import { Link } from 'react-router-dom';
import { Button } from '@familytree/ui';

export function Landing() {
  return (
    <div className="min-h-screen">
      <header className="flex items-center justify-between px-6 py-5">
        <span className="text-lg font-semibold">FamilyTree</span>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
            Connexion
          </Link>
          <Link to="/register">
            <Button className="h-9 px-4">Créer un compte</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto flex max-w-2xl flex-col items-center px-6 pb-24 pt-20 text-center sm:pt-28">
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
          Construisez l'arbre de votre famille, ensemble.
        </h1>
        <p className="mt-4 max-w-lg text-[15px] text-[var(--color-ink-muted)]">
          Ajoutez vos proches, leurs histoires, leurs photos — et explorez vos liens de parenté
          dans une vue interactive pensée pour ça.
        </p>
        <div className="mt-8 flex gap-3">
          <Link to="/register">
            <Button className="h-11 px-6">Commencer gratuitement</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" className="h-11 px-6">
              J'ai déjà un compte
            </Button>
          </Link>
        </div>

        <div className="mt-20 grid w-full gap-4 text-left sm:grid-cols-3">
          {[
            { title: 'Vue interactive', desc: "Naviguez dans votre arbre en un coup d'œil, générations comprises." },
            { title: 'Vue orbitale', desc: 'Centrez-vous sur une personne et explorez ses liens en un regard.' },
            { title: 'Collaboratif', desc: 'Construisez votre arbre à plusieurs, sans rien perdre en route.' },
          ].map((f) => (
            <div key={f.title} className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
              <p className="text-sm font-medium">{f.title}</p>
              <p className="mt-1 text-[13px] text-[var(--color-ink-muted)]">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
