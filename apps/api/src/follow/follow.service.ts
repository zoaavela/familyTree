import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowService {
  constructor(private prisma: PrismaService) {}

  async follow(followerId: string, followedId: string) {
    if (followerId === followedId) {
      throw new BadRequestException('Impossible de se suivre soi-même');
    }
    return this.prisma.follow.upsert({
      where: { followerId_followedId: { followerId, followedId } },
      create: { followerId, followedId },
      update: {},
    });
  }

  async unfollow(followerId: string, followedId: string) {
    await this.prisma.follow.deleteMany({ where: { followerId, followedId } });
    return { success: true };
  }

  async isFollowing(followerId: string, followedId: string) {
    const rel = await this.prisma.follow.findUnique({
      where: { followerId_followedId: { followerId, followedId } },
    });
    return !!rel;
  }

  async counts(userId: string) {
    const [followers, following] = await Promise.all([
      this.prisma.follow.count({ where: { followedId: userId } }),
      this.prisma.follow.count({ where: { followerId: userId } }),
    ]);
    return { followers, following };
  }

  async listFollowers(userId: string) {
    const rows = await this.prisma.follow.findMany({
      where: { followedId: userId },
      include: { follower: { select: { id: true, displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => r.follower);
  }

  async listFollowing(userId: string) {
    const rows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: { followed: { select: { id: true, displayName: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((r) => r.followed);
  }
}
