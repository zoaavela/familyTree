import { LabelHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label
            className={clsx('block text-xs font-medium text-[var(--color-ink-muted)] mb-1.5', className)}
            {...props}
        />
    );
}