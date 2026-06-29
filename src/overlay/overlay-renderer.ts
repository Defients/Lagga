/* ─── OverlayRenderer ──────────────────────────────────────────────────────
 *  Encapsulates all canvas rendering logic for the cursor trail overlay.
 *  Separated from physics, state management, and event handling.
 * ────────────────────────────────────────────────────────────────────────── */

import { hexToRgb, lerpColor } from "../shared/settings";
import type { TrailSettings, TrailPoint, Particle, BurstParticle, AfterimageState, PersistDot, TrailState, EchoState, GravityWellState } from "../shared/types";

export type { TrailPoint, Particle, BurstParticle, AfterimageState, PersistDot, TrailState, EchoState, GravityWellState };

/* ── Particle pool for GC pressure reduction ─────────────────────────────── */

class ParticlePool {
  private pool: Particle[] = [];

  acquire(): Particle {
    const p = this.pool.pop();
    if (p) {
      p.life = 1;
      return p;
    }
    return {
      x: 0, y: 0, vx: 0, vy: 0,
      life: 1, maxLife: 1, size: 1,
    };
  }

  release(p: Particle): void {
    if (this.pool.length < 200) {
      this.pool.push(p);
    }
  }
}

/* ── Burst particle pool for GC pressure reduction ────────────────────────── */

class BurstPool {
  private pool: BurstParticle[] = [];

  acquire(): BurstParticle {
    const p = this.pool.pop();
    if (p) {
      p.life = 1;
      return p;
    }
    return {
      x: 0, y: 0, vx: 0, vy: 0,
      life: 1, maxLife: 1, size: 1, color: '#ffffff',
    };
  }

  release(p: BurstParticle): void {
    if (this.pool.length < 300) {
      this.pool.push(p);
    }
  }
}

/* ── OverlayRenderer ─────────────────────────────────────────────────────── */

export class OverlayRenderer {
  private ctx: CanvasRenderingContext2D;

  private textureCanvas: HTMLCanvasElement | null = null;
  private textureCtx: CanvasRenderingContext2D | null = null;
  private textureDirty = true;
  private lastTextureKey = '';

  private burstParticles: BurstParticle[] = [];
  private persistDots: PersistDot[] = [];
  private gravityWells: GravityWellState[] = [];

  private particlePool = new ParticlePool();
  private burstPool = new BurstPool();

  constructor(ctx: CanvasRenderingContext2D, _dpr: number) {
    this.ctx = ctx;
  }

  /* ── Color utilities ───────────────────────────────────────────────────── */

  static toRgbComponents(color: string): string {
    if (color.startsWith("hsl")) {
      const c = document.createElement("canvas").getContext("2d");
      if (!c) return "255, 255, 255";
      c.fillStyle = color;
      const resolved = c.fillStyle;
      const match = /^#([0-9a-f]{6})$/i.exec(resolved);
      if (!match) return "255, 255, 255";
      const rgb = hexToRgb(`#${match[1]}`);
      return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    }
    const rgb = hexToRgb(color);
    return `${rgb.r}, ${rgb.g}, ${rgb.b}`;
  }

  /* ── Texture overlay generation ────────────────────────────────────────── */

  markTextureDirty(): void {
    this.textureDirty = true;
  }

  private ensureTextureCanvas(): void {
    if (!this.textureCanvas) {
      this.textureCanvas = document.createElement("canvas");
      this.textureCtx = this.textureCanvas.getContext("2d");
    }
  }

  getTextureOverlay(settings: TrailSettings, w: number, h: number): HTMLCanvasElement | null {
    if (settings.textureOverlay === "none") return null;
    const key = `${settings.textureOverlay}-${w}-${h}`;
    if (key === this.lastTextureKey && this.textureCanvas && !this.textureDirty) return this.textureCanvas;
    this.ensureTextureCanvas();
    if (!this.textureCtx) return null;
    this.textureCanvas!.width = w;
    this.textureCanvas!.height = h;
    this.textureCtx.clearRect(0, 0, w, h);
    const c = OverlayRenderer.toRgbComponents(settings.colorPrimary);

    if (settings.textureOverlay === "starfield") {
      for (let i = 0; i < 80; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 1.5 + 0.3;
        const a = Math.random() * 0.15 + 0.03;
        this.textureCtx.fillStyle = `rgba(255,255,255,${a})`;
        this.textureCtx.beginPath();
        this.textureCtx.arc(x, y, r, 0, Math.PI * 2);
        this.textureCtx.fill();
      }
    } else if (settings.textureOverlay === "nebula-noise") {
      for (let i = 0; i < 6; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = 80 + Math.random() * 200;
        const grad = this.textureCtx.createRadialGradient(x, y, 0, x, y, r);
        grad.addColorStop(0, `rgba(${c}, 0.04)`);
        grad.addColorStop(1, `rgba(${c}, 0)`);
        this.textureCtx.fillStyle = grad;
        this.textureCtx.beginPath();
        this.textureCtx.arc(x, y, r, 0, Math.PI * 2);
        this.textureCtx.fill();
      }
    } else if (settings.textureOverlay === "energy-filaments") {
      this.textureCtx.strokeStyle = `rgba(${c}, 0.06)`;
      this.textureCtx.lineWidth = 0.5;
      for (let i = 0; i < 30; i++) {
        const x1 = Math.random() * w;
        const y1 = Math.random() * h;
        const len = 20 + Math.random() * 80;
        const angle = Math.random() * Math.PI * 2;
        this.textureCtx.beginPath();
        this.textureCtx.moveTo(x1, y1);
        this.textureCtx.lineTo(x1 + Math.cos(angle) * len, y1 + Math.sin(angle) * len);
        this.textureCtx.stroke();
      }
    } else if (settings.textureOverlay === "constellation") {
      const starCount = 60;
      const stars: { x: number; y: number; r: number }[] = [];
      for (let i = 0; i < starCount; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        const r = Math.random() * 1.2 + 0.4;
        stars.push({ x, y, r });
        this.textureCtx.fillStyle = `rgba(255,255,255,${Math.random() * 0.12 + 0.04})`;
        this.textureCtx.beginPath();
        this.textureCtx.arc(x, y, r, 0, Math.PI * 2);
        this.textureCtx.fill();
      }
      this.textureCtx.strokeStyle = `rgba(${c}, 0.05)`;
      this.textureCtx.lineWidth = 0.4;
      for (let i = 0; i < stars.length; i++) {
        for (let j = i + 1; j < stars.length; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            this.textureCtx.beginPath();
            this.textureCtx.moveTo(stars[i].x, stars[i].y);
            this.textureCtx.lineTo(stars[j].x, stars[j].y);
            this.textureCtx.stroke();
          }
        }
      }
    } else if (settings.textureOverlay === "vortex") {
      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy);
      for (let i = 0; i < 120; i++) {
        const t = i / 120;
        const angle = t * Math.PI * 8;
        const r = t * maxR;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const a = (1 - t) * 0.08;
        this.textureCtx.fillStyle = `rgba(${c}, ${a})`;
        this.textureCtx.beginPath();
        this.textureCtx.arc(x, y, 1.5 - t, 0, Math.PI * 2);
        this.textureCtx.fill();
      }
    } else if (settings.textureOverlay === "aurora-veil") {
      for (let i = 0; i < 5; i++) {
        const y = (i / 5) * h + Math.random() * 40;
        const amp = 30 + Math.random() * 60;
        const freq = 0.003 + Math.random() * 0.004;
        const phase = Math.random() * Math.PI * 2;
        const grad = this.textureCtx.createLinearGradient(0, y - amp, 0, y + amp);
        grad.addColorStop(0, `rgba(${c}, 0)`);
        grad.addColorStop(0.5, `rgba(${c}, ${0.04 + Math.random() * 0.03})`);
        grad.addColorStop(1, `rgba(${c}, 0)`);
        this.textureCtx.fillStyle = grad;
        this.textureCtx.beginPath();
        this.textureCtx.moveTo(0, y);
        for (let x = 0; x <= w; x += 4) {
          this.textureCtx.lineTo(x, y + Math.sin(x * freq + phase) * amp);
        }
        this.textureCtx.lineTo(w, y + amp);
        this.textureCtx.lineTo(0, y + amp);
        this.textureCtx.closePath();
        this.textureCtx.fill();
      }
    }

    this.lastTextureKey = key;
    this.textureDirty = false;
    return this.textureCanvas;
  }

  /* ── Texture overlay: draw once per frame ──────────────────────────────── */

  renderTextureOverlay(settings: TrailSettings, w: number, h: number): void {
    const tex = this.getTextureOverlay(settings, w, h);
    if (tex) {
      this.ctx.globalAlpha = 0.5;
      this.ctx.drawImage(tex, 0, 0, w, h);
      this.ctx.globalAlpha = 1;
    }
  }

  /* ── Trail rendering ───────────────────────────────────────────────────── */

  renderTrail(state: TrailState, settings: TrailSettings, c: string, masterOpacity: number): void {
    if (state.trail.length < 2) return;
    const ctx = this.ctx;
    const fadeCurve = settings.trailFadeCurve;
    const opacity = settings.opacity * masterOpacity;

    for (let p = 1; p < state.trail.length; p++) {
      const prev = state.trail[p - 1];
      const curr = state.trail[p];
      const t = p / state.trail.length;
      const fadeT = fadeCurve > 0.5
        ? Math.pow(t, 1 + (fadeCurve - 0.5) * 4)
        : t * (1 - fadeCurve * 0.5);
      const widthBoost = settings.velocityThickness ? Math.min(curr.speed / 400, 1) * 0.9 : 0;
      const lineW = Math.max(0.5, fadeT * settings.trailWidth * (0.35 + widthBoost));

      if (settings.renderMode === "dots") {
        ctx.fillStyle = `rgba(${c}, ${fadeT * opacity * 0.8})`;
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, lineW * 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (settings.renderMode === "lines") {
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.strokeStyle = `rgba(${c}, ${fadeT * opacity * 0.8})`;
        ctx.lineWidth = lineW;
        ctx.lineCap = "round";
        ctx.stroke();
      } else if (settings.renderMode === "ribbon") {
        const perpX = -(curr.y - prev.y);
        const perpY = curr.x - prev.x;
        const plen = Math.sqrt(perpX * perpX + perpY * perpY) || 0.001;
        const halfW = lineW * 1.5;
        const ox = (perpX / plen) * halfW;
        const oy = (perpY / plen) * halfW;
        ctx.beginPath();
        ctx.moveTo(prev.x + ox, prev.y + oy);
        ctx.lineTo(curr.x + ox, curr.y + oy);
        ctx.lineTo(curr.x - ox, curr.y - oy);
        ctx.lineTo(prev.x - ox, prev.y - oy);
        ctx.closePath();
        ctx.fillStyle = `rgba(${c}, ${fadeT * opacity * 0.6})`;
        ctx.fill();
      } else if (settings.renderMode === "energy-streams") {
        const perpX = -(curr.y - prev.y);
        const perpY = curr.x - prev.x;
        const plen = Math.sqrt(perpX * perpX + perpY * perpY) || 0.001;
        const offset = Math.sin(p * 0.3 + performance.now() / 200) * 3 * fadeT;
        const ox = (perpX / plen) * offset;
        const oy = (perpY / plen) * offset;
        ctx.beginPath();
        ctx.moveTo(prev.x + ox, prev.y + oy);
        ctx.lineTo(curr.x + ox, curr.y + oy);
        ctx.strokeStyle = `rgba(${c}, ${fadeT * opacity * 0.7})`;
        ctx.lineWidth = lineW;
        ctx.lineCap = "round";
        ctx.stroke();
      } else if (settings.renderMode === "glowing-orbs") {
        const orbR = lineW * 1.2;
        const grad = ctx.createRadialGradient(curr.x, curr.y, 0, curr.x, curr.y, orbR);
        grad.addColorStop(0, `rgba(${c}, ${fadeT * opacity * 0.9})`);
        grad.addColorStop(0.4, `rgba(${c}, ${fadeT * opacity * 0.4})`);
        grad.addColorStop(1, `rgba(${c}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, orbR, 0, Math.PI * 2);
        ctx.fill();
      } else if (settings.renderMode === "plasma-bolt") {
        const perpX = -(curr.y - prev.y);
        const perpY = curr.x - prev.x;
        const plen = Math.sqrt(perpX * perpX + perpY * perpY) || 0.001;
        const jitter = Math.sin(p * 1.7 + performance.now() / 80) * 4 * fadeT;
        const jitter2 = Math.cos(p * 2.3 + performance.now() / 55) * 3 * fadeT;
        const ox = (perpX / plen) * jitter;
        const oy = (perpY / plen) * jitter;
        const ox2 = (perpX / plen) * jitter2;
        const oy2 = (perpY / plen) * jitter2;
        ctx.strokeStyle = `rgba(${c}, ${fadeT * opacity * 0.5})`;
        ctx.lineWidth = lineW * 2.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(prev.x + ox, prev.y + oy);
        ctx.lineTo(curr.x + ox, curr.y + oy);
        ctx.stroke();
        ctx.strokeStyle = `rgba(255, 255, 255, ${fadeT * opacity * 0.6})`;
        ctx.lineWidth = lineW * 0.8;
        ctx.beginPath();
        ctx.moveTo(prev.x + ox2, prev.y + oy2);
        ctx.lineTo(curr.x + ox2, curr.y + oy2);
        ctx.stroke();
      } else if (settings.renderMode === "shockwave") {
        const segT = 1 - fadeT;
        const ringR = lineW * (1 + segT * 3);
        const ringAlpha = fadeT * opacity * 0.5;
        ctx.strokeStyle = `rgba(${c}, ${ringAlpha})`;
        ctx.lineWidth = Math.max(0.5, lineW * 0.6);
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, ringR, 0, Math.PI * 2);
        ctx.stroke();
        const innerGrad = ctx.createRadialGradient(curr.x, curr.y, 0, curr.x, curr.y, ringR * 0.8);
        innerGrad.addColorStop(0, `rgba(${c}, ${ringAlpha * 0.3})`);
        innerGrad.addColorStop(1, `rgba(${c}, 0)`);
        ctx.fillStyle = innerGrad;
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, ringR * 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else if (settings.renderMode === "fireflies") {
        const ffR = lineW * 0.9;
        const blink = 0.4 + 0.6 * Math.abs(Math.sin(p * 0.7 + performance.now() / 300));
        const ffAlpha = fadeT * opacity * blink * 0.8;
        const grad = ctx.createRadialGradient(curr.x, curr.y, 0, curr.x, curr.y, ffR * 2);
        grad.addColorStop(0, `rgba(${c}, ${ffAlpha})`);
        grad.addColorStop(0.3, `rgba(${c}, ${ffAlpha * 0.5})`);
        grad.addColorStop(1, `rgba(${c}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, ffR * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(255, 255, 255, ${ffAlpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(curr.x, curr.y, ffR * 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (settings.renderMode === "spiral") {
        const angle = p * 0.5 + performance.now() / 400;
        const spiralR = lineW * (1 + fadeT * 2);
        const ox = Math.cos(angle) * spiralR;
        const oy = Math.sin(angle) * spiralR;
        const grad = ctx.createRadialGradient(curr.x + ox, curr.y + oy, 0, curr.x + ox, curr.y + oy, lineW);
        grad.addColorStop(0, `rgba(${c}, ${fadeT * opacity * 0.8})`);
        grad.addColorStop(1, `rgba(${c}, 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(curr.x + ox, curr.y + oy, lineW, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(${c}, ${fadeT * opacity * 0.3})`;
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x + ox, curr.y + oy);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
        ctx.strokeStyle = `rgba(${c}, ${fadeT * opacity * 0.8})`;
        ctx.lineWidth = lineW;
        ctx.lineCap = "round";
        ctx.stroke();
      }
    }
  }

  /* ── Particle rendering ────────────────────────────────────────────────── */

  renderParticles(state: TrailState, settings: TrailSettings, c: string, masterOpacity: number): void {
    const ctx = this.ctx;
    const opacity = settings.opacity * masterOpacity;
    for (const part of state.particles) {
      const a = part.life * opacity * 0.6;
      ctx.fillStyle = `rgba(${c}, ${a})`;
      ctx.beginPath();
      ctx.arc(part.x, part.y, part.size * part.life, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ── Afterimage rendering ──────────────────────────────────────────────── */

  renderAfterimages(state: TrailState, settings: TrailSettings, c: string, masterOpacity: number): void {
    const ctx = this.ctx;
    const opacity = settings.opacity * masterOpacity;
    for (const ai of state.afterimages) {
      const a = (1 - ai.age / 60) * opacity * 0.15;
      if (a <= 0 || ai.points.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(ai.points[0].x, ai.points[0].y);
      for (let p = 1; p < ai.points.length; p++) {
        ctx.lineTo(ai.points[p].x, ai.points[p].y);
      }
      ctx.strokeStyle = `rgba(${c}, ${a})`;
      ctx.lineWidth = settings.trailWidth * 0.5;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }

  /* ── Orb rendering (with comet mode + velocity pulse) ──────────────────── */

  renderOrb(state: TrailState, settings: TrailSettings, c: string, masterScale: number, masterOpacity: number, speed: number, timestamp: number): void {
    const ctx = this.ctx;
    const opacity = settings.opacity * masterOpacity;
    let radius = settings.orbRadius * masterScale;
    if (settings.breathing) {
      const breathPhase = Math.sin(timestamp / 1000 * settings.breathSpeed * Math.PI * 2);
      radius *= 1 + breathPhase * settings.breathDepth;
    }
    const glowRadius = radius * (2.5 + settings.bloomStrength * 2);
    const glow = ctx.createRadialGradient(state.orbX, state.orbY, 0, state.orbX, state.orbY, glowRadius);
    glow.addColorStop(0, `rgba(${c}, ${settings.glowIntensity * 0.8 * opacity})`);
    glow.addColorStop(1, `rgba(${c}, 0)`);
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(state.orbX, state.orbY, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    const orbGrad = ctx.createRadialGradient(
      state.orbX - radius * 0.2,
      state.orbY - radius * 0.2,
      0,
      state.orbX,
      state.orbY,
      radius
    );
    orbGrad.addColorStop(0, `rgba(255,255,255,${0.9 * opacity})`);
    orbGrad.addColorStop(0.18, `rgba(${c}, ${0.95 * opacity})`);
    orbGrad.addColorStop(1, `rgba(${c}, ${0.18 * opacity})`);
    ctx.fillStyle = orbGrad;
    ctx.beginPath();
    ctx.arc(state.orbX, state.orbY, radius, 0, Math.PI * 2);
    ctx.fill();

    if (settings.cometMode) {
      const tailLen = Math.min(speed * 0.3, 80);
      const dirX = state.orbVx / (speed || 0.001);
      const dirY = state.orbVy / (speed || 0.001);
      const tailGrad = ctx.createLinearGradient(state.orbX, state.orbY, state.orbX - dirX * tailLen, state.orbY - dirY * tailLen);
      tailGrad.addColorStop(0, `rgba(${c}, ${0.5 * opacity})`);
      tailGrad.addColorStop(1, `rgba(${c}, 0)`);
      ctx.fillStyle = tailGrad;
      ctx.beginPath();
      const perpX = -dirY;
      const perpY = dirX;
      ctx.moveTo(state.orbX + perpX * radius * 0.8, state.orbY + perpY * radius * 0.8);
      ctx.lineTo(state.orbX - dirX * tailLen, state.orbY - dirY * tailLen);
      ctx.lineTo(state.orbX - perpX * radius * 0.8, state.orbY - perpY * radius * 0.8);
      ctx.closePath();
      ctx.fill();
    }

    if (speed > 50) {
      const pulseR = radius * (1 + Math.min(speed / 500, 0.5));
      ctx.strokeStyle = `rgba(${c}, ${0.15 * opacity * Math.min(speed / 300, 1)})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(state.orbX, state.orbY, pulseR, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /* ── Tether rendering ──────────────────────────────────────────────────── */

  renderTether(cursorX: number, cursorY: number, state: TrailState, c: string): void {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.moveTo(cursorX, cursorY);
    ctx.lineTo(state.orbX, state.orbY);
    ctx.strokeStyle = `rgba(${c}, 0.25)`;
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* ── Anchor crosshair rendering ────────────────────────────────────────── */

  renderAnchor(cursorX: number, cursorY: number, c: string): void {
    const ctx = this.ctx;
    const s = 4;
    ctx.strokeStyle = `rgba(${c}, 0.55)`;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cursorX - s, cursorY);
    ctx.lineTo(cursorX + s, cursorY);
    ctx.moveTo(cursorX, cursorY - s);
    ctx.lineTo(cursorX, cursorY + s);
    ctx.stroke();
  }

  /* ── Burst particle system ─────────────────────────────────────────────── */

  updateBursts(state: TrailState, settings: TrailSettings, timestamp: number, color: string): void {
    if (!settings.randomBursts) return;
    const interval = 1000 / (0.5 + settings.burstFrequency * 4);
    if (timestamp - state.lastBurstTime > interval) {
      state.lastBurstTime = timestamp;
      const count = 6 + Math.floor(Math.random() * 10);
      for (let p = 0; p < count; p++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 50 + Math.random() * 150;
        const bp = this.burstPool.acquire();
        bp.x = state.orbX;
        bp.y = state.orbY;
        bp.vx = Math.cos(angle) * speed;
        bp.vy = Math.sin(angle) * speed;
        bp.life = 1;
        bp.maxLife = 0.4 + Math.random() * 0.6;
        bp.size = 1 + Math.random() * 4;
        bp.color = color;
        this.burstParticles.push(bp);
      }
    }
  }

  renderBursts(dt: number): void {
    const ctx = this.ctx;
    for (let p = this.burstParticles.length - 1; p >= 0; p--) {
      const b = this.burstParticles[p];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vx *= 0.94;
      b.vy *= 0.94;
      b.vy += 30 * dt;
      b.life -= dt / b.maxLife;
      if (b.life <= 0) { this.burstParticles.splice(p, 1); this.burstPool.release(b); continue; }
      const c = OverlayRenderer.toRgbComponents(b.color);
      ctx.fillStyle = `rgba(${c}, ${b.life * 0.7})`;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size * b.life, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ── Persist dot system (click bursts) ─────────────────────────────────── */

  addPersistDots(x: number, y: number, color: string, count: number): void {
    for (let p = 0; p < count; p++) {
      const angle = (Math.PI * 2 * p) / count + Math.random() * 0.3;
      const speed = 40 + Math.random() * 80;
      this.persistDots.push({
        x,
        y,
        life: 1,
        maxLife: 0.6 + Math.random() * 0.4,
        color,
        size: 2 + Math.random() * 4,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
      });
    }
  }

  /* ── Gravity well system ─────────────────────────────────────────────────── */

  addGravityWell(x: number, y: number, strength: number): void {
    this.gravityWells.push({
      x,
      y,
      strength,
      life: 1,
      maxLife: 2.0,
    });
  }

  updateGravityWells(dt: number): void {
    for (let i = this.gravityWells.length - 1; i >= 0; i--) {
      const w = this.gravityWells[i];
      w.life -= dt / w.maxLife;
      if (w.life <= 0) { this.gravityWells.splice(i, 1); }
    }
  }

  applyGravityWells(state: TrailState, settings: TrailSettings, dt: number): void {
    if (!settings.gravityWell) return;
    for (const well of this.gravityWells) {
      const dx = well.x - state.orbX;
      const dy = well.y - state.orbY;
      const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
      const force = well.strength * well.life * 200 / (dist + 50);
      state.orbVx += (dx / dist) * force * dt * settings.gravityWellStrength;
      state.orbVy += (dy / dist) * force * dt * settings.gravityWellStrength;
    }
  }

  renderGravityWells(): void {
    const ctx = this.ctx;
    for (const well of this.gravityWells) {
      const r = (1 - well.life) * 60 + 10;
      const alpha = well.life * 0.15;
      const grad = ctx.createRadialGradient(well.x, well.y, 0, well.x, well.y, r);
      grad.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.5})`);
      grad.addColorStop(0.5, `rgba(168, 85, 247, ${alpha})`);
      grad.addColorStop(1, `rgba(168, 85, 247, 0)`);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(well.x, well.y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  renderPersistDots(dt: number): void {
    const ctx = this.ctx;
    for (let p = this.persistDots.length - 1; p >= 0; p--) {
      const d = this.persistDots[p];
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vx *= 0.94;
      d.vy *= 0.94;
      d.vy += 30 * dt;
      d.life -= dt / d.maxLife;
      if (d.life <= 0) { this.persistDots.splice(p, 1); continue; }
      const c = OverlayRenderer.toRgbComponents(d.color);
      ctx.fillStyle = `rgba(${c}, ${d.life * 0.6})`;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size * d.life, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /* ── Nexus link rendering ──────────────────────────────────────────────── */

  renderNexusLinks(
    activeIndices: number[],
    trailStates: TrailState[],
    settingsTrails: TrailSettings[],
    timestamp: number
  ): void {
    if (activeIndices.length < 2) return;
    const ctx = this.ctx;
    for (let i = 0; i < activeIndices.length; i++) {
      for (let j = i + 1; j < activeIndices.length; j++) {
        const a = trailStates[activeIndices[i]];
        const b = trailStates[activeIndices[j]];
        const dx = b.orbX - a.orbX;
        const dy = b.orbY - a.orbY;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        const alpha = Math.max(0, 0.22 - dist / 900);
        if (alpha <= 0) continue;

        const ca = settingsTrails[activeIndices[i]].colorPrimary;
        const cb = settingsTrails[activeIndices[j]].colorPrimary;
        const mid = lerpColor(ca, cb, 0.5);
        const m = OverlayRenderer.toRgbComponents(mid);

        ctx.beginPath();
        ctx.moveTo(a.orbX, a.orbY);
        ctx.lineTo(b.orbX, b.orbY);
        ctx.strokeStyle = `rgba(${m}, ${alpha})`;
        ctx.lineWidth = 1.1;
        ctx.stroke();

        const midX = (a.orbX + b.orbX) / 2;
        const midY = (a.orbY + b.orbY) / 2;
        const pulse = 2 + Math.sin(timestamp / 300) * 1.5;
        ctx.fillStyle = `rgba(${m}, ${alpha * 1.5})`;
        ctx.beginPath();
        ctx.arc(midX, midY, pulse, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  /* ── Trail echo rendering ───────────────────────────────────────────────── */

  renderEchoes(echoes: EchoState[], c: string, opacity: number): void {
    const ctx = this.ctx;
    for (const echo of echoes) {
      if (echo.points.length < 2) continue;
      const a = (1 - echo.age / echo.maxAge) * opacity * 0.25;
      if (a <= 0) continue;
      ctx.beginPath();
      ctx.moveTo(echo.points[0].x, echo.points[0].y);
      for (let p = 1; p < echo.points.length; p++) {
        ctx.lineTo(echo.points[p].x, echo.points[p].y);
      }
      ctx.strokeStyle = `rgba(${c}, ${a})`;
      ctx.lineWidth = 1.5;
      ctx.lineCap = "round";
      ctx.stroke();
    }
  }

  /* ── Particle pool access ──────────────────────────────────────────────── */

  acquireParticle(): Particle {
    return this.particlePool.acquire();
  }

  releaseParticle(p: Particle): void {
    this.particlePool.release(p);
  }

  getGravityWells(): GravityWellState[] {
    return this.gravityWells;
  }
}
