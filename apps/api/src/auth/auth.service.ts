import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async register(email: string, password: string, displayName: string) {
        const user = await this.usersService.create(email, password, displayName);
        return this.buildTokenResponse(user.id, user.email);
    }

    async login(email: string, password: string) {
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Identifiants invalides');
        }
        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) {
            throw new UnauthorizedException('Identifiants invalides');
        }
        return this.buildTokenResponse(user.id, user.email);
    }

    private buildTokenResponse(userId: string, email: string) {
        const payload = { sub: userId, email };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}