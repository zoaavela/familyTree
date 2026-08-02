import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button, Input, Card, Label } from '@familytree/ui';
import { api, type Person, type Relationship } from '../lib/api';
import { getToken } from '../lib/AuthContext';

export function TreeDetail() {
    const { treeId } = useParams<{ treeId: string }>();
    const [persons, setPersons] = useState<Person[]>([]);
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [personAId, setPersonAId] = useState('');
    const [personBId, setPersonBId] = useState('');
    const [relType, setRelType] = useState<'PARENT_OF' | 'SPOUSE_OF'>('PARENT_OF');
    const [relError, setRelError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [treeId]);

    async function loadData() {
        const token = getToken();
        if (!token || !treeId) return;
        setLoading(true);
        const [p, r] = await Promise.all([
            api.listPersons(token, treeId),
            api.listRelationships(token, treeId),
        ]);
        setPersons(p);
        setRelationships(r);
        setLoading(false);
    }

    async function handleAddPerson(e: FormEvent) {
        e.preventDefault();
        const token = getToken();
        if (!token || !treeId || !firstName.trim()) return;
        await api.createPerson(token, treeId, { firstName, lastName: lastName || undefined });
        setFirstName('');
        setLastName('');
        await loadData();
    }

    async function handleAddRelationship(e: FormEvent) {
        e.preventDefault();
        setRelError(null);
        const token = getToken();
        if (!token || !treeId || !personAId || !personBId) return;
        try {
            await api.createRelationship(token, treeId, { personAId, personBId, type: relType });
            setPersonAId('');
            setPersonBId('');
            await loadData();
        } catch (err) {
            setRelError(err instanceof Error ? err.message : 'Erreur inconnue');
        }
    }

    function personName(id: string) {
        const p = persons.find((p) => p.id === id);
        return p ? `${p.firstName} ${p.lastName ?? ''}`.trim() : id;
    }

    if (loading) return <div className="p-10 text-sm text-[var(--color-ink-muted)]">Chargement...</div>;

    return (
        <div className="min-h-screen px-4 py-10 max-w-3xl mx-auto">
            <Link to="/" className="text-sm text-[var(--color-ink-muted)] underline mb-4 inline-block">
                ← Mes arbres
            </Link>
            <Link to={`/trees/${treeId}/graph`} className="text-sm text-[var(--color-ink-muted)] underline mb-4 ml-4 inline-block">
                Vue graphique →
            </Link>
            <h1 className="text-xl font-semibold mb-6">Personnes ({persons.length})</h1>

            <Card className="mb-8">
                <form onSubmit={handleAddPerson} className="flex gap-3 items-end flex-wrap">
                    <div className="flex-1 min-w-[140px]">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="flex-1 min-w-[140px]">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                    <Button type="submit">Ajouter</Button>
                </form>
            </Card>

            <div className="flex flex-col gap-2 mb-10">
                {persons.map((p) => (
                    <Card key={p.id} className="flex justify-between items-center py-2.5">
                        <span className="text-sm font-medium">
                            {p.firstName} {p.lastName}
                        </span>
                        <span className="text-xs text-[var(--color-ink-muted)]">{p.id.slice(0, 8)}</span>
                    </Card>
                ))}
            </div>

            <h2 className="text-lg font-semibold mb-4">Relations</h2>

            <Card className="mb-8">
                <form onSubmit={handleAddRelationship} className="flex flex-col gap-3">
                    <div className="flex gap-3 flex-wrap">
                        <div className="flex-1 min-w-[160px]">
                            <Label htmlFor="personA">Personne A</Label>
                            <select
                                id="personA"
                                value={personAId}
                                onChange={(e) => setPersonAId(e.target.value)}
                                className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-sm text-[var(--color-ink)]"
                            >
                                <option value="">Choisir...</option>
                                {persons.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.firstName} {p.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[160px]">
                            <Label htmlFor="relType">Relation</Label>
                            <select
                                id="relType"
                                value={relType}
                                onChange={(e) => setRelType(e.target.value as 'PARENT_OF' | 'SPOUSE_OF')}
                                className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-sm text-[var(--color-ink)]"
                            >
                                <option value="PARENT_OF">est parent de</option>
                                <option value="SPOUSE_OF">est conjoint de</option>
                            </select>
                        </div>
                        <div className="flex-1 min-w-[160px]">
                            <Label htmlFor="personB">Personne B</Label>
                            <select
                                id="personB"
                                value={personBId}
                                onChange={(e) => setPersonBId(e.target.value)}
                                className="h-10 w-full rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-sm text-[var(--color-ink)]"
                            >
                                <option value="">Choisir...</option>
                                {persons.map((p) => (
                                    <option key={p.id} value={p.id}>
                                        {p.firstName} {p.lastName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    {relError && <p className="text-sm text-[var(--color-error)]">{relError}</p>}
                    <Button type="submit" className="self-start">
                        Lier
                    </Button>
                </form>
            </Card>

            <div className="flex flex-col gap-2">
                {relationships.map((r) => (
                    <Card key={r.id} className="text-sm py-2.5">
                        {personName(r.personAId)}{' '}
                        <span className="text-[var(--color-ink-muted)]">
                            {r.type === 'PARENT_OF' ? '→ parent de →' : '↔ conjoint de ↔'}
                        </span>{' '}
                        {personName(r.personBId)}
                    </Card>
                ))}
            </div>
        </div>
    );
}