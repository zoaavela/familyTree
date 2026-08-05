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
            {person.photoUrl ? (
                <>
                    <defs>
                        <clipPath id={`clip-${person.id}`}>
                            <circle r={r} cx={0} cy={0} />
                        </clipPath>
                    </defs>
                    <circle
                        r={r}
                        fill={isFocus ? 'var(--color-accent)' : 'var(--color-bg-elevated)'}
                        stroke={isFocus ? 'var(--color-accent)' : 'var(--color-border)'}
                        strokeWidth={1.5}
                    />
                    <image
                        href={person.photoUrl}
                        x={-r}
                        y={-r}
                        width={r * 2}
                        height={r * 2}
                        clipPath={`url(#clip-${person.id})`}
                        preserveAspectRatio="xMidYMid slice"
                    />
                </>
            ) : (
                <>
                    <circle
                        r={r}
                        fill={isFocus ? 'var(--color-accent)' : 'var(--color-bg-sunken)'}
                        stroke={isFocus ? 'var(--color-accent)' : 'var(--color-border)'}
                        strokeWidth={1.5}
                    />
                    <g
                        transform={`translate(${-r * 0.42}, ${-r * 0.42}) scale(${r / 24})`}
                        stroke={isFocus ? 'var(--color-on-accent)' : 'var(--color-ink-faint)'}
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                        style={{ pointerEvents: 'none' }}
                    >
                        <circle cx="10" cy="7.2" r="3.2" />
                        <path d="M3.6 17c.7-3.4 3.4-5.4 6.4-5.4s5.7 2 6.4 5.4" />
                    </g>
                </>
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