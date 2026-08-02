import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

interface AuthenticatedRequest extends Request {
    user: { userId: string; email: string };
}

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService,
    ) { }

    @Post('register')
    register(@Body() dto: RegisterDto) {
        return this.authService.register(dto.email, dto.password, dto.displayName);
    }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto.email, dto.password);
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async me(@Req() req: AuthenticatedRequest) {
        const user = await this.usersService.findById(req.user.userId);
        if (!user) return null;
        const { passwordHash, ...safeUser } = user;
        return safeUser;
    }
}