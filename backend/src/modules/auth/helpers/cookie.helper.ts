import { CookieOptions } from 'express';

const IS_PROD = process.env.APP_ENV === 'production';

/** 15 minutes in milliseconds */
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

/** 7 days in milliseconds */
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const accessTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'strict' : 'lax',
  path: '/',
  maxAge: ACCESS_TOKEN_TTL_MS,
});

export const refreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'strict' : 'lax',
  path: '/api/auth',
  maxAge: REFRESH_TOKEN_TTL_MS,
});

export const clearCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: IS_PROD,
  sameSite: IS_PROD ? 'strict' : 'lax',
  path: '/',
  maxAge: 0,
});
