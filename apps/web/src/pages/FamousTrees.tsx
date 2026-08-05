import { useNavigate } from 'react-router-dom';
import { Button, Badge, Card } from '@familytree/ui';
import { Icon } from '../components/Icon';
import { BranchPattern } from '../components/BranchPattern';

const FAMOUS_TREES = [
  {
    id: 'olympus',
    title: 'Mythologie Grecque',
    subtitle: "Les dieux de l'Olympe et leurs descendants",
    description: "Une exploration de la généalogie divine grecque, des Titans jusqu'aux héros mythologiques. Découvrez les branches complexes de cette famille fondatrice.",
    icon: 'tree' as const,
  },
  {
    id: 'capetians',
    title: 'Les Rois Maudits',
    subtitle: 'Dynastie des Capétiens',
    description: "La lignée des rois de France qui a inspiré la célèbre saga littéraire. Retracez la généalogie de Philippe le Bel et de sa descendance jusqu'à la guerre de Cent Ans.",
    icon: 'link' as const,
  },
  {
    id: 'kennedy',
    title: 'Famille Kennedy',
    subtitle: 'Dynastie politique américaine',
    description: "L'un des arbres généalogiques les plus étudiés de l'histoire moderne américaine. Visualisez les liens d'une famille marquée par le pouvoir et la tragédie.",
    icon: 'photo' as const,
  },
];

export function FamousTrees() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="relative overflow-hidden border-b border-[var(--color-border)] bg-[var(--color-bg-sunken)] px-8 py-10">
        <BranchPattern className="absolute inset-0 h-full w-full opacity-70" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.09em] text-[var(--color-ink-faint)]">
              Inspiration
            </p>
            <h1 className="text-[30px] font-semibold leading-none tracking-[-0.025em]">Arbres célèbres</h1>
            <p className="mt-2.5 max-w-lg text-[14px] text-[var(--color-ink-muted)]">
              Explorez des généalogies historiques et mythologiques pour comprendre 
              comment structurer des familles complexes.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate(-1)}>
            <Icon name="arrow-left" size={16} className="mr-1.5" />
            Retour
          </Button>
        </div>
      </div>

      <div className="mx-auto max-w-[1400px] px-8 py-12">
        <div 
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide"
          style={{ scrollBehavior: 'smooth' }}
        >
          {FAMOUS_TREES.map((tree, i) => (
            <div 
              key={tree.id} 
              className="rise-in flex w-[85%] min-w-[300px] max-w-[500px] flex-none snap-center md:w-[400px]"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div 
                className="group relative flex h-full flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 transition-all hover:border-[var(--color-border-strong)] hover:shadow-[var(--shadow-md)]"
                style={{ transitionDuration: 'var(--transition-fast)' }}
              >
                <div className="mb-8 flex items-start justify-between">
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-md)]"
                    style={{ background: 'var(--color-bg-sunken)', color: 'var(--color-ink-muted)' }}
                  >
                    <Icon name={tree.icon} size={24} />
                  </span>
                  <Badge tone="quiet">Exemple</Badge>
                </div>
                
                <h2 className="mb-1 text-[20px] font-semibold tracking-[-0.015em]">{tree.title}</h2>
                <h3 className="mb-4 text-[13px] font-medium text-[var(--color-ink-faint)]">
                  {tree.subtitle}
                </h3>
                
                <p className="mb-8 text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
                  {tree.description}
                </p>
                
                <div className="mt-auto">
                  <Button variant="secondary" className="w-full">
                    Ouvrir l'arbre
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
