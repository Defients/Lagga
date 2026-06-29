/* ─── Trail Settings Panel ────────────────────────────────────────────────
 *  Full settings UI for a single trail: Presets, Physics, Visuals,
 *  Color, Behaviors, and Advanced sections in collapsible groups.
 * ────────────────────────────────────────────────────────────────────────── */

import { useCallback } from 'react';
import { useTrailStore } from '../stores/trail-store';
import { PRESETS, generateRandomTrail } from '../shared/presets';
import { COSMIC_PALETTES } from '../shared/settings';
import type { TrailSettings, ColorMode, TextureOverlay, RenderMode } from '../shared/types';
import {
  CosmoSlider,
  CosmoToggle,
  CosmoSelect,
  CosmoColorPicker,
  CollapsibleSection,
  CosmoButton,
  Icon,
} from './CosmoUI';
import { TrailPreview } from './TrailPreview';
import { PresetThumbnail } from './PresetThumbnail';

interface TrailPanelProps {
  trailIndex: number;
  bulk?: boolean;
}

export function TrailPanel({ trailIndex, bulk = false }: TrailPanelProps) {
  const trail = useTrailStore((s) => s.trails[trailIndex]);
  const setTrail = useTrailStore((s) => s.setTrail);
  const setAllTrails = useTrailStore((s) => s.setAllTrails);
  const applyPreset = useTrailStore((s) => s.applyPreset);
  const resetTrail = useTrailStore((s) => s.resetTrail);
  const activePreset = useTrailStore((s) => s.activePreset);
  const setActivePreset = useTrailStore((s) => s.setActivePreset);

  const update = useCallback(
    (patch: Partial<TrailSettings>) => {
      if (bulk) setAllTrails(patch);
      else setTrail(trailIndex, patch);
    },
    [bulk, trailIndex, setTrail, setAllTrails]
  );

  const handlePreset = useCallback(
    (key: string) => {
      if (bulk) {
        setAllTrails(PRESETS[key].settings);
      } else {
        applyPreset(trailIndex, PRESETS[key].settings);
      }
      setActivePreset(key);
    },
    [bulk, trailIndex, applyPreset, setAllTrails, setActivePreset]
  );

  if (!trail) return null;

  return (
    <div className="space-y-3 animate-fade-in tab-switch" key={bulk ? 'all' : trailIndex}>
      {/* ── Live Preview ──────────────────────────────────────────────── */}
      {!bulk && <TrailPreview trailIndex={trailIndex} />}

      {/* ── Quick Actions ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-1">
        <CosmoButton
          onClick={() => update(generateRandomTrail())}
          title="Apply random preset to all trails"
        >
          <Icon name="dice" className="w-3 h-3 inline" /> Randomize All
        </CosmoButton>
        <div className="flex-1" />
      </div>

      {/* ── Individual Presets ──────────────────────────────────────────── */}
      <CollapsibleSection title="Presets" icon="sparkles" defaultOpen={true}>
        <div className="grid grid-cols-4 gap-1.5">
          {Object.entries(PRESETS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePreset(key)}
              className={`flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-lg border transition-all text-center overflow-hidden
                ${activePreset === key
                  ? 'border-neon-cyan/40 bg-neon-cyan/[0.07] shadow-neon-cyan'
                  : 'border-cosmos-border/20 hover:border-white/15 bg-white/[0.02]'
                }`}
            >
              <PresetThumbnail settings={preset.settings} width={84} height={28} />
              <span className="text-[8px] font-medium text-white/55 leading-tight mt-0.5">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* ── Physics ────────────────────────────────────────────────────── */}
      <CollapsibleSection title="Physics" icon="atom" defaultOpen={true}>
        <CosmoSlider label="Leash Length" value={trail.leashLength} min={20} max={500} onChange={(v) => update({ leashLength: v })} suffix="px" />
        <CosmoSlider label="Stiffness" value={trail.stiffness} min={50} max={800} step={10} onChange={(v) => update({ stiffness: v })} />
        <CosmoSlider label="Damping" value={trail.damping} min={2} max={30} onChange={(v) => update({ damping: v })} />
        <CosmoSlider label="Gravity" value={trail.gravity} min={-100} max={100} onChange={(v) => update({ gravity: v })} />
        <CosmoSlider label="Gravity Angle" value={trail.gravityAngle} min={0} max={360} suffix="°" onChange={(v) => update({ gravityAngle: v })} />
        <CosmoSlider label="Gravity Falloff" value={trail.gravityFalloff} min={0} max={1} step={0.05} onChange={(v) => update({ gravityFalloff: v })} />
        <CosmoSlider label="Inertia" value={trail.inertia} min={0} max={1} step={0.05} onChange={(v) => update({ inertia: v })} />
        <CosmoSlider label="Friction" value={trail.friction} min={0} max={1} step={0.05} onChange={(v) => update({ friction: v })} />
        <CosmoSlider label="Spring Tension" value={trail.springTension} min={0} max={1} step={0.05} onChange={(v) => update({ springTension: v })} />
        <CosmoSlider label="Turbulence" value={trail.turbulence} min={0} max={1} step={0.05} onChange={(v) => update({ turbulence: v })} />
        <CosmoSlider label="Orbital Pull" value={trail.orbitalAttraction} min={0} max={1} step={0.05} onChange={(v) => update({ orbitalAttraction: v })} />
        <CosmoSlider label="Wind X" value={trail.windX} min={-100} max={100} onChange={(v) => update({ windX: v })} />
        <CosmoSlider label="Wind Y" value={trail.windY} min={-100} max={100} onChange={(v) => update({ windY: v })} />
        <CosmoSlider label="Velocity Decay" value={trail.velocityDecay} min={0} max={1} step={0.05} onChange={(v) => update({ velocityDecay: v })} />
      </CollapsibleSection>

      {/* ── Visuals ────────────────────────────────────────────────────── */}
      <CollapsibleSection title="Visuals" icon="eye" defaultOpen={true}>
        <CosmoSlider label="Particle Count" value={trail.particleCount} min={0} max={200} onChange={(v) => update({ particleCount: v })} />
        <CosmoSlider label="Particle Var." value={trail.particleVariance} min={0} max={1} step={0.05} onChange={(v) => update({ particleVariance: v })} />
        <CosmoSlider label="Orb Radius" value={trail.orbRadius} min={2} max={50} onChange={(v) => update({ orbRadius: v })} suffix="px" />
        <CosmoSlider label="Size Min" value={trail.sizeMin} min={1} max={20} onChange={(v) => update({ sizeMin: v })} suffix="px" />
        <CosmoSlider label="Size Max" value={trail.sizeMax} min={1} max={50} onChange={(v) => update({ sizeMax: v })} suffix="px" />
        <CosmoSlider label="Size Curve" value={trail.sizeCurve} min={0} max={1} step={0.05} onChange={(v) => update({ sizeCurve: v })} />
        <CosmoSlider label="Glow Intensity" value={trail.glowIntensity} min={0} max={1} step={0.05} onChange={(v) => update({ glowIntensity: v })} />
        <CosmoSlider label="Bloom Strength" value={trail.bloomStrength} min={0} max={1} step={0.05} onChange={(v) => update({ bloomStrength: v })} />
        <CosmoSlider label="Trail Length" value={trail.trailLength} min={2} max={128} onChange={(v) => update({ trailLength: v })} />
        <CosmoSlider label="Trail Width" value={trail.trailWidth} min={1} max={20} step={0.5} onChange={(v) => update({ trailWidth: v })} suffix="px" />
        <CosmoSlider label="Fade Curve" value={trail.trailFadeCurve} min={0} max={1} step={0.05} onChange={(v) => update({ trailFadeCurve: v })} />
        <CosmoSlider label="Opacity" value={trail.opacity} min={0} max={1} step={0.05} onChange={(v) => update({ opacity: v })} />
        <CosmoSelect
          label="Render Mode"
          value={trail.renderMode}
          options={[
            { value: 'dots', label: 'Dots' },
            { value: 'lines', label: 'Lines' },
            { value: 'glowing-orbs', label: 'Glowing Orbs' },
            { value: 'energy-streams', label: 'Energy Streams' },
            { value: 'ribbon', label: 'Ribbon' },
            { value: 'plasma-bolt', label: 'Plasma Bolt' },
            { value: 'shockwave', label: 'Shockwave' },
            { value: 'fireflies', label: 'Fireflies' },
            { value: 'spiral', label: 'Spiral' },
          ]}
          onChange={(v) => update({ renderMode: v as RenderMode })}
        />
        <CosmoSelect
          label="Texture"
          value={trail.textureOverlay}
          options={[
            { value: 'none', label: 'None' },
            { value: 'nebula-noise', label: 'Nebula Noise' },
            { value: 'starfield', label: 'Starfield' },
            { value: 'energy-filaments', label: 'Energy Filaments' },
            { value: 'constellation', label: 'Constellation' },
            { value: 'vortex', label: 'Vortex' },
            { value: 'aurora-veil', label: 'Aurora Veil' },
          ]}
          onChange={(v) => update({ textureOverlay: v as TextureOverlay })}
        />
      </CollapsibleSection>

      {/* ── Color ──────────────────────────────────────────────────────── */}
      <CollapsibleSection title="Color" icon="droplet" defaultOpen={false}>
        <CosmoSelect
          label="Color Mode"
          value={trail.colorMode}
          options={[
            { value: 'static', label: 'Static' },
            { value: 'gradient', label: 'Gradient' },
            { value: 'velocity', label: 'Velocity' },
            { value: 'rainbow', label: 'Rainbow' },
            { value: 'palette', label: 'Palette' },
            { value: 'pulse', label: 'Pulse' },
          ]}
          onChange={(v) => update({ colorMode: v as ColorMode })}
        />
        <CosmoColorPicker label="Primary" value={trail.colorPrimary} onChange={(v) => update({ colorPrimary: v })} />
        <CosmoColorPicker label="Secondary" value={trail.colorSecondary} onChange={(v) => update({ colorSecondary: v })} />
        <CosmoColorPicker label="Tertiary" value={trail.colorTertiary} onChange={(v) => update({ colorTertiary: v })} />

        <div className="flex items-start gap-3">
          <span className="text-[11px] text-white/50 w-[120px] shrink-0 mt-1">Palette</span>
          <div className="flex flex-wrap gap-1">
            {Object.entries(COSMIC_PALETTES).map(([name, colors]) => (
              <button
                key={name}
                onClick={() => update({
                  colorPrimary: colors[2] || colors[0],
                  colorSecondary: colors[1] || colors[0],
                  colorTertiary: colors[3] || colors[0],
                })}
                className="flex items-center gap-0.5 px-1.5 py-1 rounded-md border border-cosmos-border/20 hover:border-white/20 transition-all"
                title={name}
                aria-label={`Apply ${name} palette`}
              >
                {colors.slice(0, 4).map((hex, i) => (
                  <div
                    key={i}
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: hex }}
                    aria-hidden="true"
                  />
                ))}
              </button>
            ))}
          </div>
        </div>

        <CosmoToggle label="Color Cycling" checked={trail.colorCycling} onChange={(v) => update({ colorCycling: v })} />
        {trail.colorCycling && (
          <CosmoSlider label="Cycle Speed" value={trail.colorCycleSpeed} min={0.1} max={10} step={0.1} onChange={(v) => update({ colorCycleSpeed: v })} />
        )}
      </CollapsibleSection>

      <div className="flex justify-end pt-2 mt-2 border-t border-cosmos-border/10">
        <CosmoButton
          variant="danger"
          onClick={() => { for (let i = 0; i < 4; i++) resetTrail(i); }}
          title="Reset all trails to defaults"
          className="px-4 py-2 rounded-lg text-[13px]"
          style={{ color: '#cc5500' }}
        >
          <Icon name="shuffle" className="w-4 h-4 inline" /> Reset All Trails
        </CosmoButton>
      </div>
    </div>
  );
}
