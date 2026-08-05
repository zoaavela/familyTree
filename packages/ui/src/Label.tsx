import { LabelHTMLAttributes } from 'react';
import clsx from 'clsx';

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={clsx(
        'mb-1.5 block text-[13px] font-medium text-[var(--color-ink-muted)]',
        className,
      )}
      {...props}
    />
  );
}