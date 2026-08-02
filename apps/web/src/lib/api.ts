const API_URL = 'http://localhost:3000';

export interface Tree {
    id: string;
    title: string;
    type: 'PERSONAL' | 'REFERENCE';
    visibility: string;
    createdAt: string;
}

export interface Person {
    id: string;
    treeId: string;
    firstName: string;
    lastName: string | null;
    birthDate: string | null;
    deathDate: string | null;
}

export interface Relationship {
    id: string;
    personAId: string;
    personBId: string;
    type: 'PARENT_OF' | 'SPOUSE_OF';
}

interface ApiError {
    message: string | string[];
    error: string;
    statusCode: number;
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    if (!res.ok) {
        const err: ApiError = await res.json().catch(() => ({
            message: 'Erreur réseau',
            error: 'Unknown',
            statusCode: res.status,
        }));
        const message = Array.isArray(err.message) ? err.message.join(', ') : err.message;
        throw new Error(message);
    }

    return res.json();
}

export const api = {
    register: (email: string, password: string, displayName: string) =>
        request<{ accessToken: string }>('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, displayName }),
        }),
    login: (email: string, password: string) =>
        request<{ accessToken: string }>('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        }),
    me: (token: string) => request<{ id: string; email: string; displayName: string }>('/auth/me', {}, token),
    createTree: (token: string, title: string, type: 'PERSONAL' | 'REFERENCE') =>
        request<Tree>('/trees', { method: 'POST', body: JSON.stringify({ title, type }) }, token),
    listTrees: (token: string) => request<Tree[]>('/trees', {}, token),
    getTree: (token: string, treeId: string) => request<Tree>(`/trees/${treeId}`, {}, token),

    createPerson: (token: string, treeId: string, data: { firstName: string; lastName?: string }) =>
        request<Person>(`/trees/${treeId}/persons`, { method: 'POST', body: JSON.stringify(data) }, token),
    listPersons: (token: string, treeId: string) =>
        request<Person[]>(`/trees/${treeId}/persons`, {}, token),

    createRelationship: (
        token: string,
        treeId: string,
        data: { personAId: string; personBId: string; type: 'PARENT_OF' | 'SPOUSE_OF' },
    ) => request<Relationship>(`/trees/${treeId}/relationships`, { method: 'POST', body: JSON.stringify(data) }, token),
    listRelationships: (token: string, treeId: string) =>
        request<Relationship[]>(`/trees/${treeId}/relationships`, {}, token),
};