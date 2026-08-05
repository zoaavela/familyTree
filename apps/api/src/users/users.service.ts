import { Injectable, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../media/storage.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService, private storage: StorageService) { }

    async create(email: string, password: string, displayName: string) {
        const existing = await this.prisma.user.findUnique({ where: { email } });
        if (existing) {
            throw new ConflictException('Email déjà utilisé');
        }
        const passwordHash = await bcrypt.hash(password, 10);
        return this.prisma.user.create({
            data: { email, passwordHash, displayName },
        });
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async findById(id: string) {
        return this.prisma.user.findUnique({ where: { id } });
    }

    async updateProfile(userId: string, data: { displayName?: string; bio?: string }) {
        return this.prisma.user.update({ where: { id: userId }, data });
    }

    async updateAvatar(userId: string, avatarUrl: string | null) {
        return this.prisma.user.update({ where: { id: userId }, data: { avatarUrl } });
    }

    async findVisibleTrees(profileUserId: string, viewerId: string, isSelf: boolean) {
        if (isSelf) {
            return this.prisma.tree.findMany({
                where: { ownerId: profileUserId },
                orderBy: { updatedAt: 'desc' },
            });
        }

        const collaboratedTreeIds = await this.prisma.treeCollaborator.findMany({
            where: { userId: viewerId },
            select: { treeId: true },
        });

        return this.prisma.tree.findMany({
            where: {
                ownerId: profileUserId,
                OR: [
                    { visibility: 'PUBLIC' },
                    { id: { in: collaboratedTreeIds.map((c) => c.treeId) } },
                ],
            },
            orderBy: { updatedAt: 'desc' },
        });
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.passwordHash) {
            throw new BadRequestException('Ce compte utilise une connexion externe');
        }
        const valid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!valid) throw new UnauthorizedException('Mot de passe actuel incorrect');

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
        await this.prisma.refreshToken.deleteMany({ where: { userId } });
        return { success: true };
    }

    async changeEmail(userId: string, newEmail: string, password: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.passwordHash) {
            throw new BadRequestException('Ce compte utilise une connexion externe');
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) throw new UnauthorizedException('Mot de passe incorrect');

        const existing = await this.prisma.user.findUnique({ where: { email: newEmail } });
        if (existing && existing.id !== userId) {
            throw new ConflictException('Cet email est déjà utilisé');
        }

        return this.prisma.user.update({ where: { id: userId }, data: { email: newEmail } });
    }

    async exportData(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                displayName: true,
                avatarUrl: true,
                bio: true,
                createdAt: true,
            },
        });

        const trees = await this.prisma.tree.findMany({
            where: { ownerId: userId },
            include: {
                persons: true,
                relationships: true,
                media: true,
                collaborators: { include: { user: { select: { id: true, displayName: true } } } },
            },
        });

        const following = await this.prisma.follow.findMany({
            where: { followerId: userId },
            include: { followed: { select: { id: true, displayName: true } } },
        });

        const followers = await this.prisma.follow.findMany({
            where: { followedId: userId },
            include: { follower: { select: { id: true, displayName: true } } },
        });

        return {
            exportedAt: new Date().toISOString(),
            account: user,
            trees,
            following: following.map((f) => f.followed),
            followers: followers.map((f) => f.follower),
        };
    }

    async deleteAccount(userId: string, password: string, treesService: { remove: (uid: string, tid: string) => Promise<unknown> }) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user?.passwordHash) {
            throw new BadRequestException('Ce compte utilise une connexion externe');
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) throw new UnauthorizedException('Mot de passe incorrect');

        if (user.avatarUrl) {
            await this.storage.deleteImage(user.avatarUrl).catch(() => { });
        }

        const ownedTrees = await this.prisma.tree.findMany({ where: { ownerId: userId }, select: { id: true } });
        for (const tree of ownedTrees) {
            await treesService.remove(userId, tree.id);
        }

        await this.prisma.user.delete({ where: { id: userId } });
        return { success: true };
    }
}