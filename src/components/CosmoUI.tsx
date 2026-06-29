/* ─── CosmoTech™ UI Primitives ────────────────────────────────────────────
 *  Styled slider, toggle, select, section, and glass panel components
 *  matching the cosmic glassmorphism design language.
 * ────────────────────────────────────────────────────────────────────────── */

import { useState, useId, type ReactNode } from 'react';

/* ════════════════════════════════════════════════════════════════════════════
 *  Icon — inline SVG icon set (no emojis)
 * ════════════════════════════════════════════════════════════════════════════ */

export type IconName =
  | 'globe' | 'layers' | 'sparkles' | 'chart' | 'palette' | 'wind'
  | 'zap' | 'moon' | 'atom' | 'eye' | 'droplet' | 'settings' | 'wrench'
  | 'save' | 'x' | 'alert' | 'check' | 'star' | 'dice' | 'cpu' | 'shuffle'
  | 'circle' | 'circle-filled' | 'triangle' | 'diamond' | 'hexagon'
  | 'cross' | 'heart' | 'flame' | 'orbit' | 'compass' | 'web' | 'burst'
  | 'waves' | 'sun' | 'ghost' | 'leaf' | 'magnet' | 'satellite' | 'map'
  | 'crystal' | 'microscope' | 'comet';

const ICON_PATHS: Record<IconName, string> = {
  globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z',
  layers: 'M12 2 2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
  sparkles: 'M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8',
  chart: 'M3 3v18h18M7 16l4-4 3 3 5-6',
  palette: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM8 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM16 8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12 14a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM6 12a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
  wind: 'M3 8h10a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8a3 3 0 1 1-3 3',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z',
  atom: 'M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0M12 2C8 2 4.5 6.5 4.5 12S8 22 12 22s7.5-4.5 7.5-10S16 2 12 2zM12 2c4 0 7.5 4.5 7.5 10S16 22 12 22 4.5 17.5 4.5 12 8 2 12 2z',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  droplet: 'M12 2.7s6 5.5 6 10.3a6 6 0 0 1-12 0c0-4.8 6-10.3 6-10.3z',
  settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z',
  wrench: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.5-2.5 2.5-2.5z',
  save: 'M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2zM17 21v-8H7v8M7 3v5h8',
  x: 'M18 6 6 18M6 6l12 12',
  alert: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  check: 'M20 6 9 17l-5-5',
  star: 'M12 2 15.1 8.6 22 9.3l-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-.7L12 2z',
  dice: 'M3 3h18v18H3zM8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01',
  cpu: 'M9 9h6v6H9zM4 9h2M4 12h2M4 15h2M18 9h2M18 12h2M18 15h2M9 4h6v2M9 18h6v2',
  shuffle: 'M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
  circle: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0',
  'circle-filled': 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0',
  triangle: 'M12 3 22 20 2 20z',
  diamond: 'M12 2 22 12 12 22 2 12z',
  hexagon: 'M12 2 21 7v10l-9 5-9-5V7l9-5z',
  cross: 'M12 2v6M12 16v6M2 12h6M16 12h6',
  heart: 'M12 21s-7-4.5-9.5-9C1 9 2.5 5 6.5 5c2 0 3.5 1 5.5 3 2-2 3.5-3 5.5-3 4 0 5.5 4 4 7-2.5 4.5-9.5 9-9.5 9z',
  flame: 'M12 2c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 1-5 0-2-1-3-1-4 2 1 3 2 4 0z',
  orbit: 'M12 12m-2 0a2 2 0 1 0 4 0 2 2 0 1 0-4 0M12 4a8 8 0 0 1 8 8M12 20a8 8 0 0 1-8-8',
  compass: 'M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0-18 0M16 8l-2 6-6 2 2-6 6-2z',
  web: 'M12 2 2 7v10l10 5 10-5V7L12 2zM12 2v20M2 7l10 5 10-5M2 17l10-5 10 5',
  burst: 'M12 2v6M12 16v6M2 12h6M16 12h6M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3',
  waves: 'M2 8c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 14c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
  sun: 'M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  ghost: 'M9 12h.01M15 12h.01M12 2a8 8 0 0 0-8 8v12l3-3 3 3 2-3 2 3 3-3 3 3V10a8 8 0 0 0-8-8z',
  leaf: 'M6 18a6 6 0 0 0 6-6V6a6 6 0 0 0-6 6v6zM12 12c4-4 8-4 10-4-2 6-6 8-10 8',
  magnet: 'M6 4v8a6 6 0 0 0 12 0V4M6 4h4v8a2 2 0 0 0 4 0V4h4',
  satellite: 'M5 13a4 4 0 0 0 4 4M5 17a8 8 0 0 0 8 8M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M9 9l-3-3M15 9l3-3M9 15l-3 3M15 15l3 3',
  map: 'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15',
  crystal: 'M12 2 7 8l5 14 5-14z',
  microscope: 'M6 18h8M6 18a2 2 0 0 1-2-2v-2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2M9 22a7 7 0 0 0 6-3M10 6l4 4 4-4-4-4z',
  comet: 'M14 4a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM14 10 4 20',
};

const FILLED_ICONS: IconName[] = ['circle-filled', 'star', 'heart', 'zap', 'flame', 'diamond', 'burst', 'cross'];

interface IconProps {
  name: IconName;
  className?: string;
}

export function Icon({ name, className = 'w-3.5 h-3.5' }: IconProps) {
  const filled = FILLED_ICONS.includes(name);
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

const ENERGY_ICON_MAP: Record<string, IconName> = {
  ethereal: 'circle',
  organic: 'leaf',
  aggressive: 'triangle',
  void: 'circle-filled',
  minimal: 'diamond',
  cyber: 'hexagon',
  luminous: 'star',
  chaotic: 'burst',
};

export function PresetIcon({ icon, energy, className }: { icon: string; energy: string; className?: string }) {
  const namedIcon = icon as IconName;
  if (ICON_PATHS[namedIcon]) {
    return <Icon name={namedIcon} className={className} />;
  }
  const energyIcon = ENERGY_ICON_MAP[energy];
  return <Icon name={energyIcon || 'sparkles'} className={className} />;
}

/* ════════════════════════════════════════════════════════════════════════════
 *  CosmoSlider
 * ════════════════════════════════════════════════════════════════════════════ */

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}

export function CosmoSlider({ label, value, min, max, step = 1, onChange, suffix }: SliderProps) {
  const id = useId();
  const display = step < 1 ? value.toFixed(2) : Math.round(value).toString();
  return (
    <div className="flex items-center gap-3 group">
      <label htmlFor={id} className="text-[11px] text-white/50 w-[120px] shrink-0 group-hover:text-white/70 transition-colors">
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-label={label}
        className="cosmo-range flex-1"
      />
      <span className="text-[11px] text-white/40 w-14 text-right font-mono tabular-nums" aria-hidden="true">
        {display}{suffix ? <span className="text-white/25 ml-0.5">{suffix}</span> : null}
      </span>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 *  CosmoToggle
 * ════════════════════════════════════════════════════════════════════════════ */

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  description?: string;
}

export function CosmoToggle({ label, checked, onChange, description }: ToggleProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-3 cursor-pointer select-none group" onClick={() => onChange(!checked)}>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={`cosmo-toggle ${checked ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onChange(!checked);
        }}
        onKeyDown={(e) => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onChange(!checked);
          }
        }}
      />
      <label htmlFor={id} className="flex flex-col cursor-pointer">
        <span className="text-[11px] text-white/55 group-hover:text-white/75 transition-colors">
          {label}
        </span>
        {description && (
          <span className="text-[9px] text-white/25">{description}</span>
        )}
      </label>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 *  CosmoSelect
 * ════════════════════════════════════════════════════════════════════════════ */

interface SelectProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

export function CosmoSelect({ label, value, options, onChange }: SelectProps) {
  const id = useId();
  return (
    <div className="flex items-center gap-3">
      <label htmlFor={id} className="text-[11px] text-white/50 w-[120px] shrink-0">{label}</label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="cosmo-select flex-1 text-[11px] text-white/70 px-2 py-1.5 rounded-md
                   border border-cosmos-border/40 focus:outline-none focus:border-neon-cyan/30
                   transition-colors"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-cosmos-deep text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 *  CosmoColorPicker
 * ════════════════════════════════════════════════════════════════════════════ */

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  presets?: string[];
}

const DEFAULT_COLOR_SWATCHES = [
  '#00f0ff', '#a855f7', '#ec4899', '#f43f5e', '#f97316',
  '#fbbf24', '#34d399', '#22d3ee', '#6366f1', '#ffffff',
  '#3b82f6', '#06b6d4', '#d946ef', '#84cc16', '#f472b6',
];

export function CosmoColorPicker({ label, value, onChange, presets }: ColorPickerProps) {
  const swatches = presets || DEFAULT_COLOR_SWATCHES;

  return (
    <div className="flex items-start gap-3">
      <span className="text-[11px] text-white/50 w-[120px] shrink-0 mt-1">{label}</span>
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-wrap gap-1.5">
          {swatches.map((hex) => (
            <button
              key={hex}
              onClick={() => onChange(hex)}
              className={`color-swatch w-5 h-5 rounded-full border-2 transition-all ${
                value === hex
                  ? 'border-white/80 scale-110 ring-1 ring-white/30'
                  : 'border-white/10 hover:border-white/30'
              }`}
              style={{ backgroundColor: hex, color: hex }}
              title={hex}
            />
          ))}
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-label={`${label} custom color`}
            className="w-5 h-5 rounded-full cursor-pointer border border-cosmos-border/40 overflow-hidden"
            style={{ padding: 0 }}
            title="Custom color"
          />
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 *  StaticSection — non-collapsible section with large left icon
 * ════════════════════════════════════════════════════════════════════════════ */

interface StaticSectionProps {
  title: string;
  icon?: IconName;
  children: ReactNode;
}

export function StaticSection({ title, icon, children }: StaticSectionProps) {
  return (
    <div className="glass-inset rounded-lg overflow-hidden flex">
      {icon && (
        <div className="flex items-center justify-center w-10 shrink-0 border-r border-cosmos-border/15 bg-white/[0.02]">
          <Icon name={icon} className="w-5 h-5 text-neon-cyan/50" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 px-3 py-2.5">
          <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white/40">
            {title}
          </span>
          <div className="flex-1 h-px bg-gradient-to-r from-cosmos-border/30 to-transparent ml-2" />
        </div>
        <div className="px-3 pb-3 space-y-2.5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 *  CollapsibleSection
 * ════════════════════════════════════════════════════════════════════════════ */

interface SectionProps {
  title: string;
  icon?: IconName;
  children: ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleSection({ title, icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();

  return (
    <div className="glass-inset rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls={id}
        className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-white/[0.02] transition-all"
      >
        <svg
          className={`w-3 h-3 text-neon-cyan/50 transition-transform duration-300 ${open ? 'rotate-0' : '-rotate-90'}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
        {icon && <Icon name={icon as IconName} className="w-3.5 h-3.5 text-neon-cyan/50" />}
        <span className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white/40">
          {title}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-cosmos-border/30 to-transparent ml-2" />
      </button>
      <div id={id} className={`section-content ${open ? 'expanded' : 'collapsed'}`}>
        <div className="px-3 pb-3 space-y-2.5">
          {children}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 *  GlassPanel
 * ════════════════════════════════════════════════════════════════════════════ */

interface PanelProps {
  children: ReactNode;
  className?: string;
  raised?: boolean;
}

export function GlassPanel({ children, className = '', raised = false }: PanelProps) {
  return (
    <div className={`${raised ? 'glass-panel-raised' : 'glass-panel'} rounded-xl ${className}`}>
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 *  SectionHeader — consistent panel header with icon + title
 * ════════════════════════════════════════════════════════════════════════════ */

interface SectionHeaderProps {
  icon?: IconName;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function SectionHeader({ icon, title, subtitle, actions }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon && <Icon name={icon} className="w-4 h-4 text-neon-cyan/50" />}
      <div className="flex flex-col">
        <h2 className="text-[11px] uppercase tracking-[0.15em] font-semibold text-white/40">
          {title}
        </h2>
        {subtitle && (
          <span className="text-[9px] text-white/20">{subtitle}</span>
        )}
      </div>
      <div className="flex-1" />
      {actions}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
 *  CosmoButton — consistent styled button
 * ════════════════════════════════════════════════════════════════════════════ */

type ButtonVariant = 'default' | 'primary' | 'danger' | 'ghost';

interface CosmoButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  default: 'border-cosmos-border/30 text-white/40 hover:text-white/60 hover:border-white/20',
  primary: 'border-neon-cyan/30 text-neon-cyan bg-neon-cyan/10 hover:bg-neon-cyan/15',
  danger: 'border-cosmos-border/30 text-white/40 hover:text-red-400/70 hover:border-red-400/20 hover:bg-red-400/5',
  ghost: 'border-transparent text-white/40 hover:text-white/60',
};

export function CosmoButton({ variant = 'default', className = '', children, ...props }: CosmoButtonProps) {
  return (
    <button
      {...props}
      className={`text-[10px] px-2.5 py-1 rounded-md border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${BUTTON_VARIANTS[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
