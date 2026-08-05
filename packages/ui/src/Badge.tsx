import { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'quiet' | 'solid';
}

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium leading-[1.6]',
        {
          'bg-[var(--color-bg-sunken)] text-[var(--color-ink-muted)]': tone === 'neutral',
          'border border-[var(--color-border)] text-[var(--color-ink-faint)]': tone === 'quiet',
          'bg-[var(--color-accent)] text-[var(--color-on-accent)]': tone === 'solid',
        },
        className,
      )}
      {...props}
    />
  );
}
