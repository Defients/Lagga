/* ─── Lagga Store ───────────────────────────────────────────────────
 *  Zustand store managing 4 independent trails + global settings.
 *  Emits combined payload to the overlay window via Tauri events.
 * ────────────────────────────────────────────────────────────────────────── */

import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import {
  DEFAULT_TRAIL,
  DEFAULT_GLOBAL,
  type TrailSettings,
  type GlobalSettings,
  loadTrails,
  saveTrails,
  loadGlobal,
  saveGlobal,
} from '../shared/settings';

interface HistorySnapshot {
  trails: TrailSettings[];
  global: GlobalSettings;
  activeTab: number;
}

interface TrailStore {
  trails: TrailSettings[];
  global: GlobalSettings;
  activeTab: number;           // 0-3
  activePreset: string | null; // currently active individual preset key

  /* Undo/Redo */
  undoStack: HistorySnapshot[];
  redoStack: HistorySnapshot[];
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;

  /* Trail actions */
  setTrail: (index: number, patch: Partial<TrailSettings>) => void;
  setAllTrails: (patch: Partial<TrailSettings>) => void;
  setTrailFull: (index: number, settings: TrailSettings) => void;
  resetTrail: (index: number) => void;

  /* Global actions */
  setGlobal: (patch: Partial<GlobalSettings>) => void;

  /* Bundle actions */
  applyBundle: (trails: Partial<TrailSettings>[], trailCount: 1 | 2 | 3 | 4) => void;

  /* Preset actions */
  applyPreset: (index: number, preset: Partial<TrailSettings>) => void;
  setActivePreset: (key: string | null) => void;

  /* UI */
  setActiveTab: (tab: number) => void;

  /* Infrastructure */
  pushToOverlay: () => void;
}

let emitTimer: ReturnType<typeof setTimeout> | null = null;
let pendingEmit: { trails: TrailSettings[]; global: GlobalSettings } | null = null;

function emitSettings(trails: TrailSettings[], global: GlobalSettings) {
  pendingEmit = { trails, global };
  if (emitTimer) return;
  emitTimer = setTimeout(() => {
    if (pendingEmit) {
      invoke('broadcast_settings', { payload: { global: pendingEmit.global, trails: pendingEmit.trails } }).catch((e) => console.error('[store] broadcast_settings failed:', e));
      pendingEmit = null;
    }
    emitTimer = null;
  }, 80);
}

function emitSettingsImmediate(trails: TrailSettings[], global: GlobalSettings) {
  if (emitTimer) { clearTimeout(emitTimer); emitTimer = null; }
  pendingEmit = null;
  invoke('broadcast_settings', { payload: { global, trails } }).catch(() => {});
}

const MAX_HISTORY = 50;

function snapshot(state: { trails: TrailSettings[]; global: GlobalSettings; activeTab: number }): HistorySnapshot {
  return {
    trails: state.trails.map((t) => ({ ...t })),
    global: { ...state.global },
    activeTab: state.activeTab,
  };
}

let undoTimer: ReturnType<typeof setTimeout> | null = null;
let pendingSnapshot: HistorySnapshot | null = null;

function pushUndo(state: { trails: TrailSettings[]; global: GlobalSettings; activeTab: number; undoStack: HistorySnapshot[]; redoStack: HistorySnapshot[] }): { undoStack: HistorySnapshot[]; redoStack: HistorySnapshot[] } {
  if (!pendingSnapshot) {
    pendingSnapshot = snapshot(state);
  }
  if (undoTimer) clearTimeout(undoTimer);
  undoTimer = setTimeout(() => { pendingSnapshot = null; undoTimer = null; }, 500);

  const undoStack = [...state.undoStack, pendingSnapshot].slice(-MAX_HISTORY);
  return { undoStack, redoStack: [] };
}

export const useTrailStore = create<TrailStore>((set, get) => ({
  trails: loadTrails(),
  global: loadGlobal(),
  activeTab: 0,
  activePreset: null,
  undoStack: [],
  redoStack: [],
  canUndo: false,
  canRedo: false,

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const prev = state.undoStack[state.undoStack.length - 1];
    const current = snapshot(state);
    saveTrails(prev.trails);
    saveGlobal(prev.global);
    emitSettingsImmediate(prev.trails, prev.global);
    set({
      trails: prev.trails.map((t) => ({ ...t })),
      global: { ...prev.global },
      activeTab: prev.activeTab,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, current],
      canUndo: state.undoStack.length > 1,
      canRedo: true,
      activePreset: null,
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const next = state.redoStack[state.redoStack.length - 1];
    const current = snapshot(state);
    saveTrails(next.trails);
    saveGlobal(next.global);
    emitSettingsImmediate(next.trails, next.global);
    set({
      trails: next.trails.map((t) => ({ ...t })),
      global: { ...next.global },
      activeTab: next.activeTab,
      undoStack: [...state.undoStack, current],
      redoStack: state.redoStack.slice(0, -1),
      canUndo: true,
      canRedo: state.redoStack.length > 1,
      activePreset: null,
    });
  },

  setTrail: (index, patch) => {
    set((state) => {
      const trails = [...state.trails];
      trails[index] = { ...trails[index], ...patch };
      const enabledCount = trails.filter(t => t.enabled).length;
      const global = { ...state.global, activeTrailCount: enabledCount };
      saveTrails(trails);
      saveGlobal(global);
      emitSettings(trails, global);
      const hist = pushUndo(state);
      const activeTab = state.activeTab >= 0 && state.activeTab >= enabledCount ? Math.max(0, enabledCount - 1) : state.activeTab;
      return { trails, global, activeTab, activePreset: null, ...hist, canUndo: true, canRedo: false };
    });
  },

  setAllTrails: (patch) => {
    set((state) => {
      const trails = state.trails.map((t) => ({ ...t, ...patch }));
      const enabledCount = trails.filter(t => t.enabled).length;
      const global = { ...state.global, activeTrailCount: enabledCount };
      saveTrails(trails);
      saveGlobal(global);
      emitSettings(trails, global);
      const hist = pushUndo(state);
      return { trails, global, activePreset: null, ...hist, canUndo: true, canRedo: false };
    });
  },

  setTrailFull: (index, settings) => {
    set((state) => {
      const trails = [...state.trails];
      trails[index] = settings;
      const enabledCount = trails.filter(t => t.enabled).length;
      const global = { ...state.global, activeTrailCount: enabledCount };
      saveTrails(trails);
      saveGlobal(global);
      emitSettings(trails, global);
      const hist = pushUndo(state);
      return { trails, global, ...hist, canUndo: true, canRedo: false };
    });
  },

  resetTrail: (index) => {
    set((state) => {
      const trails = [...state.trails];
      trails[index] = { ...DEFAULT_TRAIL, name: `Trail ${index + 1}` };
      const enabledCount = trails.filter(t => t.enabled).length;
      const global = { ...state.global, activeTrailCount: enabledCount };
      saveTrails(trails);
      saveGlobal(global);
      emitSettings(trails, global);
      const hist = pushUndo(state);
      return { trails, global, activePreset: null, ...hist, canUndo: true, canRedo: false };
    });
  },

  setGlobal: (patch) => {
    set((state) => {
      const global = { ...state.global, ...patch };
      saveGlobal(global);
      emitSettings(state.trails, global);
      const hist = pushUndo(state);
      return { global, ...hist, canUndo: true, canRedo: false };
    });
  },

  applyBundle: (bundleTrails, trailCount) => {
    set((state) => {
      const trails = [...state.trails];
      for (let i = 0; i < 4; i++) {
        if (i < trailCount && bundleTrails[i]) {
          const bt = bundleTrails[i];
          const scaledLeash = bt.leashLength != null
            ? Math.round(bt.leashLength * 1.35)
            : Math.round(DEFAULT_TRAIL.leashLength * 1.35);
          trails[i] = {
            ...DEFAULT_TRAIL,
            ...bt,
            leashLength: scaledLeash,
            enabled: true,
            name: bt.name || `Trail ${i + 1}`,
          };
        } else {
          trails[i] = { ...trails[i], enabled: i < trailCount };
        }
      }
      const global = { ...state.global, activeTrailCount: trailCount };
      saveTrails(trails);
      saveGlobal(global);
      emitSettings(trails, global);
      const hist = pushUndo(state);
      return { trails, global, activePreset: null, activeTab: 0, ...hist, canUndo: true, canRedo: false };
    });
  },

  applyPreset: (index, preset) => {
    set((state) => {
      const trails = [...state.trails];
      trails[index] = {
        ...DEFAULT_TRAIL,
        ...preset,
        name: preset.name || trails[index].name,
        enabled: true,
      };
      saveTrails(trails);
      emitSettings(trails, state.global);
      const hist = pushUndo(state);
      return { trails, ...hist, canUndo: true, canRedo: false };
    });
  },

  setActivePreset: (key) => set({ activePreset: key }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  pushToOverlay: () => {
    const { trails, global } = get();
    emitSettings(trails, global);
  },
}));
