import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Label } from '@familytree/ui';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../lib/AuthContext';

export function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  }

  return (
    <AuthLayout
      title="Content de vous revoir"
      subtitle="Reprenez votre arbre là où vous l'avez laissé."
      footer={
        <p>
          Pas encore de compte ?{' '}
          <Link to="/register" className="font-medium text-[var(--color-ink)] hover:underline">
            Créer un compte
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vous@exemple.com"
            autoComplete="email"
            required
          />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>

        {error && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-error-bg)] px-3 py-2 text-[13px] text-[var(--color-error)]">
            {error}
          </div>
        )}

        <Button type="submit" disabled={loading} className="mt-1 h-11 w-full">
          {loading ? 'Connexion…' : 'Se connecter'}
        </Button>
      </form>
    </AuthLayout>
  );
}