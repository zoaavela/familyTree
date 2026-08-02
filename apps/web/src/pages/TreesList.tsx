import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card, Label } from '@familytree/ui';
import { api, type Tree } from '../lib/api';
import { getToken } from '../lib/AuthContext';

export function TreesList() {
    const [trees, setTrees] = useState<Tree[]>([]);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        loadTrees();
    }, []);

    async function loadTrees() {
        const token = getToken();
        if (!token) return;
        setLoading(true);
        const data = await api.listTrees(token);
        setTrees(data);
        setLoading(false);
    }

    async function handleCreate(e: FormEvent) {
        e.preventDefault();
        const token = getToken();
        if (!token || !title.trim()) return;
        setCreating(true);
        try {
            await api.createTree(token, title, 'PERSONAL');
            setTitle('');
            await loadTrees();
        } finally {
            setCreating(false);
        }
    }

    return (
        <div className="min-h-screen px-4 py-10 max-w-2xl mx-auto">
            <h1 className="text-xl font-semibold mb-6">Mes arbres</h1>

            <Card className="mb-8">
                <form onSubmit={handleCreate} className="flex gap-3 items-end">
                    <div className="flex-1">
                        <Label htmlFor="title">Nouvel arbre</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Ma famille"
                        />
                    </div>
                    <Button type="submit" disabled={creating}>
                        {creating ? 'Création...' : 'Créer'}
                    </Button>
                </form>
            </Card>

            {loading ? (
                <p className="text-sm text-[var(--color-ink-muted)]">Chargement...</p>
            ) : trees.length === 0 ? (
                <p className="text-sm text-[var(--color-ink-muted)]">Aucun arbre pour l'instant.</p>
            ) : (
                <div className="flex flex-col gap-3">
                    {trees.map((tree) => (
                        <Link key={tree.id} to={`/trees/${tree.id}`}>
                            <Card className="hover:bg-[var(--color-bg)] transition-colors cursor-pointer">
                                <p className="font-medium">{tree.title}</p>
                                <p className="text-xs text-[var(--color-ink-muted)]">
                                    {new Date(tree.createdAt).toLocaleDateString('fr-FR')}
                                </p>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}