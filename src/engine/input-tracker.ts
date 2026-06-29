import { RingBuffer } from "./ring-buffer";
import { INPUT_BUFFER_SIZE } from "./constants";
import type { InputSnapshot } from "./types";

export class InputTracker {
  private delays: RingBuffer;
  private pendingInputTime: number | null = null;

  constructor() {
    this.delays = new RingBuffer(INPUT_BUFFER_SIZE);
  }

  recordPointerDown(eventTimestamp: number): void {
    this.pendingInputTime = eventTimestamp;
  }

  recordFrameAfterInput(frameTimestamp: number): void {
    if (this.pendingInputTime !== null) {
      const delay = frameTimestamp - this.pendingInputTime;
      if (delay >= 0 && delay < 1000) {
        this.delays.push(delay);
      }
      this.pendingInputTime = null;
    }
  }

  getSnapshot(): InputSnapshot {
    return {
      avgDelay: this.delays.mean(),
      worstDelay: this.delays.max(),
      sampleCount: this.delays.length,
    };
  }

  reset(): void {
    this.delays.clear();
    this.pendingInputTime = null;
  }
}
