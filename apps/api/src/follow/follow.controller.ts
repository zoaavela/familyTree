import { Controller, Post, Delete, Get, Param, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FollowService } from './follow.service';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('users/:id')
export class FollowController {
  constructor(private followService: FollowService) {}

  @Post('follow')
  follow(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.followService.follow(req.user.userId, id);
  }

  @Delete('follow')
  unfollow(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.followService.unfollow(req.user.userId, id);
  }

  @Get('follow-status')
  async status(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    return { following: await this.followService.isFollowing(req.user.userId, id) };
  }

  @Get('follow-counts')
  counts(@Param('id') id: string) {
    return this.followService.counts(id);
  }

  @Get('followers')
  followers(@Param('id') id: string) {
    return this.followService.listFollowers(id);
  }

  @Get('following')
  following(@Param('id') id: string) {
    return this.followService.listFollowing(id);
  }
}
