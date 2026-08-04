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
    birthPlace: string | null;
    deathPlace: string | null;
    biography: string | null;
    photoUrl: string | null;
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

type TokenGetter = () => string | null;
type TokenSetter = (token: string | null) => void;

let getStoredToken: TokenGetter = () => null;
let setStoredToken: TokenSetter = () => {};

export function configureAuth(getter: TokenGetter, setter: TokenSetter) {
  getStoredToken = getter;
  setStoredToken = setter;
}

let refreshing: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshing) {
    refreshing = fetch(`${API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      .then(async (res) => {
        if (!res.ok) return null;
        const data: { accessToken: string } = await res.json();
        return data.accessToken;
      })
      .catch(() => null)
      .finally(() => {
        setTimeout(() => (refreshing = null), 0);
      });
  }
  const token = await refreshing;
  setStoredToken(token);
  return token;
}

async function rawRequest(path: string, options: RequestInit, token?: string | null) {
  return fetch(`${API_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

async function request<T>(path: string, options: RequestInit = {}, token?: string): Promise<T> {
  const authToken = token ?? getStoredToken();
  let res = await rawRequest(path, options, authToken);

  // Access token expiré : on le renouvelle une fois puis on rejoue la requête
  if (res.status === 401 && !path.startsWith('/auth/refresh') && !path.startsWith('/auth/login')) {
    const fresh = await refreshAccessToken();
    if (fresh) res = await rawRequest(path, options, fresh);
  }

  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      message: 'Erreur réseau',
      error: 'Unknown',
      statusCode: res.status,
    }));
    throw new Error(Array.isArray(err.message) ? err.message.join(', ') : err.message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
    refresh: () => request<{ accessToken: string }>('/auth/refresh', { method: 'POST' }),
    logout: () => request<{ success: boolean }>('/auth/logout', { method: 'POST' }),
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

    deleteRelationship: (token: string, treeId: string, relId: string) =>
        request<{ success: boolean }>(`/trees/${treeId}/relationships/${relId}`, { method: 'DELETE' }, token),

    updatePerson: (
        token: string,
        treeId: string,
        personId: string,
        data: Partial<{
            firstName: string;
            lastName: string;
            birthDate: string;
            deathDate: string;
            birthPlace: string;
            deathPlace: string;
            biography: string;
        }>,
    ) => request<Person>(`/trees/${treeId}/persons/${personId}`, { method: 'PATCH', body: JSON.stringify(data) }, token),

    deletePerson: (token: string, treeId: string, personId: string) =>
        request<{ success: boolean }>(`/trees/${treeId}/persons/${personId}`, { method: 'DELETE' }, token),
        
    uploadPhoto: async (token: string, treeId: string, personId: string, file: File): Promise<Person> => {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch(`${API_URL}/trees/${treeId}/persons/${personId}/photo`, {
            method: 'POST',
            credentials: 'include',
            headers: { Authorization: `Bearer ${token}` },
            body: form,
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({ message: "Échec de l'upload" }));
            throw new Error(Array.isArray(err.message) ? err.message.join(', ') : err.message);
        }
        return res.json();
    },

    deletePhoto: (token: string, treeId: string, personId: string) =>
        request<Person>(`/trees/${treeId}/persons/${personId}/photo`, { method: 'DELETE' }, token),
};

