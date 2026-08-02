import type { Relationship } from '../api';

export interface Relatives {
    parents: string[];
    children: string[];
    spouses: string[];
    siblings: string[];
}

export function getRelatives(personId: string, relationships: Relationship[]): Relatives {
    const parents: string[] = [];
    const children: string[] = [];
    const spouses: string[] = [];

    for (const r of relationships) {
        if (r.type === 'PARENT_OF') {
            if (r.personBId === personId) parents.push(r.personAId);
            if (r.personAId === personId) children.push(r.personBId);
        } else if (r.type === 'SPOUSE_OF') {
            if (r.personAId === personId) spouses.push(r.personBId);
            if (r.personBId === personId) spouses.push(r.personAId);
        }
    }

    const siblings = new Set<string>();
    for (const parentId of parents) {
        for (const r of relationships) {
            if (r.type === 'PARENT_OF' && r.personAId === parentId && r.personBId !== personId) {
                siblings.add(r.personBId);
            }
        }
    }

    return { parents, children, spouses, siblings: [...siblings] };
}