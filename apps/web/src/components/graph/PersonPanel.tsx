import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Button, Input, Label } from '@familytree/ui';
import type { Person, Relationship } from '../../lib/api';
import { getRelatives } from '../../lib/graph/siblings';

interface Props {
    person: Person | null;
    persons: Person[];
    relationships: Relationship[];
    onClose: () => void;
    onAddRelative: (id: string) => void;
    onFocusRadial: (id: string) => void;
    onSelect: (id: string) => void;
    onSave: (id: string, data: Record<string, string | undefined>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
    isRadialFocus: boolean;
    editSignal?: number;
}

const dateValue = (iso: string | null) => (iso ? iso.slice(0, 10) : '');

export function PersonPanel({
    person,
    persons,
    relationships,
    onClose,
    onAddRelative,
    onFocusRadial,
    onSelect,
    onSave,
    onDelete,
    isRadialFocus,
    editSignal,
}: Props) {
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        birthDate: '',
        deathDate: '',
        birthPlace: '',
        biography: '',
    });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (editSignal) setEditing(true);
    }, [editSignal]);

    useEffect(() => {
        setEditing(false);
        setError(null);
        if (person) {
            setForm({
                firstName: person.firstName,
                lastName: person.lastName ?? '',
                birthDate: dateValue(person.birthDate),
                deathDate: dateValue(person.deathDate),
                birthPlace: person.birthPlace ?? '',
                biography: person.biography ?? '',
            });
        }
    }, [person]);

    if (!person) return null;

    const rel = getRelatives(person.id, relationships);
    const nameOf = (id: string) => {
        const p = persons.find((p) => p.id === id);
        return p ? `${p.firstName} ${p.lastName ?? ''}`.trim() : '—';
    };

    const groups = [
        { label: 'Parents', ids: rel.parents },
        { label: 'Frères & sœurs', ids: rel.siblings },
        { label: 'Conjoint·e·s', ids: rel.spouses },
        { label: 'Enfants', ids: rel.children },
    ].filter((g) => g.ids.length > 0);

    async function handleSave(e: FormEvent) {
        e.preventDefault();
        if (!person) return;
        setSaving(true);
        setError(null);
        try {
            await onSave(person.id, {
                firstName: form.firstName,
                lastName: form.lastName || undefined,
                birthDate: form.birthDate || undefined,
                deathDate: form.deathDate || undefined,
                birthPlace: form.birthPlace || undefined,
                biography: form.biography || undefined,
            });
            setEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erreur inconnue');
        } finally {
            setSaving(false);
        }
    }

    const birth = person.birthDate ? new Date(person.birthDate).toLocaleDateString('fr-FR') : null;
    const death = person.deathDate ? new Date(person.deathDate).toLocaleDateString('fr-FR') : null;

    return (
        <aside
            onPointerDown={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 z-20 flex h-full w-[320px] flex-col overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-5"
            style={{ animation: 'slideInRight 220ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
            <div className="mb-5 flex items-start justify-between gap-2">
                <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold">
                        {person.firstName} {person.lastName}
                    </h2>
                    {(birth || death) && (
                        <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                            {birth ?? '?'} — {death ?? "aujourd'hui"}
                        </p>
                    )}
                </div>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="shrink-0 rounded-[var(--radius-sm)] px-2 py-1 text-[var(--color-ink-muted)] transition-colors hover:bg-[var(--color-bg)] hover:text-[var(--color-ink)]"
                    aria-label="Fermer"
                >
                    ✕
                </button>
            </div>

            {editing ? (
                <form onSubmit={handleSave} className="flex flex-col gap-3">
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Label htmlFor="p-first">Prénom</Label>
                            <Input
                                id="p-first"
                                value={form.firstName}
                                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="p-last">Nom</Label>
                            <Input
                                id="p-last"
                                value={form.lastName}
                                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1">
                            <Label htmlFor="p-birth">Naissance</Label>
                            <Input
                                id="p-birth"
                                type="date"
                                value={form.birthDate}
                                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                            />
                        </div>
                        <div className="flex-1">
                            <Label htmlFor="p-death">Décès</Label>
                            <Input
                                id="p-death"
                                type="date"
                                value={form.deathDate}
                                onChange={(e) => setForm({ ...form, deathDate: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="p-place">Lieu de naissance</Label>
                        <Input
                            id="p-place"
                            value={form.birthPlace}
                            onChange={(e) => setForm({ ...form, birthPlace: e.target.value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="p-bio">Biographie</Label>
                        <textarea
                            id="p-bio"
                            value={form.biography}
                            onChange={(e) => setForm({ ...form, biography: e.target.value })}
                            rows={4}
                            className="w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 py-2 text-sm text-[var(--color-ink)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                    </div>
                    {error && <p className="text-sm text-[var(--color-error)]">{error}</p>}
                    <div className="flex gap-2">
                        <Button type="submit" disabled={saving} className="flex-1">
                            {saving ? 'Enregistrement…' : 'Enregistrer'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
                            Annuler
                        </Button>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            if (confirm(`Supprimer ${person.firstName} et ses liens ?`)) onDelete(person.id);
                        }}
                        className="mt-1 text-xs text-[var(--color-error)] hover:underline"
                    >
                        Supprimer cette personne
                    </button>
                </form>
            ) : (
                <>
                    {person.birthPlace && (
                        <p className="mb-3 text-[13px] text-[var(--color-ink-muted)]">📍 {person.birthPlace}</p>
                    )}
                    {person.biography && (
                        <p className="mb-4 whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
                            {person.biography}
                        </p>
                    )}

                    <div className="mb-6 flex flex-col gap-2">
                        <Button onClick={() => onAddRelative(person.id)} className="w-full">
                            Ajouter un proche
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => setEditing(true)} className="flex-1">
                                Modifier
                            </Button>
                            <Button variant="secondary" onClick={() => onFocusRadial(person.id)} className="flex-1">
                                {isRadialFocus ? 'Hiérarchie' : 'Orbite'}
                            </Button>
                        </div>
                    </div>

                    {groups.length === 0 ? (
                        <p className="text-xs text-[var(--color-ink-muted)]">Aucun proche enregistré.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {groups.map((group) => (
                                <div key={group.label}>
                                    <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-[var(--color-ink-muted)]">
                                        {group.label}
                                    </p>
                                    <div className="flex flex-col gap-0.5">
                                        {group.ids.map((id) => (
                                            <button
                                                key={id}
                                                onClick={() => onSelect(id)}
                                                className="rounded-[var(--radius-sm)] px-2 py-1.5 text-left text-[13px] text-[var(--color-ink)] transition-colors hover:bg-[var(--color-bg)]"
                                            >
                                                {nameOf(id)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </aside>
    );
}