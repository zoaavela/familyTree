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
                    'inline-flex items-center justify-center h-10 px-4 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    {
                        'bg-[var(--color-accent)] text-[var(--color-bg)] hover:bg-[var(--color-accent-hover)]':
                            variant === 'primary',
                        'bg-transparent border border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-bg-elevated)]':
                            variant === 'secondary',
                        'bg-transparent text-[var(--color-ink)] hover:bg-[var(--color-bg-elevated)]':
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