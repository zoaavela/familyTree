import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { PersonsService } from './persons.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
    user: { userId: string; email: string };
}

@UseGuards(JwtAuthGuard)
@Controller('trees/:treeId/persons')
export class PersonsController {
    constructor(private personsService: PersonsService) { }

    @Post()
    create(@Req() req: AuthenticatedRequest, @Param('treeId') treeId: string, @Body() dto: CreatePersonDto) {
        return this.personsService.create(req.user.userId, treeId, dto);
    }

    @Get()
    findAll(@Req() req: AuthenticatedRequest, @Param('treeId') treeId: string) {
        return this.personsService.findAllForTree(req.user.userId, treeId);
    }

    @Get(':id')
    findOne(@Req() req: AuthenticatedRequest, @Param('treeId') treeId: string, @Param('id') id: string) {
        return this.personsService.findOne(req.user.userId, treeId, id);
    }

    @Patch(':id')
    update(
        @Req() req: AuthenticatedRequest,
        @Param('treeId') treeId: string,
        @Param('id') id: string,
        @Body() dto: UpdatePersonDto,
    ) {
        return this.personsService.update(req.user.userId, treeId, id, dto);
    }

    @Delete(':id')
    remove(@Req() req: AuthenticatedRequest, @Param('treeId') treeId: string, @Param('id') id: string) {
        return this.personsService.remove(req.user.userId, treeId, id);
    }
}