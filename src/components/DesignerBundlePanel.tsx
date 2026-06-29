/* ─── Designer Bundle Panel ────────────────────────────────────────────────
 *  Behavior customization panel for designer bundles.
 *  Shows toggle/slider controls for all Behaviors, applied uniformly
 *  across all trails in the bundle. User adjusts, then clicks Apply.
 * ────────────────────────────────────────────────────────────────────────── */

import { useState, useMemo } from 'react';
import { DEFAULT_TRAIL } from '../shared/types';
import type { PresetBundle, TrailSettings } from '../shared/types';
import { CosmoToggle, CosmoSlider, GlassPanel, Icon, PresetIcon } from './CosmoUI';
import { PresetThumbnail } from './PresetThumbnail';

interface DesignerBundlePanelProps {
  bundle: PresetBundle;
  onApply: (trails: Partial<TrailSettings>[]) => void;
  onClose: () => void;
}

export function DesignerBundlePanel({ bundle, onApply, onClose }: DesignerBundlePanelProps) {
  // Merge behaviors across all trails: OR for booleans, max for numbers
  const mergedBehaviors = useMemo(() => {
    const keys: (keyof TrailSettings)[] = [
      'mouseVelocityInfluence', 'velocityThickness',
      'persistOnClick', 'randomBursts', 'burstFrequency',
      'crossTrailSync', 'nexusMode', 'cometMode',
      'magneticRepulsion',
      'trailEcho', 'trailEchoInterval',
      'breathing', 'breathSpeed', 'breathDepth',
      'gravityWell', 'gravityWellStrength',
    ];
    const result = {} as Record<string, boolean | number>;
    for (const key of keys) {
      const vals = bundle.trails.map((t) => ({ ...DEFAULT_TRAIL, ...t })[key]);
      const firstVal = vals[0];
      if (typeof firstVal === 'boolean') {
        result[key] = (vals as boolean[]).some((v) => v);
      } else if (typeof firstVal === 'number') {
        result[key] = Math.max(...(vals as number[]));
      }
    }
    return result as Partial<TrailSettings>;
  }, [bundle]);

  const [behaviors, setBehaviors] = useState<Partial<TrailSettings>>({
    mouseVelocityInfluence: mergedBehaviors.mouseVelocityInfluence ?? false,
    velocityThickness: mergedBehaviors.velocityThickness ?? false,
    persistOnClick: mergedBehaviors.persistOnClick ?? false,
    randomBursts: mergedBehaviors.randomBursts ?? false,
    burstFrequency: mergedBehaviors.burstFrequency ?? 0.3,
    crossTrailSync: mergedBehaviors.crossTrailSync ?? false,
    nexusMode: mergedBehaviors.nexusMode ?? false,
    cometMode: mergedBehaviors.cometMode ?? false,
    magneticRepulsion: mergedBehaviors.magneticRepulsion ?? 0,
    trailEcho: mergedBehaviors.trailEcho ?? false,
    trailEchoInterval: mergedBehaviors.trailEchoInterval ?? 1.5,
    breathing: mergedBehaviors.breathing ?? false,
    breathSpeed: mergedBehaviors.breathSpeed ?? 0.8,
    breathDepth: mergedBehaviors.breathDepth ?? 0.15,
    gravityWell: mergedBehaviors.gravityWell ?? false,
    gravityWellStrength: mergedBehaviors.gravityWellStrength ?? 0.5,
  });

  const update = (patch: Partial<TrailSettings>) =>
    setBehaviors((prev) => ({ ...prev, ...patch }));

  const handleApply = () => {
    const mergedTrails = bundle.trails.map((t) => ({ ...t, ...behaviors }));
    onApply(mergedTrails);
  };

  const handleReset = () => {
    setBehaviors({
      mouseVelocityInfluence: false,
      velocityThickness: false,
      persistOnClick: false,
      randomBursts: false,
      burstFrequency: 0.3,
      crossTrailSync: false,
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
    });
  };

  const handleEnableAll = () => {
    setBehaviors({
      mouseVelocityInfluence: true,
      velocityThickness: true,
      persistOnClick: true,
      randomBursts: true,
      burstFrequency: 0.4,
      crossTrailSync: true,
      nexusMode: true,
      cometMode: true,
      magneticRepulsion: 0.5,
      trailEcho: true,
      trailEchoInterval: 1.5,
      breathing: true,
      breathSpeed: 0.8,
      breathDepth: 0.15,
      gravityWell: true,
      gravityWellStrength: 0.5,
    });
  };

  return (
    <GlassPanel className="p-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <PresetIcon icon={bundle.icon} energy={bundle.energy} className="w-4 h-4 text-white/60" />
          <div>
            <h2 className="text-[12px] font-bold text-white/80">{bundle.name}</h2>
            <p className="text-[9px] text-white/30">{bundle.description}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[10px] px-2.5 py-1 rounded-md border border-cosmos-border/30 text-white/40 hover:text-red-400/60 hover:border-red-400/20 transition-all"
        >
          <Icon name="x" className="w-3 h-3 inline" /> Close
        </button>
      </div>

      {/* Preview */}
      <div className="glass-inset rounded-lg p-2 mb-3">
        <PresetThumbnail
          settings={bundle.trails[0]}
          multiTrails={bundle.trails}
          width={400}
          height={48}
        />
      </div>

      {/* Behavior Controls */}
      <div className="glass-inset rounded-lg p-3 space-y-2.5 mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-white/30">
            <Icon name="settings" className="w-3 h-3 inline" /> Behaviors <span className="text-white/20 normal-case tracking-normal">— applied to all trails</span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleReset}
              className="text-[9px] px-2 py-0.5 rounded-md border border-cosmos-border/30 text-white/40 hover:text-white/60 hover:border-white/20 transition-all"
            >
              Reset All
            </button>
            <button
              onClick={handleEnableAll}
              className="text-[9px] px-2 py-0.5 rounded-md border border-cosmos-border/30 text-white/40 hover:text-neon-cyan/70 hover:border-neon-cyan/20 transition-all"
            >
              Enable All
            </button>
          </div>
        </div>

        <CosmoToggle label="Mouse Velocity Influence" checked={behaviors.mouseVelocityInfluence ?? false} onChange={(v) => update({ mouseVelocityInfluence: v })} description="Particle behavior reacts to cursor speed" />
        <CosmoToggle label="Velocity Thickness" checked={behaviors.velocityThickness ?? false} onChange={(v) => update({ velocityThickness: v })} description="Trail width scales with cursor speed" />
        <CosmoToggle label="Persist on Click" checked={behaviors.persistOnClick ?? false} onChange={(v) => update({ persistOnClick: v })} description="Leave a particle burst when clicking" />
        <CosmoToggle label="Random Bursts" checked={behaviors.randomBursts ?? false} onChange={(v) => update({ randomBursts: v })} description="Occasional particle explosions" />
        {behaviors.randomBursts && (
          <CosmoSlider label="Burst Freq." value={behaviors.burstFrequency ?? 0.3} min={0} max={1} step={0.05} onChange={(v) => update({ burstFrequency: v })} />
        )}
        <CosmoToggle label="Cross-Trail Sync" checked={behaviors.crossTrailSync ?? false} onChange={(v) => update({ crossTrailSync: v })} description="Sync physics with other active trails" />
        <CosmoToggle label="Nexus Mode" checked={behaviors.nexusMode ?? false} onChange={(v) => update({ nexusMode: v })} description="Trails connect and influence each other" />
        <CosmoToggle label="Comet Mode" checked={behaviors.cometMode ?? false} onChange={(v) => update({ cometMode: v })} description="Dramatic comet-style trail head" />
        <CosmoSlider label="Magnetic Repulsion" value={behaviors.magneticRepulsion ?? 0} min={0} max={1} step={0.05} onChange={(v) => update({ magneticRepulsion: v })} />
        <CosmoToggle label="Trail Echo" checked={behaviors.trailEcho ?? false} onChange={(v) => update({ trailEcho: v })} description="Periodic echo of trail path" />
        {behaviors.trailEcho && (
          <CosmoSlider label="Echo Interval" value={behaviors.trailEchoInterval ?? 1.5} min={0.5} max={5} step={0.1} onChange={(v) => update({ trailEchoInterval: v })} suffix="s" />
        )}
        <CosmoToggle label="Breathing" checked={behaviors.breathing ?? false} onChange={(v) => update({ breathing: v })} description="Orb radius subtly pulses" />
        {behaviors.breathing && (
          <>
            <CosmoSlider label="Breath Speed" value={behaviors.breathSpeed ?? 0.8} min={0.1} max={3} step={0.1} onChange={(v) => update({ breathSpeed: v })} />
            <CosmoSlider label="Breath Depth" value={behaviors.breathDepth ?? 0.15} min={0} max={1} step={0.05} onChange={(v) => update({ breathDepth: v })} />
          </>
        )}
        <CosmoToggle label="Gravity Well" checked={behaviors.gravityWell ?? false} onChange={(v) => update({ gravityWell: v })} description="Clicks create temporary gravity wells" />
        {behaviors.gravityWell && (
          <CosmoSlider label="Well Strength" value={behaviors.gravityWellStrength ?? 0.5} min={0} max={1} step={0.05} onChange={(v) => update({ gravityWellStrength: v })} />
        )}
      </div>

      {/* Apply Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleApply}
          className="flex-1 px-4 py-2 rounded-lg text-[11px] font-semibold tracking-wide
                     bg-gradient-to-r from-neon-cyan/15 to-neon-violet/15 text-neon-cyan
                     border border-neon-cyan/30 hover:bg-neon-cyan/20 transition-all"
        >
          <Icon name="check" className="w-3 h-3 inline" /> Apply {bundle.name} with {bundle.trailCount} Trails
        </button>
      </div>
    </GlassPanel>
  );
}
