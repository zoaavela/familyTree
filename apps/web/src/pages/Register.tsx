import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Turnstile } from '@marsidev/react-turnstile';
import { Button, Input, Label } from '@familytree/ui';
import { AuthLayout } from '../components/AuthLayout';
import { useAuth } from '../lib/AuthContext';

export function Register() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!turnstileToken) {
      setError('Veuillez patienter pendant la vérification de sécurité');
      return;
    }
    setError(null);
    try {
      await register(email, password, displayName, turnstileToken);
      navigate('/app');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  }

  return (
    <AuthLayout
      title="Créez votre compte"
      subtitle="Quelques secondes, et votre premier arbre peut commencer."
      footer={
        <p>
          Déjà inscrit ?{' '}
          <Link to="/login" className="font-medium text-[var(--color-ink)] hover:underline">
            Se connecter
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Nom</Label>
          <Input
            id="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enzo Abdi"
            autoComplete="name"
            required
          />
        </div>
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
            placeholder="8 caractères minimum"
            autoComplete="new-password"
            minLength={8}
            required
          />
        </div>

        {error && (
          <div className="rounded-[var(--radius-sm)] bg-[var(--color-error-bg)] px-3 py-2 text-[13px] text-[var(--color-error)]">
            {error}
          </div>
        )}

        <div className="mt-1 flex justify-center">
          <Turnstile 
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY} 
            onSuccess={setTurnstileToken} 
          />
        </div>

        <Button type="submit" disabled={loading || !turnstileToken} className="mt-1 h-11 w-full">
          {loading ? 'Création…' : 'Créer mon compte'}
        </Button>

        <p className="text-center text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">
          En continuant, vous acceptez nos conditions d'utilisation et notre politique de
          confidentialité.
        </p>
      </form>
    </AuthLayout>
  );
}