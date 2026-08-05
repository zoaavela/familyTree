import { useState } from 'react';
import { Badge } from '@familytree/ui';
import { PasswordCard } from '../components/settings/PasswordCard';
import { DangerZone } from '../components/settings/DangerZone';

interface ThemePreview {
  id: string;
  label: string;
  bg: string;
  surface: string;
  ink: string;
  accent: string;
  available: boolean;
}

const THEMES: ThemePreview[] = [
  { id: 'system', label: 'Clair / sombre auto', bg: '#FBF9F5', surface: '#FFFFFF', ink: '#1A1815', accent: '#B08432', available: true },
  { id: 'contrast', label: 'Contraste élevé', bg: '#000000', surface: '#111111', ink: '#FFFFFF', accent: '#E0A73C', available: false },
  { id: 'sepia', label: 'Sépia', bg: '#F1E7D6', surface: '#FAF3E6', ink: '#3A2E1F', accent: '#9C6B2E', available: false },
];

export function Settings() {
  const [active, setActive] = useState('system');

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-12">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.09em] text-[var(--color-ink-faint)]">
        Préférences
      </p>
      <h1 className="text-[30px] font-semibold leading-none tracking-[-0.025em]">Paramètres</h1>
      <p className="mt-2.5 text-[14px] text-[var(--color-ink-muted)]">
        Apparence, thèmes et options de compte.
      </p>

      <div className="mt-10">
        <h2 className="mb-4 text-[14px] font-semibold tracking-[-0.01em]">Thème</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {THEMES.map((t, i) => (
            <button
              key={t.id}
              onClick={() => t.available && setActive(t.id)}
              disabled={!t.available}
              className="rise-in group relative overflow-hidden rounded-[var(--radius-md)] border text-left transition-all disabled:cursor-not-allowed"
              style={{
                borderColor: active === t.id ? 'var(--color-ink)' : 'var(--color-border)',
                borderWidth: active === t.id ? 2 : 1,
                opacity: t.available ? 1 : 0.55,
                animationDelay: `${i * 60}ms`,
                transitionDuration: 'var(--transition-fast)',
              }}
            >
              <div className="flex h-20 items-center gap-2 p-3" style={{ background: t.bg }}>
                <div className="h-full flex-1 rounded-[6px]" style={{ background: t.surface, border: `1px solid ${t.ink}22` }} />
                <div className="flex h-full w-7 flex-col justify-between py-1">
                  <span className="block h-1.5 w-full rounded-full" style={{ background: t.ink, opacity: 0.7 }} />
                  <span className="block h-1.5 w-full rounded-full" style={{ background: t.accent }} />
                </div>
              </div>
              <div className="flex items-center justify-between border-t px-3 py-2.5" style={{ borderColor: 'var(--color-border)' }}>
                <span className="text-[12.5px] font-medium">{t.label}</span>
                {!t.available ? (
                  <Badge tone="quiet">Bientôt</Badge>
                ) : active === t.id ? (
                  <span
                    className="flex h-4 w-4 items-center justify-center rounded-full"
                    style={{ background: 'var(--color-ink)' }}
                  >
                    <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2 2 4-4" stroke="var(--color-bg)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : null}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 border-t border-[var(--color-border)] pt-8">
        <h2 className="mb-4 text-[14px] font-semibold tracking-[-0.01em]">Compte</h2>
        <div className="flex flex-col gap-3">
          <PasswordCard />
          <DangerZone />
        </div>
      </div>
    </div>
  );
}
