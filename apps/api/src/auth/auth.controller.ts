import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UsersService } from '../users/users.service';

interface AuthenticatedRequest extends Request {
  user: { userId: string; email: string };
}

const COOKIE = 'ft_refresh';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  private setCookie(res: Response, token: string, expiresAt: Date) {
    res.cookie(COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/auth',
      expires: expiresAt,
    });
  }

  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, refreshExpiresAt } = await this.authService.register(
      dto.email,
      dto.password,
      dto.displayName,
    );
    this.setCookie(res, refreshToken, refreshExpiresAt);
    return { accessToken };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, refreshExpiresAt } = await this.authService.login(
      dto.email,
      dto.password,
    );
    this.setCookie(res, refreshToken, refreshExpiresAt);
    return { accessToken };
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { accessToken, refreshToken, refreshExpiresAt } = await this.authService.refresh(
      req.cookies?.[COOKIE],
    );
    this.setCookie(res, refreshToken, refreshExpiresAt);
    return { accessToken };
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.cookies?.[COOKIE]);
    res.clearCookie(COOKIE, { path: '/auth' });
    return { success: true };
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