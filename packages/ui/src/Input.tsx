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
                    'h-10 w-full rounded-[var(--radius-sm)] border bg-[var(--color-bg-elevated)] px-3 text-sm text-[var(--color-ink)] outline-none transition-colors',
                    'placeholder:text-[var(--color-ink-muted)]',
                    'focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-0',
                    error ? 'border-[var(--color-error)]' : 'border-[var(--color-border)]',
                    className,
                )}
                style={{ transitionDuration: 'var(--transition-fast)' }}
                {...props}
            />
        );
    },
);
Input.displayName = 'Input';