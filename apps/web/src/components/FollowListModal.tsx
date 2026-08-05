import { Link } from 'react-router-dom';
import { Modal } from '@familytree/ui';
import type { FollowUser } from '../lib/api';

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  users: FollowUser[];
  loading: boolean;
}

export function FollowListModal({ open, onClose, title, users, loading }: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <h2 className="mb-4 text-[16px] font-semibold tracking-[-0.01em]">{title}</h2>

      {loading ? (
        <p className="py-4 text-center text-[13px] text-[var(--color-ink-muted)]">Chargement…</p>
      ) : users.length === 0 ? (
        <p className="py-4 text-center text-[13px] text-[var(--color-ink-muted)]">Personne pour l'instant.</p>
      ) : (
        <div className="flex max-h-[320px] flex-col gap-1 overflow-y-auto">
          {users.map((u) => (
            <Link
              key={u.id}
              to={`/app/profil/${u.id}`}
              onClick={onClose}
              className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-2 transition-colors hover:bg-[var(--color-bg-sunken)]"
            >
              {u.avatarUrl ? (
                <img src={u.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full"
                  style={{ background: 'var(--color-bg-sunken)', color: 'var(--color-ink-faint)' }}
                >
                  <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="10" cy="7.2" r="3.2" />
                    <path d="M3.6 17c.7-3.4 3.4-5.4 6.4-5.4s5.7 2 6.4 5.4" />
                  </svg>
                </span>
              )}
              <span className="text-[13.5px] font-medium">{u.displayName}</span>
            </Link>
          ))}
        </div>
      )}
    </Modal>
  );
}
