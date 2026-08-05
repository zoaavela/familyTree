import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../lib/AuthContext';

export function VerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    api
      .verifyEmail(token)
      .then(() => {
        setStatus('success');
        if (user) {
          refreshUser({ ...user, emailVerified: true });
        }
        setTimeout(() => navigate('/app'), 3000);
      })
      .catch(() => setStatus('error'));
  }, [token, navigate, user, refreshUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <div className="w-full max-w-[360px] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-8 text-center">
        {status === 'loading' && (
          <>
            <h1 className="text-xl font-semibold">Vérification en cours...</h1>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Nous validons votre adresse email.
            </p>
          </>
        )}
        {status === 'success' && (
          <>
            <h1 className="text-xl font-semibold text-[var(--color-success)]">Email vérifié !</h1>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Merci, votre compte est maintenant validé. Redirection en cours...
            </p>
          </>
        )}
        {status === 'error' && (
          <>
            <h1 className="text-xl font-semibold text-[var(--color-error)]">Lien invalide</h1>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Ce lien est invalide ou a expiré. Vous pouvez demander un nouveau lien depuis
              l'application.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
