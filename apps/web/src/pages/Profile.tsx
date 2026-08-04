import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Input } from '@familytree/ui';
import { PhotoUpload } from '../components/graph/PhotoUpload';
import { api } from '../lib/api';
import { useAuth, getToken } from '../lib/AuthContext';

export function Profile() {
  const { user, logout, refreshUser } = useAuth();
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setDisplayName(user.displayName);
  }, [user]);

  async function handleSaveName(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token || !displayName.trim()) return;
    setSaving(true);
    try {
      refreshUser(await api.updateProfile(token, { displayName }));
      setEditingName(false);
    } finally {
      setSaving(false);
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
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-xl font-semibold">Mon profil</h1>

      <div className="flex items-center gap-5">
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
              <Button type="submit" disabled={saving} className="h-9 px-3">
                {saving ? '…' : 'OK'}
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
              <h2 className="text-lg font-semibold">{user.displayName}</h2>
              <button
                onClick={() => setEditingName(true)}
                className="text-xs text-[var(--color-ink-muted)] underline hover:text-[var(--color-ink)]"
              >
                Modifier
              </button>
            </div>
          )}
          <p className="mt-0.5 text-sm text-[var(--color-ink-muted)]">{user.email}</p>
        </div>
      </div>

      <Button variant="secondary" onClick={() => void logout()} className="mt-10">
        Déconnexion
      </Button>
    </div>
  );
}
