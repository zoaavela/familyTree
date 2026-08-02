import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Input, Label, Modal } from '@familytree/ui';
import { api, type Person, type Relationship } from '../lib/api';
import { getToken } from '../lib/AuthContext';
import { computeFamilyLayout } from '../lib/graph/familyLayout';
import { computeRadialLayout } from '../lib/graph/radialLayout';
import { getRelatives } from '../lib/graph/siblings';
import { useCanvas } from '../lib/graph/useCanvas';
import { GraphEdges } from '../components/graph/GraphEdges';
import { PersonCard } from '../components/graph/PersonCard';
import { PersonOrbitNode } from '../components/graph/PersonOrbitNode';
import { PersonPanel } from '../components/graph/PersonPanel';
import { ContextMenu, type MenuItem } from '../components/graph/ContextMenu';

type Mode = 'vertical' | 'radial';
type RelKind = 'parent' | 'child' | 'spouse';

const KIND_LABEL: Record<RelKind, string> = {
    parent: 'Parent',
    child: 'Enfant',
    spouse: 'Conjoint·e',
};

export function TreeGraph() {
    const { treeId } = useParams<{ treeId: string }>();
    const [persons, setPersons] = useState<Person[]>([]);
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [loading, setLoading] = useState(true);
    const [mode, setMode] = useState<Mode>('vertical');
    const [focusId, setFocusId] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoverId, setHoverId] = useState<string | null>(null);
    const [showSiblings, setShowSiblings] = useState(true);

    const [modalOpen, setModalOpen] = useState(false);
    const [anchorId, setAnchorId] = useState<string | null>(null);
    const [relKind, setRelKind] = useState<RelKind>('child');
    const [useExisting, setUseExisting] = useState(false);
    const [existingId, setExistingId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [linkPartner, setLinkPartner] = useState(true);
    const [formError, setFormError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const [menu, setMenu] = useState<{ x: number; y: number; personId: string | null } | null>(null);
    const [editSignal, setEditSignal] = useState(0);

    const { containerRef, viewport, isPanning, handlers, fitToBounds, zoomBy } = useCanvas();
    const didFit = useRef(false);

    const load = useCallback(async () => {
        const token = getToken();
        if (!token || !treeId) return;
        const [p, r] = await Promise.all([
            api.listPersons(token, treeId),
            api.listRelationships(token, treeId),
        ]);
        setPersons(p);
        setRelationships(r);
        setLoading(false);
    }, [treeId]);

    useEffect(() => {
        load();
    }, [load]);

    const layout = useMemo(() => {
        if (persons.length === 0) return null;
        return mode === 'radial' && focusId
            ? computeRadialLayout({ persons, relationships }, focusId)
            : computeFamilyLayout({ persons, relationships, showSiblings });
    }, [persons, relationships, mode, focusId, showSiblings]);

    useEffect(() => {
        if (!layout || didFit.current) return;
        const t = setTimeout(() => {
            fitToBounds(layout.bounds);
            didFit.current = true;
        }, 40);
        return () => clearTimeout(t);
    }, [layout, fitToBounds]);

    useEffect(() => {
        if (!layout) return;
        const t = setTimeout(() => fitToBounds(layout.bounds), 20);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, focusId]);

    const exitRadial = useCallback(() => {
        setMode('vertical');
        setFocusId(null);
    }, []);

    const toggleRadial = useCallback(
        (personId: string) => {
            if (mode === 'radial' && focusId === personId) exitRadial();
            else {
                setMode('radial');
                setFocusId(personId);
                setSelectedId(personId);
            }
        },
        [mode, focusId, exitRadial],
    );

    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (modalOpen) return;
            const tag = (e.target as HTMLElement)?.tagName;
            if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
            if (e.key === 'Escape') {
                if (selectedId) setSelectedId(null);
                else if (mode === 'radial') exitRadial();
            } else if (e.key === 'f' && layout) fitToBounds(layout.bounds);
            else if (e.key === '+' || e.key === '=') zoomBy(1.18);
            else if (e.key === '-') zoomBy(0.85);
            else if (e.key === 'o' && selectedId) toggleRadial(selectedId);
        }
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [modalOpen, selectedId, mode, layout, fitToBounds, zoomBy, exitRadial, toggleRadial]);

    function openAddModal(personId: string | null, kind: RelKind = 'child') {
        setAnchorId(personId);
        setRelKind(kind);
        setUseExisting(false);
        setExistingId('');
        setFirstName('');
        setLastName('');
        setLinkPartner(true);
        setFormError(null);
        setModalOpen(true);
    }

    const anchorPerson = persons.find((p) => p.id === anchorId) ?? null;
    const anchorRelatives = anchorId ? getRelatives(anchorId, relationships) : null;
    const partnerIds = relKind === 'child' ? (anchorRelatives?.spouses ?? []) : [];
    const partnerName = partnerIds.length
        ? persons.find((p) => p.id === partnerIds[0])?.firstName
        : null;

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        const token = getToken();
        if (!token || !treeId) return;
        if (useExisting && !existingId) return;
        if (!useExisting && !firstName.trim()) return;

        setSaving(true);
        setFormError(null);
        try {
            const targetId = useExisting
                ? existingId
                : (await api.createPerson(token, treeId, { firstName, lastName: lastName || undefined })).id;

            if (anchorId) {
                if (relKind === 'parent') {
                    await api.createRelationship(token, treeId, {
                        personAId: targetId,
                        personBId: anchorId,
                        type: 'PARENT_OF',
                    });
                } else if (relKind === 'spouse') {
                    await api.createRelationship(token, treeId, {
                        personAId: anchorId,
                        personBId: targetId,
                        type: 'SPOUSE_OF',
                    });
                } else {
                    await api.createRelationship(token, treeId, {
                        personAId: anchorId,
                        personBId: targetId,
                        type: 'PARENT_OF',
                    });
                    if (linkPartner && partnerIds[0]) {
                        await api.createRelationship(token, treeId, {
                            personAId: partnerIds[0],
                            personBId: targetId,
                            type: 'PARENT_OF',
                        });
                    }
                }
            }

            setModalOpen(false);
            await load();
            setSelectedId(targetId);
        } catch (err) {
            setFormError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setSaving(false);
        }
    }

    async function handleSavePerson(id: string, data: Record<string, string | undefined>) {
        const token = getToken();
        if (!token || !treeId) return;
        await api.updatePerson(token, treeId, id, data);
        await load();
    }

    async function handleDeletePerson(id: string) {
        const token = getToken();
        if (!token || !treeId) return;
        await api.deletePerson(token, treeId, id);
        setSelectedId(null);
        if (focusId === id) exitRadial();
        await load();
    }

    const selectedPerson = persons.find((p) => p.id === selectedId) ?? null;
    const activeHighlight = hoverId ?? selectedId;

    const neighbourIds = useMemo(() => {
        if (!activeHighlight) return null;
        const r = getRelatives(activeHighlight, relationships);
        return new Set([activeHighlight, ...r.parents, ...r.children, ...r.spouses, ...r.siblings]);
    }, [activeHighlight, relationships]);

    if (loading) return <div className="p-10 text-sm text-[var(--color-ink-muted)]">Chargement…</div>;

    const btn =
        'rounded-[var(--radius-sm)] border border-[var(--color-border)] px-2.5 py-1 text-xs text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg)]';
    const candidates = persons.filter((p) => p.id !== anchorId);

    function openMenu(e: React.MouseEvent, personId: string | null) {
        e.preventDefault();
        e.stopPropagation();
        setMenu({ x: e.clientX, y: e.clientY, personId });
    }

    const menuItems: MenuItem[] = !menu
        ? []
        : menu.personId
            ? [
                { label: 'Ouvrir la fiche', onClick: () => setSelectedId(menu.personId!) },
                {
                    label: 'Modifier',
                    onClick: () => {
                        setSelectedId(menu.personId!);
                        setEditSignal((n) => n + 1);
                    },
                },
                { separator: true, label: '', onClick: () => { } },
                { label: 'Ajouter un parent', onClick: () => openAddModal(menu.personId, 'parent') },
                { label: 'Ajouter un·e conjoint·e', onClick: () => openAddModal(menu.personId, 'spouse') },
                { label: 'Ajouter un enfant', onClick: () => openAddModal(menu.personId, 'child') },
                { separator: true, label: '', onClick: () => { } },
                {
                    label: mode === 'radial' && focusId === menu.personId ? 'Vue hiérarchique' : 'Vue orbitale',
                    onClick: () => toggleRadial(menu.personId!),
                },
                { separator: true, label: '', onClick: () => { } },
                {
                    label: 'Supprimer',
                    danger: true,
                    onClick: () => {
                        const p = persons.find((p) => p.id === menu.personId);
                        if (p && confirm(`Supprimer ${p.firstName} et ses liens ?`)) handleDeletePerson(p.id);
                    },
                },
            ]
            : [
                { label: 'Ajouter une personne', onClick: () => openAddModal(null) },
                { separator: true, label: '', onClick: () => { } },
                { label: 'Recentrer la vue', onClick: () => layout && fitToBounds(layout.bounds) },
                { separator: true, label: '', onClick: () => { } },
                ...(mode === 'radial'
                    ? [{ label: "Quitter l'orbite", onClick: exitRadial }]
                    : [
                        {
                            label: showSiblings ? 'Masquer les fratries' : 'Afficher les fratries',
                            onClick: () => setShowSiblings((s) => !s),
                        },
                    ]),
            ];

    return (
        <div className="relative flex h-screen w-screen flex-col overflow-hidden">
            <header className="z-10 flex items-center gap-4 border-b border-[var(--color-border)] px-4 py-2.5">
                <Link to="/trees" className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                    ← Mes arbres
                </Link>
                <Link to={`/trees/${treeId}`} className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
                    Vue liste
                </Link>
                {mode === 'radial' && (
                    <span className="rounded-full bg-[var(--color-bg)] px-2.5 py-1 text-[11px] text-[var(--color-ink-muted)]">
                        Orbite · {persons.find((p) => p.id === focusId)?.firstName}
                    </span>
                )}
                <div className="ml-auto flex items-center gap-1.5">
                    {mode === 'vertical' && (
                        <>
                            <button
                                onClick={() => {
                                    const id = selectedId ?? persons[0]?.id;
                                    if (id) toggleRadial(id);
                                }}
                                className={btn}
                                title={selectedId ? 'Voir l\'orbite de cette personne' : 'Voir l\'orbite (racine)'}
                            >
                                Vue orbitale
                            </button>
                            <button
                                onClick={() => setShowSiblings((s) => !s)}
                                className={btn}
                                style={{ background: showSiblings ? 'var(--color-bg)' : 'transparent', opacity: showSiblings ? 1 : 0.55 }}
                            >
                                Fratries
                            </button>
                        </>
                    )}
                    {mode === 'radial' && (
                        <button onClick={exitRadial} className={btn}>
                            Quitter l'orbite
                        </button>
                    )}
                    <button onClick={() => layout && fitToBounds(layout.bounds)} className={btn}>
                        Recentrer
                    </button>
                </div>
            </header>

            <div
                ref={containerRef}
                {...handlers}
                className="relative flex-1"
                style={{ cursor: isPanning ? 'grabbing' : 'grab', touchAction: 'none' }}
            >
                {persons.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center gap-4">
                        <p className="text-sm text-[var(--color-ink-muted)]">Cet arbre est encore vide.</p>
                        <Button onClick={() => openAddModal(null)}>Ajouter la première personne</Button>
                    </div>
                ) : (
                    <>
                        <svg
                            className="h-full w-full"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) setSelectedId(null);
                            }}
                            onContextMenu={(e) => {
                                if (e.target === e.currentTarget) openMenu(e, null);
                            }}
                        >
                            <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.scale})`}>
                                {layout && <GraphEdges edges={layout.edges} highlightId={activeHighlight} />}
                                {layout?.nodes.map((node) => (
                                    <g
                                        key={node.id}
                                        transform={`translate(${node.x}, ${node.y})`}
                                        onMouseEnter={() => setHoverId(node.id)}
                                        onMouseLeave={() => setHoverId(null)}
                                        style={{ transition: 'transform 340ms cubic-bezier(0.16, 1, 0.3, 1)' }}
                                    >
                                        {mode === 'radial' ? (
                                            <PersonOrbitNode
                                                node={node}
                                                isFocus={node.id === focusId}
                                                selected={node.id === selectedId}
                                                dimmed={!!neighbourIds && !neighbourIds.has(node.id)}
                                                onSelect={setSelectedId}
                                                onFocusRadial={toggleRadial}
                                                onContextMenu={openMenu}
                                            />
                                        ) : (
                                            <PersonCard
                                                node={node}
                                                selected={node.id === selectedId}
                                                dimmed={!!neighbourIds && !neighbourIds.has(node.id)}
                                                onSelect={setSelectedId}
                                                onAddRelative={(id) => openAddModal(id, 'child')}
                                                onFocusRadial={toggleRadial}
                                                onContextMenu={openMenu}
                                            />
                                        )}
                                    </g>
                                ))}
                            </g>
                        </svg>

                        <div className="pointer-events-none absolute bottom-4 left-4 flex flex-col gap-2">
                            <div className="flex gap-3.5 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-[11px] text-[var(--color-ink-muted)]">
                                {[
                                    { label: 'Filiation', color: 'var(--edge-parent)', dash: undefined },
                                    { label: 'Union', color: 'var(--edge-spouse)', dash: undefined },
                                    { label: 'Fratrie', color: 'var(--edge-sibling)', dash: '2 3' },
                                ].map((item) => (
                                    <span key={item.label} className="flex items-center gap-1.5">
                                        <svg width="18" height="2">
                                            <line x1="0" y1="1" x2="18" y2="1" stroke={item.color} strokeWidth="2" strokeDasharray={item.dash} />
                                        </svg>
                                        {item.label}
                                    </span>
                                ))}
                            </div>
                            <p className="text-[10px] text-[var(--color-ink-muted)] opacity-70">
                                Survol d'une carte : + pour ajouter, ◎ pour l'orbite · F recentre · Échap ferme
                            </p>
                        </div>

                        <button
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => openAddModal(null)}
                            className="absolute bottom-5 flex items-center justify-center rounded-full shadow-lg transition-all hover:scale-105"
                            style={{
                                width: 48,
                                height: 48,
                                background: 'var(--color-accent)',
                                color: 'var(--color-bg)',
                                right: selectedPerson ? 340 : 20,
                                transitionDuration: 'var(--transition-base)',
                            }}
                            aria-label="Ajouter une personne"
                        >
                            <span className="text-2xl leading-none">+</span>
                        </button>
                    </>
                )}

                <PersonPanel
                    person={selectedPerson}
                    persons={persons}
                    relationships={relationships}
                    onClose={() => setSelectedId(null)}
                    onAddRelative={(id) => openAddModal(id, 'child')}
                    onFocusRadial={toggleRadial}
                    onSelect={setSelectedId}
                    onSave={handleSavePerson}
                    onDelete={handleDeletePerson}
                    isRadialFocus={mode === 'radial' && focusId === selectedId}
                    editSignal={editSignal}
                />
            </div>

            {menu && <ContextMenu x={menu.x} y={menu.y} items={menuItems} onClose={() => setMenu(null)} />}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="mb-4 text-lg font-semibold">
                    {anchorPerson ? `Proche de ${anchorPerson.firstName}` : 'Ajouter une personne'}
                </h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {anchorId && (
                        <div>
                            <Label>Lien</Label>
                            <div className="flex gap-1.5">
                                {(['parent', 'spouse', 'child'] as RelKind[]).map((kind) => (
                                    <button
                                        key={kind}
                                        type="button"
                                        onClick={() => setRelKind(kind)}
                                        className="flex-1 rounded-[var(--radius-sm)] border px-2 py-2 text-xs transition-colors"
                                        style={{
                                            borderColor: relKind === kind ? 'var(--color-ink)' : 'var(--color-border)',
                                            background: relKind === kind ? 'var(--color-bg)' : 'transparent',
                                            color: 'var(--color-ink)',
                                        }}
                                    >
                                        {KIND_LABEL[kind]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {candidates.length > 0 && (
                        <div className="flex gap-1.5 text-xs">
                            <button
                                type="button"
                                onClick={() => setUseExisting(false)}
                                className="flex-1 rounded-[var(--radius-sm)] border px-2 py-1.5 transition-colors"
                                style={{
                                    borderColor: !useExisting ? 'var(--color-ink)' : 'var(--color-border)',
                                    color: 'var(--color-ink)',
                                }}
                            >
                                Nouvelle personne
                            </button>
                            <button
                                type="button"
                                onClick={() => setUseExisting(true)}
                                className="flex-1 rounded-[var(--radius-sm)] border px-2 py-1.5 transition-colors"
                                style={{
                                    borderColor: useExisting ? 'var(--color-ink)' : 'var(--color-border)',
                                    color: 'var(--color-ink)',
                                }}
                            >
                                Personne existante
                            </button>
                        </div>
                    )}

                    {useExisting ? (
                        <div>
                            <Label htmlFor="existing">Qui ?</Label>
                            <select
                                id="existing"
                                value={existingId}
                                onChange={(e) => setExistingId(e.target.value)}
                                className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-sm text-[var(--color-ink)]"
                                required
                            >
                                <option value="">Choisir…</option>
                                {candidates.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.firstName} {p.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <Label htmlFor="m-first">Prénom</Label>
                                <Input id="m-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} autoFocus required />
                            </div>
                            <div className="flex-1">
                                <Label htmlFor="m-last">Nom</Label>
                                <Input id="m-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                            </div>
                        </div>
                    )}

                    {relKind === 'child' && partnerName && (
                        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[var(--color-ink-muted)]">
                            <input
                                type="checkbox"
                                checked={linkPartner}
                                onChange={(e) => setLinkPartner(e.target.checked)}
                                className="accent-[var(--color-accent)]"
                            />
                            Aussi enfant de {partnerName}
                        </label>
                    )}

                    {formError && <p className="text-sm text-[var(--color-error)]">{formError}</p>}

                    <div className="mt-1 flex justify-end gap-2">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving ? 'Ajout…' : 'Ajouter'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}