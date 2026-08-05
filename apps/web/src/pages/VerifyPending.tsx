import { useState } from 'react';
import { api } from '../lib/api';
import { useAuth, getToken } from '../lib/AuthContext';
import { Icon } from '../components/Icon';
import { Button } from '@familytree/ui';

export function VerifyPending() {
  const { user, logout } = useAuth();
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (!user) return null;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--color-bg)] px-6 py-12">
      <div className="w-full max-w-[400px] text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-bg-sunken)] text-[var(--color-ink-muted)]">
          <Icon name="link" size={24} />
        </div>
        
        <h1 className="mb-2 text-2xl font-semibold tracking-[-0.02em] text-[var(--color-ink)]">
          Vérifiez vos emails
        </h1>
        
        <p className="mb-8 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
          Nous avons envoyé un lien de confirmation à <strong className="font-medium text-[var(--color-ink)]">{user.email}</strong>. 
          Veuillez cliquer sur ce lien pour activer votre compte et accéder à l'application.
        </p>

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            disabled={resending || resendSuccess}
            onClick={() => {
              setResending(true);
              api
                .resendVerification(getToken()!)
                .then(() => setResendSuccess(true))
                .finally(() => setResending(false));
            }}
            className="h-11 w-full"
          >
            {resendSuccess ? 'Email envoyé avec succès' : resending ? 'Envoi en cours...' : 'Renvoyer le lien de confirmation'}
          </Button>
          
          <Button
            variant="secondary"
            onClick={() => void logout()}
            className="h-11 w-full"
          >
            Me connecter avec un autre compte
          </Button>
        </div>
      </div>
    </div>
  );
}
