import type { GraphNode } from '../../lib/graph/types';
import { NODE_WIDTH, NODE_HEIGHT } from '../../lib/graph/types';

interface Props {
    node: GraphNode;
    selected: boolean;
    dimmed: boolean;
    onSelect: (id: string) => void;
    onAddRelative: (id: string) => void;
    onFocusRadial: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, id: string) => void;
}

export function PersonCard({ node, selected, dimmed, onSelect, onAddRelative, onFocusRadial, onContextMenu }: Props) {
    const { person } = node;
    const initials = `${person.firstName[0] ?? ''}${person.lastName?.[0] ?? ''}`.toUpperCase();
    const birth = person.birthDate ? new Date(person.birthDate).getFullYear() : null;
    const death = person.deathDate ? new Date(person.deathDate).getFullYear() : null;
    const years = birth || death ? `${birth ?? '?'} – ${death ?? ''}`.trim() : null;

    const round =
        'flex items-center justify-center rounded-full shadow-sm transition-transform hover:scale-110';

    return (
        <foreignObject
            x={-NODE_WIDTH / 2}
            y={-NODE_HEIGHT / 2}
            width={NODE_WIDTH}
            height={NODE_HEIGHT + 26}
            style={{ overflow: 'visible' }}
        >
            <div
                onContextMenu={(e) => onContextMenu(e, person.id)}
                data-node
                onClick={() => onSelect(person.id)}
                className="group relative flex cursor-pointer select-none items-center gap-2.5 rounded-[var(--radius-md)] border bg-[var(--color-bg-elevated)] px-3"
                style={{
                    height: NODE_HEIGHT,
                    borderColor: selected ? 'var(--color-ink)' : 'var(--color-border)',
                    boxShadow: selected ? '0 0 0 3px var(--node-focus-ring)' : 'var(--shadow-sm)',
                    opacity: dimmed ? 0.28 : 1,
                    transition: 'opacity 200ms ease-out, box-shadow 180ms ease-out, border-color 180ms ease-out',
                }}
            >
                <div
                    className="flex shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
                    style={{ width: 32, height: 32, background: 'var(--color-accent)', color: 'var(--color-bg)' }}
                >
                    {initials}
                </div>
                <div className="min-w-0 leading-tight">
                    <p className="truncate text-[13px] font-medium text-[var(--color-ink)]">
                        {person.firstName} {person.lastName}
                    </p>
                    {years && <p className="text-[11px] text-[var(--color-ink-muted)]">{years}</p>}
                </div>

                <div className="absolute -bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddRelative(person.id);
                        }}
                        className={round}
                        style={{
                            width: 24,
                            height: 24,
                            background: 'var(--color-accent)',
                            color: 'var(--color-bg)',
                            fontSize: 15,
                            lineHeight: 1,
                        }}
                        title="Ajouter un proche"
                    >
                        +
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onFocusRadial(person.id);
                        }}
                        className={round}
                        style={{
                            width: 24,
                            height: 24,
                            background: 'var(--color-bg-elevated)',
                            border: '1px solid var(--color-border)',
                            color: 'var(--color-ink)',
                            fontSize: 12,
                            lineHeight: 1,
                        }}
                        title="Vue orbitale"
                    >
                        ◎
                    </button>
                </div>
            </div>
        </foreignObject>
    );
}