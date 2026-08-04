import { useEffect, useRef, useState } from 'react';

export interface OverflowItem {
  label: string;
  onClick: () => void;
  active?: boolean;
}

export function OverflowMenu({ items }: { items: OverflowItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);

  if (items.length === 0) return null;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-ink)]"
        aria-label="Plus d'options"
      >
        <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
          <circle cx="3" cy="7.5" r="1.3" />
          <circle cx="7.5" cy="7.5" r="1.3" />
          <circle cx="12" cy="7.5" r="1.3" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-9 z-40 min-w-[180px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1 shadow-lg"
          style={{ animation: 'scaleIn 120ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          {items.map((item) => (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className="flex w-full items-center justify-between px-3 py-1.5 text-left text-[13px] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg)]"
            >
              {item.label}
              {item.active && <span className="text-[var(--color-accent)]">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
