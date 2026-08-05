import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Label, Modal } from '@familytree/ui';
import { api } from '../../lib/api';
import { getToken, useAuth } from '../../lib/AuthContext';

export function DangerZone() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    const token = getToken();
    if (!token) return;
    setExporting(true);
    try {
      const data = await api.exportData(token);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `donnees-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete(e: FormEvent) {
    e.preventDefault();
    const token = getToken();
    if (!token) return;
    setDeleting(true);
    setError(null);
    try {
      await api.deleteAccount(token, password);
      await logout();
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="rounded-[var(--radius-md)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div>
            <p className="text-[13.5px] font-medium">Exporter mes données</p>
            <p className="text-[12px] text-[var(--color-ink-muted)]">
              Téléchargez un fichier contenant vos arbres, personnes et liens.
            </p>
          </div>
          <Button variant="secondary" onClick={handleExport} disabled={exporting} className="h-8 px-3 text-[12.5px]">
            {exporting ? '…' : 'Télécharger'}
          </Button>
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3.5">
          <div>
            <p className="text-[13.5px] font-medium text-[var(--color-error)]">Supprimer le compte</p>
            <p className="text-[12px] text-[var(--color-ink-muted)]">
              Vos arbres, photos et liens seront définitivement effacés.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => setConfirmOpen(true)}
            className="h-8 border-[var(--color-error)] px-3 text-[12.5px] text-[var(--color-error)] hover:bg-[var(--color-error-bg)]"
          >
            Supprimer
          </Button>
        </div>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <h2 className="mb-1 text-[17px] font-semibold tracking-[-0.01em] text-[var(--color-error)]">
          Supprimer définitivement votre compte
        </h2>
        <p className="mb-5 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
          Cette action est irréversible. Tous vos arbres, personnes, photos et liens seront
          effacés. Pensez à exporter vos données avant de continuer.
        </p>
        <form onSubmit={handleDelete} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="del-password">Mot de passe</Label>
            <Input
              id="del-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="del-confirm">Tapez SUPPRIMER pour confirmer</Label>
            <Input
              id="del-confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SUPPRIMER"
              required
            />
          </div>
          {error && (
            <p className="rounded-[var(--radius-sm)] bg-[var(--color-error-bg)] px-3 py-2 text-[12.5px] text-[var(--color-error)]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={deleting || confirmText !== 'SUPPRIMER'}
              className="bg-[var(--color-error)] hover:bg-[var(--color-error)]"
            >
              {deleting ? 'Suppression…' : 'Supprimer définitivement'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
