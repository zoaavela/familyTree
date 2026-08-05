import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';

@Injectable()
export class RelationshipsService {
    constructor(private prisma: PrismaService) { }

    private async assertTreeAccess(userId: string, treeId: string) {
        const tree = await this.prisma.tree.findUnique({ where: { id: treeId } });
        if (!tree) throw new NotFoundException('Arbre introuvable');
        if (tree.ownerId !== userId) throw new ForbiddenException('Accès refusé');
    }

    // Vérifie si `targetId` est un ancêtre de `personId` (remonte via PARENT_OF)
    private async isAncestor(treeId: string, personId: string, targetId: string): Promise<boolean> {
        const parents = await this.prisma.relationship.findMany({
            where: { treeId, personBId: personId, type: 'PARENT_OF' },
            select: { personAId: true },
        });
        for (const p of parents) {
            if (p.personAId === targetId) return true;
            if (await this.isAncestor(treeId, p.personAId, targetId)) return true;
        }
        return false;
    }

    async create(userId: string, treeId: string, dto: CreateRelationshipDto) {
        await this.assertTreeAccess(userId, treeId);

        if (dto.personAId === dto.personBId) {
            throw new BadRequestException('Une personne ne peut pas être liée à elle-même');
        }

        const [personA, personB] = await Promise.all([
            this.prisma.person.findUnique({ where: { id: dto.personAId } }),
            this.prisma.person.findUnique({ where: { id: dto.personBId } }),
        ]);
        if (!personA || personA.treeId !== treeId) throw new NotFoundException('Personne A introuvable');
        if (!personB || personB.treeId !== treeId) throw new NotFoundException('Personne B introuvable');

        if (dto.type === 'PARENT_OF') {
            // personA devient parent de personB : vérifie que personA n'est pas déjà descendant de personB
            const wouldCreateCycle = await this.isAncestor(treeId, dto.personAId, dto.personBId);
            if (wouldCreateCycle) {
                throw new BadRequestException(
                    'Cette relation créerait un cycle (une personne ne peut pas être son propre ancêtre)',
                );
            }
        }

        return this.prisma.relationship.create({
            data: {
                treeId,
                personAId: dto.personAId,
                personBId: dto.personBId,
                type: dto.type,
                startDate: dto.startDate ? new Date(dto.startDate) : undefined,
                endDate: dto.endDate ? new Date(dto.endDate) : undefined,
            },
        });
    }

    async findAllForTree(userId: string, treeId: string) {
        await this.assertTreeAccess(userId, treeId);
        return this.prisma.relationship.findMany({ where: { treeId } });
    }

    async remove(userId: string, treeId: string, relationshipId: string) {
        await this.assertTreeAccess(userId, treeId);
        const rel = await this.prisma.relationship.findUnique({ where: { id: relationshipId } });
        if (!rel || rel.treeId !== treeId) throw new NotFoundException('Relation introuvable');
        await this.prisma.relationship.delete({ where: { id: relationshipId } });
        return { success: true };
    }

    async update(userId: string, treeId: string, relationshipId: string, dto: UpdateRelationshipDto) {
        await this.assertTreeAccess(userId, treeId);
        const rel = await this.prisma.relationship.findUnique({ where: { id: relationshipId } });
        if (!rel || rel.treeId !== treeId) throw new NotFoundException('Relation introuvable');

        return this.prisma.relationship.update({
            where: { id: relationshipId },
            data: {
                startDate: dto.startDate ? new Date(dto.startDate) : null,
                endDate: dto.endDate ? new Date(dto.endDate) : null,
            },
        });
    }
}