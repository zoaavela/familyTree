import { ReactNode, useEffect } from 'react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        if (open) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            style={{ animation: 'fadeIn 150ms ease-out' }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 shadow-lg w-full max-w-sm mx-4"
                style={{ animation: 'scaleIn 180ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
                {children}
            </div>
        </div>
    );
}