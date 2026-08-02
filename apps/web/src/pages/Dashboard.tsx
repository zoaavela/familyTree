import { Link } from 'react-router-dom';
import { Button, Card } from '@familytree/ui';
import { useAuth } from '../lib/AuthContext';

export function Dashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <Card className="w-full max-w-sm text-center">
                <h1 className="text-xl font-semibold mb-2">Bienvenue {user?.displayName}</h1>
                <p className="text-sm text-[var(--color-ink-muted)] mb-6">{user?.email}</p>
                <Link to="/trees">
                    <Button className="w-full mb-3">Mes arbres</Button>
                </Link>
                <Button variant="secondary" onClick={logout} className="w-full">
                    Se déconnecter
                </Button>
            </Card>
        </div>
    );
}