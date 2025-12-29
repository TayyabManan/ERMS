import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface DecodedToken extends TokenPayload, JwtPayload {}

const parseExpiry = (expiry: string): number => {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error(`Invalid expiry format: ${expiry}`);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value;
    case 'm':
      return value * 60;
    case 'h':
      return value * 60 * 60;
    case 'd':
      return value * 60 * 60 * 24;
    default:
      throw new Error(`Invalid expiry unit: ${unit}`);
  }
};

const JWT_ALGORITHM = 'HS256' as const;

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: parseExpiry(env.JWT_ACCESS_EXPIRY),
    algorithm: JWT_ALGORITHM,
  };
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: parseExpiry(env.JWT_REFRESH_EXPIRY),
    algorithm: JWT_ALGORITHM,
  };
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, options);
};

export const verifyAccessToken = (token: string): DecodedToken => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: [JWT_ALGORITHM] }) as DecodedToken;
};

export const verifyRefreshToken = (token: string): DecodedToken => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: [JWT_ALGORITHM] }) as DecodedToken;
};

export const getRefreshTokenExpiry = (): Date => {
  const seconds = parseExpiry(env.JWT_REFRESH_EXPIRY);
  return new Date(Date.now() + seconds * 1000);
};
