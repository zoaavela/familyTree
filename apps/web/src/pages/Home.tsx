import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Card, Badge, Modal } from '@familytree/ui';
import { Icon } from '../components/Icon';
import { api, type Tree, type Person, type Relationship } from '../lib/api';
import { useAuth, getToken } from '../lib/AuthContext';

interface Suggestion {
  id: string;
  icon: 'plus' | 'photo' | 'calendar' | 'link' | 'orbit';
  title: string;
  detail: string;
  to: string;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Bonne nuit';
  if (h < 13) return 'Bonjour';
  if (h < 19) return 'Bon après-midi';
  return 'Bonsoir';
}

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [trees, setTrees] = useState<Tree[]>([]);
  const [stats, setStats] = useState({ persons: 0, links: 0, generations: 0 });
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const token = getToken();
    if (!token) return;

    const list = await api.listTrees(token);
    setTrees(list);

    const recent = list.slice(0, 3);
    const data = await Promise.all(
      recent.map(async (t) => ({
        tree: t,
        persons: await api.listPersons(token, t.id),
        relationships: await api.listRelationships(token, t.id),
      })),
    );

    let persons = 0;
    let links = 0;
    const found: Suggestion[] = [];

    for (const { tree, persons: ps, relationships: rs } of data) {
      persons += ps.length;
      links += rs.length;

      if (ps.length === 0) {
        found.push({
          id: `empty-${tree.id}`,
          icon: 'plus',
          title: `Commencez « ${tree.title} »`,
          detail: 'Cet arbre attend sa première personne.',
          to: `/app/trees/${tree.id}/graph`,
        });
        continue;
      }

      const noPhoto = ps.filter((p) => !p.photoUrl);
      if (noPhoto.length > 0) {
        found.push({
          id: `photo-${tree.id}`,
          icon: 'photo',
          title: 'Ajoutez des visages',
          detail: `${noPhoto.length} ${noPhoto.length > 1 ? 'personnes n\'ont' : 'personne n\'a'} pas encore de photo dans « ${tree.title} ».`,
          to: `/app/trees/${tree.id}/graph`,
        });
      }

      const noDate = ps.filter((p) => !p.birthDate);
      if (noDate.length > 0) {
        found.push({
          id: `date-${tree.id}`,
          icon: 'calendar',
          title: 'Complétez les dates',
          detail: `${noDate.length} ${noDate.length > 1 ? 'fiches sont' : 'fiche est'} sans date de naissance.`,
          to: `/app/trees/${tree.id}/graph`,
        });
      }

      const linked = new Set(rs.flatMap((r) => [r.personAId, r.personBId]));
      const isolated = ps.filter((p) => !linked.has(p.id));
      if (isolated.length > 0) {
        found.push({
          id: `link-${tree.id}`,
          icon: 'link',
          title: 'Rattachez les isolés',
          detail: `${isolated.length} ${isolated.length > 1 ? 'personnes ne sont reliées' : 'personne n\'est reliée'} à personne.`,
          to: `/app/trees/${tree.id}/graph`,
        });
      }

      if (ps.length >= 4 && rs.length >= 3) {
        found.push({
          id: `orbit-${tree.id}`,
          icon: 'orbit',
          title: 'Essayez la vue orbitale',
          detail: `Centrez-vous sur ${ps[0].firstName} et explorez ses liens autrement.`,
          to: `/app/trees/${tree.id}/graph`,
        });
      }
    }

    const depths = data.map(({ relationships }) => {
      const children = new Map<string, string[]>();
      for (const r of relationships) {
        if (r.type !== 'PARENT_OF') continue;
        if (!children.has(r.personAId)) children.set(r.personAId, []);
        children.get(r.personAId)!.push(r.personBId);
      }
      const seen = new Set<string>();
      const walk = (id: string): number => {
        if (seen.has(id)) return 1;
        seen.add(id);
        const kids = children.get(id) ?? [];
        return kids.length === 0 ? 1 : 1 + Math.max(...kids.map(walk));
      };
      const roots = [...children.keys()];
      return roots.length ? Math.max(...roots.map(walk)) : 0;
    });

    setStats({ persons, links, generations: depths.length ? Math.max(...depths) : 0 });
    setSuggestions(found.slice(0, 4));
    setLoading(false);
  }

  const metrics = [
    { label: 'Arbres', value: trees.length },
    { label: 'Personnes', value: stats.persons },
    { label: 'Liens', value: stats.links },
    { label: 'Générations', value: stats.generations },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-8 py-10 md:py-16">
      
      {/* Header */}
      <div className="rise-in mb-8 flex items-center justify-between">
        <h1 className="text-[34px] font-bold leading-tight tracking-[-0.03em] text-[var(--color-ink)]">
          {greeting()}, {user?.displayName.split(' ')[0]}.
        </h1>
      </div>

      {/* Bento Grid */}
      <div className="grid gap-5 md:grid-cols-3 lg:grid-cols-4">
        
        {/* Bento Box 1: Reprendre (col-span-1) */}
        <section 
          className="rise-in relative flex flex-col justify-between overflow-hidden rounded-[var(--radius-lg)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-md)] md:col-span-1 lg:col-span-1 border border-[var(--color-border)] group"
          style={{ animationDelay: '50ms' }}
        >
          <div className="mb-8 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2 text-[var(--color-ink-muted)]">
              <Icon name="tree" size={18} />
              <h2 className="text-[14px] font-semibold uppercase tracking-widest">Reprendre</h2>
            </div>
          </div>

          {loading ? (
             <div className="h-[100px] w-full animate-pulse rounded-[var(--radius-md)] bg-[var(--color-bg-sunken)]" />
          ) : trees.length === 0 ? (
            <div className="flex flex-col items-start relative z-10">
              <p className="mb-4 text-[16px] font-medium leading-snug">Vous n'avez pas encore d'arbre.</p>
              <Button onClick={() => navigate('/app/arbres')} className="w-full">Créer un arbre</Button>
            </div>
          ) : (
            <div className="flex flex-col gap-5 relative z-10">
              <div>
                <p className="mb-1 text-[24px] font-bold tracking-tight leading-tight">{trees[0].title}</p>
                <p className="text-[13px] text-[var(--color-ink-muted)]">
                  Modifié le {new Date(trees[0].updatedAt ?? trees[0].createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <Button onClick={() => navigate(`/app/trees/${trees[0].id}/graph`)} className="w-full shadow-sm">
                Ouvrir l'arbre
              </Button>
            </div>
          )}

          {/* Decorative faint icon */}
          <div className="pointer-events-none absolute -bottom-6 -right-6 text-[var(--color-ink)] opacity-[0.02] transition-transform duration-500 group-hover:scale-110 group-hover:opacity-[0.04]">
            <Icon name="tree" size={160} />
          </div>
        </section>

        {/* Bento Box 2: Statistiques (col-span-2) */}
        <section 
          className="rise-in flex flex-col rounded-[var(--radius-lg)] bg-[var(--color-bg-sunken)] p-6 border border-[var(--color-border)] md:col-span-2 lg:col-span-3"
          style={{ animationDelay: '100ms' }}
        >
           <div className="mb-6 flex items-center gap-2 text-[var(--color-ink-muted)]">
              <Icon name="orbit" size={18} />
              <h2 className="text-[14px] font-semibold uppercase tracking-widest">Aperçu global</h2>
            </div>
            
            <div className="grid flex-1 grid-cols-2 md:grid-cols-4 gap-4">
              {metrics.map((m) => (
                <div key={m.label} className="flex flex-col justify-center rounded-[var(--radius-sm)] bg-[var(--color-bg)] p-4 shadow-sm border border-[var(--color-border)]">
                  <p className="text-[28px] font-bold tabular-nums tracking-tight">
                    {loading ? '—' : m.value}
                  </p>
                  <p className="text-[13px] font-medium text-[var(--color-ink-muted)]">{m.label}</p>
                </div>
              ))}
            </div>
        </section>

        {/* Bento Box 3: Pistes à suivre (col-span-2) */}
        {suggestions.length > 0 && (
          <section 
            className="rise-in rounded-[var(--radius-lg)] bg-[var(--color-bg-elevated)] p-6 shadow-[var(--shadow-sm)] md:col-span-2 lg:col-span-3 border border-[var(--color-border)]"
            style={{ animationDelay: '150ms' }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--color-ink-muted)]">
                <Icon name="calendar" size={18} />
                <h2 className="text-[14px] font-semibold uppercase tracking-widest">Pistes à explorer</h2>
              </div>
              <Badge tone="quiet">{suggestions.length}</Badge>
            </div>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.map((s, i) => (
                <Link
                  key={s.id}
                  to={s.to}
                  className="group flex flex-col rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-[var(--color-border-strong)]"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-[var(--color-ink)] bg-[var(--color-bg-sunken)] p-1.5 rounded-md">
                      <Icon name={s.icon} size={16} />
                    </span>
                    <span className="text-[var(--color-ink-faint)] opacity-0 transition-opacity group-hover:opacity-100">
                      <Icon name="arrow-right" size={14} />
                    </span>
                  </div>
                  <p className="text-[14px] font-semibold">{s.title}</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
                    {s.detail}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Bento Box 4: Inspiration (col-span-1) */}
        <section 
          className="rise-in relative overflow-hidden flex flex-col rounded-[var(--radius-lg)] bg-[var(--color-accent)] p-6 text-[var(--color-on-accent)] shadow-[var(--shadow-md)] hover:bg-[var(--color-accent-hover)] transition-colors cursor-pointer md:col-span-1 lg:col-span-1"
          style={{ animationDelay: '200ms' }}
          onClick={() => navigate('/app/inspiration')}
        >
          <div className="mb-auto flex items-center gap-2 opacity-80">
            <Icon name="link" size={18} />
            <h2 className="text-[14px] font-semibold uppercase tracking-widest">Inspiration</h2>
          </div>
          
          <div className="absolute -bottom-8 -right-8 opacity-20 pointer-events-none">
            <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </div>
          <div className="mt-12 relative z-10">
            <h3 className="text-[22px] font-bold leading-tight tracking-tight mb-2">Arbres<br/>célèbres</h3>
            <p className="text-[14px] opacity-70 mb-6">
              Explorez des généalogies mythiques et historiques.
            </p>
            <div className="inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-wider">
              Découvrir <Icon name="arrow-right" size={14} />
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
