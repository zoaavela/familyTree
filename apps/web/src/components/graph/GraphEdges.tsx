import type { GraphEdge } from '../../lib/graph/types';

const STROKE = {
    PARENT_OF: 'var(--edge-parent)',
    SPOUSE_OF: 'var(--edge-spouse)',
    SIBLING_OF: 'var(--edge-sibling)',
} as const;

const DASH = {
    PARENT_OF: undefined,
    SPOUSE_OF: undefined,
    SIBLING_OF: '2 4',
} as const;

export function GraphEdges({ edges, highlightId }: { edges: GraphEdge[]; highlightId: string | null }) {
    return (
        <g>
            {edges.map((edge) => {
                const active = !!highlightId && edge.memberIds.includes(highlightId);
                return (
                    <path
                        key={edge.id}
                        d={edge.path}
                        fill="none"
                        stroke={STROKE[edge.kind]}
                        strokeWidth={active ? 2.2 : edge.kind === 'SPOUSE_OF' ? 2 : 1.4}
                        strokeDasharray={DASH[edge.kind]}
                        strokeLinecap="round"
                        opacity={highlightId && !active ? 0.15 : edge.kind === 'SIBLING_OF' ? 0.55 : 0.8}
                        style={{ transition: 'opacity 200ms ease-out, stroke-width 200ms ease-out' }}
                    />
                );
            })}
        </g>
    );
}