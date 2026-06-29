import { useMetricsStore } from "../stores/metrics-store";
import { TIER_COLORS } from "../engine/types";

export function Sparkline() {
  const history = useMetricsStore((s) => s.frameHistory);
  const tier = useMetricsStore((s) => s.health.tier);

  if (history.length < 2) return null;

  const width = 120;
  const height = 24;
  const maxVal = Math.max(33, ...history);
  const step = width / (history.length - 1);

  const points = history
    .map((v, i) => `${i * step},${height - (v / maxVal) * height}`)
    .join(" ");

  const color = TIER_COLORS[tier];

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
