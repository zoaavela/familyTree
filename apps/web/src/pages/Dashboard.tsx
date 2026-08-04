import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Card, Label } from '@familytree/ui';
import { PhotoUpload } from '../components/graph/PhotoUpload';
import { api, type Tree } from '../lib/api';
import { useAuth, getToken } from '../lib/AuthContext';

export function Dashboard() {
  const { user, logout, refreshUser } = useAuth();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loadingTrees, setLoadingTrees] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [savingName, setSavingName] = useState(false);

  useEffect(() => {
    loadTrees();
  }, []);

  useEffect(() => {
    if (user) setDisplayName(user.displayName);
  }, [user]);

  async function loadTrees() {
    const token = getToken();
    if (!token) return;
    setLoadingTrees(true);
    setTrees(await api.listTrees(token));
    setLoadingTrees(false);
  }

  async function handleCreateTree(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !newTitle.trim()) return;
    setCreating(true);
    try {
      await api.createTree(token, newTitle, 'PERSONAL');
      setNewTitle('');
      await loadTrees();
    } finally {
      setCreating(false);
    }
  }

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !displayName.trim()) return;
    setSavingName(true);
    try {
      const updated = await api.updateProfile(token, { displayName });
      refreshUser(updated);
      setEditingName(false);
    } finally {
      setSavingName(false);
    }
  }

  async function handleUploadAvatar(file: File) {
    const token = getToken();
    if (!token) return;
    refreshUser(await api.uploadAvatar(token, file));
  }

  async function handleRemoveAvatar() {
    const token = getToken();
    if (!token) return;
    refreshUser(await api.removeAvatar(token));
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-10 flex items-center gap-5">
        <PhotoUpload
          photoUrl={user.avatarUrl}
          initials={user.displayName.slice(0, 2).toUpperCase()}
          onUpload={handleUploadAvatar}
          onRemove={handleRemoveAvatar}
          size={72}
        />

        <div className="flex-1">
          {editingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-2">
              <Input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoFocus
                className="h-9 max-w-[220px]"
              />
              <Button type="submit" disabled={savingName} className="h-9 px-3">
                {savingName ? '…' : 'OK'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditingName(false);
                  setDisplayName(user.displayName);
                }}
                className="h-9 px-3"
              >
                Annuler
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold">{user.displayName}</h1>
              <button
                onClick={() => setEditingName(true)}
                className="text-xs text-[var(--color-ink-muted)] underline transition-colors hover:text-[var(--color-ink)]"
              >
                Modifier
              </button>
            </div>
          )}
          <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{user.email}</p>
        </div>

        <Button variant="secondary" onClick={() => void logout()}>
          Déconnexion
        </Button>
      </div>

      <h2 className="mb-4 text-base font-semibold">Mes arbres</h2>

      <Card className="mb-6">
        <form onSubmit={handleCreateTree} className="flex items-end gap-3">
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

      {loadingTrees ? (
        <p className="text-sm text-[var(--color-ink-muted)]">Chargement…</p>
      ) : trees.length === 0 ? (
        <p className="text-sm text-[var(--color-ink-muted)]">Aucun arbre pour l'instant.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {trees.map((tree) => (
            <Link key={tree.id} to={`/trees/${tree.id}/graph`}>
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