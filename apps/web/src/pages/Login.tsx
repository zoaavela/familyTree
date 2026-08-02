import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Card, Label } from '@familytree/ui';
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
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-sm">
                <h1 className="text-xl font-semibold mb-6">Connexion</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="toi@exemple.com"
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
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Connexion...' : 'Se connecter'}
                    </Button>
                </form>
                <p className="text-sm text-[var(--color-ink-muted)] mt-4">
                    Pas de compte ? <Link to="/register" className="underline">S'inscrire</Link>
                </p>
            </Card>
        </div>
    );
}