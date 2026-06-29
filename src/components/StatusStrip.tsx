import { useMetricsStore } from "../stores/metrics-store";
import { HealthBadge } from "./HealthBadge";
import { Sparkline } from "./Sparkline";

function formatUptime(s: number): string {
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m${s % 60}s`;
  return `${Math.floor(s / 3600)}h${Math.floor((s % 3600) / 60)}m`;
}

export function StatusStrip() {
  const avgDelta = useMetricsStore((s) => s.frame.avgDelta);
  const stallCount = useMetricsStore((s) => s.stall.stallCount);
  const overlayFps = useMetricsStore((s) => s.overlayFps);
  const overlayQuality = useMetricsStore((s) => s.overlayQuality);
  const stats = useMetricsStore((s) => s.sessionStats);

  const qualityColor = overlayQuality >= 0.9
    ? 'text-emerald-400/60'
    : overlayQuality >= 0.6
      ? 'text-amber-400/60'
      : 'text-red-400/60';

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-t border-cosmos-border/15 bg-cosmos-raised/50">
      <HealthBadge />
      <div className="h-3 w-px bg-white/10" aria-hidden="true" />
      <span className="text-[11px] font-mono text-white/55">
        {avgDelta.toFixed(1)}ms avg
      </span>
      <div className="h-3 w-px bg-white/10" aria-hidden="true" />
      <span className="text-[11px] font-mono text-white/55">
        {stallCount} stalls
      </span>
      {overlayFps > 0 && (
        <>
          <div className="h-3 w-px bg-white/10" aria-hidden="true" />
          <span className="text-[11px] font-mono text-white/55">
            overlay {overlayFps}fps
          </span>
          <span className={`text-[11px] font-mono ${qualityColor}`}>
            Q{Math.round(overlayQuality * 100)}%
          </span>
        </>
      )}
      <div className="flex-1" />
      {stats.uptime > 0 && (
        <>
          <span className="text-[11px] font-mono text-white/40">
            {formatUptime(stats.uptime)}
          </span>
          <div className="h-3 w-px bg-white/10" aria-hidden="true" />
          <span className="text-[11px] font-mono text-white/40">
            {stats.clicks} clicks
          </span>
          <div className="h-3 w-px bg-white/10" aria-hidden="true" />
          <span className="text-[11px] font-mono text-white/40">
            {(stats.distance / 1000).toFixed(1)}k px
          </span>
        </>
      )}
      <Sparkline />
    </div>
  );
}
