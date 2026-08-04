import {
    Controller,
    Post,
    Delete,
    Param,
    Req,
    UseGuards,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StorageService } from './storage.service';
import { PrismaService } from '../prisma/prisma.service';

interface AuthenticatedRequest extends Request {
    user: { userId: string; email: string };
}

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@UseGuards(JwtAuthGuard)
@Controller('trees/:treeId/persons/:personId/photo')
export class MediaController {
    constructor(
        private storage: StorageService,
        private prisma: PrismaService,
    ) { }

    private async assertAccess(userId: string, treeId: string, personId: string) {
        const tree = await this.prisma.tree.findUnique({ where: { id: treeId } });
        if (!tree) throw new NotFoundException('Arbre introuvable');
        if (tree.ownerId !== userId) throw new ForbiddenException('Accès refusé');
        const person = await this.prisma.person.findUnique({ where: { id: personId } });
        if (!person || person.treeId !== treeId) throw new NotFoundException('Personne introuvable');
        return person;
    }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async upload(
        @Req() req: AuthenticatedRequest,
        @Param('treeId') treeId: string,
        @Param('personId') personId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) throw new BadRequestException('Aucun fichier reçu');
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
            throw new BadRequestException('Format non supporté (jpeg, png, webp uniquement)');
        }
        if (file.size > MAX_SIZE) throw new BadRequestException('Fichier trop volumineux (5 Mo max)');

        const person = await this.assertAccess(req.user.userId, treeId, personId);

        if (person.photoUrl) {
            await this.storage.deleteImage(person.photoUrl).catch(() => { });
        }

        const url = await this.storage.uploadImage(file.buffer, file.mimetype, `persons/${personId}`);

        return this.prisma.person.update({ where: { id: personId }, data: { photoUrl: url } });
    }

    @Delete()
    async remove(
        @Req() req: AuthenticatedRequest,
        @Param('treeId') treeId: string,
        @Param('personId') personId: string,
    ) {
        const person = await this.assertAccess(req.user.userId, treeId, personId);
        if (person.photoUrl) {
            await this.storage.deleteImage(person.photoUrl).catch(() => { });
        }
        return this.prisma.person.update({ where: { id: personId }, data: { photoUrl: null } });
    }
}