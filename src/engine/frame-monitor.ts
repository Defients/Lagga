import { RingBuffer } from "./ring-buffer";
import { FRAME_BUFFER_SIZE, SPIKE_THRESHOLD_MS } from "./constants";
import type { FrameSnapshot } from "./types";

export class FrameMonitor {
  private deltas: RingBuffer;
  private lastTimestamp = -1;

  constructor() {
    this.deltas = new RingBuffer(FRAME_BUFFER_SIZE);
  }

  recordFrame(timestamp: number): number {
    if (this.lastTimestamp < 0) {
      this.lastTimestamp = timestamp;
      return 0;
    }
    const delta = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    if (delta > 0 && delta < 2000) {
      this.deltas.push(delta);
    }
    return delta;
  }

  getSnapshot(): FrameSnapshot {
    return {
      avgDelta: this.deltas.mean(),
      jitter: this.deltas.stddev(),
      p95: this.deltas.percentile(95),
      p99: this.deltas.percentile(99),
      spikeCount: this.deltas.countAbove(SPIKE_THRESHOLD_MS),
      maxDelta: this.deltas.max(),
    };
  }

  getRecentDeltas(count: number): number[] {
    return this.deltas.last(count);
  }

  reset(): void {
    this.deltas.clear();
    this.lastTimestamp = -1;
  }
}
