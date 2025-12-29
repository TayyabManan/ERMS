import { Role, User } from '@prisma/client';
import { prisma } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { UpdateProfileInput, UpdatePasswordInput } from '../validators/user.validator.js';
import { PaginationParams } from '../types/index.js';
import { revokeAllUserTokens } from './auth.service.js';

type SafeUser = Omit<User, 'password'>;

const userSelectFields = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  role: true,
  isBlocked: true,
  profileImage: true,
  createdAt: true,
  updatedAt: true,
};

export const getUserById = async (userId: string): Promise<SafeUser> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelectFields,
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  return user;
};

export const updateProfile = async (
  userId: string,
  data: UpdateProfileInput
): Promise<SafeUser> => {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: userSelectFields,
  });

  return user;
};

export const updatePassword = async (
  userId: string,
  data: UpdatePasswordInput
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isPasswordValid = await comparePassword(data.currentPassword, user.password);

  if (!isPasswordValid) {
    throw new BadRequestError('Current password is incorrect');
  }

  const hashedPassword = await hashPassword(data.newPassword);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  // Revoke all refresh tokens to force re-login
  await revokeAllUserTokens(userId);
};

export const deleteAccount = async (userId: string): Promise<void> => {
  await prisma.user.delete({
    where: { id: userId },
  });
};

// Admin functions
export const getAllUsers = async (
  pagination: PaginationParams
): Promise<{ users: SafeUser[]; total: number }> => {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      select: userSelectFields,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count(),
  ]);

  return { users, total };
};

export const blockUser = async (
  adminId: string,
  adminRole: Role,
  userId: string,
  isBlocked: boolean
): Promise<SafeUser> => {
  if (adminId === userId) {
    throw new BadRequestError('Cannot block yourself');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    throw new NotFoundError('User not found');
  }

  // Prevent privilege escalation: moderators cannot block other moderators or super admins
  if (adminRole === Role.MODERATOR) {
    if (targetUser.role === Role.SUPER_ADMIN) {
      throw new ForbiddenError('Cannot block a Super Admin');
    }
    if (targetUser.role === Role.MODERATOR) {
      throw new ForbiddenError('Cannot block another Moderator');
    }
  }

  // Only super admins can block other super admins
  if (targetUser.role === Role.SUPER_ADMIN && adminRole !== Role.SUPER_ADMIN) {
    throw new ForbiddenError('Only Super Admin can block another Super Admin');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isBlocked },
    select: userSelectFields,
  });

  if (isBlocked) {
    await revokeAllUserTokens(userId);
  }

  return user;
};

export const updateUserRole = async (
  adminId: string,
  adminRole: Role,
  userId: string,
  newRole: Role
): Promise<SafeUser> => {
  if (adminId === userId) {
    throw new BadRequestError('Cannot change your own role');
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    throw new NotFoundError('User not found');
  }

  // Only Super Admin can assign Super Admin or Moderator roles
  if (adminRole !== Role.SUPER_ADMIN && (newRole === Role.SUPER_ADMIN || newRole === Role.MODERATOR)) {
    throw new ForbiddenError('Only Super Admin can assign admin roles');
  }

  // Cannot demote another Super Admin
  if (targetUser.role === Role.SUPER_ADMIN && adminRole !== Role.SUPER_ADMIN) {
    throw new ForbiddenError('Cannot modify Super Admin');
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
    select: userSelectFields,
  });

  return user;
};
