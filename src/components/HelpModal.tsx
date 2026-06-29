import { useEffect, useRef } from 'react';
import { Icon } from './CosmoUI';

const SHORTCUTS = [
  { keys: 'Space', desc: 'Toggle overlay on/off' },
  { keys: 'Tab', desc: 'Cycle to next trail tab' },
  { keys: '1 – 4', desc: 'Jump to trail tab 1–4' },
  { keys: 'R', desc: 'Randomize current bundle' },
  { keys: 'Ctrl+R', desc: 'Reset current trail to defaults' },
  { keys: 'Ctrl+Shift+R', desc: 'Reset all trails to defaults' },
  { keys: 'Ctrl+Z', desc: 'Undo last change' },
  { keys: 'Ctrl+Shift+Z', desc: 'Redo last undone change' },
  { keys: 'H', desc: 'Toggle this help overlay' },
  { keys: 'Esc', desc: 'Close this help overlay' },
];

interface HelpModalProps {
  open: boolean;
  onClose: () => void;
}

export function HelpModal({ open, onClose }: HelpModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    if (!dialog) return;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    if (first) first.focus();

    const trapHandler = (e: KeyboardEvent) => {
      if (e.key !== 'Tab' || focusable.length === 0) return;
      if (e.shiftKey) {
        if (document.activeElement === first || document.activeElement === dialog) {
          e.preventDefault();
          focusable[focusable.length - 1].focus();
        }
      } else {
        if (document.activeElement === focusable[focusable.length - 1]) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    dialog.addEventListener('keydown', trapHandler);
    return () => dialog.removeEventListener('keydown', trapHandler);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard Shortcuts"
        tabIndex={-1}
        className="glass-panel-raised rounded-2xl p-6 max-w-md w-full mx-4 border border-neon-cyan/20 outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <Icon name="settings" className="w-5 h-5 text-neon-cyan neon-text" />
          <h2 className="text-sm font-bold tracking-wide text-white/80">
            Keyboard Shortcuts
          </h2>
          <div className="flex-1" />
          <button
            onClick={onClose}
            aria-label="Close help"
            className="text-white/30 hover:text-white/60 transition-colors text-lg leading-none"
          >
            <Icon name="x" className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-2">
          {SHORTCUTS.map((s) => (
            <div key={s.keys} className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors">
              <span className="text-[12px] text-white/55">{s.desc}</span>
              <kbd className="text-[10px] font-mono px-2 py-1 rounded-md bg-white/[0.06] border border-white/10 text-white/65">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-white/5 text-center">
          <span className="text-[10px] text-white/25 font-mono">Press Esc or H to close</span>
        </div>
      </div>
    </div>
  );
}
