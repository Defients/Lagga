/* ─── Lagga — CosmoTech™ Main Interface ────────────────────────────
 *  Premium cursor trail customization app with up to 4 independent trails,
 *  preset bundles, deep physics/visuals/behavior controls, and immersive
 *  CosmoTech deep-space aesthetic.
 * ────────────────────────────────────────────────────────────────────────── */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { getCurrentWindow, LogicalSize } from '@tauri-apps/api/window';
import { useTrailStore } from './stores/trail-store';
import { CosmicBackground } from './components/CosmicBackground';
import { BundleGallery } from './components/BundleGallery';
import { TrailPanel } from './components/TrailPanel';
import { AdvancedPanel } from './components/AdvancedPanel';
import { TrailTabBar } from './components/TrailTabBar';
import { HelpModal } from './components/HelpModal';
import { CosmoSlider, CosmoToggle, CosmoSelect, StaticSection, Icon, type IconName } from './components/CosmoUI';
import type { PerformanceMode } from './shared/types';
import { BUNDLES, generateRandomBundle } from './shared/presets';
import logo from './assets/Lagga-logo.png';

function StardustHeader() {
  const motes = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const size = 1 + Math.random() * 2.5;
      return {
        id: i,
        left: `${Math.random() * 100}%`,
        size,
        duration: 6 + Math.random() * 10,
        delay: Math.random() * 8,
        hue: Math.random() > 0.6
          ? `rgba(0, 240, 255, ${0.2 + Math.random() * 0.3})`
          : Math.random() > 0.5
            ? `rgba(168, 85, 247, ${0.15 + Math.random() * 0.2})`
            : `rgba(255, 255, 255, ${0.15 + Math.random() * 0.25})`,
      };
    });
  }, []);

  return (
    <div className="stardust-header-bg">
      {motes.map((m) => (
        <div
          key={m.id}
          className="stardust-mote"
          style={{
            left: m.left,
            width: `${m.size}px`,
            height: `${m.size}px`,
            animationDuration: `${m.duration}s`,
            animationDelay: `${m.delay}s`,
            background: m.hue,
            boxShadow: `0 0 ${m.size * 4}px ${m.hue}`,
          }}
        />
      ))}
    </div>
  );
}

type SectionId = 'global' | 'presets' | 'trails' | 'advanced';

const SECTIONS: { id: SectionId; label: string; icon: IconName }[] = [
  { id: 'global', label: 'Global', icon: 'globe' },
  { id: 'presets', label: 'Presets', icon: 'layers' },
  { id: 'trails', label: 'Trails', icon: 'sparkles' },
  { id: 'advanced', label: 'Advanced', icon: 'settings' },
];

const TRAIL_COUNT_OPTIONS = [1, 2, 3, 4] as const;

export default function App() {
  const {
    global,
    activeTab,
    setActiveTab,
    setGlobal,
    applyBundle,
    pushToOverlay,
    undo,
    redo,
    canUndo,
    canRedo,
    resetTrail,
  } = useTrailStore();

  const [activeSection, setActiveSection] = useState<SectionId>('global');
  const [displayedSection, setDisplayedSection] = useState<SectionId>('global');
  const [transitioning, setTransitioning] = useState(false);
  const [headerReady, setHeaderReady] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout>>();
  const headerTimer = useRef<ReturnType<typeof setTimeout>>();

  const handleSectionChange = useCallback((section: SectionId) => {
    if (section === activeSection) return;

    if (section === 'global') {
      setHeaderReady(false);
      setActiveSection(section);
      setTransitioning(true);
      if (headerTimer.current) clearTimeout(headerTimer.current);
      headerTimer.current = setTimeout(() => setHeaderReady(true), 800);
    } else {
      setActiveSection(section);
      setHeaderReady(true);
      setTransitioning(true);
    }

    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => {
      setDisplayedSection(section);
      setTransitioning(false);
    }, 500);
  }, [activeSection]);

  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    if (headerTimer.current) clearTimeout(headerTimer.current);
  }, []);

  /* ── Keyboard shortcuts ─────────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') return;

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
        if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo(); return; }
        if (e.key === 'r' && !e.shiftKey) { e.preventDefault(); resetTrail(activeTab >= 0 ? activeTab : 0); return; }
        if (e.key === 'r' && e.shiftKey) { e.preventDefault(); for (let i = 0; i < 4; i++) resetTrail(i); return; }
        return;
      }

      switch (e.key) {
        case ' ': { e.preventDefault(); setGlobal({ overlayEnabled: !global.overlayEnabled }); break; }
        case 'Tab': { e.preventDefault(); cycleTrailTab(); break; }
        case '1': case '2': case '3': case '4': {
          const n = parseInt(e.key) - 1;
          if (n < global.activeTrailCount) setActiveTab(n);
          break;
        }
        case 'r': case 'R': {
          const bundle = generateRandomBundle(global.activeTrailCount as 1|2|3|4);
          applyBundle(bundle.trails, bundle.trailCount);
          break;
        }
        case 'h': case 'H': { e.preventDefault(); setHelpOpen(o => !o); break; }
        case 'Escape': { setHelpOpen(false); break; }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo, resetTrail, activeTab, global.overlayEnabled, global.activeTrailCount, setGlobal, setActiveTab, applyBundle]);

  const cycleTrailTab = useCallback(() => {
    const max = global.activeTrailCount;
    if (activeTab === -1) { setActiveTab(0); return; }
    const next = activeTab + 1;
    if (next >= max) setActiveTab(-1);
    else setActiveTab(next);
  }, [activeTab, global.activeTrailCount, setActiveTab]);

  /* Clamp activeTab when trail count decreases */
  useEffect(() => {
    if (activeTab >= 0 && activeTab >= global.activeTrailCount) {
      setActiveTab(global.activeTrailCount - 1);
    }
  }, [global.activeTrailCount, activeTab, setActiveTab]);

  /* Push initial settings on mount with a short delay */
  const didPush = useRef(false);
  useEffect(() => {
    if (!didPush.current) {
      didPush.current = true;
      const t = setTimeout(() => pushToOverlay(), 600);
      return () => clearTimeout(t);
    }
  }, [pushToOverlay]);

  const handleTrailCountChange = useCallback((count: number) => {
    setGlobal({ activeTrailCount: count });
    if (activeTab >= 0 && activeTab >= count) setActiveTab(count - 1);
  }, [setGlobal, activeTab, setActiveTab]);

  /* Resize window when switching to content-heavy sections */
  const NORMAL_HEIGHT = 650;
  const PRESETS_HEIGHT = 1000;
  const TRAILS_HEIGHT = 1000;
  const ADVANCED_HEIGHT = 1000;
  useEffect(() => {
    let targetHeight = NORMAL_HEIGHT;
    if (activeSection === 'presets') targetHeight = PRESETS_HEIGHT;
    else if (activeSection === 'trails') targetHeight = TRAILS_HEIGHT;
    else if (activeSection === 'advanced') targetHeight = ADVANCED_HEIGHT;
    getCurrentWindow()
      .setSize(new LogicalSize(960, targetHeight))
      .catch(() => {});
  }, [activeSection]);

  /* Auto-swap bundles on interval */
  const lastBundleRef = useRef<string | null>(null);
  useEffect(() => {
    if (!global.autoSwapBundles) return;
    const intervalMs = Math.max(30, global.autoSwapInterval) * 1000;
    const tick = () => {
      const count = global.activeTrailCount as 1 | 2 | 3 | 4;
      const candidates = BUNDLES.filter(
        (b) => b.trailCount === count && b.name !== lastBundleRef.current
      );
      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        lastBundleRef.current = pick.name;
        applyBundle(pick.trails, pick.trailCount);
      }
    };
    const timer = setInterval(tick, intervalMs);
    return () => clearInterval(timer);
  }, [global.autoSwapBundles, global.autoSwapInterval, global.activeTrailCount, applyBundle]);

  const renderSection = (section: SectionId) => {
    if (section === 'global') {
      return (
        <>
          <div className="space-y-3">
            <StaticSection title="Appearance" icon="palette">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                <CosmoSlider
                  label="Master Opacity"
                  value={global.masterOpacity}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={(v) => setGlobal({ masterOpacity: v })}
                />
                <CosmoSlider
                  label="Master Scale"
                  value={global.masterScale}
                  min={0.5}
                  max={2}
                  step={0.1}
                  onChange={(v) => setGlobal({ masterScale: v })}
                />
                <CosmoSlider
                  label="Global Hue Shift"
                  value={global.globalHueShift}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(v) => setGlobal({ globalHueShift: v })}
                  suffix="°"
                />
              </div>
            </StaticSection>

            <StaticSection title="Environment" icon="wind">
              <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
                <CosmoSlider
                  label="Global Wind X"
                  value={global.globalWindX}
                  min={-100}
                  max={100}
                  onChange={(v) => setGlobal({ globalWindX: v })}
                />
                <CosmoSlider
                  label="Global Wind Y"
                  value={global.globalWindY}
                  min={-100}
                  max={100}
                  onChange={(v) => setGlobal({ globalWindY: v })}
                />
              </div>
            </StaticSection>

            <div className="grid grid-cols-2 gap-3">
              <StaticSection title="Performance" icon="zap">
                <CosmoSelect
                  label="Performance Mode"
                  value={global.performanceMode}
                  options={[
                    { value: 'auto', label: 'Auto (Adaptive)' },
                    { value: 'quality', label: 'Quality (Full)' },
                    { value: 'balanced', label: 'Balanced (70%)' },
                    { value: 'performance', label: 'Performance (40%)' },
                  ]}
                  onChange={(v) => setGlobal({ performanceMode: v as PerformanceMode })}
                />
              </StaticSection>

              <StaticSection title="Idle Behavior" icon="moon">
                <CosmoToggle
                  label="Auto-Dim When Idle"
                  checked={global.autoDim}
                  onChange={(v) => setGlobal({ autoDim: v })}
                  description="Dim overlay when cursor is idle"
                />
                {global.autoDim && (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-1">
                    <CosmoSlider
                      label="Dim Delay"
                      value={global.autoDimDelay}
                      min={3}
                      max={60}
                      step={1}
                      onChange={(v) => setGlobal({ autoDimDelay: v })}
                      suffix="s"
                    />
                    <CosmoSlider
                      label="Dimmed Opacity"
                      value={global.autoDimOpacity}
                      min={0}
                      max={1}
                      step={0.05}
                      onChange={(v) => setGlobal({ autoDimOpacity: v })}
                    />
                  </div>
                )}
              </StaticSection>
            </div>

            <StaticSection title="Auto-Swap" icon="shuffle">
              <CosmoToggle
                label="Random Bundle Swapping"
                checked={global.autoSwapBundles}
                onChange={(v) => setGlobal({ autoSwapBundles: v })}
                description="Randomly switch to another bundle with the same trail count"
              />
              {global.autoSwapBundles && (
                <CosmoSlider
                  label="Swap Interval"
                  value={global.autoSwapInterval}
                  min={30}
                  max={3600}
                  step={15}
                  onChange={(v) => setGlobal({ autoSwapInterval: v })}
                  suffix="s"
                />
              )}
            </StaticSection>
          </div>
        </>
      );
    }

    if (section === 'presets') {
      return <BundleGallery />;
    }

    if (section === 'trails') {
      const isAll = activeTab === -1;
      return (
        <TrailTabBar>
          {isAll
            ? <TrailPanel key="all" trailIndex={0} bulk />
            : <TrailPanel key={activeTab} trailIndex={activeTab} />}
        </TrailTabBar>
      );
    }

    if (section === 'advanced') {
      const isAll = activeTab === -1;
      return (
        <TrailTabBar paddingBottom="pb-[50px]">
          {isAll
            ? <AdvancedPanel key="all" trailIndex={0} bulk />
            : <AdvancedPanel key={activeTab} trailIndex={activeTab} />}
        </TrailTabBar>
      );
    }

    return null;
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden font-cosmo">
      <CosmicBackground />

      {/* Draggable handle — visible on all pages */}
      <div
        data-tauri-drag-region
        className="absolute top-2 left-1/2 -translate-x-1/2 z-50 rounded-full cursor-grab active:cursor-grabbing"
        style={{
          width: '120px',
          height: '8px',
          backgroundColor: '#fffafa',
          opacity: 0.42,
          border: '1px dotted #4a0080',
        }}
      />

      <div className="relative z-10 flex flex-col h-full">

        {/* ════ Header ═══════════════════════════════════════════════════ */}
        <header
          className="glass-panel-raised flex items-center px-5 py-3 border-b border-cosmos-border/20 relative overflow-visible"
          style={{
            height: (activeSection === 'global' || displayedSection === 'global') ? '180px' : '34px',
            transition: 'height 0.8s ease-in-out',
          }}
        >
          <StardustHeader />

          {/* ════ Window Controls ═════════════════════════════════════════ */}
          <div className="absolute top-2 right-3 flex items-center gap-1.5 z-30">
            <button
              onClick={() => getCurrentWindow().minimize().catch(() => {})}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
              title="Minimize"
              aria-label="Minimize"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button
              onClick={() => getCurrentWindow().close().catch(() => {})}
              className="w-7 h-7 rounded-md flex items-center justify-center text-white/30 hover:text-red-400/80 hover:bg-red-400/10 transition-all"
              title="Close"
              aria-label="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3.5 h-3.5">
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </svg>
            </button>
          </div>
          {headerReady && (activeSection === 'global' || displayedSection === 'global') && (
            <div className={`flex items-center ${activeSection !== 'global' ? 'header-fade-out' : 'header-fade-in'}`}>
              <div className="w-2 relative z-20" />
              <img src={logo} alt="Lagga" className="h-[300px] object-contain -my-12 pt-[8px] -mb-[75px] relative z-20" style={{ filter: 'drop-shadow(0 0 30px rgba(0, 240, 255, 0.5)) drop-shadow(0 0 60px rgba(0, 180, 255, 0.3))' }} />
            </div>
          )}
          {headerReady && (activeSection === 'global' || displayedSection === 'global') && (
            <div className={`flex-1 flex items-center justify-end gap-3 ${activeSection !== 'global' ? 'header-fade-out' : 'header-fade-in'}`}>
              <div className="relative mr-auto ml-[30px] mt-[32px]">
                <span className="absolute -top-[29px] left-[1px] text-[20px] text-white/40 font-medium">Trails:</span>
                <div className="flex items-center gap-1 glass-inset rounded-lg p-1.5" role="group" aria-label="Active trail count">
                  {TRAIL_COUNT_OPTIONS.map((count) => (
                    <button
                      key={count}
                      onClick={() => handleTrailCountChange(count)}
                      aria-pressed={global.activeTrailCount === count}
                      className={`px-[25px] py-[10px] rounded-md text-[27px] font-medium transition-all ${
                        global.activeTrailCount === count
                          ? 'bg-gradient-to-r from-neon-cyan/15 to-neon-violet/15 text-neon-cyan border border-neon-cyan/20'
                          : 'text-white/30 hover:text-white/50 border border-transparent'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Overlay Toggle — Premium Visual */}
              <button
                onClick={() => setGlobal({ overlayEnabled: !global.overlayEnabled })}
                className={`relative flex items-center gap-3 py-2.5 rounded-xl border transition-all duration-300 group ${!global.overlayEnabled ? 'dormant-toggle' : ''}`}
                style={{
                  position: 'relative',
                  top: '15px',
                  right: '10px',
                  paddingLeft: '16px',
                  paddingRight: '16px',
                  borderColor: global.overlayEnabled ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 255, 255, 0.08)',
                  background: global.overlayEnabled
                    ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.08), rgba(168, 85, 247, 0.06))'
                    : 'rgba(5, 2, 14, 0.4)',
                  boxShadow: global.overlayEnabled
                    ? '0 0 20px rgba(0, 240, 255, 0.15), inset 0 0 12px rgba(0, 240, 255, 0.05)'
                    : 'inset 0 2px 8px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Glowing orb indicator — only visible when active */}
                {global.overlayEnabled && (
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <div
                      className="rounded-full transition-all duration-500"
                      style={{
                        width: '16px',
                        height: '16px',
                        background: 'radial-gradient(circle, #00f0ff 0%, #00b4d8 60%, transparent 100%)',
                        boxShadow: '0 0 12px rgba(0, 240, 255, 0.6), 0 0 24px rgba(0, 240, 255, 0.3)',
                        animation: 'glowPulse 2s ease-in-out infinite',
                      }}
                    />
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: '24px',
                        height: '24px',
                        border: '1px solid rgba(0, 240, 255, 0.2)',
                        animation: 'glowPulse 2s ease-in-out infinite',
                      }}
                    />
                  </div>
                )}

                {/* Status text */}
                <div className="flex flex-col items-start">
                  <span
                    className={`text-[13px] font-semibold tracking-wide transition-colors duration-300 ${!global.overlayEnabled ? 'dormant-text' : ''}`}
                    style={{ color: global.overlayEnabled ? '#00f0ff' : 'rgba(255, 255, 255, 0.3)' }}
                  >
                    {global.overlayEnabled ? 'ACTIVE' : 'DORMANT'}
                  </span>
                  <span className="text-[9px] text-white/25 tracking-wider uppercase">
                    Overlay
                  </span>
                </div>

                {/* Subtle scanline effect when active */}
                {global.overlayEnabled && (
                  <div
                    className="absolute inset-0 rounded-xl pointer-events-none opacity-30"
                    style={{
                      background: 'linear-gradient(180deg, transparent 0%, rgba(0, 240, 255, 0.03) 50%, transparent 100%)',
                      backgroundSize: '100% 4px',
                    }}
                  />
                )}
              </button>
            </div>
          )}
        </header>

        {/* ════ Section Nav ══════════════════════════════════════════════ */}
        <nav className="glass-panel border-b border-cosmos-border/15 px-4 py-1.5" aria-label="Sections">
          <div className="max-w-[960px] mx-auto flex items-center justify-center gap-2">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionChange(section.id)}
                aria-pressed={activeSection === section.id}
                className={`section-nav-btn flex items-center gap-2 px-5 py-1 rounded-lg text-[14px] font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-white/[0.06] text-white/70 border border-white/10'
                    : 'text-white/30 hover:text-white/50 border border-transparent'
                }`}
              >
                <Icon name={section.icon} className="w-4 h-4" />
                {section.label}
              </button>
            ))}
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              <button
                onClick={undo}
                disabled={!canUndo}
                aria-label="Undo"
                title="Undo (Ctrl+Z)"
                className="w-7 h-7 rounded-md flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-15-6.7L3 13" />
                </svg>
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                aria-label="Redo"
                title="Redo (Ctrl+Shift+Z)"
                className="w-7 h-7 rounded-md flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M21 7v6h-6" /><path d="M3 17a9 9 0 0 1 15-6.7L21 13" />
                </svg>
              </button>
              <button
                onClick={() => setHelpOpen(true)}
                aria-label="Keyboard shortcuts"
                title="Shortcuts (H)"
                className="w-7 h-7 rounded-md flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </button>
            </div>
          </div>
        </nav>

        {/* ════ Content Area ═════════════════════════════════════════════ */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Old content fading out */}
          {transitioning && (
            <div className="tab-page-exit absolute inset-0">
              <div className="max-w-[960px] mx-auto p-4 space-y-4">
                {renderSection(displayedSection)}
              </div>
            </div>
          )}
          {/* New content fading in */}
          <div key={activeSection} className={`tab-page-enter ${transitioning ? 'tab-page-enter-delayed' : ''}`}>
            <div className="max-w-[960px] mx-auto p-4 space-y-4">
              {renderSection(activeSection)}
            </div>
          </div>
        </div>

      </div>

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}
