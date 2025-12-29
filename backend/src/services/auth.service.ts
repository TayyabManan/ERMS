import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
} from '../utils/jwt.js';
import { ConflictError, UnauthorizedError } from '../utils/errors.js';
import { RegisterInput, LoginInput } from '../validators/auth.validator.js';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  tokens: AuthTokens;
}

export const register = async (data: RegisterInput): Promise<AuthResponse> => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
  });

  const tokens = await generateTokens(user.id, user.email, user.role);

  return { user, tokens };
};

export const login = async (data: LoginInput): Promise<AuthResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.isBlocked) {
    throw new UnauthorizedError('Account is blocked');
  }

  const isPasswordValid = await comparePassword(data.password, user.password);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const tokens = await generateTokens(user.id, user.email, user.role);

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    },
    tokens,
  };
};

export const logout = async (refreshToken: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { token: refreshToken },
  });
};

export const refreshTokens = async (refreshToken: string): Promise<AuthTokens> => {
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  if (storedToken.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: storedToken.id } });
    throw new UnauthorizedError('Refresh token expired');
  }

  if (storedToken.user.isBlocked) {
    throw new UnauthorizedError('Account is blocked');
  }

  // Delete old refresh token
  await prisma.refreshToken.delete({ where: { id: storedToken.id } });

  // Generate new tokens
  return generateTokens(storedToken.user.id, storedToken.user.email, storedToken.user.role);
};

const generateTokens = async (
  userId: string,
  email: string,
  role: string
): Promise<AuthTokens> => {
  const payload = { userId, email, role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  // Store refresh token in database
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return { accessToken, refreshToken };
};

export const revokeAllUserTokens = async (userId: string): Promise<void> => {
  await prisma.refreshToken.deleteMany({
    where: { userId },
  });
};
