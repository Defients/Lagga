import { create } from "zustand";
import type { MetricsState } from "../engine/types";

interface SessionStats {
  uptime: number;
  distance: number;
  clicks: number;
  peakSpeed: number;
}

interface MetricsStore extends MetricsState {
  overlayFps: number;
  overlayQuality: number;
  sessionStats: SessionStats;
  update: (metrics: MetricsState) => void;
  setSystemMetrics: (cpu: number, memUsed: number, memTotal: number, memPercent: number) => void;
  setOverlayQuality: (fps: number, quality: number) => void;
  setSessionStats: (stats: SessionStats) => void;
}

export const useMetricsStore = create<MetricsStore>((set) => ({
  frame: { avgDelta: 16.67, jitter: 0, p95: 16.67, p99: 16.67, spikeCount: 0, maxDelta: 16.67 },
  stall: { stallCount: 0, maxStall: 0 },
  input: { avgDelay: 0, worstDelay: 0, sampleCount: 0 },
  system: { cpuUsage: 0, memoryUsedMb: 0, memoryTotalMb: 0, memoryPercent: 0 },
  health: {
    tier: "silky",
    score: 1.0,
    components: { jitter: 1, stalls: 1, input: 1, spike: 1, pressure: 1 },
  },
  frameHistory: [],
  overlayFps: 0,
  overlayQuality: 1.0,
  sessionStats: { uptime: 0, distance: 0, clicks: 0, peakSpeed: 0 },

  update: (metrics) => set(metrics),

  setSystemMetrics: (cpu, memUsed, memTotal, memPercent) =>
    set(() => ({
      system: {
        cpuUsage: cpu,
        memoryUsedMb: memUsed,
        memoryTotalMb: memTotal,
        memoryPercent: memPercent,
      },
    })),

  setOverlayQuality: (fps, quality) =>
    set({ overlayFps: fps, overlayQuality: quality }),

  setSessionStats: (stats) =>
    set({ sessionStats: stats }),
}));
