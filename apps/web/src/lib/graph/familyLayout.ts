import type { Person, Relationship } from '../api';
import type { GraphLayout, GraphNode, GraphEdge } from './types';
import { NODE_WIDTH, NODE_HEIGHT, SPOUSE_GAP, UNIT_GAP, GEN_GAP } from './types';

interface Unit {
    id: string;
    members: string[];
    childIds: string[];
    gen: number;
    x: number;
    width: number;
}

function elbow(sx: number, sy: number, tx: number, ty: number, busY: number) {
    if (Math.abs(tx - sx) < 1.5) return `M ${sx} ${sy} L ${tx} ${ty}`;
    const dir = tx > sx ? 1 : -1;
    const r = Math.min(14, Math.abs(tx - sx) / 2, Math.abs(busY - sy), Math.abs(ty - busY));
    return [
        `M ${sx} ${sy}`,
        `L ${sx} ${busY - r}`,
        `Q ${sx} ${busY} ${sx + dir * r} ${busY}`,
        `L ${tx - dir * r} ${busY}`,
        `Q ${tx} ${busY} ${tx} ${busY + r}`,
        `L ${tx} ${ty}`,
    ].join(' ');
}

export function computeFamilyLayout({
    persons: rawPersons,
    relationships: rawRels,
    showSiblings,
}: {
    persons: Person[];
    relationships: Relationship[];
    showSiblings: boolean;
}): GraphLayout {
    // Rendre l'ordre totalement déterministe (chronologique puis alphabétique)
    const persons = [...rawPersons].sort((a, b) => {
        const da = a.birthDate || '';
        const db = b.birthDate || '';
        if (da !== db) return da.localeCompare(db);
        return a.id.localeCompare(b.id);
    });
    const relationships = [...rawRels].sort((a, b) => {
        if (a.personAId !== b.personAId) return a.personAId.localeCompare(b.personAId);
        return a.personBId.localeCompare(b.personBId);
    });

    const parentLinks = relationships.filter((r) => r.type === 'PARENT_OF');
    const spouseLinks = relationships.filter((r) => r.type === 'SPOUSE_OF');

    // ---------- Unités (couple = 1 bloc)
    const unitOf = new Map<string, Unit>();
    const units: Unit[] = [];
    const makeUnit = (members: string[]) => {
        const u: Unit = { id: `u${units.length}`, members, childIds: [], gen: 0, x: 0, width: 0 };
        members.forEach((m) => unitOf.set(m, u));
        units.push(u);
        return u;
    };

    for (const l of spouseLinks) {
        const a = unitOf.get(l.personAId);
        const b = unitOf.get(l.personBId);
        if (!a && !b) makeUnit([l.personAId, l.personBId]);
        else if (a && !b && a.members.length < 2) {
            a.members.push(l.personBId);
            unitOf.set(l.personBId, a);
        } else if (b && !a && b.members.length < 2) {
            b.members.unshift(l.personAId);
            unitOf.set(l.personAId, b);
        }
    }
    for (const p of persons) if (!unitOf.has(p.id)) makeUnit([p.id]);
    units.forEach((u) => {
        u.width = u.members.length * NODE_WIDTH + (u.members.length - 1) * SPOUSE_GAP;
    });

    // ---------- Filiation au niveau des unités
    const parentUnitsOf = new Map<string, Unit[]>();
    for (const l of parentLinks) {
        const pu = unitOf.get(l.personAId);
        if (!pu || !unitOf.has(l.personBId)) continue;
        if (!pu.childIds.includes(l.personBId)) pu.childIds.push(l.personBId);
        if (!parentUnitsOf.has(l.personBId)) parentUnitsOf.set(l.personBId, []);
        const list = parentUnitsOf.get(l.personBId)!;
        if (!list.includes(pu)) list.push(pu);
    }

    const childUnits = (u: Unit) => {
        const seen = new Set<string>();
        const out: Unit[] = [];
        for (const id of u.childIds) {
            const cu = unitOf.get(id);
            if (cu && cu !== u && !seen.has(cu.id)) {
                seen.add(cu.id);
                out.push(cu);
            }
        }
        return out;
    };
    const parentUnits = (u: Unit) => {
        const seen = new Set<string>();
        const out: Unit[] = [];
        for (const m of u.members) {
            for (const pu of parentUnitsOf.get(m) ?? []) {
                if (pu !== u && !seen.has(pu.id)) {
                    seen.add(pu.id);
                    out.push(pu);
                }
            }
        }
        return out;
    };

    // ---------- Générations
    const roots = units.filter((u) => parentUnits(u).length === 0);
    const seed = roots.length ? roots : units.slice(0, 1);
    const seen = new Set(seed.map((u) => u.id));
    const queue = [...seed];
    while (queue.length) {
        const u = queue.shift()!;
        for (const c of childUnits(u)) {
            if (c.gen < u.gen + 1) c.gen = u.gen + 1;
            if (!seen.has(c.id)) {
                seen.add(c.id);
                queue.push(c);
            }
        }
    }

    // ---------- Ordre initial (DFS : enfants regroupés sous leurs parents)
    const order: Unit[] = [];
    const visited = new Set<string>();
    const walk = (u: Unit) => {
        if (visited.has(u.id)) return;
        visited.add(u.id);
        order.push(u);
        childUnits(u)
            .sort((a, b) => a.gen - b.gen)
            .forEach(walk);
    };
    seed.forEach(walk);
    units.forEach(walk);

    const byGen = new Map<number, Unit[]>();
    for (const u of order) {
        if (!byGen.has(u.gen)) byGen.set(u.gen, []);
        byGen.get(u.gen)!.push(u);
    }
    const gens = [...byGen.keys()].sort((a, b) => a - b);

    // ---------- Placement séquentiel initial
    for (const g of gens) {
        let cursor = 0;
        for (const u of byGen.get(g)!) {
            u.x = cursor + u.width / 2;
            cursor += u.width + UNIT_GAP;
        }
    }

    // ---------- Optimisation des couples (éviter les croisements de lignes parentales)
    for (const u of units) {
        if (u.members.length > 1) {
            u.members.sort((aId, bId) => {
                const aParents = parentUnitsOf.get(aId) || [];
                const bParents = parentUnitsOf.get(bId) || [];
                const avgA = aParents.length ? aParents.reduce((sum, p) => sum + p.x, 0) / aParents.length : u.x;
                const avgB = bParents.length ? bParents.reduce((sum, p) => sum + p.x, 0) / bParents.length : u.x;
                if (Math.abs(avgA - avgB) > 0.1) return avgA - avgB;
                return aId.localeCompare(bId);
            });
        }
    }

    // ---------- Résolution de collisions dans une génération (ordre conservé)
    const relax = (list: Unit[]) => {
        for (let i = 1; i < list.length; i++) {
            const prev = list[i - 1];
            const cur = list[i];
            const min = prev.x + prev.width / 2 + UNIT_GAP + cur.width / 2;
            if (cur.x < min) cur.x = min;
        }
        for (let i = list.length - 2; i >= 0; i--) {
            const next = list[i + 1];
            const cur = list[i];
            const max = next.x - next.width / 2 - UNIT_GAP - cur.width / 2;
            if (cur.x > max) cur.x = max;
        }
    };

    // ---------- Convergence : parents centrés sur enfants, enfants centrés sous parents
    const avg = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;

    for (let pass = 0; pass < 6; pass++) {
        for (const g of [...gens].reverse()) {
            for (const u of byGen.get(g)!) {
                const kids = childUnits(u);
                if (kids.length) u.x = avg(kids.map((k) => k.x));
            }
            relax(byGen.get(g)!);
        }
        for (const g of gens) {
            for (const u of byGen.get(g)!) {
                const ps = parentUnits(u);
                if (ps.length) u.x = avg(ps.map((p) => p.x));
            }
            relax(byGen.get(g)!);
        }
    }

    // ---------- Ancrage global (pour éviter que l'arbre ne glisse à l'écran quand on ajoute qqn)
    const anchorPerson = persons[0]; // La plus ancienne (triée plus haut)
    if (anchorPerson) {
        const au = unitOf.get(anchorPerson.id);
        if (au) {
            const dx = -au.x;
            for (const u of units) {
                u.x += dx;
            }
        }
    }

    // ---------- Positions
    const pos = new Map<string, { x: number; y: number }>();
    for (const u of units) {
        const y = u.gen * (NODE_HEIGHT + GEN_GAP);
        u.members.forEach((id, i) => {
            pos.set(id, { x: u.x - u.width / 2 + NODE_WIDTH / 2 + i * (NODE_WIDTH + SPOUSE_GAP), y });
        });
    }

    const nodes: GraphNode[] = persons
        .filter((p) => pos.has(p.id))
        .map((p) => {
            const { x, y } = pos.get(p.id)!;
            return { id: p.id, person: p, x, y, generation: unitOf.get(p.id)!.gen };
        });

    // ---------- Arêtes
    const edges: GraphEdge[] = [];

    for (const u of units) {
        // Union(s)
        for (let i = 0; i < u.members.length - 1; i++) {
            const a = pos.get(u.members[i])!;
            const b = pos.get(u.members[i + 1])!;
            edges.push({
                id: `sp-${u.id}-${i}`,
                kind: 'SPOUSE_OF',
                memberIds: [u.members[i], u.members[i + 1]],
                path: `M ${a.x + NODE_WIDTH / 2} ${a.y} L ${b.x - NODE_WIDTH / 2} ${b.y}`,
            });
        }

        if (!u.childIds.length) continue;
        const bottom = u.gen * (NODE_HEIGHT + GEN_GAP) + NODE_HEIGHT / 2;
        const busY = bottom + GEN_GAP * 0.5;

        for (const childId of u.childIds) {
            const c = pos.get(childId);
            if (!c) continue;
            edges.push({
                id: `pa-${u.id}-${childId}`,
                kind: 'PARENT_OF',
                memberIds: [...u.members, childId],
                path: elbow(u.x, bottom, c.x, c.y - NODE_HEIGHT / 2, busY),
            });
        }
    }

    if (showSiblings) {
        for (const u of units) {
            const sibs = u.childIds
                .map((id) => ({ id, p: pos.get(id) }))
                .filter((s): s is { id: string; p: { x: number; y: number } } => !!s.p)
                .sort((a, b) => a.p.x - b.p.x);
            for (let i = 0; i < sibs.length - 1; i++) {
                const a = sibs[i];
                const b = sibs[i + 1];
                const y = a.p.y;
                edges.push({
                    id: `sib-${a.id}-${b.id}`,
                    kind: 'SIBLING_OF',
                    memberIds: [a.id, b.id],
                    path: `M ${a.p.x + NODE_WIDTH / 2} ${y} L ${b.p.x - NODE_WIDTH / 2} ${y}`,
                });
            }
        }
    }

    const xs = nodes.map((n) => n.x);
    const ys = nodes.map((n) => n.y);
    return {
        nodes,
        edges,
        bounds: {
            minX: (xs.length ? Math.min(...xs) : 0) - NODE_WIDTH,
            maxX: (xs.length ? Math.max(...xs) : 0) + NODE_WIDTH,
            minY: (ys.length ? Math.min(...ys) : 0) - NODE_HEIGHT,
            maxY: (ys.length ? Math.max(...ys) : 0) + NODE_HEIGHT * 1.5,
        },
    };
}