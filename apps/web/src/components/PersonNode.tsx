import { Handle, Position } from '@xyflow/react';

interface PersonNodeData {
    firstName: string;
    lastName: string | null;
    birthDate: string | null;
    deathDate: string | null;
}

export function PersonNode({ data }: { data: PersonNodeData }) {
    const initials = `${data.firstName[0] ?? ''}${data.lastName?.[0] ?? ''}`.toUpperCase();
    const years =
        data.birthDate || data.deathDate
            ? `${data.birthDate ? new Date(data.birthDate).getFullYear() : '?'} — ${data.deathDate ? new Date(data.deathDate).getFullYear() : "aujourd'hui"
            }`
            : null;

    return (
        <div
            className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3.5 py-3 shadow-sm flex items-center gap-3 transition-transform hover:scale-[1.02] cursor-pointer"
            style={{ width: 190, transitionDuration: 'var(--transition-fast)' }}
        >
            <Handle type="target" position={Position.Top} className="!bg-[var(--color-accent)] !w-2 !h-2" />
            <div
                className="rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{
                    width: 34,
                    height: 34,
                    background: 'var(--color-accent)',
                    color: 'var(--color-bg)',
                }}
            >
                {initials}
            </div>
            <div className="min-w-0">
                <p className="text-sm font-medium truncate">
                    {data.firstName} {data.lastName}
                </p>
                {years && <p className="text-xs text-[var(--color-ink-muted)]">{years}</p>}
            </div>
            <Handle type="source" position={Position.Bottom} className="!bg-[var(--color-accent)] !w-2 !h-2" />
        </div>
    );
}