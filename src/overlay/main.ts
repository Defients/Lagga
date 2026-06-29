import { listen, emit as tauriEmit } from "@tauri-apps/api/event";
import { DEFAULT_TRAIL, DEFAULT_GLOBAL, lerpColor, hexToRgb } from "../shared/settings";
import type { TrailSettings, GlobalSettings, LaggaPayload, TrailState, IdlePattern } from "../shared/types";
import { OverlayRenderer } from "./overlay-renderer";

window.addEventListener('error', (e) => {
  console.error('[overlay] FATAL ERROR:', e.message, e.filename, e.lineno, e.colno, e.error);
});
window.addEventListener('unhandledrejection', (e) => {
  console.error('[overlay] UNHANDLED REJECTION:', e.reason);
});

const canvas = document.getElementById("overlay-canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d", { alpha: true })!;
const dpr = window.devicePixelRatio || 1;

let cursorX = 0;
let cursorY = 0;
let windowOffsetX = 0;
let windowOffsetY = 0;
let settingsTrails: TrailSettings[] = Array.from({ length: 4 }, (_, i) => ({
  ...DEFAULT_TRAIL,
  name: `Trail ${i + 1}`,
  enabled: i === 0,
}));
let globalSettings: GlobalSettings = { ...DEFAULT_GLOBAL };

const trailStates: TrailState[] = Array.from({ length: 4 }, () => ({
  orbX: 0,
  orbY: 0,
  orbVx: 0,
  orbVy: 0,
  initialized: false,
  trail: [],
  particles: [],
  afterimages: [],
  lastAfterimageTime: 0,
  lastBurstTime: 0,
  prevOrbX: 0,
  prevOrbY: 0,
  lastEchoTime: 0,
  echoes: [],
  gravityWells: [],
  idlePhase: 0,
}));

let lastClickX = 0;
let lastClickY = 0;
let mouseSpeed = 0;
let prevCursorX = 0;
let prevCursorY = 0;
let lastMoveTime = 0;
let cursorIdle = false;

let fadeOpacity = 0;
let targetFadeOpacity = 0;
let autoDimFactor = 1.0;

let sessionStartTime = performance.now();
let sessionDistance = 0;
let sessionClicks = 0;
let sessionPeakSpeed = 0;
let lastStatsBroadcast = 0;

const renderer = new OverlayRenderer(ctx, dpr);

const VELOCITY_STOPS = [
  { speed: 0, color: "#00ffc8" },
  { speed: 250, color: "#4dabf7" },
  { speed: 550, color: "#fbbf24" },
  { speed: 850, color: "#ff00ff" },
];

function velocityToHex(speed: number): string {
  const s = Math.abs(speed);
  for (let i = 1; i < VELOCITY_STOPS.length; i++) {
    if (s <= VELOCITY_STOPS[i].speed) {
      const prev = VELOCITY_STOPS[i - 1];
      const curr = VELOCITY_STOPS[i];
      const t = (s - prev.speed) / (curr.speed - prev.speed);
      return lerpColor(prev.color, curr.color, t);
    }
  }
  return VELOCITY_STOPS[VELOCITY_STOPS.length - 1].color;
}

function resizeCanvas(): void {
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = `${window.innerWidth}px`;
  canvas.style.height = `${window.innerHeight}px`;
}

function applyHueShift(color: string, hueShift: number): string {
  if (hueShift === 0) return color;
  if (color.startsWith('hsl(')) {
    const match = color.match(/hsl\((\d+(?:\.\d+)?)/);
    if (match) {
      const hue = (parseFloat(match[1]) + hueShift) % 360;
      return color.replace(/hsl\(\d+(?:\.\d+)?/, `hsl(${hue}`);
    }
  }
  if (color.startsWith('rgb(')) {
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      const r = parseInt(match[1]) / 255;
      const g = parseInt(match[2]) / 255;
      const b = parseInt(match[3]) / 255;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const l = (max + min) / 2;
      const d = max - min;
      let h = 0;
      if (d !== 0) {
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
        if (h < 0) h += 360;
      }
      const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
      h = (h + hueShift) % 360;
      return `hsl(${h}, ${(s * 100).toFixed(0)}%, ${(l * 100).toFixed(0)}%)`;
    }
  }
  if (color.startsWith('#')) {
    const rgb = hexToRgb(color);
    return applyHueShift(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`, hueShift);
  }
  return color;
}

function getTrailColor(settings: TrailSettings, speed: number, timeMs: number, index: number): string {
  const cycleSpeed = settings.colorCycling ? settings.colorCycleSpeed : 1;
  if (settings.colorMode === "velocity") {
    if (settings.colorCycling) {
      const base = velocityToHex(speed);
      const shifted = lerpColor(base, settings.colorSecondary, (Math.sin(timeMs / 1000 * cycleSpeed) + 1) * 0.25);
      return shifted;
    }
    return velocityToHex(speed);
  }
  if (settings.colorMode === "rainbow") {
    const hue = (timeMs / 16 * cycleSpeed + index * 45) % 360;
    return `hsl(${hue}, 85%, 62%)`;
  }
  if (settings.colorMode === "gradient") {
    const phase = (Math.sin(timeMs / 700 * cycleSpeed + index) + 1) * 0.5;
    return lerpColor(settings.colorPrimary, settings.colorSecondary, phase);
  }
  if (settings.colorMode === "palette") {
    const phase = (Math.sin(timeMs / 900 * cycleSpeed + index * 0.7) + 1) * 0.5;
    return lerpColor(settings.colorSecondary, settings.colorTertiary, phase);
  }
  if (settings.colorMode === "pulse") {
    const pulse = (Math.sin(timeMs / 400 * cycleSpeed + index * 1.2) + 1) * 0.5;
    const brightness = 0.35 + pulse * 0.65;
    const base = settings.colorPrimary;
    const accent = settings.colorSecondary;
    const blended = lerpColor(base, accent, pulse * 0.4);
    const rgb = hexToRgb(blended);
    return `rgb(${Math.round(rgb.r * brightness)}, ${Math.round(rgb.g * brightness)}, ${Math.round(rgb.b * brightness)})`;
  }
  if (settings.colorCycling) {
    const phase = (Math.sin(timeMs / 700 * cycleSpeed + index) + 1) * 0.5;
    return lerpColor(settings.colorPrimary, settings.colorSecondary, phase * 0.3);
  }
  return settings.colorPrimary;
}

function getTrailColorWithHueShift(settings: TrailSettings, speed: number, timeMs: number, index: number): string {
  const base = getTrailColor(settings, speed, timeMs, index);
  return applyHueShift(base, globalSettings.globalHueShift);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

/* ── Poll for window size changes (Tauri programmatic resize may not fire DOM resize event) ── */
let lastWinW = window.innerWidth;
let lastWinH = window.innerHeight;
setInterval(() => {
  if (window.innerWidth !== lastWinW || window.innerHeight !== lastWinH) {
    lastWinW = window.innerWidth;
    lastWinH = window.innerHeight;
    resizeCanvas();
    console.log('[overlay] canvas resized via poll:', canvas.width, canvas.height);
  }
}, 500);

/* ── Periodically refresh window offset (handles monitor hot-plug / repositioning) ── */
setInterval(() => {
  updateWindowOffset();
}, 2000);

async function updateWindowOffset() {
  try {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    const pos = await win.outerPosition();
    windowOffsetX = pos.x;
    windowOffsetY = pos.y;
    console.log('[overlay] window offset:', windowOffsetX, windowOffsetY, 'innerSize:', window.innerWidth, window.innerHeight);
  } catch {
    // Not in Tauri environment (browser dev mode)
  }
}
updateWindowOffset();

/* ── Ensure overlay window is fullscreen via Tauri JS API (backup for Rust resize) ── */
async function ensureFullscreen() {
  try {
    const { getCurrentWindow, currentMonitor, PhysicalSize } = await import("@tauri-apps/api/window");
    const win = getCurrentWindow();
    const monitor = await currentMonitor();
    if (monitor) {
      const curSize = await win.innerSize();
      const monSize = monitor.size;
      const needsResize = Math.abs(curSize.width - monSize.width) > 10 || Math.abs(curSize.height - monSize.height) > 10;
      if (needsResize) {
        await win.setSize(new PhysicalSize(monSize.width, monSize.height));
        console.log('[overlay] ensured fullscreen:', monSize.width, monSize.height);
      } else {
        console.log('[overlay] already fullscreen:', curSize.width, curSize.height);
      }
    } else {
      console.log('[overlay] currentMonitor() returned null, relying on Rust positioning');
    }
    resizeCanvas();
    await updateWindowOffset();
  } catch (e) {
    console.error('[overlay] ensureFullscreen failed:', e);
    resizeCanvas();
    await updateWindowOffset();
  }
}
setTimeout(ensureFullscreen, 300);

console.log('[overlay] overlay script loaded, registering listeners...');

listen<{ x: number; y: number }>("cursor-move", (event) => {
  const newX = (event.payload.x - windowOffsetX) / dpr;
  const newY = (event.payload.y - windowOffsetY) / dpr;
  const dx = newX - cursorX;
  const dy = newY - cursorY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  mouseSpeed = dist;
  sessionDistance += dist;
  if (mouseSpeed > sessionPeakSpeed) sessionPeakSpeed = mouseSpeed;
  prevCursorX = cursorX;
  prevCursorY = cursorY;
  cursorX = newX;
  cursorY = newY;
  if (dist > 0.5) {
    lastMoveTime = performance.now();
    cursorIdle = false;
  }

  for (let i = 0; i < trailStates.length; i++) {
    const state = trailStates[i];
    const setting = settingsTrails[i];
    if (!state.initialized) {
      const angle = (Math.PI * 2 * i) / trailStates.length;
      const offset = setting.leashLength * 0.35;
      state.orbX = cursorX + Math.cos(angle) * offset;
      state.orbY = cursorY + Math.sin(angle) * offset;
      state.initialized = true;
    }
  }
});

listen<{ x: number; y: number }>("cursor-click", (event) => {
  lastClickX = (event.payload.x - windowOffsetX) / dpr;
  lastClickY = (event.payload.y - windowOffsetY) / dpr;
  sessionClicks++;
  for (let i = 0; i < trailStates.length; i++) {
    const settings = settingsTrails[i];
    if (!settings.enabled) continue;
    const color = getTrailColor(settings, mouseSpeed, performance.now(), i);
    if (settings.persistOnClick) {
      renderer.addPersistDots(lastClickX, lastClickY, color, 12);
    }
    if (settings.gravityWell) {
      renderer.addGravityWell(lastClickX, lastClickY, settings.gravityWellStrength);
    }
  }
});

listen<LaggaPayload>("settings-changed", (event) => {
  const payload = event.payload;
  console.log('[overlay] settings-changed received:', { overlayEnabled: payload?.global?.overlayEnabled, activeTrailCount: payload?.global?.activeTrailCount, trailsLen: payload?.trails?.length });
  if (payload?.global) globalSettings = { ...DEFAULT_GLOBAL, ...payload.global };
  targetFadeOpacity = globalSettings.overlayEnabled ? 1 : 0;
  if (payload?.trails?.length) {
    settingsTrails = Array.from({ length: 4 }, (_, i) => ({
      ...DEFAULT_TRAIL,
      ...(payload.trails[i] || {}),
      enabled: i < globalSettings.activeTrailCount && (payload.trails[i]?.enabled ?? i === 0),
      name: payload.trails[i]?.name || `Trail ${i + 1}`,
    }));
  }

  for (let i = 0; i < 4; i++) {
    const maxTrailLen = Math.max(2, Math.round(settingsTrails[i].trailLength));
    while (trailStates[i].trail.length > maxTrailLen) trailStates[i].trail.shift();
  }
  renderer.markTextureDirty();
}).catch(err => console.error('[overlay] settings-changed listen error:', err));

let lastTime = -1;
let frameSkipCounter = 0;

/* ── Adaptive quality system ────────────────────────────────────────────── */
const frameTimes: number[] = [];
const FRAME_SAMPLE_SIZE = 60;
const QUALITY_DEGRADED = 25;    // <40fps triggers reduction
const QUALITY_RECOVER = 18;     // >55fps triggers recovery
let qualityLevel = 1.0;         // 1.0 = full, down to 0.3
let qualityCheckTimer = 0;

function updateAdaptiveQuality(dtMs: number, dt: number): void {
  frameTimes.push(dtMs);
  if (frameTimes.length > FRAME_SAMPLE_SIZE) frameTimes.shift();

  qualityCheckTimer += dt;
  if (qualityCheckTimer < 0.5) return; // check every 500ms
  qualityCheckTimer = 0;

  if (frameTimes.length < 20) return;
  const avgMs = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
  const fps = Math.round(1000 / avgMs);

  if (globalSettings.performanceMode === 'auto') {
    if (avgMs > QUALITY_DEGRADED && qualityLevel > 0.3) {
      qualityLevel = Math.max(0.3, qualityLevel - 0.15);
    } else if (avgMs < QUALITY_RECOVER && qualityLevel < 1.0) {
      qualityLevel = Math.min(1.0, qualityLevel + 0.1);
    }
  } else if (globalSettings.performanceMode === 'quality') {
    qualityLevel = 1.0;
  } else if (globalSettings.performanceMode === 'balanced') {
    qualityLevel = 0.7;
  } else if (globalSettings.performanceMode === 'performance') {
    qualityLevel = 0.4;
  }

  // Broadcast quality metrics to main UI
  tauriEmit('overlay-quality', { fps, qualityLevel: Math.round(qualityLevel * 100) / 100 }).catch(() => {});
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function getAdaptiveParticleCount(settings: TrailSettings): number {
  const base = Math.round(settings.particleCount * qualityLevel);
  return reducedMotion ? Math.round(base * 0.3) : base;
}

function getAdaptiveTrailLength(settings: TrailSettings): number {
  const base = Math.max(2, Math.round(settings.trailLength * qualityLevel));
  return reducedMotion ? Math.max(2, Math.round(base * 0.4)) : base;
}

const screenW = () => canvas.width / dpr;
const screenH = () => canvas.height / dpr;

/* ── Physics update with all parameters ─────────────────────────────────── */
function updatePhysics(state: TrailState, settings: TrailSettings, dt: number, idx: number, activeIndices: number[], _timestamp: number): void {
  state.prevOrbX = state.orbX;
  state.prevOrbY = state.orbY;

  const dx = state.orbX - cursorX;
  const dy = state.orbY - cursorY;
  const dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
  const displacement = dist - settings.leashLength;
  const nx = dx / dist;
  const ny = dy / dist;

  const tensionMul = 0.5 + settings.springTension * 1.5;
  state.orbVx -= nx * displacement * settings.stiffness * tensionMul * dt;
  state.orbVy -= ny * displacement * settings.stiffness * tensionMul * dt;

  const gravityRad = (settings.gravityAngle * Math.PI) / 180;
  const gravityMul = settings.gravityFalloff > 0
    ? 1 - settings.gravityFalloff * Math.min(dist / 300, 1)
    : 1;
  state.orbVx += Math.cos(gravityRad) * settings.gravity * gravityMul * dt;
  state.orbVy += Math.sin(gravityRad) * settings.gravity * gravityMul * dt;

  const WIND_SCALE = 10;
  const windX = (settings.windX + globalSettings.globalWindX);
  const windY = (settings.windY + globalSettings.globalWindY);
  const windMag = Math.sqrt(windX * windX + windY * windY);
  if (windMag > 0.01) {
    const wdx = windX / windMag;
    const wdy = windY / windMag;
    // Project orb velocity onto wind direction (negative = moving against wind)
    const vAlongWind = state.orbVx * wdx + state.orbVy * wdy;
    if (vAlongWind < 0) {
      // Extra resistance when moving against the wind
      const resistance = -vAlongWind * windMag * WIND_SCALE * dt;
      state.orbVx += wdx * resistance;
      state.orbVy += wdy * resistance;
    } else {
      // Slight boost when moving with the wind
      const boost = vAlongWind * windMag * WIND_SCALE * 0.3 * dt;
      state.orbVx += wdx * boost;
      state.orbVy += wdy * boost;
    }
  }

  const turbulence = reducedMotion ? 0 : settings.turbulence * 80;
  if (turbulence > 0) {
    state.orbVx += (Math.random() - 0.5) * turbulence * dt;
    state.orbVy += (Math.random() - 0.5) * turbulence * dt;
  }

  if (settings.mouseVelocityInfluence && mouseSpeed > 0 && !cursorIdle) {
    const inf = Math.min(mouseSpeed / 200, 1) * 40 * dt;
    const mdx = cursorX - prevCursorX;
    const mdy = cursorY - prevCursorY;
    const mlen = Math.sqrt(mdx * mdx + mdy * mdy) || 0.001;
    state.orbVx += (mdx / mlen) * inf;
    state.orbVy += (mdy / mlen) * inf;
  }

  if (settings.orbitalAttraction > 0) {
    const perpX = -ny;
    const perpY = nx;
    const orbForce = settings.orbitalAttraction * 60 * dt;
    state.orbVx += perpX * orbForce;
    state.orbVy += perpY * orbForce;
  }

  /* ── Idle behavior: various patterns around cursor when idle ── */
  if (settings.idleTimeout > 0 && cursorIdle) {
    const idleSpeed = settings.idleOrbitSpeed;
    const orbitRadius = settings.leashLength * 0.6;
    state.idlePhase += idleSpeed * dt;
    const phaseIdx = idx * (Math.PI * 2 / activeIndices.length);
    const pattern: IdlePattern = settings.idlePattern;
    let targetX: number, targetY: number;
    if (pattern === 'figure8') {
      const t = state.idlePhase + phaseIdx;
      targetX = cursorX + Math.sin(t) * orbitRadius;
      targetY = cursorY + Math.sin(t * 2) * orbitRadius * 0.5;
    } else if (pattern === 'spiral') {
      const t = state.idlePhase + phaseIdx;
      const r = orbitRadius * (0.5 + 0.5 * Math.sin(t * 0.3));
      targetX = cursorX + Math.cos(t * 2) * r;
      targetY = cursorY + Math.sin(t * 2) * r;
    } else if (pattern === 'bounce') {
      const t = state.idlePhase + phaseIdx;
      targetX = cursorX + Math.cos(t) * orbitRadius * (1 + Math.sin(t * 3) * 0.2);
      targetY = cursorY + Math.sin(t * 1.3) * orbitRadius * (1 + Math.cos(t * 2.7) * 0.2);
    } else {
      // orbit (default)
      targetX = cursorX + Math.cos(state.idlePhase + phaseIdx) * orbitRadius;
      targetY = cursorY + Math.sin(state.idlePhase + phaseIdx) * orbitRadius;
    }
    state.orbVx += (targetX - state.orbX) * 2 * dt;
    state.orbVy += (targetY - state.orbY) * 2 * dt;
  }

  /* ── Magnetic repulsion between nearby trails ── */
  if (settings.magneticRepulsion > 0 && activeIndices.length > 1) {
    const repulseRange = 120;
    const repulseStrength = settings.magneticRepulsion * 200;
    for (const j of activeIndices) {
      if (j === idx) continue;
      const other = trailStates[j];
      const odx = state.orbX - other.orbX;
      const ody = state.orbY - other.orbY;
      const odist = Math.sqrt(odx * odx + ody * ody) || 0.001;
      if (odist < repulseRange) {
        const force = (1 - odist / repulseRange) * repulseStrength * dt;
        state.orbVx += (odx / odist) * force;
        state.orbVy += (ody / odist) * force;
      }
    }
  }

  const dampingMul = 1 - settings.damping * dt;
  const frictionMul = 1 - settings.friction * dt * 3;
  const decayMul = 1 - settings.velocityDecay * dt * 2;
  state.orbVx *= Math.max(0, dampingMul * frictionMul * decayMul);
  state.orbVy *= Math.max(0, dampingMul * frictionMul * decayMul);

  state.orbVx *= Math.max(0, 1 - (1 - settings.inertia) * dt * 2);
  state.orbVy *= Math.max(0, 1 - (1 - settings.inertia) * dt * 2);

  if (settings.crossTrailSync && activeIndices.length > 1) {
    for (const j of activeIndices) {
      if (j === idx) continue;
      const other = trailStates[j];
      const odx = other.orbX - state.orbX;
      const ody = other.orbY - state.orbY;
      const odist = Math.sqrt(odx * odx + ody * ody) || 0.001;
      state.orbVx += (odx / odist) * 15 * dt;
      state.orbVy += (ody / odist) * 15 * dt;
    }
  }

  /* ── Gravity wells: pull orb toward click-created wells ── */
  renderer.applyGravityWells(state, settings, dt);

  state.orbX += state.orbVx * dt;
  state.orbY += state.orbVy * dt;
}

/* ── Particle system ────────────────────────────────────────────────────── */
function spawnParticles(state: TrailState, settings: TrailSettings, dt: number): void {
  const target = getAdaptiveParticleCount(settings);
  const variance = settings.particleVariance;
  const curve = settings.sizeCurve;
  while (state.particles.length < target) {
    const sizeBase = settings.sizeMin + Math.random() * (settings.sizeMax - settings.sizeMin);
    const curveMul = curve > 0.5
      ? Math.pow(1 - Math.random(), (curve - 0.5) * 4 + 1)
      : 1 - Math.random() * curve * 0.5;
    const size = sizeBase * (1 - variance * 0.5 + Math.random() * variance) * (0.3 + curveMul * 0.7);
    const angle = Math.random() * Math.PI * 2;
    const speed = 10 + Math.random() * 40;
    const p = renderer.acquireParticle();
    p.x = state.orbX + (Math.random() - 0.5) * settings.orbRadius;
    p.y = state.orbY + (Math.random() - 0.5) * settings.orbRadius;
    p.vx = Math.cos(angle) * speed;
    p.vy = Math.sin(angle) * speed;
    p.maxLife = 0.5 + Math.random() * 1.5;
    p.size = size;
    state.particles.push(p);
  }
  for (let p = state.particles.length - 1; p >= 0; p--) {
    const part = state.particles[p];
    part.x += part.vx * dt;
    part.y += part.vy * dt;
    part.vx *= 0.96;
    part.vy *= 0.96;
    part.vy += 20 * dt;
    part.life -= dt / part.maxLife;
    if (part.life <= 0) {
      renderer.releaseParticle(part);
      state.particles.splice(p, 1);
    }
  }
}

/* ── Afterimage system ──────────────────────────────────────────────────── */
function updateAfterimages(state: TrailState, settings: TrailSettings, timestamp: number): void {
  if (!settings.afterimages) return;
  const interval = 80 / Math.max(1, settings.afterimageCount);
  if (timestamp - state.lastAfterimageTime > interval) {
    state.lastAfterimageTime = timestamp;
    state.afterimages.push({
      points: state.trail.map((p) => ({ x: p.x, y: p.y })),
      age: 0,
    });
    while (state.afterimages.length > settings.afterimageCount) {
      state.afterimages.shift();
    }
  }
  for (let a = state.afterimages.length - 1; a >= 0; a--) {
    state.afterimages[a].age += 1;
    if (state.afterimages[a].age > 60) state.afterimages.splice(a, 1);
  }
}

/* ── Main tick ──────────────────────────────────────────────────────────── */
function tick(timestamp: number): void {
  requestAnimationFrame(tick);

  if (document.hidden) {
    lastTime = timestamp;
    return;
  }

  if (lastTime < 0) {
    lastTime = timestamp;
    return;
  }

  const dtMs = timestamp - lastTime;
  lastTime = timestamp;
  const dt = Math.min(dtMs / 1000, 0.1);

  updateAdaptiveQuality(dtMs, dt);

  /* ── Frame skip when quality is degraded ── */
  if (qualityLevel < 0.5) {
    frameSkipCounter++;
    if (frameSkipCounter % 2 === 0) return;
  }

  /* ── Auto-dim: reduce opacity when cursor is idle ── */
  if (globalSettings.autoDim && lastMoveTime > 0) {
    const idleSecs = (timestamp - lastMoveTime) / 1000;
    if (idleSecs > globalSettings.autoDimDelay) {
      autoDimFactor += (globalSettings.autoDimOpacity - autoDimFactor) * Math.min(dt * 2, 1);
    } else {
      autoDimFactor += (1.0 - autoDimFactor) * Math.min(dt * 4, 1);
    }
  } else {
    autoDimFactor += (1.0 - autoDimFactor) * Math.min(dt * 4, 1);
  }

  /* ── Fade transition ── */
  fadeOpacity += (targetFadeOpacity - fadeOpacity) * Math.min(dt * 4, 1);

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (fadeOpacity < 0.01 && targetFadeOpacity === 0) return;

  if (fadeOpacity < 0.01) return;

  const activeIndices = Array.from({ length: Math.max(1, globalSettings.activeTrailCount) }, (_, i) => i)
    .filter((i) => settingsTrails[i]?.enabled);

  if (activeIndices.length === 0) return;

  /* ── Idle detection ── */
  const idleSince = (timestamp - lastMoveTime) / 1000;
  const anyIdleTimeout = Math.min(...activeIndices.map((i) => settingsTrails[i]?.idleTimeout || Infinity));
  cursorIdle = lastMoveTime > 0 && idleSince > anyIdleTimeout && anyIdleTimeout > 0;

  const masterOpacity = globalSettings.masterOpacity * fadeOpacity * autoDimFactor;
  const masterScale = globalSettings.masterScale;

  ctx.save();
  ctx.scale(dpr, dpr);

  /* ── Texture overlay: draw once per frame using first active trail's settings ── */
  const firstSettings = settingsTrails[activeIndices[0]];
  if (firstSettings.textureOverlay !== "none") {
    renderer.renderTextureOverlay(firstSettings, screenW(), screenH());
  }

  for (const i of activeIndices) {
    const settings = settingsTrails[i];
    const state = trailStates[i];
    if (!state.initialized) continue;

    updatePhysics(state, settings, dt, i, activeIndices, timestamp);

    const speed = Math.sqrt(state.orbVx * state.orbVx + state.orbVy * state.orbVy);
    const activeColor = getTrailColorWithHueShift(settings, speed, timestamp, i);
    const c = OverlayRenderer.toRgbComponents(activeColor);

    state.trail.push({ x: state.orbX, y: state.orbY, speed });
    const maxLen = Math.max(2, Math.round(getAdaptiveTrailLength(settings) * masterScale));
    while (state.trail.length > maxLen) state.trail.shift();

    /* ── Trail echo: snapshot trail at interval ── */
    if (settings.trailEcho && timestamp - state.lastEchoTime > settings.trailEchoInterval * 1000) {
      state.lastEchoTime = timestamp;
      state.echoes.push({
        points: state.trail.map((p) => ({ x: p.x, y: p.y })),
        age: 0,
        maxAge: 2.0,
      });
      if (state.echoes.length > 3) state.echoes.shift();
    }
    for (let e = state.echoes.length - 1; e >= 0; e--) {
      state.echoes[e].age += dt;
      if (state.echoes[e].age >= state.echoes[e].maxAge) state.echoes.splice(e, 1);
    }

    ctx.globalCompositeOperation = 'lighter';
    renderer.renderEchoes(state.echoes, c, settings.opacity * masterOpacity);
    renderer.renderAfterimages(state, settings, c, masterOpacity);
    updateAfterimages(state, settings, timestamp);
    renderer.renderTrail(state, settings, c, masterOpacity);

    spawnParticles(state, settings, dt);
    renderer.renderParticles(state, settings, c, masterOpacity);
    ctx.globalCompositeOperation = 'source-over';

    renderer.updateBursts(state, settings, timestamp, activeColor);

    if (settings.showTether) {
      renderer.renderTether(cursorX, cursorY, state, c);
    }

    ctx.globalCompositeOperation = 'lighter';
    renderer.renderOrb(state, settings, c, masterScale, masterOpacity, speed, timestamp);
    ctx.globalCompositeOperation = 'source-over';

    if (settings.showAnchor) {
      renderer.renderAnchor(cursorX, cursorY, c);
    }
  }

  renderer.updateGravityWells(dt);
  renderer.renderGravityWells();
  renderer.renderBursts(dt);
  renderer.renderPersistDots(dt);

  const shouldLinkNexus = activeIndices.some((i) => settingsTrails[i].nexusMode);
  if (shouldLinkNexus && activeIndices.length > 1) {
    renderer.renderNexusLinks(activeIndices, trailStates, settingsTrails, timestamp);
  }

  ctx.restore();

  /* ── Session stats broadcast (every 2s) ── */
  if (timestamp - lastStatsBroadcast > 2000) {
    lastStatsBroadcast = timestamp;
    tauriEmit('overlay-stats', {
      uptime: Math.round((timestamp - sessionStartTime) / 1000),
      distance: Math.round(sessionDistance),
      clicks: sessionClicks,
      peakSpeed: Math.round(sessionPeakSpeed),
    }).catch(() => {});
  }
}

requestAnimationFrame(tick);
