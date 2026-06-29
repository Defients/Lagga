import { useTrailStore } from '../stores/trail-store';
import { GlassPanel, Icon } from './CosmoUI';

const TRAIL_TABS = [0, 1, 2, 3] as const;
const TRAIL_COLORS = ['#00f0ff', '#a855f7', '#ec4899', '#fbbf24'];

interface TrailTabBarProps {
  children: React.ReactNode;
  paddingBottom?: string;
}

export function TrailTabBar({ children, paddingBottom = 'pb-[20px]' }: TrailTabBarProps) {
  const trails = useTrailStore((s) => s.trails);
  const global = useTrailStore((s) => s.global);
  const activeTab = useTrailStore((s) => s.activeTab);
  const setActiveTab = useTrailStore((s) => s.setActiveTab);

  const isAll = activeTab === -1;

  return (
    <GlassPanel className="overflow-hidden">
      <div className="flex border-b border-cosmos-border/15" role="tablist" aria-label="Trail selection">
        {TRAIL_TABS.filter((i) => i < global.activeTrailCount).map((i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            role="tab"
            aria-selected={activeTab === i}
            className={`cosmo-tab flex items-center gap-2 ${activeTab === i ? 'active' : ''}`}
          >
            <span
              className={`w-2 h-2 rounded-full transition-all ${activeTab === i && trails[i]?.enabled ? 'glow-pulse' : ''}`}
              style={{
                backgroundColor: trails[i]?.enabled ? TRAIL_COLORS[i] : 'rgba(255,255,255,0.1)',
                color: TRAIL_COLORS[i],
                boxShadow: trails[i]?.enabled ? `0 0 8px ${TRAIL_COLORS[i]}40` : 'none',
              }}
              aria-hidden="true"
            />
            <span>{trails[i]?.name || `Trail ${i + 1}`}</span>
          </button>
        ))}
        <button
          onClick={() => setActiveTab(-1)}
          role="tab"
          aria-selected={isAll}
          className={`cosmo-tab flex items-center gap-2 ${isAll ? 'active' : ''}`}
        >
          <Icon name="globe" className="w-3 h-3 text-white/50" />
          <span>All</span>
        </button>
      </div>

      <div className={`p-4 max-h-[calc(100vh-120px)] overflow-y-auto ${paddingBottom}`}>
        {children}
      </div>
    </GlassPanel>
  );
}
