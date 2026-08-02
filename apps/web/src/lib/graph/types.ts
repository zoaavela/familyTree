import type { Person } from '../api';

export interface GraphNode {
    id: string;
    person: Person;
    x: number;
    y: number;
    generation: number;
}

export type EdgeKind = 'PARENT_OF' | 'SPOUSE_OF' | 'SIBLING_OF';

export interface GraphEdge {
    id: string;
    kind: EdgeKind;
    memberIds: string[];
    path: string;
}

export interface GraphLayout {
    nodes: GraphNode[];
    edges: GraphEdge[];
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export const NODE_WIDTH = 190;
export const NODE_HEIGHT = 64;
export const SPOUSE_GAP = 20;
export const UNIT_GAP = 64;
export const GEN_GAP = 118;