import { FrameMonitor } from "../engine/frame-monitor";
import { StallDetector } from "../engine/stall-detector";
import { InputTracker } from "../engine/input-tracker";
import { HealthScorer } from "../engine/health-scorer";
import { SCORING_INTERVAL_MS } from "../engine/constants";
import { createSpringState, updateSpring, type SpringState } from "./spring-physics";
import { TetherRenderer } from "./tether-renderer";
import type { HealthTier, MetricsState } from "../engine/types";

export interface RenderLoopCallbacks {
  onMetricsUpdate: (metrics: MetricsState) => void;
}

export class RenderLoop {
  private frameMonitor = new FrameMonitor();
  private stallDetector = new StallDetector();
  private inputTracker = new InputTracker();
  private healthScorer = new HealthScorer();
  private renderer = new TetherRenderer();
  private spring: SpringState;

  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animId: number | null = null;
  private running = false;

  private cursorX = 0;
  private cursorY = 0;
  private hasCursor = false;

  private lastScoringTime = 0;
  private currentTier: HealthTier = "silky";
  private cpuPercent = 0;

  private callbacks: RenderLoopCallbacks;
  private dpr = 1;

  constructor(callbacks: RenderLoopCallbacks) {
    this.callbacks = callbacks;
    this.spring = createSpringState(0, 0);
  }

  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.dpr = window.devicePixelRatio || 1;
    this.resizeCanvas();

    canvas.addEventListener("pointermove", this.handlePointerMove);
    canvas.addEventListener("pointerdown", this.handlePointerDown);
    canvas.addEventListener("pointerenter", this.handlePointerEnter);
    canvas.addEventListener("pointerleave", this.handlePointerLeave);
    window.addEventListener("resize", this.handleResize);
  }

  detach(): void {
    if (this.canvas) {
      this.canvas.removeEventListener("pointermove", this.handlePointerMove);
      this.canvas.removeEventListener("pointerdown", this.handlePointerDown);
      this.canvas.removeEventListener("pointerenter", this.handlePointerEnter);
      this.canvas.removeEventListener("pointerleave", this.handlePointerLeave);
    }
    window.removeEventListener("resize", this.handleResize);
    this.canvas = null;
    this.ctx = null;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.stallDetector.start();
    this.tick(performance.now());
  }

  stop(): void {
    this.running = false;
    this.stallDetector.stop();
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  setCpuPercent(cpu: number): void {
    this.cpuPercent = cpu;
  }

  private tick = (timestamp: number): void => {
    if (!this.running) return;

    const delta = this.frameMonitor.recordFrame(timestamp);
    this.inputTracker.recordFrameAfterInput(timestamp);

    if (this.ctx && this.canvas) {
      const w = this.canvas.width / this.dpr;
      const h = this.canvas.height / this.dpr;

      if (!this.hasCursor) {
        this.cursorX = w / 2;
        this.cursorY = h / 2;
      }

      if (delta > 0) {
        updateSpring(this.spring, this.cursorX, this.cursorY, delta / 1000);
      }

      this.renderer.pushTrailPoint(this.spring.x, this.spring.y, delta);

      this.ctx.save();
      this.ctx.scale(this.dpr, this.dpr);
      this.renderer.render(
        this.ctx,
        this.spring.x,
        this.spring.y,
        this.cursorX,
        this.cursorY,
        this.currentTier,
        w,
        h
      );
      this.ctx.restore();
    }

    if (timestamp - this.lastScoringTime >= SCORING_INTERVAL_MS) {
      this.lastScoringTime = timestamp;
      const frameSnap = this.frameMonitor.getSnapshot();
      const stallSnap = this.stallDetector.getSnapshot();
      const inputSnap = this.inputTracker.getSnapshot();
      const health = this.healthScorer.score(frameSnap, stallSnap, inputSnap, this.cpuPercent);
      this.currentTier = health.tier;

      this.callbacks.onMetricsUpdate({
        frame: frameSnap,
        stall: stallSnap,
        input: inputSnap,
        system: {
          cpuUsage: this.cpuPercent,
          memoryUsedMb: 0,
          memoryTotalMb: 0,
          memoryPercent: 0,
        },
        health,
        frameHistory: this.frameMonitor.getRecentDeltas(60),
      });
    }

    this.animId = requestAnimationFrame(this.tick);
  };

  private handlePointerMove = (e: PointerEvent): void => {
    const rect = this.canvas!.getBoundingClientRect();
    this.cursorX = e.clientX - rect.left;
    this.cursorY = e.clientY - rect.top;
  };

  private handlePointerDown = (e: PointerEvent): void => {
    this.inputTracker.recordPointerDown(e.timeStamp);
  };

  private handlePointerEnter = (): void => {
    this.hasCursor = true;
  };

  private handlePointerLeave = (): void => {
    this.hasCursor = false;
  };

  private handleResize = (): void => {
    this.resizeCanvas();
  };

  private resizeCanvas(): void {
    if (!this.canvas) return;
    this.dpr = window.devicePixelRatio || 1;
    const parent = this.canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${rect.height}px`;
  }

  destroy(): void {
    this.stop();
    this.detach();
    this.frameMonitor.reset();
    this.stallDetector.reset();
    this.inputTracker.reset();
    this.healthScorer.reset();
    this.renderer.reset();
  }
}
