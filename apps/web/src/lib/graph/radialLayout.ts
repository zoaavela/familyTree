import type { Person, Relationship } from '../api';
import type { GraphLayout, GraphNode, GraphEdge, EdgeKind } from './types';

const ORBIT_STEP = 190;

export interface RadialExtras {
  rings: number[];
}

export function computeRadialLayout(
  { persons, relationships }: { persons: Person[]; relationships: Relationship[] },
  focusId: string,
): GraphLayout & { rings: number[] } {
  const personById = new Map(persons.map((p) => [p.id, p]));
  const adjacency = new Map<string, { id: string; via: string }[]>();
  const link = (a: string, b: string, via: string) => {
    if (!adjacency.has(a)) adjacency.set(a, []);
    adjacency.get(a)!.push({ id: b, via });
  };
  for (const r of relationships) {
    link(r.personAId, r.personBId, r.personAId);
    link(r.personBId, r.personAId, r.personAId);
  }

  // BFS : distance = orbite, "via" = quel voisin de l'orbite précédente a introduit ce nœud
  const depth = new Map<string, number>([[focusId, 0]]);
  const parentOf = new Map<string, string>();
  const queue = [focusId];
  while (queue.length) {
    const id = queue.shift()!;
    const d = depth.get(id)!;
    for (const next of adjacency.get(id) ?? []) {
      if (!depth.has(next.id)) {
        depth.set(next.id, d + 1);
        parentOf.set(next.id, id);
        queue.push(next.id);
      }
    }
  }

  const byOrbit = new Map<number, string[]>();
  for (const [id, d] of depth) {
    if (!byOrbit.has(d)) byOrbit.set(d, []);
    byOrbit.get(d)!.push(id);
  }

  // Trie chaque orbite : regroupe par parent d'origine (branche), puis par date de naissance
  for (const [orbit, ids] of byOrbit) {
    if (orbit === 0) continue;
    ids.sort((a, b) => {
      const pa = parentOf.get(a) ?? '';
      const pb = parentOf.get(b) ?? '';
      if (pa !== pb) return pa.localeCompare(pb);
      const da = personById.get(a)?.birthDate ?? '';
      const db = personById.get(b)?.birthDate ?? '';
      return da.localeCompare(db);
    });
  }

  const positions = new Map<string, { x: number; y: number }>([[focusId, { x: 0, y: 0 }]]);
  for (const [orbit, ids] of byOrbit) {
    if (orbit === 0) continue;
    const radius = orbit * ORBIT_STEP;
    const step = (Math.PI * 2) / ids.length;
    const offset = -Math.PI / 2; // démarre en haut, sens horaire, stable visuellement
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
    const curve = 0.14;
    const isUnion = r.type === 'SPOUSE_OF';
    edges.push({
      id: r.id,
      kind: r.type as EdgeKind,
      memberIds: [r.personAId, r.personBId],
      path: `M ${a.x} ${a.y} Q ${mx - dy * curve} ${my + dx * curve} ${b.x} ${b.y}`,
      midX: isUnion ? mx : undefined,
      midY: isUnion ? my : undefined,
      label: isUnion && r.startDate ? String(new Date(r.startDate).getFullYear()) : undefined,
      ended: isUnion && !!r.endDate,
    });
  }

  const orbitCount = Math.max(1, ...byOrbit.keys());
  const rings = Array.from({ length: orbitCount }, (_, i) => (i + 1) * ORBIT_STEP);
  const extent = orbitCount * ORBIT_STEP + 130;

  return {
    nodes,
    edges,
    rings,
    bounds: { minX: -extent, maxX: extent, minY: -extent, maxY: extent },
  };
}