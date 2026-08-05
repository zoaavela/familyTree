import type { GraphEdge } from '../../lib/graph/types';

const STROKE = {
  PARENT_OF: 'var(--edge-parent)',
  SPOUSE_OF: 'var(--edge-union)',
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
        const union = edge.kind === 'SPOUSE_OF';
        const dimmed = !!highlightId && !active;

        return (
          <g key={edge.id} style={{ transition: 'opacity 200ms ease-out' }} opacity={dimmed ? 0.16 : 1}>
            <path
              d={edge.path}
              fill="none"
              stroke={STROKE[edge.kind]}
              strokeWidth={active ? 2.4 : union ? 2 : 1.4}
              strokeDasharray={edge.ended ? '4 4' : DASH[edge.kind]}
              strokeLinecap="round"
              opacity={edge.kind === 'SIBLING_OF' ? 0.6 : 0.9}
              style={{ transition: 'stroke-width 200ms ease-out' }}
            />

            {union && edge.midX !== undefined && edge.midY !== undefined && (
              <g transform={`translate(${edge.midX}, ${edge.midY})`}>
                <rect
                  x={edge.label ? -20 : -11}
                  y={-10}
                  width={edge.label ? 40 : 22}
                  height={20}
                  rx={10}
                  fill="var(--color-bg)"
                  stroke="var(--edge-union)"
                  strokeWidth={1.2}
                />
                {edge.label ? (
                  <text
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={10}
                    fontWeight={500}
                    fill="var(--edge-union)"
                    style={{ pointerEvents: 'none' }}
                  >
                    {edge.label}
                  </text>
                ) : (
                  <g
                    fill="none"
                    stroke="var(--edge-union)"
                    strokeWidth={1.3}
                    style={{ pointerEvents: 'none' }}
                  >
                    <circle cx={-3} cy={0} r={3.4} />
                    <circle cx={3} cy={0} r={3.4} />
                  </g>
                )}
              </g>
            )}
          </g>
        );
      })}
    </g>
  );
}