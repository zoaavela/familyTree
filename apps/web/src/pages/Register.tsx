import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button, Input, Card, Label } from '@familytree/ui';
import { useAuth } from '../lib/AuthContext';

export function Register() {
    const { register, loading } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        try {
            await register(email, password, displayName);
            navigate('/app');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-sm">
                <h1 className="text-xl font-semibold mb-6">Créer un compte</h1>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="displayName">Nom</Label>
                        <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Ton nom"
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
                            placeholder="8 caractères minimum"
                            required
                            minLength={8}
                        />
                    </div>
                    {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
                    <Button type="submit" disabled={loading}>
                        {loading ? 'Création...' : 'Créer mon compte'}
                    </Button>
                </form>
                <p className="text-sm text-[var(--color-ink-muted)] mt-4">
                    Déjà un compte ? <Link to="/login" className="underline">Se connecter</Link>
                </p>
            </Card>
        </div>
    );
}