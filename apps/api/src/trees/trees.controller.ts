import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TreesService } from './trees.service';
import { CreateTreeDto } from './dto/create-tree.dto';
import { UpdateTreeDto } from './dto/update-tree.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
    user: { userId: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('trees')
export class TreesController {
    constructor(private treesService: TreesService) { }

    @Post()
    create(@Req() req: AuthenticatedRequest, @Body() dto: CreateTreeDto) {
        return this.treesService.create(req.user.userId, dto);
    }

    @Get()
    findAll(@Req() req: AuthenticatedRequest) {
        return this.treesService.findAllForUser(req.user.userId);
    }

    @Get(':id')
    findOne(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        return this.treesService.findOne(req.user.userId, id);
    }

    @Patch(':id')
    update(@Req() req: AuthenticatedRequest, @Param('id') id: string, @Body() dto: UpdateTreeDto) {
        return this.treesService.update(req.user.userId, id, dto);
    }

    @Delete(':id')
    remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
        return this.treesService.remove(req.user.userId, id);
    }
}