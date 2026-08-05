import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Input, Card, Badge } from '@familytree/ui';
import { PhotoUpload } from '../components/graph/PhotoUpload';
import { FollowListModal } from '../components/FollowListModal';
import { BranchPattern } from '../components/BranchPattern';
import { Icon } from '../components/Icon';
import {
  api,
  type PublicUser,
  type FollowCounts,
  type FollowUser,
  type Tree,
} from '../lib/api';
import { useAuth, getToken } from '../lib/AuthContext';

export function Profile() {
  const { userId } = useParams<{ userId?: string }>();
  const { user: me, refreshUser } = useAuth();

  const targetId = userId ?? me?.id ?? '';
  const isSelf = !userId || userId === me?.id;

  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [trees, setTrees] = useState<Tree[]>([]);
  const [counts, setCounts] = useState<FollowCounts>({ followers: 0, following: 0 });
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ displayName: '', bio: '' });
  const [saving, setSaving] = useState(false);

  const [listModal, setListModal] = useState<'followers' | 'following' | null>(null);
  const [listUsers, setListUsers] = useState<FollowUser[]>([]);
  const [listLoading, setListLoading] = useState(false);

  useEffect(() => {
    void load();
  }, [targetId]);

  async function load() {
    const token = getToken();
    if (!token || !targetId) return;
    setLoading(true);

    const [p, t, c] = await Promise.all([
      api.getProfile(token, targetId),
      api.getProfileTrees(token, targetId),
      api.followCounts(token, targetId),
    ]);
    setProfile(p);
    setTrees(t);
    setCounts(c);
    setForm({ displayName: p?.displayName ?? '', bio: p?.bio ?? '' });

    if (!p?.isSelf) {
      const { following } = await api.followStatus(token, targetId);
      setFollowing(following);
    }
    setLoading(false);
  }

  async function toggleFollow() {
    const token = getToken();
    if (!token) return;
    if (following) {
      await api.unfollow(token, targetId);
      setFollowing(false);
      setCounts((c) => ({ ...c, followers: c.followers - 1 }));
    } else {
      await api.follow(token, targetId);
      setFollowing(true);
      setCounts((c) => ({ ...c, followers: c.followers + 1 }));
    }
  }

  async function openList(kind: 'followers' | 'following') {
    setListModal(kind);
    setListLoading(true);
    const token = getToken();
    if (!token) return;
    const users =
      kind === 'followers'
        ? await api.listFollowers(token, targetId)
        : await api.listFollowing(token, targetId);
    setListUsers(users);
    setListLoading(false);
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    try {
      const updated = await api.updateProfile(token, form);
      refreshUser(updated);
      setProfile((p) => (p ? { ...p, displayName: updated.displayName, bio: updated.bio } : p));
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleUploadAvatar(file: File) {
    const token = getToken();
    if (!token) return;
    const updated = await api.uploadAvatar(token, file);
    refreshUser(updated);
    setProfile((p) => (p ? { ...p, avatarUrl: updated.avatarUrl } : p));
  }

  async function handleRemoveAvatar() {
    const token = getToken();
    if (!token) return;
    const updated = await api.removeAvatar(token);
    refreshUser(updated);
    setProfile((p) => (p ? { ...p, avatarUrl: null } : p));
  }

  if (loading || !profile) {
    return (
      <div className="px-8 py-12 text-[13px] text-[var(--color-ink-muted)]">Chargement…</div>
    );
  }

  return (
    <div>
      <div className="relative h-[132px] overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg-sunken)]">
        <BranchPattern className="h-full w-full opacity-70" />
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-10 px-8 pb-16 pt-0 lg:grid-cols-[280px_1fr]">
        <aside className="relative -mt-12 flex flex-col items-center lg:sticky lg:top-8 lg:items-start lg:self-start">
          <div className="rounded-full ring-4 ring-[var(--color-bg)]">
            <PhotoUpload
              photoUrl={profile.avatarUrl}
              onUpload={isSelf ? handleUploadAvatar : async () => {}}
              onRemove={isSelf ? handleRemoveAvatar : async () => {}}
              size={104}
            />
          </div>

          {editing ? (
            <form onSubmit={handleSave} className="mt-4 flex w-full flex-col gap-3">
              <Input
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                placeholder="Nom"
                autoFocus
                required
              />
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                placeholder="Quelques mots sur vous…"
                rows={3}
                className="w-full resize-none rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[13.5px] text-[var(--color-ink)] outline-none transition-all focus:border-[var(--color-ink)] focus:ring-[3px] focus:ring-[var(--node-focus-ring)]"
                style={{ transitionDuration: 'var(--transition-fast)' }}
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="flex-1">
                  {saving ? '…' : 'Enregistrer'}
                </Button>
                <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="mt-4 text-center text-[21px] font-semibold tracking-[-0.015em] lg:text-left">
                {profile.displayName}
              </h1>
              {profile.bio ? (
                <p className="mt-1.5 text-center text-[13.5px] leading-relaxed text-[var(--color-ink-muted)] lg:text-left">
                  {profile.bio}
                </p>
              ) : isSelf ? (
                <button
                  onClick={() => setEditing(true)}
                  className="mt-1.5 text-[13px] text-[var(--color-ink-faint)] underline decoration-dotted transition-colors hover:text-[var(--color-ink-muted)]"
                >
                  Ajouter une bio
                </button>
              ) : null}
              <p className="mt-2 text-[11.5px] text-[var(--color-ink-faint)]">
                Membre depuis{' '}
                {new Date(profile.createdAt).toLocaleDateString('fr-FR', {
                  month: 'long',
                  year: 'numeric',
                })}
              </p>

              <div className="mt-5 flex w-full gap-2 border-y border-[var(--color-border)] py-3">
                <button
                  onClick={() => openList('followers')}
                  className="flex-1 rounded-[var(--radius-sm)] py-1 text-center transition-colors hover:bg-[var(--color-bg-sunken)]"
                >
                  <span className="block text-[16px] font-semibold leading-none tabular-nums">
                    {counts.followers}
                  </span>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">Abonnés</span>
                </button>
                <button
                  onClick={() => openList('following')}
                  className="flex-1 rounded-[var(--radius-sm)] py-1 text-center transition-colors hover:bg-[var(--color-bg-sunken)]"
                >
                  <span className="block text-[16px] font-semibold leading-none tabular-nums">
                    {counts.following}
                  </span>
                  <span className="text-[11px] text-[var(--color-ink-muted)]">Abonnements</span>
                </button>
              </div>

              <div className="mt-4 flex w-full gap-2">
                {isSelf ? (
                  <>
                    <Button variant="secondary" onClick={() => setEditing(true)} className="flex-1">
                      Modifier
                    </Button>
                    <Link to="/app/parametres" className="flex-1">
                      <Button variant="secondary" className="w-full">
                        <Icon name="settings" size={15} />
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Button
                    variant={following ? 'secondary' : 'primary'}
                    onClick={toggleFollow}
                    className="w-full"
                  >
                    {following ? 'Abonné' : "S'abonner"}
                  </Button>
                )}
              </div>
            </>
          )}
        </aside>

        <main className="rise-in min-w-0 pt-8">
          <div className="mb-5 flex items-baseline justify-between">
            <h2 className="text-[15px] font-semibold tracking-[-0.01em]">
              {isSelf ? 'Mes arbres' : 'Arbres visibles'}
            </h2>
            <Badge tone="quiet">{trees.length}</Badge>
          </div>

          {trees.length === 0 ? (
            <div className="rounded-[var(--radius-md)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-sunken)] px-6 py-14 text-center">
              <Icon name="tree" size={22} className="mx-auto mb-3 text-[var(--color-ink-faint)]" />
              <p className="text-[13.5px] text-[var(--color-ink-muted)]">
                {isSelf ? "Vous n'avez encore aucun arbre." : 'Rien à afficher pour le moment.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {trees.map((tree, i) => (
                <Link
                  key={tree.id}
                  to={`/app/trees/${tree.id}/graph`}
                  className="rise-in"
                  style={{ animationDelay: `${i * 45}ms` }}
                >
                  <Card interactive className="h-full">
                    <div className="mb-2.5 flex items-start justify-between">
                      <span className="text-[var(--color-ink-faint)]">
                        <Icon name="tree" size={18} />
                      </span>
                      {tree.visibility === 'PUBLIC' && <Badge tone="quiet">Public</Badge>}
                    </div>
                    <p className="truncate text-[14px] font-medium">{tree.title}</p>
                    <p className="mt-1 text-[12px] text-[var(--color-ink-muted)]">
                      Créé le {new Date(tree.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>

      <FollowListModal
        open={listModal !== null}
        onClose={() => setListModal(null)}
        title={listModal === 'followers' ? 'Abonnés' : 'Abonnements'}
        users={listUsers}
        loading={listLoading}
      />
    </div>
  );
}
