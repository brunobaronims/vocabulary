import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from './user.service';
import * as argon2 from 'argon2';

type AuthPayload = {
  accessToken: string;
  refreshToken: string;
};

@Injectable()
export class AuthService {
  private accessTtlSeconds = Number(process.env.JWT_ACCESS_TTL ?? 900);
  private refreshTtlSeconds = Number(process.env.JWT_REFRESH_TTL ?? 604800);
  private accessSecret = process.env.JWT_ACCESS_SECRET ?? 'change-me';
  private refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'change-me';

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async login(name: string, password: string): Promise<AuthPayload> {
    const user = await this.userService.findOneByName(name);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    return this.issueTokens(user.id);
  }

  async refresh(refreshToken: string): Promise<AuthPayload> {
    let payload: { sub: number };
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: this.refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token.');
    }
    return this.issueTokens(payload.sub);
  }

  private async issueTokens(userId: number): Promise<AuthPayload> {
    const accessToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.accessSecret,
        expiresIn: this.accessTtlSeconds,
      },
    );

    const refreshToken = await this.jwtService.signAsync(
      { sub: userId },
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshTtlSeconds,
      },
    );

    return { accessToken, refreshToken };
  }
}
