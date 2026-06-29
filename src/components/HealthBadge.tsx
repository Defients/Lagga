import { useMetricsStore } from "../stores/metrics-store";
import { TIER_COLORS } from "../engine/types";

export function HealthBadge() {
  const tier = useMetricsStore((s) => s.health.tier);
  const score = useMetricsStore((s) => s.health.score);
  const color = TIER_COLORS[tier];

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2.5 h-2.5 rounded-full transition-colors duration-500"
        style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}60` }}
      />
      <span
        className="text-xs font-semibold uppercase tracking-wider transition-colors duration-500"
        style={{ color }}
      >
        {tier}
      </span>
      <span className="text-[10px] text-white/30 font-mono">
        {(score * 100).toFixed(0)}
      </span>
    </div>
  );
}
