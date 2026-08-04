import { useState } from 'react';
import type { GraphNode } from '../../lib/graph/types';
import { useLongPress } from '../../lib/graph/useLongPress';

interface Props {
    node: GraphNode;
    isFocus: boolean;
    selected: boolean;
    dimmed: boolean;
    onSelect: (id: string) => void;
    onFocusRadial: (id: string) => void;
    onContextMenu: (e: React.MouseEvent, id: string) => void;
}

export function PersonOrbitNode({ node, isFocus, selected, dimmed, onSelect, onFocusRadial, onContextMenu }: Props) {
    const [hover, setHover] = useState(false);
    const { person } = node;
    const initials = `${person.firstName[0] ?? ''}${person.lastName?.[0] ?? ''}`.toUpperCase();
    const r = isFocus ? 34 : Math.max(14, 23 - node.generation * 3);

    const longPress = useLongPress((x, y) => {
        onContextMenu({ preventDefault() {}, stopPropagation() {}, clientX: x, clientY: y } as React.MouseEvent, person.id);
    });

    return (
        <g
            data-node
            {...longPress}
            onContextMenu={(e) => onContextMenu(e, person.id)}
            onClick={() => onSelect(person.id)}
            onDoubleClick={(e) => {
                e.stopPropagation();
                onFocusRadial(person.id);
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            style={{ cursor: 'pointer', opacity: dimmed ? 0.25 : 1, transition: 'opacity 220ms ease-out' }}
        >
            {(isFocus || selected || hover) && (
                <circle r={r + 8} fill="none" stroke="var(--color-accent)" strokeWidth={1} opacity={0.35} />
            )}
            <defs>
                {person.photoUrl && (
                    <clipPath id={`clip-${person.id}`}>
                        <circle r={r} cx={0} cy={0} />
                    </clipPath>
                )}
            </defs>
            <circle
                r={r}
                fill={isFocus ? 'var(--color-accent)' : 'var(--color-bg-elevated)'}
                stroke={isFocus ? 'var(--color-accent)' : 'var(--color-border)'}
                strokeWidth={1.5}
            />
            {person.photoUrl ? (
                <image
                    href={person.photoUrl}
                    x={-r}
                    y={-r}
                    width={r * 2}
                    height={r * 2}
                    clipPath={`url(#clip-${person.id})`}
                    preserveAspectRatio="xMidYMid slice"
                />
            ) : (
                <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isFocus ? 13 : 10}
                    fontWeight={600}
                    fill={isFocus ? 'var(--color-bg)' : 'var(--color-ink)'}
                    style={{ pointerEvents: 'none' }}
                >
                    {initials}
                </text>
            )}
            {(hover || isFocus) && (
                <text
                    y={r + 15}
                    textAnchor="middle"
                    fontSize={11}
                    fill="var(--color-ink)"
                    style={{ pointerEvents: 'none' }}
                >
                    {person.firstName} {person.lastName}
                </text>
            )}
        </g>
    );
}