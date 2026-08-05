import { useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Input, Label } from '@familytree/ui';
import { api } from '../../lib/api';
import { getToken } from '../../lib/AuthContext';

export function PasswordCard() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setSaving(true);
    setError(null);
    try {
      await api.changePassword(token, current, next);
      setDone(true);
      setCurrent('');
      setNext('');
      setTimeout(() => {
        setOpen(false);
        setDone(false);
      }, 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[var(--radius-md)] border border-[var(--color-border)]">
      <div className="flex items-center justify-between px-4 py-3.5">
        <div>
          <p className="text-[13.5px] font-medium">Mot de passe</p>
          <p className="text-[12px] text-[var(--color-ink-muted)]">
            Vous serez déconnecté des autres appareils.
          </p>
        </div>
        <Button variant="secondary" onClick={() => setOpen((o) => !o)} className="h-8 px-3 text-[12.5px]">
          {open ? 'Fermer' : 'Modifier'}
        </Button>
      </div>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-t border-[var(--color-border)] px-4 py-4"
          style={{ animation: 'fadeIn 160ms ease-out' }}
        >
          <div>
            <Label htmlFor="current-pw">Mot de passe actuel</Label>
            <Input
              id="current-pw"
              type="password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <div>
            <Label htmlFor="new-pw">Nouveau mot de passe</Label>
            <Input
              id="new-pw"
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          {error && (
            <p className="rounded-[var(--radius-sm)] bg-[var(--color-error-bg)] px-3 py-2 text-[12.5px] text-[var(--color-error)]">
              {error}
            </p>
          )}
          {done && <p className="text-[12.5px] text-[var(--color-success)]">Mot de passe mis à jour.</p>}
          <Button type="submit" disabled={saving} className="self-start h-9 px-4 text-[13px]">
            {saving ? '…' : 'Enregistrer'}
          </Button>
        </form>
      )}
    </div>
  );
}
