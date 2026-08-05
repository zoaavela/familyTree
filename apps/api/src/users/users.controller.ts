import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Param,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { StorageService } from '../media/storage.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ChangeEmailDto } from './dto/change-email.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { TreesService } from '../trees/trees.service';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private storage: StorageService,
    private treesService: TreesService,
  ) {}

  @Patch('me')
  async update(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(req.user.userId, dto);
    const { passwordHash, ...safe } = user;
    return safe;
  }

  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Req() req: AuthenticatedRequest, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Aucun fichier reçu');
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Format non supporté (jpeg, png, webp uniquement)');
    }
    if (file.size > MAX_SIZE) throw new BadRequestException('Fichier trop volumineux (5 Mo max)');

    const current = await this.usersService.findById(req.user.userId);
    if (current?.avatarUrl) {
      await this.storage.deleteImage(current.avatarUrl).catch(() => {});
    }

    const url = await this.storage.uploadImage(file.buffer, file.mimetype, `avatars/${req.user.userId}`);
    const user = await this.usersService.updateAvatar(req.user.userId, url);
    const { passwordHash, ...safe } = user;
    return safe;
  }

  @Delete('me/avatar')
  async removeAvatar(@Req() req: AuthenticatedRequest) {
    const current = await this.usersService.findById(req.user.userId);
    if (current?.avatarUrl) {
      await this.storage.deleteImage(current.avatarUrl).catch(() => {});
    }
    const user = await this.usersService.updateAvatar(req.user.userId, null);
    const { passwordHash, ...safe } = user;
    return safe;
  }

  @Patch('password')
  changePassword(@Req() req: AuthenticatedRequest, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, dto.currentPassword, dto.newPassword);
  }

  @Patch('email')
  async changeEmail(@Req() req: AuthenticatedRequest, @Body() dto: ChangeEmailDto) {
    const user = await this.usersService.changeEmail(req.user.userId, dto.newEmail, dto.password);
    const { passwordHash, ...safe } = user;
    return safe;
  }

  @Get('export')
  exportData(@Req() req: AuthenticatedRequest) {
    return this.usersService.exportData(req.user.userId);
  }

  @Delete()
  deleteAccount(@Req() req: AuthenticatedRequest, @Body() dto: DeleteAccountDto) {
    return this.usersService.deleteAccount(req.user.userId, dto.password, this.treesService);
  }

  @Get(':id')
  async getPublicProfile(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const user = await this.usersService.findById(id);
    if (!user) return null;
    const isSelf = req.user.userId === id;
    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      createdAt: user.createdAt,
      isSelf,
    };
  }

  @Get(':id/trees')
  async getPublicTrees(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const isSelf = req.user.userId === id;
    return this.usersService.findVisibleTrees(id, req.user.userId, isSelf);
  }
}
