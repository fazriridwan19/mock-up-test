import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../users/repositories/user.repository';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req?.cookies?.['refresh_token'] ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshSecret') as string,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const rawToken: string | undefined = req.cookies?.['refresh_token'];

    if (!rawToken) {
      throw new UnauthorizedException('Refresh token tidak ditemukan');
    }

    const user = await this.userRepository.findById(payload.sub);

    if (!user?.refreshTokenHash) {
      throw new UnauthorizedException(
        'Sesi tidak valid, silakan login kembali',
      );
    }

    const isMatch = await bcrypt.compare(rawToken, user.refreshTokenHash);
    if (!isMatch) {
      await this.userRepository.setRefreshTokenHash(user.id, null);
      throw new UnauthorizedException(
        'Refresh token tidak valid, silakan login kembali',
      );
    }

    return user;
  }
}
