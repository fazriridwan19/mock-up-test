import {
  Controller,
  Post,
  Get,
  Body,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiCookieAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtRefreshGuard } from '../../common/guards/jwt-refresh.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserEntity } from '../users/entities/user.entity';
import {
  accessTokenCookieOptions,
  refreshTokenCookieOptions,
  clearCookieOptions,
} from './helpers/cookie.helper';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Register a new user account' })
  async signUp(@Body() dto: SignUpDto) {
    const result = await this.authService.signUp(dto);
    return {
      success: true,
      message: 'Registrasi berhasil',
      data: result,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login — sets access_token and refresh_token cookies',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens, user } = await this.authService.login(dto);

    res.cookie('access_token', tokens.accessToken, accessTokenCookieOptions());
    res.cookie(
      'refresh_token',
      tokens.refreshToken,
      refreshTokenCookieOptions(),
    );

    return {
      success: true,
      message: 'Login berhasil',
      data: { user },
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshGuard)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Rotate tokens using refresh_token cookie' })
  async refresh(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { tokens } = await this.authService.refresh(user);

    res.cookie('access_token', tokens.accessToken, accessTokenCookieOptions());
    res.cookie(
      'refresh_token',
      tokens.refreshToken,
      refreshTokenCookieOptions(),
    );

    return {
      success: true,
      message: 'Token diperbarui',
      data: null,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({
    summary: 'Logout — clears cookies and invalidates refresh token',
  })
  async logout(
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);

    res.clearCookie('access_token', clearCookieOptions());
    res.clearCookie('refresh_token', {
      ...clearCookieOptions(),
      path: '/api/auth',
    });

    return {
      success: true,
      message: 'Berhasil keluar',
      data: null,
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser() user: UserEntity) {
    const result = await this.authService.getProfile(user.id);
    return {
      success: true,
      message: 'Profil berhasil diambil',
      data: result,
    };
  }
}
