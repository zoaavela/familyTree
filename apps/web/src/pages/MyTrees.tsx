import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card, Label } from '@familytree/ui';
import { api, type Tree } from '../lib/api';
import { getToken } from '../lib/AuthContext';

export function MyTrees() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    setTrees(await api.listTrees(token));
    setLoading(false);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !newTitle.trim()) return;
    setCreating(true);
    try {
      await api.createTree(token, newTitle, 'PERSONAL');
      setNewTitle('');
      await load();
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-xl font-semibold">Mes arbres</h1>

      <Card className="mb-6">
        <form onSubmit={handleCreate} className="flex items-end gap-3">
          <div className="flex-1">
            <Label htmlFor="new-tree">Nouvel arbre</Label>
            <Input
              id="new-tree"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ex : Ma famille"
            />
          </div>
          <Button type="submit" disabled={creating}>
            {creating ? 'Création…' : 'Créer'}
          </Button>
        </form>
      </Card>

      {loading ? (
        <p className="text-sm text-[var(--color-ink-muted)]">Chargement…</p>
      ) : trees.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-muted)]">Aucun arbre pour l'instant.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {trees.map((tree) => (
            <Link key={tree.id} to={`/app/trees/${tree.id}/graph`}>
              <Card className="cursor-pointer transition-colors hover:bg-[var(--color-bg)]">
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
