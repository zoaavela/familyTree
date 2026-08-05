import { Body, Controller, Delete, Get, Param, Post, Patch, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { RelationshipsService } from './relationships.service';
import { CreateRelationshipDto } from './dto/create-relationship.dto';
import { UpdateRelationshipDto } from './dto/update-relationship.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
    user: { userId: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('trees/:treeId/relationships')
export class RelationshipsController {
    constructor(private relationshipsService: RelationshipsService) { }

    @Post()
    create(@Req() req: AuthenticatedRequest, @Param('treeId') treeId: string, @Body() dto: CreateRelationshipDto) {
        return this.relationshipsService.create(req.user.userId, treeId, dto);
    }

    @Get()
    findAll(@Req() req: AuthenticatedRequest, @Param('treeId') treeId: string) {
        return this.relationshipsService.findAllForTree(req.user.userId, treeId);
    }

    @Delete(':id')
    remove(@Req() req: AuthenticatedRequest, @Param('treeId') treeId: string, @Param('id') id: string) {
        return this.relationshipsService.remove(req.user.userId, treeId, id);
    }

    @Patch(':id')
    update(
        @Req() req: AuthenticatedRequest,
        @Param('treeId') treeId: string,
        @Param('id') id: string,
        @Body() dto: UpdateRelationshipDto,
    ) {
        return this.relationshipsService.update(req.user.userId, treeId, id, dto);
    }
}