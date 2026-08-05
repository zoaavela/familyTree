import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx(
          'inline-flex h-10 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] px-4 text-sm font-medium',
          'transition-all active:scale-[0.985]',
          'disabled:pointer-events-none disabled:opacity-45',
          {
            'bg-[var(--color-accent)] text-[var(--color-on-accent)] hover:bg-[var(--color-accent-hover)]':
              variant === 'primary',
            'border border-[var(--color-border)] bg-transparent text-[var(--color-ink)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-bg-sunken)]':
              variant === 'secondary',
            'bg-transparent text-[var(--color-ink-muted)] hover:bg-[var(--color-bg-sunken)] hover:text-[var(--color-ink)]':
              variant === 'ghost',
          },
          className,
        )}
        style={{ transitionDuration: 'var(--transition-fast)' }}
        {...props}
      />
    );
  },
);
Button.displayName = 'Button';