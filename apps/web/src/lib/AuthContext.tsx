import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api } from './api';

interface User {
    id: string;
    email: string;
    displayName: string;
}

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Token en mémoire uniquement (pas de localStorage, protection XSS)
let currentToken: string | null = null;
export function getToken() {
    return currentToken;
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);

    async function loadUser(token: string) {
        currentToken = token;
        const me = await api.me(token);
        setUser(me);
    }

    async function login(email: string, password: string) {
        setLoading(true);
        try {
            const { accessToken } = await api.login(email, password);
            await loadUser(accessToken);
        } finally {
            setLoading(false);
        }
    }

    async function register(email: string, password: string, displayName: string) {
        setLoading(true);
        try {
            const { accessToken } = await api.register(email, password, displayName);
            await loadUser(accessToken);
        } finally {
            setLoading(false);
        }
    }

    function logout() {
        currentToken = null;
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
    return ctx;
}