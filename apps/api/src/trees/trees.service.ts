import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTreeDto } from './dto/create-tree.dto';
import { UpdateTreeDto } from './dto/update-tree.dto';

@Injectable()
export class TreesService {
    constructor(private prisma: PrismaService) { }

    create(userId: string, dto: CreateTreeDto) {
        return this.prisma.tree.create({
            data: {
                ownerId: userId,
                title: dto.title,
                description: dto.description,
                type: dto.type,
                visibility: dto.visibility ?? 'PRIVATE',
            },
        });
    }

    findAllForUser(userId: string) {
        return this.prisma.tree.findMany({
            where: { ownerId: userId },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async findOne(userId: string, treeId: string) {
        const tree = await this.prisma.tree.findUnique({ where: { id: treeId } });
        if (!tree) throw new NotFoundException('Arbre introuvable');
        if (tree.ownerId !== userId) throw new ForbiddenException('Accès refusé');
        return tree;
    }

    async update(userId: string, treeId: string, dto: UpdateTreeDto) {
        await this.findOne(userId, treeId); // vérifie existence + droits
        return this.prisma.tree.update({ where: { id: treeId }, data: dto });
    }

    async remove(userId: string, treeId: string) {
        await this.findOne(userId, treeId);
        await this.prisma.tree.delete({ where: { id: treeId } });
        return { success: true };
    }
}