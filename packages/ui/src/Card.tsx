import { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function Card({ interactive, className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 transition-all',
        interactive &&
          'cursor-pointer hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)]',
        className,
      )}
      style={{ transitionDuration: 'var(--transition-fast)' }}
      {...props}
    />
  );
}