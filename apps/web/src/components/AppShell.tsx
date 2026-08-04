import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';

interface NavItem {
  label: string;
  to?: string;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Mes arbres', to: '/app' },
  { label: 'Mon profil', to: '/app/profil' },
  { label: 'Créations de la communauté', disabled: true },
  { label: 'Paramètres', to: '/app/parametres' },
];

export function AppShell() {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-[var(--color-border)] px-3 py-5">
        <div className="mb-6 px-2 text-sm font-semibold">FamilyTree</div>

        <nav className="flex flex-1 flex-col gap-0.5">
          {NAV_ITEMS.map((item) =>
            item.disabled ? (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] text-[var(--color-ink-muted)] opacity-45"
              >
                <span>{item.label}</span>
                <span className="rounded-full bg-[var(--color-bg)] px-1.5 py-0.5 text-[10px]">
                  Bientôt
                </span>
              </div>
            ) : (
              <NavLink
                key={item.label}
                to={item.to!}
                end={item.to === '/app'}
                className={({ isActive }) =>
                  `rounded-[var(--radius-sm)] px-2.5 py-2 text-[13px] transition-colors ${
                    isActive
                      ? 'bg-[var(--color-bg)] font-medium text-[var(--color-ink)]'
                      : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        {user && (
          <div className="flex items-center gap-2 border-t border-[var(--color-border)] px-2 pt-4">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
            ) : (
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-semibold"
                style={{ background: 'var(--color-accent)', color: 'var(--color-bg)' }}
              >
                {user.displayName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="truncate text-[13px] text-[var(--color-ink-muted)]">{user.displayName}</span>
          </div>
        )}
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
