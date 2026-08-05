import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

const REFRESH_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async register(email: string, password: string, displayName: string, turnstileToken: string) {
    const isHuman = await this.verifyTurnstile(turnstileToken);
    if (!isHuman) {
      throw new BadRequestException('Vérification de sécurité échouée');
    }
    const user = await this.usersService.create(email, password, displayName);
    
    // Generate verification token and send email
    const verificationToken = randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });
    await this.mailService.sendVerificationEmail(user.email, verificationToken);

    return this.issueTokens(user.id, user.email);
  }

  private async verifyTurnstile(token: string): Promise<boolean> {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) return true; // Si pas configuré, on laisse passer (pratique pour l'environnement de dev local sans internet par ex)

    try {
      const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secret, response: token }),
      });
      const data = await res.json();
      return data.success;
    } catch {
      return false;
    }
  }

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user || !user.passwordHash) throw new UnauthorizedException('Identifiants invalides');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');
    return this.issueTokens(user.id, user.email);
  }

  async validateGoogleUser(googleProfile: any) {
    const { email, firstName, lastName, googleId } = googleProfile;
    let user = await this.usersService.findByEmail(email);

    if (user) {
      // Connect to existing user
      if (!user.googleId || !user.emailVerified) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { googleId, emailVerified: true },
        });
      }
    } else {
      // Create new user
      const displayName = `${firstName} ${lastName}`.trim() || email.split('@')[0];
      user = await this.prisma.user.create({
        data: {
          email,
          displayName,
          googleId,
          emailVerified: true,
        },
      });
    }

    return user;
  }

  async googleLogin(user: any) {
    return this.issueTokens(user.id, user.email);
  }

  async verifyEmail(token: string) {
    const verification = await this.prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verification || verification.expiresAt < new Date()) {
      throw new BadRequestException('Lien invalide ou expiré');
    }

    await this.prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    });

    await this.prisma.verificationToken.deleteMany({
      where: { userId: verification.userId },
    });

    return { success: true };
  }

  async resendVerification(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.emailVerified) return { success: true }; // Silently succeed

    // Delete old tokens
    await this.prisma.verificationToken.deleteMany({ where: { userId } });

    // Generate new token
    const verificationToken = randomBytes(32).toString('hex');
    await this.prisma.verificationToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    await this.mailService.sendVerificationEmail(user.email, verificationToken);
    return { success: true };
  }

  /** Rotation : l'ancien refresh token est révoqué, un nouveau est émis. */
  async refresh(token: string | undefined) {
    if (!token) throw new UnauthorizedException('Session expirée');

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException('Session expirée');
    }

    await this.prisma.refreshToken.delete({ where: { id: stored.id } });
    return this.issueTokens(stored.user.id, stored.user.email);
  }

  async logout(token: string | undefined) {
    if (token) await this.prisma.refreshToken.deleteMany({ where: { token } });
    return { success: true };
  }

  private async issueTokens(userId: string, email: string) {
    const accessToken = this.jwtService.sign({ sub: userId, email });
    const refreshToken = randomBytes(48).toString('hex');
    const expiresAt = new Date(Date.now() + REFRESH_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    return { accessToken, refreshToken, refreshExpiresAt: expiresAt };
  }
}