import {
  Body,
  Controller,
  Delete,
  Patch,
  Post,
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

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@UseGuards(JwtAuthGuard)
@Controller('users/me')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private storage: StorageService,
  ) {}

  @Patch()
  async update(@Req() req: AuthenticatedRequest, @Body() dto: UpdateProfileDto) {
    const user = await this.usersService.updateProfile(req.user.userId, dto);
    const { passwordHash, ...safe } = user;
    return safe;
  }

  @Post('avatar')
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

  @Delete('avatar')
  async removeAvatar(@Req() req: AuthenticatedRequest) {
    const current = await this.usersService.findById(req.user.userId);
    if (current?.avatarUrl) {
      await this.storage.deleteImage(current.avatarUrl).catch(() => {});
    }
    const user = await this.usersService.updateAvatar(req.user.userId, null);
    const { passwordHash, ...safe } = user;
    return safe;
  }
}
