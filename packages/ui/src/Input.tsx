import { InputHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'h-10 w-full rounded-[var(--radius-sm)] border bg-[var(--color-bg-elevated)] px-3 text-sm text-[var(--color-ink)] outline-none transition-all',
          'placeholder:text-[var(--color-ink-faint)]',
          'hover:border-[var(--color-border-strong)]',
          'focus:border-[var(--color-ink)] focus:ring-[3px] focus:ring-[var(--node-focus-ring)]',
          error
            ? 'border-[var(--color-error)] focus:border-[var(--color-error)]'
            : 'border-[var(--color-border)]',
          className,
        )}
        style={{ transitionDuration: 'var(--transition-fast)' }}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';