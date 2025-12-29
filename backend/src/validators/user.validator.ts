import { z } from 'zod';
import { Role } from '@prisma/client';

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  profileImage: z.string().url().nullable().optional(),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const userIdParamSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const blockUserSchema = z.object({
  isBlocked: z.boolean(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type BlockUserInput = z.infer<typeof blockUserSchema>;
