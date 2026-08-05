import type { GraphNode } from '../../lib/graph/types';
import { NODE_WIDTH, NODE_HEIGHT } from '../../lib/graph/types';
import { useLongPress } from '../../lib/graph/useLongPress';

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
    const birth = person.birthDate ? new Date(person.birthDate).getFullYear() : null;
    const death = person.deathDate ? new Date(person.deathDate).getFullYear() : null;
    const years = birth || death ? `${birth ?? '?'} – ${death ?? ''}`.trim() : null;

    const round =
        'flex items-center justify-center rounded-full shadow-sm transition-transform hover:scale-110';

    const longPress = useLongPress((x, y) => {
        onContextMenu({ preventDefault() {}, stopPropagation() {}, clientX: x, clientY: y } as React.MouseEvent, person.id);
    });

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
                {...longPress}
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
                {person.photoUrl ? (
                    <img
                        src={person.photoUrl}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                    />
                ) : (
                    <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{ background: 'var(--color-bg-sunken)', color: 'var(--color-ink-faint)' }}
                    >
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="10" cy="7.2" r="3.2" />
                            <path d="M3.6 17c.7-3.4 3.4-5.4 6.4-5.4s5.7 2 6.4 5.4" />
                        </svg>
                    </div>
                )}
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