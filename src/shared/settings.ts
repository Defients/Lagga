/* ─── Lagga Settings Storage ────────────────────────────────────────────
 *  Handles persistence to localStorage for multi-trail + global settings.
 *  Re-exports types for convenience.
 * ────────────────────────────────────────────────────────────────────────── */

import {
  DEFAULT_TRAIL,
  DEFAULT_GLOBAL,
  type TrailSettings,
  type GlobalSettings,
  type LaggaPayload,
} from './types';

export type { TrailSettings, GlobalSettings, LaggaPayload };
export { DEFAULT_TRAIL, DEFAULT_GLOBAL };

/* ─── Storage Keys ───────────────────────────────────────────────────────── */

const TRAILS_KEY = 'lagga-trails';
const GLOBAL_KEY = 'lagga-global';

/* ─── Persistence ────────────────────────────────────────────────────────── */

export function loadTrails(): TrailSettings[] {
  try {
    const raw = localStorage.getItem(TRAILS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TrailSettings>[];
      return parsed.map((t, i) => ({
        ...DEFAULT_TRAIL,
        ...t,
        name: t.name || `Trail ${i + 1}`,
      }));
    }
  } catch { /* ignore corrupt data */ }
  return [
    { ...DEFAULT_TRAIL, name: 'Trail 1' },
    { ...DEFAULT_TRAIL, name: 'Trail 2', enabled: false },
    { ...DEFAULT_TRAIL, name: 'Trail 3', enabled: false },
    { ...DEFAULT_TRAIL, name: 'Trail 4', enabled: false },
  ];
}

export function saveTrails(trails: TrailSettings[]): void {
  try {
    localStorage.setItem(TRAILS_KEY, JSON.stringify(trails));
  } catch { /* storage full or blocked */ }
}

export function loadGlobal(): GlobalSettings {
  try {
    const raw = localStorage.getItem(GLOBAL_KEY);
    if (raw) return { ...DEFAULT_GLOBAL, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return { ...DEFAULT_GLOBAL };
}

export function saveGlobal(g: GlobalSettings): void {
  try {
    localStorage.setItem(GLOBAL_KEY, JSON.stringify(g));
  } catch { /* storage full or blocked */ }
}

/* ─── Color Utilities ────────────────────────────────────────────────────── */

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 0, g: 255, b: 200 };
}

export function lerpColor(a: string, b: string, t: number): string {
  const ra = hexToRgb(a), rb = hexToRgb(b);
  const r = Math.round(ra.r + (rb.r - ra.r) * t);
  const g = Math.round(ra.g + (rb.g - ra.g) * t);
  const bl = Math.round(ra.b + (rb.b - ra.b) * t);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${bl.toString(16).padStart(2, '0')}`;
}

/* ─── Cosmic Color Palettes ──────────────────────────────────────────────── */

export const COSMIC_PALETTES: Record<string, string[]> = {
  'Void Core':    ['#0a0a1a', '#1a0a2e', '#2d1b69', '#5b21b6'],
  'Nebula Fire':  ['#7c3aed', '#ec4899', '#f43f5e', '#f97316'],
  'Ice Giant':    ['#06b6d4', '#22d3ee', '#67e8f9', '#bae6fd'],
  'Solar Flare':  ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7'],
  'Deep Space':   ['#020617', '#0f172a', '#1e293b', '#334155'],
  'Plasma Arc':   ['#22d3ee', '#a855f7', '#ec4899', '#f43f5e'],
  'Bioluminous':  ['#064e3b', '#059669', '#34d399', '#6ee7b7'],
  'Aurora':       ['#064e3b', '#10b981', '#a78bfa', '#22d3ee'],
  'Magma Core':   ['#1c0a00', '#9a3412', '#ea580c', '#fde047'],
  'Toxic Bloom':  ['#1a2e05', '#4d7c0f', '#84cc16', '#d9f99d'],
  'Stardust':     ['#1e1b4b', '#6366f1', '#c084fc', '#f0abfc'],
};
