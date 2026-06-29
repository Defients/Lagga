export const FRAME_BUFFER_SIZE = 300;
export const STALL_BUFFER_SIZE = 100;
export const INPUT_BUFFER_SIZE = 60;

export const STALL_POLL_INTERVAL_MS = 4;
export const STALL_THRESHOLD_MS = 16;

export const SPIKE_THRESHOLD_MS = 33;

export const SCORING_INTERVAL_MS = 200;
export const EMA_ALPHA = 0.15;
export const HYSTERESIS_MS = 500;

export const NORM_JITTER_GOOD = 1.0;
export const NORM_JITTER_BAD = 12.0;

export const NORM_STALLS_GOOD = 0;
export const NORM_STALLS_BAD = 8;

export const NORM_SPIKE_GOOD = 18;
export const NORM_SPIKE_BAD = 100;

export const NORM_INPUT_GOOD = 2.0;
export const NORM_INPUT_BAD = 50.0;

export const NORM_PRESSURE_GOOD = 0.3;
export const NORM_PRESSURE_BAD = 0.95;

export const WEIGHT_JITTER = 0.30;
export const WEIGHT_STALLS = 0.25;
export const WEIGHT_INPUT = 0.25;
export const WEIGHT_SPIKE = 0.10;
export const WEIGHT_PRESSURE = 0.10;

export const TIER_SILKY = 0.92;
export const TIER_SMOOTH = 0.75;
export const TIER_STICKY = 0.55;
export const TIER_HITCHING = 0.35;

export const SYSTEM_POLL_INTERVAL_MS = 1000;

export const SPRING_STIFFNESS = 180;
export const SPRING_DAMPING = 12;
export const MAX_DT = 0.1;
export const TRAIL_LENGTH = 24;
export const ORB_RADIUS = 20;
