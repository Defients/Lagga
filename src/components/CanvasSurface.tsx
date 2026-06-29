import { useEffect, useRef } from "react";
import { listen } from "@tauri-apps/api/event";
import { RenderLoop } from "../canvas/render-loop";
import { useMetricsStore } from "../stores/metrics-store";
import { getSystemMetrics } from "../lib/native-bridge";
import { SYSTEM_POLL_INTERVAL_MS } from "../engine/constants";

export function CanvasSurface() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<RenderLoop | null>(null);
  const update = useMetricsStore((s) => s.update);
  const setSystemMetrics = useMetricsStore((s) => s.setSystemMetrics);
  const setOverlayQuality = useMetricsStore((s) => s.setOverlayQuality);
  const setSessionStats = useMetricsStore((s) => s.setSessionStats);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Listen for overlay quality metrics
    let unlistenFn: (() => void) | null = null;
    let unlistenStatsFn: (() => void) | null = null;
    listen<{ fps: number; qualityLevel: number }>("overlay-quality", (event) => {
      setOverlayQuality(event.payload.fps, event.payload.qualityLevel);
    }).then((fn) => { unlistenFn = fn; }).catch(() => {});
    listen<{ uptime: number; distance: number; clicks: number; peakSpeed: number }>("overlay-stats", (event) => {
      setSessionStats(event.payload);
    }).then((fn) => { unlistenStatsFn = fn; }).catch(() => {});

    const loop = new RenderLoop({
      onMetricsUpdate: (metrics) => {
        update(metrics);
      },
    });

    loopRef.current = loop;
    loop.attach(canvas);
    loop.start();

    const systemPollId = setInterval(async () => {
      try {
        const m = await getSystemMetrics();
        setSystemMetrics(m.cpuUsage, m.memoryUsedMb, m.memoryTotalMb, m.memoryPercent);
        loop.setCpuPercent(m.cpuUsage);
      } catch {
        // Native bridge unavailable (e.g. running in browser dev mode)
      }
    }, SYSTEM_POLL_INTERVAL_MS);

    return () => {
      clearInterval(systemPollId);
      loop.destroy();
      loopRef.current = null;
      if (unlistenFn) unlistenFn();
      if (unlistenStatsFn) unlistenStatsFn();
    };
  }, [update, setSystemMetrics, setOverlayQuality, setSessionStats]);

  return (
    <div ref={containerRef} className="flex-1 relative cursor-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />
    </div>
  );
}
