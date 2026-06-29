import type { FrameSnapshot, StallSnapshot, InputSnapshot, HealthTier, HealthState } from "./types";
import {
  EMA_ALPHA,
  HYSTERESIS_MS,
  NORM_JITTER_GOOD,
  NORM_JITTER_BAD,
  NORM_STALLS_GOOD,
  NORM_STALLS_BAD,
  NORM_SPIKE_GOOD,
  NORM_SPIKE_BAD,
  NORM_INPUT_GOOD,
  NORM_INPUT_BAD,
  NORM_PRESSURE_GOOD,
  NORM_PRESSURE_BAD,
  WEIGHT_JITTER,
  WEIGHT_STALLS,
  WEIGHT_INPUT,
  WEIGHT_SPIKE,
  WEIGHT_PRESSURE,
  TIER_SILKY,
  TIER_SMOOTH,
  TIER_STICKY,
  TIER_HITCHING,
} from "./constants";

function normalize(value: number, good: number, bad: number): number {
  return 1 - Math.min(Math.max((value - good) / (bad - good), 0), 1);
}

function scoreToTier(score: number): HealthTier {
  if (score >= TIER_SILKY) return "silky";
  if (score >= TIER_SMOOTH) return "smooth";
  if (score >= TIER_STICKY) return "sticky";
  if (score >= TIER_HITCHING) return "hitching";
  return "cooked";
}

export class HealthScorer {
  private smoothedScore = 1.0;
  private currentTier: HealthTier = "silky";
  private pendingTier: HealthTier | null = null;
  private pendingTierSince = 0;

  score(
    frame: FrameSnapshot,
    stall: StallSnapshot,
    input: InputSnapshot,
    cpuPercent: number
  ): HealthState {
    const components = {
      jitter: normalize(frame.jitter, NORM_JITTER_GOOD, NORM_JITTER_BAD),
      stalls: normalize(stall.stallCount, NORM_STALLS_GOOD, NORM_STALLS_BAD),
      input: input.sampleCount > 0
        ? normalize(input.avgDelay, NORM_INPUT_GOOD, NORM_INPUT_BAD)
        : 1.0,
      spike: normalize(frame.maxDelta, NORM_SPIKE_GOOD, NORM_SPIKE_BAD),
      pressure: normalize(cpuPercent / 100, NORM_PRESSURE_GOOD, NORM_PRESSURE_BAD),
    };

    const raw =
      components.jitter * WEIGHT_JITTER +
      components.stalls * WEIGHT_STALLS +
      components.input * WEIGHT_INPUT +
      components.spike * WEIGHT_SPIKE +
      components.pressure * WEIGHT_PRESSURE;

    this.smoothedScore = this.smoothedScore * (1 - EMA_ALPHA) + raw * EMA_ALPHA;

    const candidateTier = scoreToTier(this.smoothedScore);
    const now = performance.now();

    if (candidateTier !== this.currentTier) {
      if (this.pendingTier === candidateTier) {
        if (now - this.pendingTierSince >= HYSTERESIS_MS) {
          this.currentTier = candidateTier;
          this.pendingTier = null;
        }
      } else {
        this.pendingTier = candidateTier;
        this.pendingTierSince = now;
      }
    } else {
      this.pendingTier = null;
    }

    return {
      tier: this.currentTier,
      score: this.smoothedScore,
      components,
    };
  }

  reset(): void {
    this.smoothedScore = 1.0;
    this.currentTier = "silky";
    this.pendingTier = null;
    this.pendingTierSince = 0;
  }
}
