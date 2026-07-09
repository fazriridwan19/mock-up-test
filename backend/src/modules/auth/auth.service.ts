import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { UserRepository } from '../users/repositories/user.repository';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { UserEntity } from '../users/entities/user.entity';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signUp(dto: SignUpDto): Promise<{ user: Partial<UserEntity> }> {
    this.logger.log(`Sign up attempt: ${dto.email}`);

    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
    });

    this.logger.log(`User created: ${user.id}`);

    return { user: this.sanitizeUser(user) };
  }

  async login(
    dto: LoginDto,
  ): Promise<{ tokens: TokenPair; user: Partial<UserEntity> }> {
    this.logger.log(`Login attempt: ${dto.email}`);

    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email atau password salah');
    }

    const tokens = await this.generateAndPersistTokens(user);

    this.logger.log(`Login success: ${user.id}`);

    return { tokens, user: this.sanitizeUser(user) };
  }

  async refresh(user: UserEntity): Promise<{ tokens: TokenPair }> {
    this.logger.log(`Token refresh: ${user.id}`);
    const tokens = await this.generateAndPersistTokens(user);
    return { tokens };
  }

  async logout(userId: string): Promise<void> {
    this.logger.log(`Logout: ${userId}`);
    await this.userRepository.setRefreshTokenHash(userId, null);
  }

  async getProfile(userId: string): Promise<Partial<UserEntity>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User tidak ditemukan');
    }
    return this.sanitizeUser(user);
  }

  private async generateAndPersistTokens(user: UserEntity): Promise<TokenPair> {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.accessSecret') as string,
      expiresIn: this.configService.get<string>(
        'jwt.accessExpiresIn',
      ) as StringValue,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret') as string,
      expiresIn: this.configService.get<string>(
        'jwt.refreshExpiresIn',
      ) as StringValue,
    });
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.setRefreshTokenHash(user.id, refreshTokenHash);

    return { accessToken, refreshToken };
  }

  private sanitizeUser(user: UserEntity): Partial<UserEntity> {
    const { password: _p, refreshTokenHash: _r, ...sanitized } = user;
    return sanitized;
  }
}
