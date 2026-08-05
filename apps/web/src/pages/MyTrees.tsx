import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input, Modal, Label, Badge } from '@familytree/ui';
import { Icon } from '../components/Icon';
import { api, type Tree } from '../lib/api';
import { getToken } from '../lib/AuthContext';

export function MyTrees() {
  const [trees, setTrees] = useState<Tree[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const token = getToken();
    if (!token) return;
    setTrees(await api.listTrees(token));
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
      setOpen(false);
      await load();
    } finally {
      setCreating(false);
    }
  }

  async function handleVisibilityChange(treeId: string, visibility: 'PRIVATE' | 'PUBLIC' | 'UNLISTED') {
    const token = getToken();
    if (!token) return;
    setTrees((prev) => prev.map((t) => (t.id === treeId ? { ...t, visibility } : t)));
    // await api.updateTree(token, treeId, { visibility });
  }

  const sorted = [...trees].sort(
    (a, b) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime(),
  );
  const [featured, ...rest] = sorted;

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-12">
      <div className="mb-9 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.09em] text-[var(--color-ink-faint)]">
            Collection
          </p>
          <div className="flex items-baseline gap-3">
            <h1 className="text-[30px] font-semibold leading-none tracking-[-0.025em]">Mes arbres</h1>
            {!loading && trees.length > 0 && (
              <span className="text-[30px] font-normal leading-none text-[var(--color-ink-faint)] tabular-nums">
                {trees.length}
              </span>
            )}
          </div>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Icon name="plus" size={16} className="mr-1.5" />
          Nouvel arbre
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[110px] rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)]" />
          ))}
        </div>
      ) : trees.length === 0 ? (
        <div
          className="rise-in flex flex-col items-center rounded-[var(--radius-lg)] px-8 py-20 text-center"
          style={{ background: 'var(--color-bg-sunken)' }}
        >
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" className="mb-5">
            <path
              d="M22 6v8m0 0c0 6-8 6-8 13m8-13c0 6 8 6 8 13"
              stroke="var(--color-ink-faint)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <circle cx="22" cy="6" r="3" fill="var(--color-ink-faint)" />
            <circle cx="14" cy="27" r="3" fill="var(--color-ink-faint)" />
            <circle cx="30" cy="27" r="3" fill="none" stroke="var(--edge-union)" strokeWidth="1.6" />
          </svg>
          <p className="text-[16px] font-medium">Votre première lignée commence ici</p>
          <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-[var(--color-ink-muted)]">
            Donnez un nom à votre arbre, puis ajoutez les personnes une à une — le reste se
            construit tout seul.
          </p>
          <Button onClick={() => setOpen(true)} className="mt-6">
            Créer un arbre
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {featured && (
            <Link to={`/app/trees/${featured.id}/graph`} className="rise-in group block">
              <div
                className="relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] p-7 transition-all group-hover:border-[var(--color-border-strong)] group-hover:shadow-[var(--shadow-md)]"
                style={{ background: 'var(--color-bg-sunken)', transitionDuration: 'var(--transition-fast)' }}
              >
                <svg
                  className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 opacity-[0.08]"
                  viewBox="0 0 100 100"
                  fill="none"
                >
                  <circle cx="50" cy="50" r="49" stroke="var(--color-ink)" strokeWidth="1" />
                  <circle cx="50" cy="50" r="34" stroke="var(--color-ink)" strokeWidth="1" />
                  <circle cx="50" cy="50" r="19" stroke="var(--color-ink)" strokeWidth="1" />
                </svg>

                <Badge tone="quiet" className="relative">Continuer</Badge>
                <p className="relative mt-3 text-[22px] font-semibold tracking-[-0.015em]">{featured.title}</p>
                <p className="relative mt-1.5 text-[13px] text-[var(--color-ink-muted)]">
                  Modifié le {new Date(featured.updatedAt ?? featured.createdAt).toLocaleDateString('fr-FR')}
                </p>
                <div className="relative mt-5 flex items-center gap-1.5 text-[13px] font-medium text-[var(--color-ink)]">
                  Ouvrir l'arbre
                  <Icon name="arrow-right" size={15} className="transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <div>
              <p className="mb-3 text-[12px] font-medium text-[var(--color-ink-muted)]">Autres arbres</p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {rest.map((tree, i) => (
                  <div
                    key={tree.id}
                    className="rise-in group relative rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 transition-all hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)]"
                    style={{ animationDelay: `${i * 45}ms`, transitionDuration: 'var(--transition-fast)' }}
                  >
                    <Link to={`/app/trees/${tree.id}/graph`} className="absolute inset-0" aria-label={tree.title} />
                    <div className="relative flex items-start justify-between">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)]"
                        style={{ background: 'var(--color-bg-sunken)', color: 'var(--color-ink-muted)' }}
                      >
                        <Icon name="tree" size={16} />
                      </span>
                      <div className="relative z-10">
                        <Badge tone="quiet">{tree.visibility === 'PRIVATE' ? 'Privé' : 'Public'}</Badge>
                      </div>
                    </div>
                    <p className="relative mt-3 truncate text-[14px] font-medium">{tree.title}</p>
                    <p className="relative mt-1 text-[12px] text-[var(--color-ink-muted)]">
                      Créé le {new Date(tree.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <h2 className="mb-1 text-[17px] font-semibold tracking-[-0.01em]">Nouvel arbre</h2>
        <p className="mb-5 text-[13px] text-[var(--color-ink-muted)]">
          Vous pourrez le renommer à tout moment.
        </p>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="tree-title">Nom de l'arbre</Label>
            <Input
              id="tree-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Famille Abdi"
              autoFocus
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Création…' : 'Créer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
