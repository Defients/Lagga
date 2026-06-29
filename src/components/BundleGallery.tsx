/* ─── Bundle Gallery ──────────────────────────────────────────────────────
 *  Displays curated preset bundles filtered by trail count (2/3/4),
 *  plus a "Random Bundle" generator button.
 *  Hovering a bundle card shows a zoomed preview in the bottom-right corner.
 * ────────────────────────────────────────────────────────────────────────── */

import { useState, useCallback, useRef, useEffect } from 'react';
import { BUNDLES, generateRandomBundle } from '../shared/presets';
import { useTrailStore } from '../stores/trail-store';
import { GlassPanel, SectionHeader, CosmoButton, Icon, PresetIcon } from './CosmoUI';
import { PresetThumbnail } from './PresetThumbnail';
import type { PresetBundle } from '../shared/types';

const TRAIL_COUNTS = [1, 2, 3, 4] as const;

const OVERLAY_W = 440;
const OVERLAY_H = 300;
const MOUSE_PAD = 24;

export function BundleGallery() {
  const [filterCount, setFilterCount] = useState<1 | 2 | 3 | 4>(2);
  const [hoveredBundle, setHoveredBundle] = useState<PresetBundle | null>(null);
  const [overlayPos, setOverlayPos] = useState({ x: 0, y: 0 });
  const [activeBundleName, setActiveBundleName] = useState<string | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const applyBundle = useTrailStore((s) => s.applyBundle);

  const handleBundleClick = useCallback((bundle: PresetBundle) => {
    applyBundle(bundle.trails, bundle.trailCount);
    setActiveBundleName(bundle.name);
  }, [applyBundle]);

  useEffect(() => {
    if (!hoveredBundle) return;
    const update = () => {
      const container = containerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;
      const mx = mousePosRef.current.x - rect.left;
      const my = mousePosRef.current.y - rect.top;

      // Default: place to the right and below the mouse
      let x = mx + MOUSE_PAD;
      let y = my + MOUSE_PAD;

      // Flip horizontally if it would overflow the container
      if (x + OVERLAY_W > cw - 4) {
        x = mx - MOUSE_PAD - OVERLAY_W;
      }
      // Flip vertically if it would overflow the container
      if (y + OVERLAY_H > ch - 4) {
        y = my - MOUSE_PAD - OVERLAY_H;
      }
      // Clamp within container bounds
      x = Math.max(4, Math.min(x, cw - OVERLAY_W - 4));
      y = Math.max(4, Math.min(y, ch - OVERLAY_H - 4));

      setOverlayPos({ x, y });
    };
    update();
    window.addEventListener('mousemove', update);
    return () => window.removeEventListener('mousemove', update);
  }, [hoveredBundle]);

  const filteredBundles = BUNDLES.filter((b) => b.trailCount === filterCount);

  const handleRandomBundle = useCallback(() => {
    const bundle = generateRandomBundle(filterCount);
    applyBundle(bundle.trails, bundle.trailCount);
    setActiveBundleName(null);
  }, [filterCount, applyBundle]);

  return (
    <GlassPanel className="p-4">
      <div ref={containerRef} className="relative">
        <SectionHeader
          icon="layers"
          title="Preset Bundles"
          subtitle="Curated trail combinations — click to apply"
          actions={
            <div className="flex items-center gap-1 glass-inset rounded-lg p-0.5" role="group" aria-label="Filter by trail count">
              {TRAIL_COUNTS.map((count) => (
                <button
                  key={count}
                  onClick={() => setFilterCount(count)}
                  aria-pressed={filterCount === count}
                  className={`px-3 py-1 rounded-md text-[11px] font-medium transition-all ${
                    filterCount === count
                      ? 'bg-gradient-to-r from-neon-cyan/15 to-neon-violet/15 text-neon-cyan border border-neon-cyan/20 shadow-neon-cyan'
                      : 'text-white/30 hover:text-white/50 border border-transparent'
                  }`}
                >
                  {count}-Trail
                </button>
              ))}
            </div>
          }
        />

        <div className="grid grid-cols-3 gap-2 mb-2">
          {filteredBundles.map((bundle, idx) => (
            <button
              key={bundle.name}
              onClick={() => handleBundleClick(bundle)}
              onMouseEnter={(e) => {
                mousePosRef.current = { x: e.clientX, y: e.clientY };
                setHoveredBundle(bundle);
              }}
              onMouseLeave={() => setHoveredBundle(null)}
              aria-label={`Apply ${bundle.name} bundle with ${bundle.trailCount} trails`}
              className={`bundle-card glass-inset rounded-lg p-3 text-left group cursor-pointer
                         overflow-hidden transition-all hover:border-neon-cyan/20 ${
                           activeBundleName === bundle.name
                             ? 'shadow-[0_0_20px_rgba(0,240,255,0.4)] !border-neon-cyan/70'
                             : ''
                       }`}
              style={{
                animationDelay: `${idx * 50}ms`,
                borderWidth: '2px',
                borderStyle: 'solid',
                borderColor: activeBundleName === bundle.name
                  ? 'rgba(0, 240, 255, 0.7)'
                  : 'transparent',
              }}
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <PresetIcon icon={bundle.icon} energy={bundle.energy} className="w-3.5 h-3.5 text-white/50" />
                <span className="text-[11px] font-semibold text-white/70 group-hover:text-neon-cyan/90 transition-colors">
                  {bundle.name}
                </span>
              </div>
              <PresetThumbnail
                settings={bundle.trails[0]}
                multiTrails={bundle.trails}
                width={180}
                height={36}
              />
              <p className="text-[9px] text-white/30 leading-relaxed mt-1.5">
                {bundle.description}
              </p>
            </button>
          ))}

          <button
            onClick={handleRandomBundle}
            aria-label={`Generate random ${filterCount}-trail bundle`}
            className="bundle-card glass-inset rounded-lg p-3 text-left group cursor-pointer
                       hover:border-neon-magenta/20 border border-dashed border-white/[0.06]
                       flex flex-col items-center justify-center"
          >
            <Icon name="dice" className="w-4 h-4 mb-1 text-white/40 group-hover:text-neon-magenta/80 transition-colors group-hover:animate-pulse" />
            <span className="text-[11px] font-semibold text-white/50 group-hover:text-neon-magenta/80 transition-colors">
              Random Bundle
            </span>
            <p className="text-[9px] text-white/25 text-center mt-1">
              Generate a fresh {filterCount}-trail combo
            </p>
          </button>
        </div>

        {hoveredBundle && (
          <div
            className="absolute z-50 pointer-events-none"
            style={{ left: overlayPos.x, top: overlayPos.y }}
          >
            <div
              className="glass-panel-raised rounded-xl border border-neon-cyan/20 shadow-2xl overflow-hidden"
              style={{ width: OVERLAY_W }}
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-cosmos-border/10 bg-white/[0.02]">
                <PresetIcon icon={hoveredBundle.icon} energy={hoveredBundle.energy} className="w-5 h-5 text-white/60" />
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-bold text-white/90 truncate">{hoveredBundle.name}</div>
                  <div className="text-[9px] text-white/35 uppercase tracking-wider">
                    {hoveredBundle.trailCount}-trail · {hoveredBundle.energy}
                  </div>
                </div>
                <div className="text-[10px] text-neon-cyan/50">
                  Click to apply
                </div>
              </div>

              <div className="px-4 py-3 space-y-2">
                <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Individual Trails</div>
                {hoveredBundle.trails.map((t, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-cosmos-void/20 border border-cosmos-border/5 p-2">
                    <div className="flex items-center gap-2 w-28 flex-shrink-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: t.colorPrimary || '#fff',
                          boxShadow: `0 0 8px ${t.colorPrimary || '#fff'}80`,
                        }}
                        aria-hidden="true"
                      />
                      <div className="min-w-0">
                        <div className="text-[10px] text-white/65 truncate">{t.name || `Trail ${i + 1}`}</div>
                        <div className="text-[8px] text-white/30">{t.renderMode || 'lines'}</div>
                      </div>
                    </div>
                    <div className="rounded-md overflow-hidden bg-cosmos-void/30 flex-shrink-0">
                      <PresetThumbnail
                        settings={t}
                        width={260}
                        height={48}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

    </GlassPanel>
  );
}

