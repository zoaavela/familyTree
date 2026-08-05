import { useEffect, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Badge } from '@familytree/ui';
import { Icon } from './Icon';
import { api, type Tree } from '../lib/api';
import { useAuth, getToken } from '../lib/AuthContext';

const NAV = [
  { label: 'Accueil', to: '/app', icon: 'sparkle' as const, end: true },
  { label: 'Mes arbres', to: '/app/arbres', icon: 'tree' as const },
  { label: 'Mon profil', to: '/app/profil', icon: 'user' as const },
  { label: 'Paramètres', to: '/app/parametres', icon: 'settings' as const },
];

export function AppShell() {
  const { user, logout } = useAuth();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const collapsed = !isHovered;

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.listTrees(token).then(setTrees).catch(() => { });
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [menuOpen]);

  return (
    <div className="flex min-h-screen">
      <aside
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="sticky top-0 flex h-screen shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)] px-2.5 py-4 transition-[width] relative z-30 shadow-[var(--shadow-sm)]"
        style={{ width: collapsed ? 60 : 228, transitionDuration: 'var(--transition-base)' }}
      >
        <div className={`mb-8 flex items-center ${collapsed ? 'justify-center' : 'px-1'}`}>
          <Link to="/app" className="flex items-center gap-2 overflow-hidden">
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[7px] text-[12px] font-semibold"
              style={{ background: 'var(--color-accent)', color: 'var(--color-on-accent)' }}
            >
              L
            </span>
            {!collapsed && (
              <span className="whitespace-nowrap text-[15px] font-semibold tracking-[-0.015em]">
                Lignée
              </span>
            )}
          </Link>
        </div>

        <nav className="flex flex-col gap-2 mt-2">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-[var(--radius-sm)] py-2.5 text-[14px] transition-all ${
                  collapsed ? 'justify-center px-0' : 'px-3'
                } ${
                  isActive
                    ? 'bg-[var(--color-bg-sunken)] font-medium text-[var(--color-ink)]'
                    : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-bg-sunken)] hover:text-[var(--color-ink)]'
                }`
              }
              title={collapsed ? item.label : undefined}
              style={{ transitionDuration: 'var(--transition-fast)' }}
            >
              <Icon name={item.icon} size={18} />
              {!collapsed && item.label}
            </NavLink>
          ))}

          {!collapsed && (
            <div className="flex items-center justify-between rounded-[var(--radius-sm)] px-3 py-2.5 text-[14px] text-[var(--color-ink-faint)]">
              <span className="flex items-center gap-3">
                <Icon name="users" size={18} />
                Communauté
              </span>
              <Badge tone="quiet">Bientôt</Badge>
            </div>
          )}
        </nav>

        {!collapsed && trees.length > 0 && (
          <div className="mt-7 min-h-0 flex-1 overflow-y-auto">
            <p className="mb-2 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--color-ink-faint)]">
              Arbres récents
            </p>
            <div className="flex flex-col gap-1">
              {trees.slice(0, 6).map((tree) => (
                <NavLink
                  key={tree.id}
                  to={`/app/trees/${tree.id}/graph`}
                  className={({ isActive }) =>
                    `truncate rounded-[var(--radius-sm)] px-3 py-2 text-[13px] transition-all ${isActive
                      ? 'bg-[var(--color-bg-sunken)] text-[var(--color-ink)]'
                      : 'text-[var(--color-ink-muted)] hover:bg-[var(--color-bg-sunken)] hover:text-[var(--color-ink)]'
                    }`
                  }
                  style={{ transitionDuration: 'var(--transition-fast)' }}
                >
                  {tree.title}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {!collapsed && user && (
          <div className="relative mt-auto border-t border-[var(--color-border)] pt-3">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
              }}
              className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2 py-1.5 transition-all hover:bg-[var(--color-bg-sunken)]"
              style={{ transitionDuration: 'var(--transition-fast)' }}
            >
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: 'var(--color-bg-sunken)', color: 'var(--color-ink-faint)' }}
                >
                  <Icon name="user" size={14} />
                </span>
              )}
              <span className="min-w-0 flex-1 truncate text-left text-[13px] text-[var(--color-ink)]">
                {user.displayName}
              </span>
              <Icon name="chevron-down" size={14} className="text-[var(--color-ink-faint)]" />
            </button>

            {menuOpen && (
              <div
                className="absolute bottom-full left-0 mb-1 w-full overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] py-1 shadow-[var(--shadow-lg)]"
                style={{ animation: 'scaleIn 160ms var(--ease-out)' }}
              >
                <Link
                  to="/app/profil"
                  className="block px-3 py-1.5 text-[13px] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg-sunken)]"
                >
                  Mon profil
                </Link>
                <button
                  onClick={() => void logout()}
                  className="block w-full px-3 py-1.5 text-left text-[13px] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg-sunken)]"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        )}
      </aside>

      <main className="flex min-w-0 flex-1 flex-col relative">
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
