import { TRAIL_LENGTH, ORB_RADIUS } from "../engine/constants";
import { TIER_COLORS, type HealthTier } from "../engine/types";

export interface TrailPoint {
  x: number;
  y: number;
  delta: number;
}

export class TetherRenderer {
  private trail: TrailPoint[] = [];

  pushTrailPoint(x: number, y: number, delta: number): void {
    this.trail.push({ x, y, delta });
    if (this.trail.length > TRAIL_LENGTH) {
      this.trail.shift();
    }
  }

  render(
    ctx: CanvasRenderingContext2D,
    orbX: number,
    orbY: number,
    cursorX: number,
    cursorY: number,
    tier: HealthTier,
    width: number,
    height: number
  ): void {
    ctx.clearRect(0, 0, width, height);

    this.drawBackground(ctx, width, height, tier);
    this.drawTether(ctx, orbX, orbY, cursorX, cursorY, tier);
    this.drawTrail(ctx, tier);
    this.drawOrb(ctx, orbX, orbY, tier);
    this.drawCrosshair(ctx, cursorX, cursorY, tier);
  }

  private drawBackground(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    tier: HealthTier
  ): void {
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, w, h);

    const dotSpacing = 40;
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    for (let x = dotSpacing; x < w; x += dotSpacing) {
      for (let y = dotSpacing; y < h; y += dotSpacing) {
        ctx.fillRect(x, y, 1, 1);
      }
    }

    if (tier === "hitching" || tier === "cooked") {
      const color = tier === "cooked" ? "rgba(239, 68, 68, 0.06)" : "rgba(249, 115, 22, 0.04)";
      const gradient = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.3, w / 2, h / 2, Math.max(w, h) * 0.7);
      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(1, color);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    }
  }

  private drawTether(
    ctx: CanvasRenderingContext2D,
    orbX: number,
    orbY: number,
    cursorX: number,
    cursorY: number,
    tier: HealthTier
  ): void {
    const color = TIER_COLORS[tier];
    ctx.beginPath();
    ctx.moveTo(cursorX, cursorY);
    ctx.lineTo(orbX, orbY);
    ctx.strokeStyle = hexToRgba(color, 0.15);
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  private drawTrail(ctx: CanvasRenderingContext2D, tier: HealthTier): void {
    const color = TIER_COLORS[tier];
    const len = this.trail.length;
    if (len < 2) return;

    for (let i = 1; i < len; i++) {
      const prev = this.trail[i - 1];
      const curr = this.trail[i];
      const t = i / len;

      const isSpike = curr.delta > 33;

      if (isSpike) {
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(TIER_COLORS["cooked"], t * 0.5);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.strokeStyle = hexToRgba(color, t * 0.4);
        ctx.lineWidth = t * 3;
        ctx.stroke();
      }
    }
  }

  private drawOrb(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tier: HealthTier
  ): void {
    const color = TIER_COLORS[tier];

    const glowRadius = ORB_RADIUS * 3;
    const glow = ctx.createRadialGradient(x, y, ORB_RADIUS * 0.5, x, y, glowRadius);
    glow.addColorStop(0, hexToRgba(color, 0.25));
    glow.addColorStop(1, hexToRgba(color, 0));
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    const orbGrad = ctx.createRadialGradient(x, y, 0, x, y, ORB_RADIUS);
    orbGrad.addColorStop(0, hexToRgba(color, 0.9));
    orbGrad.addColorStop(0.7, hexToRgba(color, 0.6));
    orbGrad.addColorStop(1, hexToRgba(color, 0.2));
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(x, y, ORB_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = hexToRgba("#ffffff", 0.5);
    ctx.beginPath();
    ctx.arc(x - ORB_RADIUS * 0.25, y - ORB_RADIUS * 0.25, ORB_RADIUS * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawCrosshair(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    tier: HealthTier
  ): void {
    const color = TIER_COLORS[tier];
    const size = 8;
    ctx.strokeStyle = hexToRgba(color, 0.3);
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(x - size, y);
    ctx.lineTo(x + size, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x, y + size);
    ctx.stroke();
  }

  reset(): void {
    this.trail = [];
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
