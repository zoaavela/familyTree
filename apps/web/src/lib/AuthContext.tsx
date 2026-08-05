import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { api, configureAuth, type User } from './api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  booting: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, turnstileToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: (updated: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Access token en mémoire uniquement ; la persistance passe par le cookie httpOnly.
let currentToken: string | null = null;
export function getToken() {
  return currentToken;
}

configureAuth(
  () => currentToken,
  (token) => {
    currentToken = token;
  },
);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);

  // Au chargement : tente de restaurer la session via le cookie de refresh
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { accessToken } = await api.refresh();
        currentToken = accessToken;
        const me = await api.me(accessToken);
        if (!cancelled) setUser(me);
      } catch {
        currentToken = null;
      } finally {
        if (!cancelled) setBooting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadUser(token: string) {
    currentToken = token;
    setUser(await api.me(token));
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

  async function register(email: string, password: string, displayName: string, turnstileToken: string) {
    setLoading(true);
    try {
      const { accessToken } = await api.register(email, password, displayName, turnstileToken);
      await loadUser(accessToken);
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await api.logout();
    } catch {
      /* on déconnecte localement quoi qu'il arrive */
    }
    currentToken = null;
    setUser(null);
  }

  function refreshUser(updated: User) {
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, loading, booting, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
}