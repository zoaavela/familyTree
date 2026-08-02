import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PersonsService {
    constructor(private prisma: PrismaService) { }

    private async assertTreeAccess(userId: string, treeId: string) {
        const tree = await this.prisma.tree.findUnique({ where: { id: treeId } });
        if (!tree) throw new NotFoundException('Arbre introuvable');
        if (tree.ownerId !== userId) throw new ForbiddenException('Accès refusé');
        return tree;
    }

    async create(userId: string, treeId: string, dto: CreatePersonDto) {
        await this.assertTreeAccess(userId, treeId);
        return this.prisma.person.create({
            data: {
                treeId,
                createdBy: userId,
                firstName: dto.firstName,
                lastName: dto.lastName,
                gender: dto.gender ?? 'UNKNOWN',
                birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
                deathDate: dto.deathDate ? new Date(dto.deathDate) : undefined,
                birthPlace: dto.birthPlace,
                deathPlace: dto.deathPlace,
                biography: dto.biography,
                metadata: dto.metadata as any,
            },
        });
    }

    async findAllForTree(userId: string, treeId: string) {
        await this.assertTreeAccess(userId, treeId);
        return this.prisma.person.findMany({ where: { treeId }, orderBy: { createdAt: 'asc' } });
    }

    async findOne(userId: string, treeId: string, personId: string) {
        await this.assertTreeAccess(userId, treeId);
        const person = await this.prisma.person.findUnique({ where: { id: personId } });
        if (!person || person.treeId !== treeId) throw new NotFoundException('Personne introuvable');
        return person;
    }

    async update(userId: string, treeId: string, personId: string, dto: UpdatePersonDto) {
        await this.findOne(userId, treeId, personId);
        return this.prisma.person.update({
            where: { id: personId },
            data: {
                ...dto,
                metadata: dto.metadata as any,
                birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
                deathDate: dto.deathDate ? new Date(dto.deathDate) : undefined,
            },
        });
    }

    async remove(userId: string, treeId: string, personId: string) {
        await this.findOne(userId, treeId, personId);
        await this.prisma.person.delete({ where: { id: personId } });
        return { success: true };
    }
}