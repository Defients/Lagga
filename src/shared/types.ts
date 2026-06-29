/* ─── Lagga Type System ─────────────────────────────────────────────────── */

export type ColorMode = 'static' | 'gradient' | 'velocity' | 'rainbow' | 'palette' | 'pulse';
export type TextureOverlay = 'none' | 'nebula-noise' | 'starfield' | 'energy-filaments' | 'constellation' | 'vortex' | 'aurora-veil';
export type RenderMode = 'dots' | 'lines' | 'glowing-orbs' | 'energy-streams' | 'ribbon' | 'plasma-bolt' | 'shockwave' | 'fireflies' | 'spiral';
export type EnergyTag = 'ethereal' | 'aggressive' | 'minimal' | 'chaotic' | 'organic' | 'cyber' | 'void' | 'luminous';
export type PerformanceMode = 'auto' | 'quality' | 'balanced' | 'performance';
export type IdlePattern = 'orbit' | 'figure8' | 'spiral' | 'bounce';

/* ─── Per-Trail Settings ─────────────────────────────────────────────────── */

export interface TrailSettings {
  enabled: boolean;
  name: string;

  /* Physics */
  leashLength: number;        // 20-500
  stiffness: number;          // 50-800
  damping: number;            // 2-30
  gravity: number;            // -100..100
  gravityAngle: number;       // 0-360 deg
  gravityFalloff: number;     // 0-1
  inertia: number;            // 0-1
  friction: number;           // 0-1
  springTension: number;      // 0-1
  turbulence: number;         // 0-1
  orbitalAttraction: number;  // 0-1
  windX: number;              // -100..100
  windY: number;              // -100..100
  velocityDecay: number;      // 0-1

  /* Visuals */
  particleCount: number;      // 0-200
  particleVariance: number;   // 0-1
  orbRadius: number;          // 2-50
  sizeMin: number;            // 1-20
  sizeMax: number;            // 1-50
  sizeCurve: number;          // 0-1
  colorPrimary: string;
  colorSecondary: string;
  colorTertiary: string;
  glowIntensity: number;      // 0-1
  bloomStrength: number;      // 0-1
  trailLength: number;        // 2-128
  trailWidth: number;         // 1-20
  trailFadeCurve: number;     // 0-1  (0=linear, 1=exponential)
  textureOverlay: TextureOverlay;
  renderMode: RenderMode;
  opacity: number;            // 0-1

  /* Color */
  colorMode: ColorMode;
  colorCycling: boolean;
  colorCycleSpeed: number;    // 0.1-10

  /* Behaviors */
  mouseVelocityInfluence: boolean;
  randomBursts: boolean;
  burstFrequency: number;     // 0-1
  crossTrailSync: boolean;
  persistOnClick: boolean;
  velocityThickness: boolean;
  nexusMode: boolean;
  cometMode: boolean;         // dramatic comet-style trail head
  magneticRepulsion: number;  // 0-1, repulsion between nearby trails
  trailEcho: boolean;         // periodic echo of trail path
  trailEchoInterval: number;  // 0.5-5s, echo period
  breathing: boolean;         // orb radius subtly pulses
  breathSpeed: number;        // 0.1-3, breathing cycles per second
  breathDepth: number;        // 0-1, how much radius modulates
  gravityWell: boolean;       // clicks create temporary gravity wells
  gravityWellStrength: number;// 0-1, pull strength of gravity wells

  /* Idle */
  idleTimeout: number;        // seconds before idle mode (0 = disabled)
  idleOrbitSpeed: number;     // 0-2, orbit speed when idle
  idlePattern: IdlePattern;   // motion pattern when idle

  /* Advanced */
  afterimages: boolean;
  afterimageCount: number;    // 2-20
  showAnchor: boolean;
  showTether: boolean;
}

/* ─── Default Trail ──────────────────────────────────────────────────────── */

export const DEFAULT_TRAIL: TrailSettings = {
  enabled: true,
  name: 'Trail',

  leashLength: 70,
  stiffness: 300,
  damping: 10,
  gravity: 0,
  gravityAngle: 270,
  gravityFalloff: 0.5,
  inertia: 0.5,
  friction: 0.3,
  springTension: 0.5,
  turbulence: 0,
  orbitalAttraction: 0,
  windX: 0,
  windY: 0,
  velocityDecay: 0.1,

  particleCount: 20,
  particleVariance: 0.3,
  orbRadius: 14,
  sizeMin: 2,
  sizeMax: 8,
  sizeCurve: 0.5,
  colorPrimary: '#00ffc8',
  colorSecondary: '#7c3aed',
  colorTertiary: '#ec4899',
  glowIntensity: 0.3,
  bloomStrength: 0.2,
  trailLength: 24,
  trailWidth: 4,
  trailFadeCurve: 0.5,
  textureOverlay: 'none',
  renderMode: 'dots',
  opacity: 1,

  colorMode: 'static',
  colorCycling: false,
  colorCycleSpeed: 2,

  mouseVelocityInfluence: false,
  randomBursts: false,
  burstFrequency: 0.3,
  crossTrailSync: false,
  persistOnClick: false,
  velocityThickness: false,
  nexusMode: false,
  cometMode: false,
  magneticRepulsion: 0,
  trailEcho: false,
  trailEchoInterval: 1.5,
  breathing: false,
  breathSpeed: 0.8,
  breathDepth: 0.15,
  gravityWell: false,
  gravityWellStrength: 0.5,
  idleTimeout: 0,
  idleOrbitSpeed: 0.5,
  idlePattern: 'orbit' as IdlePattern,

  afterimages: false,
  afterimageCount: 5,
  showAnchor: false,
  showTether: false,
};

/* ─── Preset & Bundle Types ──────────────────────────────────────────────── */

export interface TrailPreset {
  name: string;
  description: string;
  icon: string;
  energy: EnergyTag;
  settings: Partial<TrailSettings>;
}

export interface PresetBundle {
  name: string;
  description: string;
  icon: string;
  energy: string;
  trailCount: 1 | 2 | 3 | 4;
  trails: Partial<TrailSettings>[];
}

/* ─── Global Settings ────────────────────────────────────────────────────── */

export interface GlobalSettings {
  overlayEnabled: boolean;
  activeTrailCount: number;    // 1-4
  masterOpacity: number;       // 0-1
  masterScale: number;         // 0.5-2
  globalWindX: number;         // -100..100, wind applied to all trails
  globalWindY: number;         // -100..100
  autoDim: boolean;            // dim overlay when cursor idle
  autoDimDelay: number;        // seconds before dimming
  autoDimOpacity: number;      // 0-1, dimmed opacity level
  performanceMode: PerformanceMode;
  globalHueShift: number;      // 0-360, hue shift applied to all trail colors
  autoSwapBundles: boolean;    // randomly swap between bundles with same trail count
  autoSwapInterval: number;    // seconds between swaps (30-3600)
}

export const DEFAULT_GLOBAL: GlobalSettings = {
  overlayEnabled: true,
  activeTrailCount: 1,
  masterOpacity: 1,
  masterScale: 1,
  globalWindX: 0,
  globalWindY: 0,
  autoDim: false,
  autoDimDelay: 10,
  autoDimOpacity: 0.3,
  performanceMode: 'auto',
  globalHueShift: 0,
  autoSwapBundles: false,
  autoSwapInterval: 120,
};

/* ─── Combined Payload (emitted to overlay) ──────────────────────────────── */

export interface LaggaPayload {
  global: GlobalSettings;
  trails: TrailSettings[];
}

/* ─── Overlay Runtime Types ──────────────────────────────────────────────── */

export interface TrailPoint {
  x: number;
  y: number;
  speed: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface BurstParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export interface AfterimageState {
  points: { x: number; y: number }[];
  age: number;
}

export interface PersistDot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface EchoState {
  points: { x: number; y: number }[];
  age: number;
  maxAge: number;
}

export interface GravityWellState {
  x: number;
  y: number;
  strength: number;
  life: number;
  maxLife: number;
}

export interface TrailState {
  orbX: number;
  orbY: number;
  orbVx: number;
  orbVy: number;
  initialized: boolean;
  trail: TrailPoint[];
  particles: Particle[];
  afterimages: AfterimageState[];
  lastAfterimageTime: number;
  lastBurstTime: number;
  prevOrbX: number;
  prevOrbY: number;
  lastEchoTime: number;
  echoes: EchoState[];
  gravityWells: GravityWellState[];
  idlePhase: number;
}
