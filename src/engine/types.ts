export type HealthTier = "silky" | "smooth" | "sticky" | "hitching" | "cooked";

export interface FrameSnapshot {
  avgDelta: number;
  jitter: number;
  p95: number;
  p99: number;
  spikeCount: number;
  maxDelta: number;
}

export interface StallSnapshot {
  stallCount: number;
  maxStall: number;
}

export interface InputSnapshot {
  avgDelay: number;
  worstDelay: number;
  sampleCount: number;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  memoryPercent: number;
}

export interface HealthState {
  tier: HealthTier;
  score: number;
  components: {
    jitter: number;
    stalls: number;
    input: number;
    spike: number;
    pressure: number;
  };
}

export interface MetricsState {
  frame: FrameSnapshot;
  stall: StallSnapshot;
  input: InputSnapshot;
  system: SystemMetrics;
  health: HealthState;
  frameHistory: number[];
}

export const TIER_COLORS: Record<HealthTier, string> = {
  silky: "#00ffc8",
  smooth: "#4dabf7",
  sticky: "#fbbf24",
  hitching: "#f97316",
  cooked: "#ef4444",
};

export const TIER_ORDER: HealthTier[] = [
  "cooked",
  "hitching",
  "sticky",
  "smooth",
  "silky",
];
