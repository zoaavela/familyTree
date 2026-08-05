import type { ReactNode } from 'react';

interface Props {
  eyebrow?: string;
  title: string;
  count?: number;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ eyebrow, title, count, description, action }: Props) {
  return (
    <header className="mb-8 border-b border-[var(--color-border)] pb-6">
      {eyebrow && (
        <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.09em] text-[var(--color-ink-faint)]">
          {eyebrow}
        </p>
      )}
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-baseline gap-3">
            <h1 className="text-[26px] font-semibold leading-none tracking-[-0.02em]">{title}</h1>
            {count !== undefined && (
              <span className="text-[26px] font-normal leading-none text-[var(--color-ink-faint)] tabular-nums">
                {count}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-2 text-[14px] text-[var(--color-ink-muted)]">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  );
}
