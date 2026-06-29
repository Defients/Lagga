/* ─── Individual Presets & Preset Bundles ─────────────────────────────────
 *  16 individual presets covering ethereal → aggressive → cyber → organic
 *  9 curated bundles (2/3/4-trail) + random bundle generator
 * ────────────────────────────────────────────────────────────────────────── */

import type { TrailPreset, PresetBundle, TrailSettings } from './types';

/* ════════════════════════════════════════════════════════════════════════════
 *  INDIVIDUAL PRESETS (16)
 * ════════════════════════════════════════════════════════════════════════════ */

export const PRESETS: Record<string, TrailPreset> = {

  /* ── Ethereal ──────────────────────────────────────────────────────────── */
  nebulaWhisper: {
    name: 'Nebula Whisper',
    description: 'Soft cosmic mist drifting behind your cursor',
    icon: '🌌',
    energy: 'ethereal',
    settings: {
      leashLength: 110, stiffness: 120, damping: 6,
      gravity: -8, gravityAngle: 270, gravityFalloff: 0.8,
      inertia: 0.7, friction: 0.15, turbulence: 0.2,
      particleCount: 60, particleVariance: 0.6,
      orbRadius: 18, sizeMin: 2, sizeMax: 12, sizeCurve: 0.7,
      colorPrimary: '#a855f7', colorSecondary: '#6366f1', colorTertiary: '#3b82f6',
      glowIntensity: 0.4, bloomStrength: 0.5,
      trailLength: 48, trailWidth: 3, trailFadeCurve: 0.8,
      textureOverlay: 'nebula-noise', renderMode: 'glowing-orbs',
      opacity: 0.85, colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 0.8,
      mouseVelocityInfluence: true, afterimages: true, afterimageCount: 4,
    },
  },

  ghostDrift: {
    name: 'Ghost Drift',
    description: 'Barely there — a whisper in the void',
    icon: '👻',
    energy: 'ethereal',
    settings: {
      leashLength: 120, stiffness: 80, damping: 5,
      gravity: -3, gravityAngle: 270, inertia: 0.8, friction: 0.1,
      turbulence: 0.1,
      particleCount: 12, particleVariance: 0.4,
      orbRadius: 20, sizeMin: 3, sizeMax: 10, sizeCurve: 0.9,
      colorPrimary: '#ffffff', colorSecondary: '#e2e8f0', colorTertiary: '#94a3b8',
      glowIntensity: 0.08, bloomStrength: 0.15,
      trailLength: 56, trailWidth: 1.5, trailFadeCurve: 0.95,
      renderMode: 'glowing-orbs', opacity: 0.35,
      colorMode: 'static', afterimages: true, afterimageCount: 8,
    },
  },

  sakuraDrift: {
    name: 'Sakura Drift',
    description: 'Gentle cherry blossom petals floating free',
    icon: '🌸',
    energy: 'organic',
    settings: {
      leashLength: 100, stiffness: 100, damping: 5,
      gravity: 15, gravityAngle: 250, gravityFalloff: 0.7,
      inertia: 0.6, friction: 0.2, turbulence: 0.25,
      windX: 12, windY: 5,
      particleCount: 45, particleVariance: 0.7,
      orbRadius: 10, sizeMin: 3, sizeMax: 9, sizeCurve: 0.6,
      colorPrimary: '#f9a8d4', colorSecondary: '#fbcfe8', colorTertiary: '#ffffff',
      glowIntensity: 0.2, bloomStrength: 0.25,
      trailLength: 36, trailWidth: 2, trailFadeCurve: 0.7,
      renderMode: 'dots', opacity: 0.9,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 0.5,
      mouseVelocityInfluence: true,
    },
  },

  /* ── Aggressive ────────────────────────────────────────────────────────── */
  voidSurge: {
    name: 'Void Surge',
    description: 'Dark energy ripping through spacetime',
    icon: '🕳️',
    energy: 'aggressive',
    settings: {
      leashLength: 60, stiffness: 500, damping: 14,
      gravity: 0, inertia: 0.3, friction: 0.05,
      turbulence: 0.6, velocityDecay: 0.02,
      particleCount: 80, particleVariance: 0.8,
      orbRadius: 12, sizeMin: 1, sizeMax: 6, sizeCurve: 0.3,
      colorPrimary: '#dc2626', colorSecondary: '#7f1d1d', colorTertiary: '#450a0a',
      glowIntensity: 0.7, bloomStrength: 0.6,
      trailLength: 32, trailWidth: 5, trailFadeCurve: 0.4,
      textureOverlay: 'energy-filaments', renderMode: 'energy-streams',
      opacity: 0.95, colorMode: 'velocity',
      mouseVelocityInfluence: true, velocityThickness: true,
      randomBursts: true, burstFrequency: 0.6,
    },
  },

  lightningArc: {
    name: 'Lightning Arc',
    description: 'Crackling bolts of raw electrical fury',
    icon: '⚡',
    energy: 'aggressive',
    settings: {
      leashLength: 45, stiffness: 700, damping: 18,
      gravity: 0, inertia: 0.15, friction: 0.02,
      turbulence: 0.7, springTension: 0.9,
      particleCount: 30, particleVariance: 0.9,
      orbRadius: 8, sizeMin: 1, sizeMax: 4, sizeCurve: 0.2,
      colorPrimary: '#dbeafe', colorSecondary: '#60a5fa', colorTertiary: '#2563eb',
      glowIntensity: 0.9, bloomStrength: 0.8,
      trailLength: 20, trailWidth: 2, trailFadeCurve: 0.2,
      renderMode: 'lines', opacity: 1,
      colorMode: 'velocity', colorCycling: false,
      mouseVelocityInfluence: true, velocityThickness: true,
      randomBursts: true, burstFrequency: 0.8,
      afterimages: true, afterimageCount: 3,
    },
  },

  plasmaFang: {
    name: 'Plasma Fang',
    description: 'Sharp electric plasma cutting through space',
    icon: '🔱',
    energy: 'aggressive',
    settings: {
      leashLength: 55, stiffness: 600, damping: 16,
      gravity: 0, inertia: 0.2, friction: 0.05,
      turbulence: 0.4, springTension: 0.8,
      particleCount: 40, particleVariance: 0.5,
      orbRadius: 10, sizeMin: 1, sizeMax: 5, sizeCurve: 0.25,
      colorPrimary: '#22d3ee', colorSecondary: '#06b6d4', colorTertiary: '#ffffff',
      glowIntensity: 0.8, bloomStrength: 0.7,
      trailLength: 28, trailWidth: 3, trailFadeCurve: 0.3,
      renderMode: 'lines', opacity: 1,
      colorMode: 'static', mouseVelocityInfluence: true, velocityThickness: true,
    },
  },

  /* ── Minimal / Void ────────────────────────────────────────────────────── */
  darkMatter: {
    name: 'Dark Matter',
    description: 'Invisible force — you feel it more than see it',
    icon: '⚫',
    energy: 'void',
    settings: {
      leashLength: 90, stiffness: 150, damping: 8,
      gravity: -2, inertia: 0.6, friction: 0.3,
      particleCount: 8, particleVariance: 0.3,
      orbRadius: 16, sizeMin: 2, sizeMax: 6, sizeCurve: 0.5,
      colorPrimary: '#4c1d95', colorSecondary: '#2e1065', colorTertiary: '#1e1b4b',
      glowIntensity: 0.05, bloomStrength: 0.08,
      trailLength: 40, trailWidth: 2, trailFadeCurve: 0.9,
      renderMode: 'glowing-orbs', opacity: 0.25,
      colorMode: 'static',
    },
  },

  crystalLattice: {
    name: 'Crystal Lattice',
    description: 'Clean geometric precision in ice blue',
    icon: '💎',
    energy: 'minimal',
    settings: {
      leashLength: 40, stiffness: 450, damping: 16,
      gravity: 0, inertia: 0.3, friction: 0.4,
      particleCount: 15, particleVariance: 0.1,
      orbRadius: 8, sizeMin: 2, sizeMax: 5, sizeCurve: 0.3,
      colorPrimary: '#bae6fd', colorSecondary: '#7dd3fc', colorTertiary: '#38bdf8',
      glowIntensity: 0.25, bloomStrength: 0.15,
      trailLength: 16, trailWidth: 1.5, trailFadeCurve: 0.4,
      renderMode: 'dots', opacity: 0.9,
      colorMode: 'static',
    },
  },

  minimal: {
    name: 'Minimal',
    description: 'Just the essential dot — nothing more',
    icon: '·',
    energy: 'minimal',
    settings: {
      leashLength: 25, stiffness: 550, damping: 20,
      gravity: 0, inertia: 0.2, friction: 0.5,
      particleCount: 0, orbRadius: 5,
      sizeMin: 3, sizeMax: 5, sizeCurve: 0.5,
      colorPrimary: '#e2e8f0', colorSecondary: '#cbd5e1', colorTertiary: '#94a3b8',
      glowIntensity: 0.05, bloomStrength: 0,
      trailLength: 6, trailWidth: 1.5, trailFadeCurve: 0.5,
      renderMode: 'dots', opacity: 0.8, colorMode: 'static',
    },
  },

  /* ── Cyber ─────────────────────────────────────────────────────────────── */
  neonRazor: {
    name: 'Neon Razor',
    description: 'Cyberpunk neon slicing through the grid',
    icon: '🔮',
    energy: 'cyber',
    settings: {
      leashLength: 65, stiffness: 400, damping: 12,
      gravity: 0, inertia: 0.3, friction: 0.1,
      turbulence: 0.15, springTension: 0.7,
      particleCount: 25, particleVariance: 0.3,
      orbRadius: 12, sizeMin: 1, sizeMax: 6, sizeCurve: 0.3,
      colorPrimary: '#f0abfc', colorSecondary: '#e879f9', colorTertiary: '#a3e635',
      glowIntensity: 0.75, bloomStrength: 0.65,
      trailLength: 36, trailWidth: 3, trailFadeCurve: 0.35,
      renderMode: 'lines', opacity: 1,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 3,
      mouseVelocityInfluence: true, velocityThickness: true,
    },
  },

  quantumBlur: {
    name: 'Quantum Blur',
    description: 'Probabilistic uncertainty at the subatomic level',
    icon: '🔬',
    energy: 'cyber',
    settings: {
      leashLength: 80, stiffness: 200, damping: 7,
      gravity: 0, inertia: 0.6, friction: 0.15,
      turbulence: 0.5, orbitalAttraction: 0.3,
      particleCount: 50, particleVariance: 0.9,
      orbRadius: 14, sizeMin: 1, sizeMax: 7, sizeCurve: 0.4,
      colorPrimary: '#818cf8', colorSecondary: '#6366f1', colorTertiary: '#4f46e5',
      glowIntensity: 0.35, bloomStrength: 0.3,
      trailLength: 24, trailWidth: 2, trailFadeCurve: 0.6,
      renderMode: 'dots', opacity: 0.7,
      colorMode: 'rainbow', colorCycling: true, colorCycleSpeed: 1.5,
      afterimages: true, afterimageCount: 12,
      randomBursts: true, burstFrequency: 0.4,
    },
  },

  /* ── Luminous ──────────────────────────────────────────────────────────── */
  starforgePulse: {
    name: 'Starforge Pulse',
    description: 'Golden stellar energy from the heart of a star',
    icon: '⭐',
    energy: 'luminous',
    settings: {
      leashLength: 75, stiffness: 280, damping: 10,
      gravity: 0, inertia: 0.45, friction: 0.25,
      particleCount: 35, particleVariance: 0.4,
      orbRadius: 16, sizeMin: 3, sizeMax: 10, sizeCurve: 0.6,
      colorPrimary: '#fbbf24', colorSecondary: '#f59e0b', colorTertiary: '#d97706',
      glowIntensity: 0.6, bloomStrength: 0.5,
      trailLength: 30, trailWidth: 4, trailFadeCurve: 0.5,
      textureOverlay: 'starfield', renderMode: 'glowing-orbs',
      opacity: 0.95, colorMode: 'gradient',
      mouseVelocityInfluence: true,
      afterimages: true, afterimageCount: 5,
    },
  },

  solarWind: {
    name: 'Solar Wind',
    description: 'Warm plasma stream from a nearby sun',
    icon: '☀️',
    energy: 'luminous',
    settings: {
      leashLength: 95, stiffness: 180, damping: 7,
      gravity: 0, inertia: 0.55, friction: 0.2,
      turbulence: 0.3, windX: 20, windY: -5,
      particleCount: 55, particleVariance: 0.5,
      orbRadius: 12, sizeMin: 2, sizeMax: 8, sizeCurve: 0.5,
      colorPrimary: '#fb923c', colorSecondary: '#f97316', colorTertiary: '#fbbf24',
      glowIntensity: 0.5, bloomStrength: 0.4,
      trailLength: 44, trailWidth: 3.5, trailFadeCurve: 0.6,
      renderMode: 'energy-streams', opacity: 0.9,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 1.2,
      mouseVelocityInfluence: true,
    },
  },

  /* ── Organic ───────────────────────────────────────────────────────────── */
  deepOcean: {
    name: 'Deep Ocean',
    description: 'Bioluminescent currents from the abyss',
    icon: '🌊',
    energy: 'organic',
    settings: {
      leashLength: 105, stiffness: 140, damping: 6,
      gravity: 5, gravityAngle: 280, gravityFalloff: 0.6,
      inertia: 0.65, friction: 0.2, turbulence: 0.2,
      particleCount: 40, particleVariance: 0.5,
      orbRadius: 14, sizeMin: 2, sizeMax: 9, sizeCurve: 0.7,
      colorPrimary: '#06b6d4', colorSecondary: '#0891b2', colorTertiary: '#164e63',
      glowIntensity: 0.35, bloomStrength: 0.3,
      trailLength: 40, trailWidth: 3, trailFadeCurve: 0.7,
      renderMode: 'energy-streams', opacity: 0.85,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 0.6,
      mouseVelocityInfluence: true,
    },
  },

  auroraStream: {
    name: 'Aurora Stream',
    description: 'Northern lights cascading with your motion',
    icon: '🌈',
    energy: 'organic',
    settings: {
      leashLength: 100, stiffness: 160, damping: 7,
      gravity: -5, gravityAngle: 90, gravityFalloff: 0.5,
      inertia: 0.5, friction: 0.25, turbulence: 0.15,
      particleCount: 50, particleVariance: 0.4,
      orbRadius: 14, sizeMin: 2, sizeMax: 10, sizeCurve: 0.65,
      colorPrimary: '#34d399', colorSecondary: '#22d3ee', colorTertiary: '#a78bfa',
      glowIntensity: 0.45, bloomStrength: 0.4,
      trailLength: 52, trailWidth: 4, trailFadeCurve: 0.65,
      renderMode: 'energy-streams', opacity: 0.9,
      colorMode: 'rainbow', colorCycling: true, colorCycleSpeed: 1,
      mouseVelocityInfluence: true,
    },
  },

  /* ── Chaotic ───────────────────────────────────────────────────────────── */
  chaosEngine: {
    name: 'Chaos Engine',
    description: 'Unhinged particle mayhem across all spectrums',
    icon: '🌀',
    energy: 'chaotic',
    settings: {
      leashLength: 85, stiffness: 250, damping: 8,
      gravity: 10, gravityAngle: 180, gravityFalloff: 0.3,
      inertia: 0.4, friction: 0.08, turbulence: 0.85,
      orbitalAttraction: 0.4, windX: -15, windY: 10,
      velocityDecay: 0.05,
      particleCount: 120, particleVariance: 1,
      orbRadius: 10, sizeMin: 1, sizeMax: 14, sizeCurve: 0.3,
      colorPrimary: '#f43f5e', colorSecondary: '#a855f7', colorTertiary: '#22d3ee',
      glowIntensity: 0.6, bloomStrength: 0.5,
      trailLength: 20, trailWidth: 4, trailFadeCurve: 0.3,
      renderMode: 'dots', opacity: 0.95,
      colorMode: 'rainbow', colorCycling: true, colorCycleSpeed: 6,
      mouseVelocityInfluence: true,
      randomBursts: true, burstFrequency: 0.9,
      velocityThickness: true,
      afterimages: true, afterimageCount: 6,
    },
  },

  emberTrail: {
    name: 'Ember Trail',
    description: 'Dying embers scattering from molten motion',
    icon: '🔥',
    energy: 'chaotic',
    settings: {
      leashLength: 70, stiffness: 220, damping: 9,
      gravity: 25, gravityAngle: 270, gravityFalloff: 0.4,
      inertia: 0.4, friction: 0.15, turbulence: 0.35,
      velocityDecay: 0.15,
      particleCount: 90, particleVariance: 0.7,
      orbRadius: 8, sizeMin: 1, sizeMax: 5, sizeCurve: 0.4,
      colorPrimary: '#ef4444', colorSecondary: '#f97316', colorTertiary: '#fbbf24',
      glowIntensity: 0.55, bloomStrength: 0.45,
      trailLength: 18, trailWidth: 2, trailFadeCurve: 0.5,
      renderMode: 'dots', opacity: 0.9,
      colorMode: 'velocity', mouseVelocityInfluence: true,
      randomBursts: true, burstFrequency: 0.5,
      cometMode: true,
    },
  },

  /* ── New presets using evolved features ─────────────────────────────── */
  cometStrike: {
    name: 'Comet Strike',
    description: 'Blazing comet with luminous tail streaking through space',
    icon: '☄️',
    energy: 'aggressive',
    settings: {
      leashLength: 50, stiffness: 450, damping: 12,
      gravity: 0, inertia: 0.25, friction: 0.08,
      turbulence: 0.2, springTension: 0.8,
      particleCount: 50, particleVariance: 0.5,
      orbRadius: 14, sizeMin: 2, sizeMax: 8, sizeCurve: 0.4,
      colorPrimary: '#fbbf24', colorSecondary: '#f97316', colorTertiary: '#ef4444',
      glowIntensity: 0.8, bloomStrength: 0.7,
      trailLength: 40, trailWidth: 5, trailFadeCurve: 0.6,
      renderMode: 'ribbon', opacity: 1,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 2,
      mouseVelocityInfluence: true, velocityThickness: true,
      cometMode: true,
      afterimages: true, afterimageCount: 3,
    },
  },

  constellationMap: {
    name: 'Constellation Map',
    description: 'Stars connected by invisible threads in the deep void',
    icon: '🗺️',
    energy: 'ethereal',
    settings: {
      leashLength: 90, stiffness: 130, damping: 7,
      gravity: -5, gravityAngle: 270, gravityFalloff: 0.6,
      inertia: 0.6, friction: 0.2, turbulence: 0.1,
      particleCount: 30, particleVariance: 0.4,
      orbRadius: 12, sizeMin: 1, sizeMax: 6, sizeCurve: 0.8,
      colorPrimary: '#e2e8f0', colorSecondary: '#94a3b8', colorTertiary: '#64748b',
      glowIntensity: 0.3, bloomStrength: 0.25,
      trailLength: 36, trailWidth: 2, trailFadeCurve: 0.7,
      textureOverlay: 'constellation', renderMode: 'dots',
      opacity: 0.8, colorMode: 'static',
      idleTimeout: 5, idleOrbitSpeed: 0.3,
    },
  },

  magneticDuo: {
    name: 'Magnetic Duo',
    description: 'Two trails repelling like opposing magnetic fields',
    icon: '🧲',
    energy: 'cyber',
    settings: {
      leashLength: 65, stiffness: 300, damping: 10,
      gravity: 0, inertia: 0.4, friction: 0.15,
      springTension: 0.6,
      particleCount: 35, particleVariance: 0.4,
      orbRadius: 12, sizeMin: 2, sizeMax: 7, sizeCurve: 0.5,
      colorPrimary: '#22d3ee', colorSecondary: '#a855f7', colorTertiary: '#ec4899',
      glowIntensity: 0.5, bloomStrength: 0.4,
      trailLength: 28, trailWidth: 3, trailFadeCurve: 0.5,
      renderMode: 'ribbon', opacity: 0.9,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 1.5,
      mouseVelocityInfluence: true,
      magneticRepulsion: 0.6,
    },
  },

  idleOrbiter: {
    name: 'Idle Orbiter',
    description: 'Gentle companion that orbits when you rest',
    icon: '🛰️',
    energy: 'organic',
    settings: {
      leashLength: 80, stiffness: 180, damping: 8,
      gravity: 0, inertia: 0.5, friction: 0.2,
      particleCount: 25, particleVariance: 0.4,
      orbRadius: 13, sizeMin: 2, sizeMax: 8, sizeCurve: 0.6,
      colorPrimary: '#34d399', colorSecondary: '#22d3ee', colorTertiary: '#6ee7b7',
      glowIntensity: 0.4, bloomStrength: 0.35,
      trailLength: 32, trailWidth: 3, trailFadeCurve: 0.6,
      renderMode: 'glowing-orbs', opacity: 0.85,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 0.8,
      mouseVelocityInfluence: true,
      idleTimeout: 3, idleOrbitSpeed: 1.2,
    },
  },

  /* ── Plasma / Shockwave / Pulse ───────────────────────────────────────── */

  plasmaArc: {
    name: 'Plasma Arc',
    description: 'Crackling electric bolts with white-hot core',
    icon: '⚡',
    energy: 'aggressive',
    settings: {
      leashLength: 70, stiffness: 350, damping: 5,
      gravity: 0, inertia: 0.6, friction: 0.1,
      turbulence: 0.35,
      particleCount: 40, particleVariance: 0.5,
      orbRadius: 14, sizeMin: 1, sizeMax: 6, sizeCurve: 0.8,
      colorPrimary: '#22d3ee', colorSecondary: '#a855f7', colorTertiary: '#3b82f6',
      glowIntensity: 0.7, bloomStrength: 0.6,
      trailLength: 30, trailWidth: 4, trailFadeCurve: 0.65,
      renderMode: 'plasma-bolt', opacity: 0.9,
      colorMode: 'pulse', colorCycling: true, colorCycleSpeed: 1.5,
      mouseVelocityInfluence: true,
    },
  },

  seismicRipple: {
    name: 'Seismic Ripple',
    description: 'Expanding shockwave rings on every click',
    icon: '💥',
    energy: 'aggressive',
    settings: {
      leashLength: 90, stiffness: 200, damping: 7,
      gravity: 5, gravityAngle: 90, gravityFalloff: 0.3,
      inertia: 0.5, friction: 0.15,
      particleCount: 30, particleVariance: 0.4,
      orbRadius: 16, sizeMin: 2, sizeMax: 10, sizeCurve: 0.6,
      colorPrimary: '#f97316', colorSecondary: '#fbbf24', colorTertiary: '#fde047',
      glowIntensity: 0.5, bloomStrength: 0.4,
      trailLength: 24, trailWidth: 5, trailFadeCurve: 0.5,
      renderMode: 'shockwave', opacity: 0.85,
      colorMode: 'gradient', colorCycling: false,
    },
  },

  heartbeat: {
    name: 'Heartbeat',
    description: 'Pulsing living light that breathes with your motion',
    icon: '💓',
    energy: 'organic',
    settings: {
      leashLength: 75, stiffness: 160, damping: 6,
      gravity: 0, inertia: 0.55, friction: 0.18,
      particleCount: 35, particleVariance: 0.3,
      orbRadius: 15, sizeMin: 2, sizeMax: 9, sizeCurve: 0.65,
      colorPrimary: '#ec4899', colorSecondary: '#f43f5e', colorTertiary: '#a855f7',
      glowIntensity: 0.6, bloomStrength: 0.5,
      trailLength: 36, trailWidth: 3.5, trailFadeCurve: 0.7,
      renderMode: 'glowing-orbs', opacity: 0.88,
      colorMode: 'pulse', colorCycling: true, colorCycleSpeed: 0.6,
      mouseVelocityInfluence: true,
      trailEcho: true, trailEchoInterval: 1.2,
    },
  },

  ghostTrail: {
    name: 'Ghost Trail',
    description: 'Echoes of your past path linger and fade',
    icon: '👻',
    energy: 'ethereal',
    settings: {
      leashLength: 100, stiffness: 130, damping: 7,
      gravity: -5, gravityAngle: 270, gravityFalloff: 0.6,
      inertia: 0.65, friction: 0.2, turbulence: 0.15,
      particleCount: 20, particleVariance: 0.5,
      orbRadius: 12, sizeMin: 1, sizeMax: 7, sizeCurve: 0.7,
      colorPrimary: '#6366f1', colorSecondary: '#a78bfa', colorTertiary: '#c084fc',
      glowIntensity: 0.35, bloomStrength: 0.45,
      trailLength: 40, trailWidth: 2.5, trailFadeCurve: 0.75,
      renderMode: 'lines', opacity: 0.7,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 0.5,
      trailEcho: true, trailEchoInterval: 2.0,
    },
  },

  /* ── New Feature Presets ───────────────────────────────────────────────── */

  fireflyGrove: {
    name: 'Firefly Grove',
    description: 'Blinking fireflies dancing through a summer night',
    icon: '🪲',
    energy: 'organic',
    settings: {
      leashLength: 95, stiffness: 140, damping: 6,
      gravity: -2, gravityAngle: 270, gravityFalloff: 0.5,
      inertia: 0.6, friction: 0.18, turbulence: 0.3,
      particleCount: 50, particleVariance: 0.7,
      orbRadius: 14, sizeMin: 2, sizeMax: 8, sizeCurve: 0.7,
      colorPrimary: '#fbbf24', colorSecondary: '#84cc16', colorTertiary: '#facc15',
      glowIntensity: 0.5, bloomStrength: 0.4,
      trailLength: 40, trailWidth: 3, trailFadeCurve: 0.75,
      textureOverlay: 'nebula-noise', renderMode: 'fireflies',
      opacity: 0.85, colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 0.6,
      mouseVelocityInfluence: true,
      idleTimeout: 4, idleOrbitSpeed: 0.8, idlePattern: 'figure8',
    },
  },

  spiralGalaxy: {
    name: 'Spiral Galaxy',
    description: 'Hypnotic spiral arms swirling around your cursor',
    icon: '🌀',
    energy: 'ethereal',
    settings: {
      leashLength: 85, stiffness: 160, damping: 7,
      gravity: 0, inertia: 0.55, friction: 0.15,
      turbulence: 0.2,
      particleCount: 40, particleVariance: 0.5,
      orbRadius: 16, sizeMin: 2, sizeMax: 9, sizeCurve: 0.65,
      colorPrimary: '#a855f7', colorSecondary: '#22d3ee', colorTertiary: '#f472b6',
      glowIntensity: 0.55, bloomStrength: 0.45,
      trailLength: 44, trailWidth: 3.5, trailFadeCurve: 0.7,
      textureOverlay: 'vortex', renderMode: 'spiral',
      opacity: 0.88, colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 1.0,
      mouseVelocityInfluence: true,
      orbitalAttraction: 0.3,
    },
  },

  auroraVeil: {
    name: 'Aurora Veil',
    description: 'Shimmering curtains of light like the northern sky',
    icon: '🌌',
    energy: 'ethereal',
    settings: {
      leashLength: 100, stiffness: 110, damping: 6,
      gravity: -4, gravityAngle: 270, gravityFalloff: 0.7,
      inertia: 0.7, friction: 0.18, turbulence: 0.15,
      windX: 8, windY: -3,
      particleCount: 35, particleVariance: 0.5,
      orbRadius: 15, sizeMin: 2, sizeMax: 10, sizeCurve: 0.7,
      colorPrimary: '#34d399', colorSecondary: '#22d3ee', colorTertiary: '#a855f7',
      glowIntensity: 0.45, bloomStrength: 0.4,
      trailLength: 48, trailWidth: 3, trailFadeCurve: 0.8,
      textureOverlay: 'aurora-veil', renderMode: 'energy-streams',
      opacity: 0.82, colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 0.7,
      mouseVelocityInfluence: true,
      breathing: true, breathSpeed: 0.5, breathDepth: 0.12,
    },
  },

  pulsarCore: {
    name: 'Pulsar Core',
    description: 'Breathing neutron star with gravity well pulses',
    icon: '💫',
    energy: 'aggressive',
    settings: {
      leashLength: 70, stiffness: 280, damping: 9,
      gravity: 0, inertia: 0.45, friction: 0.12,
      turbulence: 0.25,
      particleCount: 55, particleVariance: 0.5,
      orbRadius: 18, sizeMin: 2, sizeMax: 8, sizeCurve: 0.6,
      colorPrimary: '#22d3ee', colorSecondary: '#a855f7', colorTertiary: '#f472b6',
      glowIntensity: 0.7, bloomStrength: 0.55,
      trailLength: 32, trailWidth: 4, trailFadeCurve: 0.55,
      renderMode: 'glowing-orbs', opacity: 0.9,
      colorMode: 'pulse', colorCycling: true, colorCycleSpeed: 1.2,
      mouseVelocityInfluence: true,
      breathing: true, breathSpeed: 1.5, breathDepth: 0.25,
      gravityWell: true, gravityWellStrength: 0.7,
    },
  },

  wanderlust: {
    name: 'Wanderlust',
    description: 'Restless spirit that bounces and spirals when idle',
    icon: '🧭',
    energy: 'organic',
    settings: {
      leashLength: 90, stiffness: 170, damping: 7,
      gravity: 0, inertia: 0.5, friction: 0.16,
      turbulence: 0.2,
      particleCount: 30, particleVariance: 0.5,
      orbRadius: 13, sizeMin: 2, sizeMax: 8, sizeCurve: 0.6,
      colorPrimary: '#f97316', colorSecondary: '#fbbf24', colorTertiary: '#fb923c',
      glowIntensity: 0.45, bloomStrength: 0.4,
      trailLength: 36, trailWidth: 3, trailFadeCurve: 0.65,
      renderMode: 'spiral', opacity: 0.85,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 0.9,
      mouseVelocityInfluence: true,
      idleTimeout: 3, idleOrbitSpeed: 1.0, idlePattern: 'bounce',
    },
  },

  /* ── Presets leveraging underused features ──────────────────────────────── */

  nexusWeb: {
    name: 'Nexus Web',
    description: 'Linked energy nodes forming a living constellation web',
    icon: '🕸️',
    energy: 'cyber',
    settings: {
      leashLength: 75, stiffness: 220, damping: 9,
      gravity: 0, inertia: 0.45, friction: 0.15,
      turbulence: 0.1, springTension: 0.6,
      particleCount: 25, particleVariance: 0.3,
      orbRadius: 12, sizeMin: 2, sizeMax: 7, sizeCurve: 0.5,
      colorPrimary: '#22d3ee', colorSecondary: '#6366f1', colorTertiary: '#a855f7',
      glowIntensity: 0.55, bloomStrength: 0.45,
      trailLength: 28, trailWidth: 2.5, trailFadeCurve: 0.5,
      renderMode: 'glowing-orbs', opacity: 0.9,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 1.2,
      mouseVelocityInfluence: true,
      nexusMode: true,
      crossTrailSync: true,
      showTether: true,
    },
  },

  emberSpark: {
    name: 'Ember Spark',
    description: 'Click to scatter persistent glowing embers in your wake',
    icon: '✨',
    energy: 'chaotic',
    settings: {
      leashLength: 60, stiffness: 320, damping: 11,
      gravity: 12, gravityAngle: 270, gravityFalloff: 0.4,
      inertia: 0.35, friction: 0.12, turbulence: 0.3,
      velocityDecay: 0.08,
      particleCount: 45, particleVariance: 0.6,
      orbRadius: 10, sizeMin: 1, sizeMax: 6, sizeCurve: 0.4,
      colorPrimary: '#f97316', colorSecondary: '#fbbf24', colorTertiary: '#ef4444',
      glowIntensity: 0.6, bloomStrength: 0.5,
      trailLength: 22, trailWidth: 3, trailFadeCurve: 0.45,
      renderMode: 'dots', opacity: 0.9,
      colorMode: 'velocity', mouseVelocityInfluence: true,
      persistOnClick: true,
      randomBursts: true, burstFrequency: 0.4,
    },
  },

  quantumTether: {
    name: 'Quantum Tether',
    description: 'Entangled particle anchored to your cursor by visible thread',
    icon: '🔗',
    energy: 'minimal',
    settings: {
      leashLength: 50, stiffness: 380, damping: 14,
      gravity: 0, inertia: 0.3, friction: 0.35,
      springTension: 0.8,
      particleCount: 15, particleVariance: 0.2,
      orbRadius: 10, sizeMin: 2, sizeMax: 6, sizeCurve: 0.4,
      colorPrimary: '#06b6d4', colorSecondary: '#0891b2', colorTertiary: '#22d3ee',
      glowIntensity: 0.4, bloomStrength: 0.3,
      trailLength: 18, trailWidth: 2, trailFadeCurve: 0.5,
      renderMode: 'glowing-orbs', opacity: 0.85,
      colorMode: 'pulse', colorCycling: true, colorCycleSpeed: 1.0,
      showTether: true,
      showAnchor: true,
      breathing: true, breathSpeed: 0.8, breathDepth: 0.15,
    },
  },

  spiralDancer: {
    name: 'Spiral Dancer',
    description: 'Graceful double-spiral orbit when your cursor is at rest',
    icon: '💃',
    energy: 'organic',
    settings: {
      leashLength: 85, stiffness: 180, damping: 8,
      gravity: 0, inertia: 0.55, friction: 0.18,
      turbulence: 0.15,
      particleCount: 35, particleVariance: 0.5,
      orbRadius: 13, sizeMin: 2, sizeMax: 8, sizeCurve: 0.65,
      colorPrimary: '#a855f7', colorSecondary: '#ec4899', colorTertiary: '#f472b6',
      glowIntensity: 0.5, bloomStrength: 0.4,
      trailLength: 40, trailWidth: 3, trailFadeCurve: 0.7,
      renderMode: 'spiral', opacity: 0.88,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 1.1,
      mouseVelocityInfluence: true,
      idleTimeout: 3, idleOrbitSpeed: 1.4, idlePattern: 'spiral',
      orbitalAttraction: 0.2,
    },
  },

  /* ── New Presets ─────────────────────────────────────────────────────── */

  frostbite: {
    name: 'Frostbite',
    description: 'Crystalline ice shards radiating freezing blue energy',
    icon: '🧊',
    energy: 'cyber',
    settings: {
      leashLength: 55, stiffness: 380, damping: 13,
      gravity: -8, gravityAngle: 270, gravityFalloff: 0.5,
      inertia: 0.35, friction: 0.3, turbulence: 0.2,
      springTension: 0.7,
      particleCount: 45, particleVariance: 0.5,
      orbRadius: 12, sizeMin: 1, sizeMax: 7, sizeCurve: 0.4,
      colorPrimary: '#67e8f9', colorSecondary: '#22d3ee', colorTertiary: '#0891b2',
      glowIntensity: 0.65, bloomStrength: 0.55,
      trailLength: 30, trailWidth: 3, trailFadeCurve: 0.5,
      renderMode: 'plasma-bolt', opacity: 0.9,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 0.8,
      mouseVelocityInfluence: true, velocityThickness: true,
      afterimages: true, afterimageCount: 4,
    },
  },

  gravityWell: {
    name: 'Gravity Well',
    description: 'Bending spacetime — particles spiral into an unseen singularity',
    icon: '🕳️',
    energy: 'void',
    settings: {
      leashLength: 85, stiffness: 200, damping: 8,
      gravity: 30, gravityAngle: 0, gravityFalloff: 0.3,
      inertia: 0.5, friction: 0.12, turbulence: 0.1,
      orbitalAttraction: 0.8,
      particleCount: 60, particleVariance: 0.6,
      orbRadius: 14, sizeMin: 1, sizeMax: 8, sizeCurve: 0.5,
      colorPrimary: '#7c3aed', colorSecondary: '#5b21b6', colorTertiary: '#312e81',
      glowIntensity: 0.4, bloomStrength: 0.35,
      trailLength: 38, trailWidth: 2.5, trailFadeCurve: 0.6,
      renderMode: 'spiral', opacity: 0.8,
      colorMode: 'gradient', colorCycling: true, colorCycleSpeed: 0.5,
      mouseVelocityInfluence: true,
      gravityWell: true, gravityWellStrength: 0.8,
      breathing: true, breathSpeed: 0.6, breathDepth: 0.15,
    },
  },
};

/* ════════════════════════════════════════════════════════════════════════════
 *  PRESET BUNDLES (9 curated)
 * ════════════════════════════════════════════════════════════════════════════ */

export const BUNDLES: PresetBundle[] = [
  /* ── 1-Trail Solo Bundles ─────────────────────────────────────────────── */
  {
    name: 'Nebula Solo',
    description: 'A single cosmic mist trailing your every move',
    icon: '🌌',
    energy: 'ethereal',
    trailCount: 1,
    trails: [
      { ...PRESETS.nebulaWhisper.settings, name: 'Nebula Whisper' },
    ],
  },
  {
    name: 'Lightning Solo',
    description: 'One crackling bolt of raw electrical fury',
    icon: '⚡',
    energy: 'aggressive',
    trailCount: 1,
    trails: [
      { ...PRESETS.lightningArc.settings, name: 'Lightning Arc' },
    ],
  },
  {
    name: 'Ghost Solo',
    description: 'A barely-there whisper in the void',
    icon: '👻',
    energy: 'ethereal',
    trailCount: 1,
    trails: [
      { ...PRESETS.ghostDrift.settings, name: 'Ghost Drift' },
    ],
  },
  {
    name: 'Neon Solo',
    description: 'Cyberpunk neon slicing through the grid',
    icon: '🔮',
    energy: 'cyber',
    trailCount: 1,
    trails: [
      { ...PRESETS.neonRazor.settings, name: 'Neon Razor' },
    ],
  },
  {
    name: 'Sakura Solo',
    description: 'Gentle cherry blossom petals floating free',
    icon: '🌸',
    energy: 'organic',
    trailCount: 1,
    trails: [
      { ...PRESETS.sakuraDrift.settings, name: 'Sakura Drift' },
    ],
  },
  {
    name: 'Comet Solo',
    description: 'A blazing comet with luminous tail streaking through space',
    icon: '☄️',
    energy: 'aggressive',
    trailCount: 1,
    trails: [
      { ...PRESETS.cometStrike.settings, name: 'Comet Strike' },
    ],
  },
  {
    name: 'Starforge Solo',
    description: 'Golden stellar energy from the heart of a star',
    icon: '⭐',
    energy: 'luminous',
    trailCount: 1,
    trails: [
      { ...PRESETS.starforgePulse.settings, name: 'Starforge Pulse' },
    ],
  },
  {
    name: 'Deep Ocean Solo',
    description: 'Bioluminescent currents from the abyss',
    icon: '🌊',
    energy: 'organic',
    trailCount: 1,
    trails: [
      { ...PRESETS.deepOcean.settings, name: 'Deep Ocean' },
    ],
  },

  /* ── 2-Trail Bundles ───────────────────────────────────────────────────── */
  {
    name: 'Ethereal Duo',
    description: 'Dreamy cosmic mist meets ghostly silence',
    icon: '✨',
    energy: 'ethereal',
    trailCount: 2,
    trails: [
      { ...PRESETS.nebulaWhisper.settings, name: 'Nebula Whisper' },
      { ...PRESETS.ghostDrift.settings, name: 'Ghost Drift' },
    ],
  },
  {
    name: 'Aggressive Twin',
    description: 'Void energy and lightning in perfect destruction',
    icon: '💀',
    energy: 'aggressive',
    trailCount: 2,
    trails: [
      { ...PRESETS.voidSurge.settings, name: 'Void Surge' },
      { ...PRESETS.lightningArc.settings, name: 'Lightning Arc' },
    ],
  },
  {
    name: 'Minimalist Void',
    description: 'Subtle dark presence barely touching reality',
    icon: '🌑',
    energy: 'void',
    trailCount: 2,
    trails: [
      { ...PRESETS.darkMatter.settings, name: 'Dark Matter' },
      { ...PRESETS.crystalLattice.settings, name: 'Crystal Lattice' },
    ],
  },

  /* ── 3-Trail Bundles ───────────────────────────────────────────────────── */
  {
    name: 'Cosmic Trinity',
    description: 'Nebula, starlight, and aurora in divine alignment',
    icon: '🔺',
    energy: 'cosmic',
    trailCount: 3,
    trails: [
      { ...PRESETS.nebulaWhisper.settings, name: 'Nebula Whisper' },
      { ...PRESETS.starforgePulse.settings, name: 'Starforge Pulse' },
      { ...PRESETS.auroraStream.settings, name: 'Aurora Stream' },
    ],
  },
  {
    name: 'Organic Flow',
    description: 'Solar winds through deep ocean touched by blossoms',
    icon: '🍃',
    energy: 'organic',
    trailCount: 3,
    trails: [
      { ...PRESETS.solarWind.settings, name: 'Solar Wind' },
      { ...PRESETS.deepOcean.settings, name: 'Deep Ocean' },
      { ...PRESETS.sakuraDrift.settings, name: 'Sakura Drift' },
    ],
  },
  {
    name: 'Starship Command',
    description: 'Lightning, crystal, and neon — bridge officer ready',
    icon: '🚀',
    energy: 'cyber',
    trailCount: 3,
    trails: [
      { ...PRESETS.lightningArc.settings, name: 'Lightning Arc' },
      { ...PRESETS.crystalLattice.settings, name: 'Crystal Lattice' },
      { ...PRESETS.neonRazor.settings, name: 'Neon Razor' },
    ],
  },

  /* ── 4-Trail Bundles ───────────────────────────────────────────────────── */
  {
    name: 'Magnetic Constellation',
    description: 'Repelling trails forming a living star map',
    icon: '🌠',
    energy: 'cyber',
    trailCount: 4,
    trails: [
      { ...PRESETS.magneticDuo.settings, name: 'Magnetic Cyan' },
      { ...PRESETS.constellationMap.settings, name: 'Constellation' },
      { ...PRESETS.cometStrike.settings, name: 'Comet Strike' },
      { ...PRESETS.idleOrbiter.settings, name: 'Idle Orbiter' },
    ],
  },
  {
    name: 'Chaotic Quartet',
    description: 'Four forces of absolute cosmic pandemonium',
    icon: '🌪️',
    energy: 'chaotic',
    trailCount: 4,
    trails: [
      { ...PRESETS.chaosEngine.settings, name: 'Chaos Engine' },
      { ...PRESETS.voidSurge.settings, name: 'Void Surge' },
      { ...PRESETS.plasmaFang.settings, name: 'Plasma Fang' },
      { ...PRESETS.lightningArc.settings, name: 'Lightning Arc' },
    ],
  },
  {
    name: 'Cyber Neon Overload',
    description: 'Maximum cyberpunk energy across four dimensions',
    icon: '🎆',
    energy: 'cyber',
    trailCount: 4,
    trails: [
      { ...PRESETS.neonRazor.settings, name: 'Neon Razor' },
      { ...PRESETS.plasmaFang.settings, name: 'Plasma Fang' },
      { ...PRESETS.crystalLattice.settings, name: 'Crystal Lattice' },
      { ...PRESETS.quantumBlur.settings, name: 'Quantum Blur' },
    ],
  },
  {
    name: 'Wild Experimental',
    description: 'Sakura meets chaos meets ember meets starforge',
    icon: '🧬',
    energy: 'experimental',
    trailCount: 4,
    trails: [
      { ...PRESETS.sakuraDrift.settings, name: 'Sakura Drift' },
      { ...PRESETS.chaosEngine.settings, name: 'Chaos Engine' },
      { ...PRESETS.emberTrail.settings, name: 'Ember Trail' },
      { ...PRESETS.starforgePulse.settings, name: 'Starforge Pulse' },
    ],
  },

  /* ── New feature bundles ──────────────────────────────────────────────── */
  {
    name: 'Plasma Duo',
    description: 'Crackling bolts meet pulsing heartbeat',
    icon: '⚡',
    energy: 'aggressive',
    trailCount: 2,
    trails: [
      { ...PRESETS.plasmaArc.settings, name: 'Plasma Arc' },
      { ...PRESETS.heartbeat.settings, name: 'Heartbeat' },
    ],
  },
  {
    name: 'Shockwave Trio',
    description: 'Seismic rings, plasma, and ghost echoes',
    icon: '💥',
    energy: 'chaotic',
    trailCount: 3,
    trails: [
      { ...PRESETS.seismicRipple.settings, name: 'Seismic Ripple' },
      { ...PRESETS.plasmaArc.settings, name: 'Plasma Arc' },
      { ...PRESETS.ghostTrail.settings, name: 'Ghost Trail' },
    ],
  },
  {
    name: 'Spectral Quartet',
    description: 'Four ghostly echoes with edge glow and pulse',
    icon: '🔮',
    energy: 'ethereal',
    trailCount: 4,
    trails: [
      { ...PRESETS.ghostTrail.settings, name: 'Ghost Trail' },
      { ...PRESETS.heartbeat.settings, name: 'Heartbeat' },
      { ...PRESETS.nebulaWhisper.settings, name: 'Nebula Whisper' },
      { ...PRESETS.ghostTrail.settings, name: 'Ghost Trail II', colorPrimary: '#a78bfa', colorSecondary: '#22d3ee' },
    ],
  },

  /* ── New feature bundles ──────────────────────────────────────────────── */
  {
    name: 'Firefly Nexus',
    description: 'Fireflies and spiral galaxy in living harmony',
    icon: '🪲',
    energy: 'organic',
    trailCount: 2,
    trails: [
      { ...PRESETS.fireflyGrove.settings, name: 'Firefly Grove' },
      { ...PRESETS.spiralGalaxy.settings, name: 'Spiral Galaxy' },
    ],
  },
  {
    name: 'Aurora Pulsar',
    description: 'Shimmering veil meets breathing neutron core',
    icon: '💫',
    energy: 'aggressive',
    trailCount: 2,
    trails: [
      { ...PRESETS.auroraVeil.settings, name: 'Aurora Veil' },
      { ...PRESETS.pulsarCore.settings, name: 'Pulsar Core' },
    ],
  },
  {
    name: 'Wandering Spirits',
    description: 'Fireflies, aurora, and wanderlust on the loose',
    icon: '🧭',
    energy: 'organic',
    trailCount: 3,
    trails: [
      { ...PRESETS.fireflyGrove.settings, name: 'Firefly Grove' },
      { ...PRESETS.auroraVeil.settings, name: 'Aurora Veil' },
      { ...PRESETS.wanderlust.settings, name: 'Wanderlust' },
    ],
  },
  {
    name: 'Cosmic Awakening',
    description: 'Spiral, pulsar, aurora, and firefly — full spectrum',
    icon: '🌠',
    energy: 'luminous',
    trailCount: 4,
    trails: [
      { ...PRESETS.spiralGalaxy.settings, name: 'Spiral Galaxy' },
      { ...PRESETS.pulsarCore.settings, name: 'Pulsar Core' },
      { ...PRESETS.auroraVeil.settings, name: 'Aurora Veil' },
      { ...PRESETS.fireflyGrove.settings, name: 'Firefly Grove' },
    ],
  },

  /* ════════════════════════════════════════════════════════════════════════════
   *  EXPANDED BUNDLES — 35 unique thematic combinations
   * ════════════════════════════════════════════════════════════════════════════ */

  /* ── 2-Trail: Contrasting & Thematic Duos ──────────────────────────────── */

  {
    name: 'Deep Sea Bioluminescence',
    description: 'Abyssal currents meet blinking firefly light',
    icon: '🦑',
    energy: 'organic',
    trailCount: 2,
    trails: [
      { ...PRESETS.deepOcean.settings, name: 'Deep Ocean' },
      { ...PRESETS.fireflyGrove.settings, name: 'Firefly Grove', colorPrimary: '#22d3ee', colorSecondary: '#34d399' },
    ],
  },
  {
    name: 'Ghost in the Machine',
    description: 'Spectral echoes haunting a neon grid',
    icon: '👾',
    energy: 'cyber',
    trailCount: 2,
    trails: [
      { ...PRESETS.ghostTrail.settings, name: 'Ghost Trail', colorPrimary: '#22d3ee', colorSecondary: '#a855f7' },
      { ...PRESETS.neonRazor.settings, name: 'Neon Razor' },
    ],
  },
  {
    name: 'Solar Eclipse',
    description: 'Blinding starlight swallowed by absolute void',
    icon: '🌑',
    energy: 'void',
    trailCount: 2,
    trails: [
      { ...PRESETS.starforgePulse.settings, name: 'Starforge Pulse' },
      { ...PRESETS.darkMatter.settings, name: 'Dark Matter' },
    ],
  },
  {
    name: 'Whispering Sparks',
    description: 'Cosmic mist tinged with dying embers',
    icon: '🌫️',
    energy: 'ethereal',
    trailCount: 2,
    trails: [
      { ...PRESETS.nebulaWhisper.settings, name: 'Nebula Whisper' },
      { ...PRESETS.emberTrail.settings, name: 'Ember Trail', colorPrimary: '#a855f7', colorSecondary: '#fbbf24' },
    ],
  },
  {
    name: 'Crystal Fire',
    description: 'Geometric ice shattered by molten chaos',
    icon: '🔥',
    energy: 'chaotic',
    trailCount: 2,
    trails: [
      { ...PRESETS.crystalLattice.settings, name: 'Crystal Lattice' },
      { ...PRESETS.emberTrail.settings, name: 'Ember Trail' },
    ],
  },
  {
    name: 'Quantum Ghost',
    description: 'Probability waves haunted by spectral drift',
    icon: '🔬',
    energy: 'cyber',
    trailCount: 2,
    trails: [
      { ...PRESETS.quantumBlur.settings, name: 'Quantum Blur' },
      { ...PRESETS.ghostDrift.settings, name: 'Ghost Drift', colorPrimary: '#22d3ee', colorSecondary: '#6366f1' },
    ],
  },
  {
    name: 'Sakura Storm',
    description: 'Delicate petals ripped apart by void energy',
    icon: '🌪️',
    energy: 'chaotic',
    trailCount: 2,
    trails: [
      { ...PRESETS.sakuraDrift.settings, name: 'Sakura Drift' },
      { ...PRESETS.voidSurge.settings, name: 'Void Surge', colorPrimary: '#ec4899', colorSecondary: '#7f1d1d' },
    ],
  },
  {
    name: 'Magnetic Heart',
    description: 'Repelling fields pulled together by living pulse',
    icon: '💜',
    energy: 'cyber',
    trailCount: 2,
    trails: [
      { ...PRESETS.magneticDuo.settings, name: 'Magnetic Duo' },
      { ...PRESETS.heartbeat.settings, name: 'Heartbeat' },
    ],
  },
  {
    name: 'Wandering Comet',
    description: 'Restless bounce trailing a blazing comet',
    icon: '☄️',
    energy: 'aggressive',
    trailCount: 2,
    trails: [
      { ...PRESETS.wanderlust.settings, name: 'Wanderlust' },
      { ...PRESETS.cometStrike.settings, name: 'Comet Strike' },
    ],
  },
  {
    name: 'Pulsar Whisper',
    description: 'Breathing neutron star wrapped in cosmic mist',
    icon: '💫',
    energy: 'ethereal',
    trailCount: 2,
    trails: [
      { ...PRESETS.pulsarCore.settings, name: 'Pulsar Core', gravityWell: false },
      { ...PRESETS.nebulaWhisper.settings, name: 'Nebula Whisper', colorPrimary: '#22d3ee' },
    ],
  },
  {
    name: 'Frozen Lightning',
    description: 'Electric arcs crystallized in deep space',
    icon: '⚡',
    energy: 'cyber',
    trailCount: 2,
    trails: [
      { ...PRESETS.lightningArc.settings, name: 'Lightning Arc', colorPrimary: '#22d3ee', colorSecondary: '#a855f7' },
      { ...PRESETS.crystalLattice.settings, name: 'Crystal Lattice', colorPrimary: '#a855f7' },
    ],
  },
  {
    name: 'Tidal Echo',
    description: 'Ocean currents leaving ghostly afterimages',
    icon: '🌊',
    energy: 'organic',
    trailCount: 2,
    trails: [
      { ...PRESETS.deepOcean.settings, name: 'Deep Ocean' },
      { ...PRESETS.ghostTrail.settings, name: 'Ghost Trail', colorPrimary: '#22d3ee', colorSecondary: '#34d399' },
    ],
  },

  /* ── 3-Trail: Elemental & Thematic Trios ───────────────────────────────── */

  {
    name: 'Elemental Trinity',
    description: 'Fire, water, and starlight in primordial balance',
    icon: '⚛️',
    energy: 'chaotic',
    trailCount: 3,
    trails: [
      { ...PRESETS.emberTrail.settings, name: 'Ember Trail' },
      { ...PRESETS.deepOcean.settings, name: 'Deep Ocean' },
      { ...PRESETS.starforgePulse.settings, name: 'Starforge Pulse' },
    ],
  },
  {
    name: 'Ghost Galaxy',
    description: 'Spectral echoes spiraling through a star map',
    icon: '👻',
    energy: 'ethereal',
    trailCount: 3,
    trails: [
      { ...PRESETS.ghostTrail.settings, name: 'Ghost Trail' },
      { ...PRESETS.spiralGalaxy.settings, name: 'Spiral Galaxy' },
      { ...PRESETS.constellationMap.settings, name: 'Constellation Map' },
    ],
  },
  {
    name: 'Cyber Organism',
    description: 'Neon grid colonized by fireflies and orbiters',
    icon: '🦠',
    energy: 'cyber',
    trailCount: 3,
    trails: [
      { ...PRESETS.neonRazor.settings, name: 'Neon Razor' },
      { ...PRESETS.idleOrbiter.settings, name: 'Idle Orbiter', colorPrimary: '#22d3ee' },
      { ...PRESETS.fireflyGrove.settings, name: 'Firefly Grove', colorPrimary: '#a855f7', colorSecondary: '#22d3ee' },
    ],
  },
  {
    name: 'Storm Chaser',
    description: 'Lightning, shockwaves, and a restless wanderer',
    icon: '⛈️',
    energy: 'aggressive',
    trailCount: 3,
    trails: [
      { ...PRESETS.lightningArc.settings, name: 'Lightning Arc' },
      { ...PRESETS.seismicRipple.settings, name: 'Seismic Ripple' },
      { ...PRESETS.wanderlust.settings, name: 'Wanderlust', colorPrimary: '#fbbf24' },
    ],
  },
  {
    name: 'Breathing Cosmos',
    description: 'Three living pulses — aurora, pulsar, and heartbeat',
    icon: '💓',
    energy: 'organic',
    trailCount: 3,
    trails: [
      { ...PRESETS.auroraVeil.settings, name: 'Aurora Veil' },
      { ...PRESETS.pulsarCore.settings, name: 'Pulsar Core' },
      { ...PRESETS.heartbeat.settings, name: 'Heartbeat' },
    ],
  },
  {
    name: 'Void Walker',
    description: 'Darkness, ghosts, and a bouncing lost soul',
    icon: '🕳️',
    energy: 'void',
    trailCount: 3,
    trails: [
      { ...PRESETS.darkMatter.settings, name: 'Dark Matter' },
      { ...PRESETS.ghostDrift.settings, name: 'Ghost Drift', colorPrimary: '#6366f1' },
      { ...PRESETS.wanderlust.settings, name: 'Wanderlust', colorPrimary: '#64748b', colorSecondary: '#94a3b8' },
    ],
  },
  {
    name: 'Quantum Garden',
    description: 'Probability fields blooming with sakura and fireflies',
    icon: '🌸',
    energy: 'organic',
    trailCount: 3,
    trails: [
      { ...PRESETS.quantumBlur.settings, name: 'Quantum Blur', colorPrimary: '#f9a8d4' },
      { ...PRESETS.sakuraDrift.settings, name: 'Sakura Drift' },
      { ...PRESETS.fireflyGrove.settings, name: 'Firefly Grove' },
    ],
  },
  {
    name: 'Tidal Resonance',
    description: 'Ocean depths pulsing with aurora currents',
    icon: '🌊',
    energy: 'organic',
    trailCount: 3,
    trails: [
      { ...PRESETS.deepOcean.settings, name: 'Deep Ocean' },
      { ...PRESETS.heartbeat.settings, name: 'Heartbeat', colorPrimary: '#22d3ee', colorSecondary: '#34d399' },
      { ...PRESETS.auroraStream.settings, name: 'Aurora Stream' },
    ],
  },
  {
    name: 'Spectral Dawn',
    description: 'Aurora veil, ghost echoes, and morning starforge',
    icon: '🌅',
    energy: 'ethereal',
    trailCount: 3,
    trails: [
      { ...PRESETS.auroraVeil.settings, name: 'Aurora Veil' },
      { ...PRESETS.ghostTrail.settings, name: 'Ghost Trail', colorPrimary: '#fbbf24' },
      { ...PRESETS.starforgePulse.settings, name: 'Starforge Pulse', colorPrimary: '#fde047' },
    ],
  },
  {
    name: 'Thunder Plains',
    description: 'Lightning, void surges, and a wandering storm',
    icon: '🌩️',
    energy: 'aggressive',
    trailCount: 3,
    trails: [
      { ...PRESETS.lightningArc.settings, name: 'Lightning Arc' },
      { ...PRESETS.voidSurge.settings, name: 'Void Surge' },
      { ...PRESETS.wanderlust.settings, name: 'Wanderlust', colorPrimary: '#fbbf24', colorSecondary: '#f97316' },
    ],
  },
  {
    name: 'Frozen Abyss',
    description: 'Crystal lattice, aurora veil, and ghost drift',
    icon: '🧊',
    energy: 'ethereal',
    trailCount: 3,
    trails: [
      { ...PRESETS.crystalLattice.settings, name: 'Crystal Lattice' },
      { ...PRESETS.auroraVeil.settings, name: 'Aurora Veil', colorPrimary: '#22d3ee', colorSecondary: '#a855f7' },
      { ...PRESETS.ghostDrift.settings, name: 'Ghost Drift', colorPrimary: '#e0f2fe' },
    ],
  },
  {
    name: 'Phoenix Rising',
    description: 'Embers, starforge, and a comet reborn from ash',
    icon: '🦅',
    energy: 'aggressive',
    trailCount: 3,
    trails: [
      { ...PRESETS.emberTrail.settings, name: 'Ember Trail' },
      { ...PRESETS.starforgePulse.settings, name: 'Starforge Pulse' },
      { ...PRESETS.cometStrike.settings, name: 'Comet Strike', colorPrimary: '#f97316' },
    ],
  },

  /* ── 4-Trail: Grand Compositions ───────────────────────────────────────── */

  {
    name: 'Apocalypse',
    description: 'Void, fire, shockwaves, and pure chaos — end of all',
    icon: '💀',
    energy: 'chaotic',
    trailCount: 4,
    trails: [
      { ...PRESETS.voidSurge.settings, name: 'Void Surge' },
      { ...PRESETS.emberTrail.settings, name: 'Ember Trail' },
      { ...PRESETS.seismicRipple.settings, name: 'Seismic Ripple' },
      { ...PRESETS.chaosEngine.settings, name: 'Chaos Engine' },
    ],
  },
  {
    name: 'Zen Garden',
    description: 'Sakura, fireflies, orbiters, and constellations — pure peace',
    icon: '🪷',
    energy: 'organic',
    trailCount: 4,
    trails: [
      { ...PRESETS.sakuraDrift.settings, name: 'Sakura Drift' },
      { ...PRESETS.fireflyGrove.settings, name: 'Firefly Grove' },
      { ...PRESETS.idleOrbiter.settings, name: 'Idle Orbiter' },
      { ...PRESETS.constellationMap.settings, name: 'Constellation Map' },
    ],
  },
  {
    name: 'Neon Jungle',
    description: 'Cyber razors, plasma fangs, fireflies, and ocean depths',
    icon: '🌴',
    energy: 'cyber',
    trailCount: 4,
    trails: [
      { ...PRESETS.neonRazor.settings, name: 'Neon Razor' },
      { ...PRESETS.plasmaFang.settings, name: 'Plasma Fang', colorPrimary: '#22d3ee' },
      { ...PRESETS.fireflyGrove.settings, name: 'Firefly Grove', colorPrimary: '#a855f7', colorSecondary: '#22d3ee' },
      { ...PRESETS.deepOcean.settings, name: 'Deep Ocean', colorPrimary: '#34d399' },
    ],
  },
  {
    name: 'Cosmic Forge',
    description: 'Starforge, comet, pulsar, and ember — creation energy',
    icon: '🔨',
    energy: 'luminous',
    trailCount: 4,
    trails: [
      { ...PRESETS.starforgePulse.settings, name: 'Starforge Pulse' },
      { ...PRESETS.cometStrike.settings, name: 'Comet Strike' },
      { ...PRESETS.pulsarCore.settings, name: 'Pulsar Core', colorPrimary: '#fbbf24', colorSecondary: '#f97316' },
      { ...PRESETS.emberTrail.settings, name: 'Ember Trail' },
    ],
  },
  {
    name: 'Deep Space Expedition',
    description: 'Constellations, spirals, dark matter, and a lone orbiter',
    icon: '🛸',
    energy: 'ethereal',
    trailCount: 4,
    trails: [
      { ...PRESETS.constellationMap.settings, name: 'Constellation Map' },
      { ...PRESETS.spiralGalaxy.settings, name: 'Spiral Galaxy' },
      { ...PRESETS.darkMatter.settings, name: 'Dark Matter' },
      { ...PRESETS.idleOrbiter.settings, name: 'Idle Orbiter', colorPrimary: '#64748b' },
    ],
  },
  {
    name: 'Electric Symphony',
    description: 'Lightning, plasma, neon, and heartbeat — orchestrated energy',
    icon: '🎼',
    energy: 'aggressive',
    trailCount: 4,
    trails: [
      { ...PRESETS.lightningArc.settings, name: 'Lightning Arc' },
      { ...PRESETS.plasmaArc.settings, name: 'Plasma Arc' },
      { ...PRESETS.neonRazor.settings, name: 'Neon Razor', colorPrimary: '#fbbf24' },
      { ...PRESETS.heartbeat.settings, name: 'Heartbeat', colorPrimary: '#22d3ee' },
    ],
  },
  {
    name: 'Living Void',
    description: 'Dark matter, pulsar, ghosts, and a wandering soul',
    icon: '🌑',
    energy: 'void',
    trailCount: 4,
    trails: [
      { ...PRESETS.darkMatter.settings, name: 'Dark Matter' },
      { ...PRESETS.pulsarCore.settings, name: 'Pulsar Core', colorPrimary: '#6366f1', colorSecondary: '#a855f7' },
      { ...PRESETS.ghostTrail.settings, name: 'Ghost Trail', colorPrimary: '#64748b' },
      { ...PRESETS.wanderlust.settings, name: 'Wanderlust', colorPrimary: '#94a3b8', colorSecondary: '#64748b' },
    ],
  },
  {
    name: 'Prism Quartet',
    description: 'Aurora stream, aurora veil, starforge, and heartbeat — pure light',
    icon: '🌈',
    energy: 'luminous',
    trailCount: 4,
    trails: [
      { ...PRESETS.auroraStream.settings, name: 'Aurora Stream' },
      { ...PRESETS.auroraVeil.settings, name: 'Aurora Veil' },
      { ...PRESETS.starforgePulse.settings, name: 'Starforge Pulse' },
      { ...PRESETS.heartbeat.settings, name: 'Heartbeat', colorPrimary: '#f472b6' },
    ],
  },
  {
    name: 'Magnetic Storm',
    description: 'Magnetic repulsion, void, plasma, and chaos — uncontrollable',
    icon: '🧲',
    energy: 'chaotic',
    trailCount: 4,
    trails: [
      { ...PRESETS.magneticDuo.settings, name: 'Magnetic Duo' },
      { ...PRESETS.voidSurge.settings, name: 'Void Surge' },
      { ...PRESETS.plasmaFang.settings, name: 'Plasma Fang' },
      { ...PRESETS.chaosEngine.settings, name: 'Chaos Engine', colorPrimary: '#22d3ee' },
    ],
  },
  {
    name: 'Abyssal Light',
    description: 'Ocean depths, pulsar breathing, fireflies, and ghost trails',
    icon: '🐋',
    energy: 'organic',
    trailCount: 4,
    trails: [
      { ...PRESETS.deepOcean.settings, name: 'Deep Ocean' },
      { ...PRESETS.pulsarCore.settings, name: 'Pulsar Core', colorPrimary: '#22d3ee', gravityWell: false },
      { ...PRESETS.fireflyGrove.settings, name: 'Firefly Grove', colorPrimary: '#34d399', colorSecondary: '#22d3ee' },
      { ...PRESETS.ghostTrail.settings, name: 'Ghost Trail', colorPrimary: '#34d399' },
    ],
  },
  {
    name: 'Time Dilation',
    description: 'Quantum blur, ghosts, constellations, and slow orbiters',
    icon: '⏳',
    energy: 'ethereal',
    trailCount: 4,
    trails: [
      { ...PRESETS.quantumBlur.settings, name: 'Quantum Blur', colorPrimary: '#a855f7' },
      { ...PRESETS.ghostTrail.settings, name: 'Ghost Trail', colorPrimary: '#c084fc' },
      { ...PRESETS.constellationMap.settings, name: 'Constellation Map', colorPrimary: '#a78bfa' },
      { ...PRESETS.idleOrbiter.settings, name: 'Idle Orbiter', idleOrbitSpeed: 0.3, colorPrimary: '#c084fc' },
    ],
  },
  {
    name: 'Winter Solstice',
    description: 'Crystal, aurora, ghost drift, and minimal — frozen silence',
    icon: '❄️',
    energy: 'minimal',
    trailCount: 4,
    trails: [
      { ...PRESETS.crystalLattice.settings, name: 'Crystal Lattice' },
      { ...PRESETS.auroraVeil.settings, name: 'Aurora Veil', colorPrimary: '#e0f2fe', colorSecondary: '#a855f7' },
      { ...PRESETS.ghostDrift.settings, name: 'Ghost Drift', colorPrimary: '#e0f2fe' },
      { ...PRESETS.minimal.settings, name: 'Minimal', colorPrimary: '#e0f2fe' },
    ],
  },
  {
    name: 'Sakura Eclipse',
    description: 'Petals, spirals, dark matter, and a comet — beauty in darkness',
    icon: '🌚',
    energy: 'ethereal',
    trailCount: 4,
    trails: [
      { ...PRESETS.sakuraDrift.settings, name: 'Sakura Drift' },
      { ...PRESETS.spiralGalaxy.settings, name: 'Spiral Galaxy', colorPrimary: '#ec4899', colorSecondary: '#a855f7' },
      { ...PRESETS.darkMatter.settings, name: 'Dark Matter', colorPrimary: '#7f1d1d' },
      { ...PRESETS.cometStrike.settings, name: 'Comet Strike', colorPrimary: '#f9a8d4' },
    ],
  },

  /* ── Bundles leveraging nexus, persist, tether, and cross-trail sync ────── */

  {
    name: 'Nexus Protocol',
    description: 'Four linked nodes with tethered anchors and cross-sync',
    icon: '🕸️',
    energy: 'cyber',
    trailCount: 4,
    trails: [
      { ...PRESETS.nexusWeb.settings, name: 'Nexus Alpha', colorPrimary: '#22d3ee' },
      { ...PRESETS.nexusWeb.settings, name: 'Nexus Beta', colorPrimary: '#6366f1' },
      { ...PRESETS.nexusWeb.settings, name: 'Nexus Gamma', colorPrimary: '#a855f7' },
      { ...PRESETS.nexusWeb.settings, name: 'Nexus Delta', colorPrimary: '#ec4899' },
    ],
  },
  {
    name: 'Ember & Tether',
    description: 'Scattered embers anchored by a quantum tether bond',
    icon: '🔗',
    energy: 'chaotic',
    trailCount: 2,
    trails: [
      { ...PRESETS.emberSpark.settings, name: 'Ember Spark' },
      { ...PRESETS.quantumTether.settings, name: 'Quantum Tether', colorPrimary: '#f97316', colorSecondary: '#fbbf24' },
    ],
  },
  {
    name: 'Spiral Nexus',
    description: 'Spiral dancers linked in a living web of energy',
    icon: '🌀',
    energy: 'organic',
    trailCount: 3,
    trails: [
      { ...PRESETS.spiralDancer.settings, name: 'Spiral Dancer', colorPrimary: '#a855f7' },
      { ...PRESETS.spiralDancer.settings, name: 'Spiral Dancer II', colorPrimary: '#22d3ee', idlePattern: 'spiral' as const, idleOrbitSpeed: 1.6 },
      { ...PRESETS.nexusWeb.settings, name: 'Nexus Link', colorPrimary: '#ec4899' },
    ],
  },
  {
    name: 'Tethered Galaxy',
    description: 'A quantum tether anchoring a swirling spiral galaxy',
    icon: '🔭',
    energy: 'ethereal',
    trailCount: 2,
    trails: [
      { ...PRESETS.quantumTether.settings, name: 'Quantum Tether', colorPrimary: '#a855f7', colorSecondary: '#22d3ee' },
      { ...PRESETS.spiralGalaxy.settings, name: 'Spiral Galaxy', colorPrimary: '#22d3ee', colorSecondary: '#a855f7' },
    ],
  },
  {
    name: 'Ember Constellation',
    description: 'Scattered sparks forming a star map of dying light',
    icon: '✨',
    energy: 'chaotic',
    trailCount: 3,
    trails: [
      { ...PRESETS.emberSpark.settings, name: 'Ember Spark' },
      { ...PRESETS.constellationMap.settings, name: 'Constellation Map', colorPrimary: '#f97316', colorSecondary: '#fbbf24' },
      { ...PRESETS.emberTrail.settings, name: 'Ember Trail', colorPrimary: '#fbbf24', colorSecondary: '#ef4444' },
    ],
  },
  {
    name: 'Aurora Spiral',
    description: 'Shimmering veils spiraling through a pulsing core',
    icon: '🌈',
    energy: 'ethereal',
    trailCount: 3,
    trails: [
      { ...PRESETS.auroraVeil.settings, name: 'Aurora Veil' },
      { ...PRESETS.spiralDancer.settings, name: 'Spiral Dancer', colorPrimary: '#22d3ee', colorSecondary: '#a855f7' },
      { ...PRESETS.pulsarCore.settings, name: 'Pulsar Core', colorPrimary: '#34d399', gravityWell: false },
    ],
  },

];

/* ════════════════════════════════════════════════════════════════════════════
 *  RANDOM BUNDLE GENERATOR
 *  Creates a coherent random bundle for a given trail count.
 *  Ensures no duplicate presets and balances energy types.
 * ════════════════════════════════════════════════════════════════════════════ */

const presetKeys = Object.keys(PRESETS);

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Slightly mutate numeric settings for freshness (±15%) */
function jitter(settings: Partial<TrailSettings>): Partial<TrailSettings> {
  const result = { ...settings };
  const numericKeys: (keyof TrailSettings)[] = [
    'leashLength', 'stiffness', 'damping', 'gravity', 'turbulence',
    'particleCount', 'orbRadius', 'glowIntensity', 'bloomStrength',
    'trailLength', 'trailWidth', 'colorCycleSpeed',
  ];
  for (const key of numericKeys) {
    if (typeof result[key] === 'number') {
      const val = result[key] as number;
      (result as any)[key] = val * (0.85 + Math.random() * 0.3);
    }
  }
  return result;
}

/** Shift a hex color hue slightly for variation */
function shiftHue(hex: string, degrees: number): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  h = ((h * 360 + degrees) % 360) / 360;
  const s2 = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
  // HSL to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + (s2 || 0)) : l + (s2 || 0) - l * (s2 || 0);
  const p = 2 * l - q;
  const ro = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
  const go = Math.round(hue2rgb(p, q, h) * 255);
  const bo = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);
  return `#${ro.toString(16).padStart(2, '0')}${go.toString(16).padStart(2, '0')}${bo.toString(16).padStart(2, '0')}`;
}

export function generateRandomTrail(): Partial<TrailSettings> {
  const key = presetKeys[Math.floor(Math.random() * presetKeys.length)];
  const base = jitter(PRESETS[key].settings);
  const hueShift = Math.random() * 360;
  if (base.colorPrimary) base.colorPrimary = shiftHue(base.colorPrimary, hueShift);
  if (base.colorSecondary) base.colorSecondary = shiftHue(base.colorSecondary, hueShift + 30);
  if (base.colorTertiary) base.colorTertiary = shiftHue(base.colorTertiary, hueShift + 60);
  return { ...base, name: PRESETS[key].name + ' ✦' };
}

export function generateRandomBundle(trailCount: 1 | 2 | 3 | 4): PresetBundle {
  /* ── Energy-coherent selection: pick a dominant energy, then prefer presets
   *    from that energy or compatible ones. This produces more aesthetically
   *    coherent random bundles instead of completely random mashups. ── */
  const energyGroups: Record<string, string[]> = {
    ethereal: ['ethereal', 'organic', 'luminous', 'minimal'],
    aggressive: ['aggressive', 'chaotic', 'cyber'],
    organic: ['organic', 'ethereal', 'luminous'],
    cyber: ['cyber', 'aggressive', 'minimal'],
    chaotic: ['chaotic', 'aggressive', 'cyber'],
    luminous: ['luminous', 'ethereal', 'organic'],
    minimal: ['minimal', 'ethereal', 'cyber'],
    void: ['void', 'minimal', 'ethereal'],
  };
  const dominantEnergy = Object.keys(energyGroups)[Math.floor(Math.random() * Object.keys(energyGroups).length)];
  const compatibleEnergies = energyGroups[dominantEnergy];

  const compatible = presetKeys.filter(k => compatibleEnergies.includes(PRESETS[k].energy));
  const pool = compatible.length >= trailCount ? compatible : presetKeys;

  const chosen = pickRandom(pool, trailCount);
  const hueShift = Math.random() * 60 - 30;

  const trails = chosen.map((key, i) => {
    const base = PRESETS[key].settings;
    const shifted = jitter(base);
    if (shifted.colorPrimary) shifted.colorPrimary = shiftHue(shifted.colorPrimary, hueShift + i * 15);
    if (shifted.colorSecondary) shifted.colorSecondary = shiftHue(shifted.colorSecondary, hueShift + i * 15);
    return { ...shifted, name: PRESETS[key].name + ' ✦' };
  });

  const names = [
    'Cosmic Roulette', 'Void Lottery', 'Star Scramble', 'Nebula Shuffle',
    'Quantum Dice', 'Entropy Spin', 'Astral Gambit', 'Photon Scatter',
  ];

  return {
    name: names[Math.floor(Math.random() * names.length)],
    description: `Random ${trailCount}-trail ${dominantEnergy} combo — fresh every time`,
    icon: '🎲',
    energy: dominantEnergy,
    trailCount,
    trails,
  };
}
