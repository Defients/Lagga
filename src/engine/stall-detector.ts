import { RingBuffer } from "./ring-buffer";
import { STALL_BUFFER_SIZE, STALL_POLL_INTERVAL_MS, STALL_THRESHOLD_MS } from "./constants";
import type { StallSnapshot } from "./types";

export class StallDetector {
  private stalls: RingBuffer;
  private lastCheck = 0;
  private timerId: ReturnType<typeof setTimeout> | null = null;
  private running = false;

  constructor() {
    this.stalls = new RingBuffer(STALL_BUFFER_SIZE);
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.lastCheck = performance.now();
    this.poll();
  }

  stop(): void {
    this.running = false;
    if (this.timerId !== null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  private poll = (): void => {
    if (!this.running) return;
    const now = performance.now();
    const expected = this.lastCheck + STALL_POLL_INTERVAL_MS;
    const overshoot = now - expected;
    if (overshoot > STALL_THRESHOLD_MS) {
      this.stalls.push(overshoot);
    }
    this.lastCheck = now;
    this.timerId = setTimeout(this.poll, STALL_POLL_INTERVAL_MS);
  };

  getSnapshot(): StallSnapshot {
    return {
      stallCount: this.stalls.length,
      maxStall: this.stalls.max(),
    };
  }

  getRecentStallCount(_windowMs: number): number {
    let count = 0;
    for (let i = 0; i < this.stalls.length; i++) {
      if (this.stalls.get(i) > 0) count++;
    }
    return count;
  }

  reset(): void {
    this.stalls.clear();
  }
}
