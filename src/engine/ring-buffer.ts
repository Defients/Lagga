export class RingBuffer {
  private buf: Float64Array;
  private head = 0;
  private count = 0;

  constructor(private capacity: number) {
    this.buf = new Float64Array(capacity);
  }

  push(value: number): void {
    this.buf[this.head] = value;
    this.head = (this.head + 1) % this.capacity;
    if (this.count < this.capacity) this.count++;
  }

  get length(): number {
    return this.count;
  }

  get(index: number): number {
    if (index < 0 || index >= this.count) return 0;
    const realIndex =
      (this.head - this.count + index + this.capacity) % this.capacity;
    return this.buf[realIndex];
  }

  toArray(): number[] {
    const arr: number[] = new Array(this.count);
    for (let i = 0; i < this.count; i++) {
      arr[i] = this.get(i);
    }
    return arr;
  }

  clear(): void {
    this.head = 0;
    this.count = 0;
  }

  mean(): number {
    if (this.count === 0) return 0;
    let sum = 0;
    for (let i = 0; i < this.count; i++) {
      sum += this.get(i);
    }
    return sum / this.count;
  }

  stddev(): number {
    if (this.count < 2) return 0;
    const avg = this.mean();
    let sumSq = 0;
    for (let i = 0; i < this.count; i++) {
      const d = this.get(i) - avg;
      sumSq += d * d;
    }
    return Math.sqrt(sumSq / this.count);
  }

  max(): number {
    if (this.count === 0) return 0;
    let m = this.get(0);
    for (let i = 1; i < this.count; i++) {
      const v = this.get(i);
      if (v > m) m = v;
    }
    return m;
  }

  percentile(p: number): number {
    if (this.count === 0) return 0;
    const sorted = this.toArray().sort((a, b) => a - b);
    const idx = Math.min(
      Math.floor((p / 100) * sorted.length),
      sorted.length - 1
    );
    return sorted[idx];
  }

  countAbove(threshold: number): number {
    let c = 0;
    for (let i = 0; i < this.count; i++) {
      if (this.get(i) > threshold) c++;
    }
    return c;
  }

  last(n: number): number[] {
    const start = Math.max(0, this.count - n);
    const result: number[] = [];
    for (let i = start; i < this.count; i++) {
      result.push(this.get(i));
    }
    return result;
  }
}
