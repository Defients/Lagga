/* ─── Advanced Panel ─────────────────────────────────────────────────────
 *  Behaviors, Idle, and Advanced settings combined into one panel
 *  for a single trail.
 * ────────────────────────────────────────────────────────────────────────── */

import { useCallback } from 'react';
import { useTrailStore } from '../stores/trail-store';
import type { TrailSettings, IdlePattern } from '../shared/types';
import {
  CosmoSlider,
  CosmoToggle,
  CosmoSelect,
  CollapsibleSection,
  CosmoButton,
  Icon,
} from './CosmoUI';

interface AdvancedPanelProps {
  trailIndex: number;
  bulk?: boolean;
}

export function AdvancedPanel({ trailIndex, bulk = false }: AdvancedPanelProps) {
  const trail = useTrailStore((s) => s.trails[trailIndex]);
  const setTrail = useTrailStore((s) => s.setTrail);
  const setAllTrails = useTrailStore((s) => s.setAllTrails);
  const resetTrail = useTrailStore((s) => s.resetTrail);

  const update = useCallback(
    (patch: Partial<TrailSettings>) => {
      if (bulk) setAllTrails(patch);
      else setTrail(trailIndex, patch);
    },
    [bulk, trailIndex, setTrail, setAllTrails]
  );

  const handleResetAll = useCallback(() => {
    for (let i = 0; i < 4; i++) resetTrail(i);
  }, [resetTrail]);

  if (!trail) return null;

  return (
    <div className="space-y-3 animate-fade-in tab-switch" key={bulk ? 'all' : trailIndex}>
      <CollapsibleSection title="Behaviors" icon="settings" defaultOpen={true}>
        <CosmoToggle label="Mouse Velocity Influence" checked={trail.mouseVelocityInfluence} onChange={(v) => update({ mouseVelocityInfluence: v })} description="Particle behavior reacts to cursor speed" />
        <CosmoToggle label="Velocity Thickness" checked={trail.velocityThickness} onChange={(v) => update({ velocityThickness: v })} description="Trail width scales with cursor speed" />
        <CosmoToggle label="Persist on Click" checked={trail.persistOnClick} onChange={(v) => update({ persistOnClick: v })} description="Leave a particle burst when clicking" />
        <CosmoToggle label="Random Bursts" checked={trail.randomBursts} onChange={(v) => update({ randomBursts: v })} description="Occasional particle explosions" />
        {trail.randomBursts && (
          <CosmoSlider label="Burst Freq." value={trail.burstFrequency} min={0} max={1} step={0.05} onChange={(v) => update({ burstFrequency: v })} />
        )}
        <CosmoToggle label="Cross-Trail Sync" checked={trail.crossTrailSync} onChange={(v) => update({ crossTrailSync: v })} description="Sync physics with other active trails" />
        <CosmoToggle label="Nexus Mode" checked={trail.nexusMode} onChange={(v) => update({ nexusMode: v })} description="Trails connect and influence each other" />
        <CosmoToggle label="Comet Mode" checked={trail.cometMode} onChange={(v) => update({ cometMode: v })} description="Dramatic comet-style trail head" />
        <CosmoSlider label="Magnetic Repulsion" value={trail.magneticRepulsion} min={0} max={1} step={0.05} onChange={(v) => update({ magneticRepulsion: v })} />
        <CosmoToggle label="Trail Echo" checked={trail.trailEcho} onChange={(v) => update({ trailEcho: v })} description="Periodic echo of trail path" />
        {trail.trailEcho && (
          <CosmoSlider label="Echo Interval" value={trail.trailEchoInterval} min={0.5} max={5} step={0.1} onChange={(v) => update({ trailEchoInterval: v })} suffix="s" />
        )}
        <CosmoToggle label="Breathing" checked={trail.breathing} onChange={(v) => update({ breathing: v })} description="Orb radius subtly pulses" />
        {trail.breathing && (
          <>
            <CosmoSlider label="Breath Speed" value={trail.breathSpeed} min={0.1} max={3} step={0.1} onChange={(v) => update({ breathSpeed: v })} />
            <CosmoSlider label="Breath Depth" value={trail.breathDepth} min={0} max={1} step={0.05} onChange={(v) => update({ breathDepth: v })} />
          </>
        )}
        <CosmoToggle label="Gravity Well" checked={trail.gravityWell} onChange={(v) => update({ gravityWell: v })} description="Clicks create temporary gravity wells" />
        {trail.gravityWell && (
          <CosmoSlider label="Well Strength" value={trail.gravityWellStrength} min={0} max={1} step={0.05} onChange={(v) => update({ gravityWellStrength: v })} />
        )}
        <CosmoToggle label="Afterimages" checked={trail.afterimages} onChange={(v) => update({ afterimages: v })} />
        {trail.afterimages && (
          <CosmoSlider label="Ghost Count" value={trail.afterimageCount} min={2} max={20} onChange={(v) => update({ afterimageCount: v })} />
        )}
        <CosmoToggle label="Show Anchor" checked={trail.showAnchor} onChange={(v) => update({ showAnchor: v })} />
        <CosmoToggle label="Show Tether" checked={trail.showTether} onChange={(v) => update({ showTether: v })} />
      </CollapsibleSection>

      <CollapsibleSection title="Idling" icon="moon" defaultOpen={false}>
        <CosmoSlider label="Idle Timeout" value={trail.idleTimeout} min={0} max={30} step={1} onChange={(v) => update({ idleTimeout: v })} suffix="s" />
        {trail.idleTimeout > 0 && (
          <>
            <CosmoSlider label="Orbit Speed" value={trail.idleOrbitSpeed} min={0} max={2} step={0.1} onChange={(v) => update({ idleOrbitSpeed: v })} />
            <CosmoSelect
              label="Idle Pattern"
              value={trail.idlePattern}
              options={[
                { value: 'orbit', label: 'Orbit' },
                { value: 'figure8', label: 'Figure 8' },
                { value: 'spiral', label: 'Spiral' },
                { value: 'bounce', label: 'Bounce' },
              ]}
              onChange={(v) => update({ idlePattern: v as IdlePattern })}
            />
          </>
        )}
      </CollapsibleSection>

      <div className="flex justify-end items-center gap-2 pt-2 mt-2 border-t border-cosmos-border/10">
        <CosmoButton
          variant="danger"
          onClick={handleResetAll}
          title="Reset all trails to defaults (Ctrl+Shift+R)"
          className="px-4 py-2 rounded-lg text-[13px]"
          style={{ color: '#cc5500' }}
        >
          <Icon name="shuffle" className="w-4 h-4 inline" /> Reset All Trails
        </CosmoButton>
      </div>
    </div>
  );
}
