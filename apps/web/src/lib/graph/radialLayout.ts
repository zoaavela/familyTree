import type { Person, Relationship } from '../api';
import type { GraphLayout, GraphNode, GraphEdge, EdgeKind } from './types';

const ORBIT_STEP = 200;

export function computeRadialLayout(
    { persons, relationships }: { persons: Person[]; relationships: Relationship[] },
    focusId: string,
): GraphLayout {
    const adjacency = new Map<string, string[]>();
    const link = (a: string, b: string) => {
        if (!adjacency.has(a)) adjacency.set(a, []);
        adjacency.get(a)!.push(b);
    };
    for (const r of relationships) {
        link(r.personAId, r.personBId);
        link(r.personBId, r.personAId);
    }

    const depth = new Map<string, number>([[focusId, 0]]);
    const queue = [focusId];
    while (queue.length) {
        const id = queue.shift()!;
        const d = depth.get(id)!;
        for (const next of adjacency.get(id) ?? []) {
            if (!depth.has(next)) {
                depth.set(next, d + 1);
                queue.push(next);
            }
        }
    }

    const byOrbit = new Map<number, string[]>();
    for (const [id, d] of depth) {
        if (!byOrbit.has(d)) byOrbit.set(d, []);
        byOrbit.get(d)!.push(id);
    }

    const positions = new Map<string, { x: number; y: number }>([[focusId, { x: 0, y: 0 }]]);
    for (const [orbit, ids] of byOrbit) {
        if (orbit === 0) continue;
        const radius = orbit * ORBIT_STEP;
        const step = (Math.PI * 2) / ids.length;
        const offset = orbit * 0.45 - Math.PI / 2;
        ids.forEach((id, i) => {
            const angle = i * step + offset;
            positions.set(id, { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        });
    }

    const visible = persons.filter((p) => positions.has(p.id));
    const nodes: GraphNode[] = visible.map((p) => {
        const pos = positions.get(p.id)!;
        return { id: p.id, person: p, x: pos.x, y: pos.y, generation: depth.get(p.id)! };
    });

    const edges: GraphEdge[] = [];
    for (const r of relationships) {
        const a = positions.get(r.personAId);
        const b = positions.get(r.personBId);
        if (!a || !b) continue;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const curve = 0.16;
        edges.push({
            id: r.id,
            kind: r.type as EdgeKind,
            memberIds: [r.personAId, r.personBId],
            path: `M ${a.x} ${a.y} Q ${mx - dy * curve} ${my + dx * curve} ${b.x} ${b.y}`,
        });
    }

    const maxOrbit = Math.max(1, ...byOrbit.keys());
    const extent = maxOrbit * ORBIT_STEP + 140;
    return { nodes, edges, bounds: { minX: -extent, maxX: extent, minY: -extent, maxY: extent } };
}