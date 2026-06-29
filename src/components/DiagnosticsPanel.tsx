import { useState } from "react";
import { useMetricsStore } from "../stores/metrics-store";
import { TIER_COLORS } from "../engine/types";

function Metric({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-[11px] text-white/50">{label}</span>
      <span className="text-[11px] font-mono text-white/75">
        {value}
        {unit && <span className="text-white/35 ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

export function DiagnosticsPanel() {
  const [open, setOpen] = useState(false);
  const frame = useMetricsStore((s) => s.frame);
  const stall = useMetricsStore((s) => s.stall);
  const input = useMetricsStore((s) => s.input);
  const system = useMetricsStore((s) => s.system);
  const health = useMetricsStore((s) => s.health);
  const tier = health.tier;
  const color = TIER_COLORS[tier];

  return (
    <div className="border-t border-cosmos-border/15 bg-cosmos-raised/30">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-4 py-1.5 hover:bg-white/[0.02] transition-colors"
      >
        <svg
          className={`w-3 h-3 text-white/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        <span className="text-[11px] text-white/40 font-medium">Diagnostics</span>
      </button>

      {open && (
        <div className="px-4 pb-3 grid grid-cols-3 gap-x-6 gap-y-1">
          <div className="space-y-1">
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Frames</div>
            <Metric label="Avg Delta" value={frame.avgDelta.toFixed(1)} unit="ms" />
            <Metric label="Jitter" value={frame.jitter.toFixed(1)} unit="ms" />
            <Metric label="P95" value={frame.p95.toFixed(1)} unit="ms" />
            <Metric label="P99" value={frame.p99.toFixed(1)} unit="ms" />
            <Metric label="Spikes" value={String(frame.spikeCount)} />
            <Metric label="Max" value={frame.maxDelta.toFixed(1)} unit="ms" />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Interaction</div>
            <Metric label="Stalls" value={String(stall.stallCount)} />
            <Metric label="Max Stall" value={stall.maxStall.toFixed(0)} unit="ms" />
            <Metric label="Avg Input" value={input.sampleCount > 0 ? input.avgDelay.toFixed(1) : "—"} unit={input.sampleCount > 0 ? "ms" : ""} />
            <Metric label="Worst Input" value={input.sampleCount > 0 ? input.worstDelay.toFixed(1) : "—"} unit={input.sampleCount > 0 ? "ms" : ""} />
            <Metric label="Samples" value={String(input.sampleCount)} />
          </div>

          <div className="space-y-1">
            <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">System</div>
            <Metric label="CPU" value={system.cpuUsage.toFixed(0)} unit="%" />
            <Metric label="RAM" value={system.memoryPercent.toFixed(0)} unit="%" />
            <Metric
              label="Used"
              value={system.memoryTotalMb > 0 ? `${(system.memoryUsedMb / 1024).toFixed(1)}` : "—"}
              unit={system.memoryTotalMb > 0 ? "GB" : ""}
            />
            <div className="mt-2">
              <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Score</div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} aria-hidden="true" />
                <span className="text-[11px] font-mono" style={{ color }}>
                  {(health.score * 100).toFixed(0)}/100
                </span>
              </div>
            </div>
          </div>

          <div className="col-span-3 mt-2 pt-2 border-t border-white/5">
            <p className="text-[9px] text-white/25 italic">
              All timings measured within app runtime. System metrics shown for context only.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
