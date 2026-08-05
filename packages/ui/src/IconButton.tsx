import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ label, className, children, ...props }, ref) => (
    <button
      ref={ref}
      aria-label={label}
      title={label}
      className={clsx(
        'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)]',
        'text-[var(--color-ink-muted)] transition-all active:scale-95',
        'hover:bg-[var(--color-bg-sunken)] hover:text-[var(--color-ink)]',
        className,
      )}
      style={{ transitionDuration: 'var(--transition-fast)' }}
      {...props}
    >
      {children}
    </button>
  ),
);
IconButton.displayName = 'IconButton';
