import { useEffect, useRef, useState } from 'react';

export interface MenuItem {
    label: string;
    onClick: () => void;
    danger?: boolean;
    separator?: boolean;
}

interface Props {
    x: number;
    y: number;
    items: MenuItem[];
    onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState({ x, y });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        setPos({
            x: Math.min(x, window.innerWidth - r.width - 8),
            y: Math.min(y, window.innerHeight - r.height - 8),
        });
    }, [x, y]);

    useEffect(() => {
        const close = () => onClose();
        const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
        window.addEventListener('click', close);
        window.addEventListener('keydown', onKey);
        window.addEventListener('resize', close);
        return () => {
            window.removeEventListener('click', close);
            window.removeEventListener('keydown', onKey);
            window.removeEventListener('resize', close);
        };
    }, [onClose]);

    return (
        <div
            ref={ref}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
            className="fixed z-50 min-w-[186px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1 shadow-lg"
            style={{ left: pos.x, top: pos.y, animation: 'scaleIn 120ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
            {items.map((item, i) =>
                item.separator ? (
                    <div key={i} className="my-1 h-px bg-[var(--color-border)]" />
                ) : (
                    <button
                        key={i}
                        onClick={() => {
                            item.onClick();
                            onClose();
                        }}
                        className="block w-full px-3 py-1.5 text-left text-[13px] transition-colors hover:bg-[var(--color-bg)]"
                        style={{ color: item.danger ? 'var(--color-error)' : 'var(--color-ink)' }}
                    >
                        {item.label}
                    </button>
                ),
            )}
        </div>
    );
}