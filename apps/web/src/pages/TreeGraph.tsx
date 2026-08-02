import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ReactFlow, Background, Controls, MiniMap, type Node, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Button, Input, Label, Modal } from '@familytree/ui';
import { api, type Person, type Relationship } from '../lib/api';
import { getToken } from '../lib/AuthContext';
import { layoutGraph } from '../lib/layout';
import { PersonNode } from '../components/PersonNode';

const nodeTypes = { person: PersonNode };

export function TreeGraph() {
    const { treeId } = useParams<{ treeId: string }>();
    const [persons, setPersons] = useState<Person[]>([]);
    const [relationships, setRelationships] = useState<Relationship[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    async function load() {
        const token = getToken();
        if (!token || !treeId) return;
        const [p, r] = await Promise.all([
            api.listPersons(token, treeId),
            api.listRelationships(token, treeId),
        ]);
        setPersons(p);
        setRelationships(r);
        setLoading(false);
    }

    useEffect(() => {
        load();
    }, [treeId]);

    async function handleAddPerson(e: FormEvent) {
        e.preventDefault();
        const token = getToken();
        if (!token || !treeId || !firstName.trim()) return;
        await api.createPerson(token, treeId, { firstName, lastName: lastName || undefined });
        setFirstName('');
        setLastName('');
        setModalOpen(false);
        await load();
    }

    const { nodes, edges } = useMemo(() => {
        const rawNodes: Node[] = persons.map((p) => ({
            id: p.id,
            type: 'person',
            position: { x: 0, y: 0 },
            data: {
                firstName: p.firstName,
                lastName: p.lastName,
                birthDate: p.birthDate,
                deathDate: p.deathDate,
            },
        }));

        const rawEdges: Edge[] = relationships
            .filter((r) => r.type === 'PARENT_OF')
            .map((r) => ({
                id: r.id,
                source: r.personAId,
                target: r.personBId,
                type: 'smoothstep',
            }));

        return layoutGraph(rawNodes, rawEdges);
    }, [persons, relationships]);

    if (loading) return <div className="p-10 text-sm text-[var(--color-ink-muted)]">Chargement...</div>;

    return (
        <div className="h-screen w-screen flex flex-col relative">
            <div className="px-4 py-3 border-b border-[var(--color-border)] flex gap-4 items-center">
                <Link to="/trees" className="text-sm text-[var(--color-ink-muted)] underline">
                    ← Mes arbres
                </Link>
                <Link to={`/trees/${treeId}`} className="text-sm text-[var(--color-ink-muted)] underline">
                    Vue liste
                </Link>
            </div>

            <div className="flex-1" style={{ height: '100%' }}>
                {persons.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4">
                        <p className="text-sm text-[var(--color-ink-muted)]">Cet arbre est encore vide.</p>
                        <Button onClick={() => setModalOpen(true)}>Ajouter la première personne</Button>
                    </div>
                ) : (
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes}
                        fitView
                        proOptions={{ hideAttribution: true }}
                    >
                        <Background gap={20} color="var(--color-border)" />
                        <Controls showInteractive={false} />
                        <MiniMap pannable zoomable nodeColor="var(--color-accent)" />
                    </ReactFlow>
                )}
            </div>

            {persons.length > 0 && (
                <button
                    onClick={() => setModalOpen(true)}
                    className="absolute bottom-6 right-6 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                    style={{
                        width: 52,
                        height: 52,
                        background: 'var(--color-accent)',
                        color: 'var(--color-bg)',
                        transitionDuration: 'var(--transition-fast)',
                    }}
                    aria-label="Ajouter une personne"
                >
                    <span className="text-2xl leading-none">+</span>
                </button>
            )}

            <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                <h2 className="text-lg font-semibold mb-4">Ajouter une personne</h2>
                <form onSubmit={handleAddPerson} className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="modal-firstName">Prénom</Label>
                        <Input
                            id="modal-firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            autoFocus
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="modal-lastName">Nom</Label>
                        <Input id="modal-lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                    <div className="flex gap-2 justify-end mt-2">
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                            Annuler
                        </Button>
                        <Button type="submit">Ajouter</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}