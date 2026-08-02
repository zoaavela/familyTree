const API_URL = 'http://localhost:3000';

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
};