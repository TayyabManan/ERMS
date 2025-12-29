import { z } from 'zod';
import { ResourceCategory } from '@prisma/client';

export const createResourceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  category: z.nativeEnum(ResourceCategory),
  capacity: z.number().int().positive().optional(),
  location: z.string().max(200).optional(),
  isAvailable: z.boolean().default(true),
  imageUrl: z.string().url().optional(),
});

export const updateResourceSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).nullable().optional(),
  category: z.nativeEnum(ResourceCategory).optional(),
  capacity: z.number().int().positive().nullable().optional(),
  location: z.string().max(200).nullable().optional(),
  isAvailable: z.boolean().optional(),
  imageUrl: z.string().url().nullable().optional(),
});

export const resourceIdParamSchema = z.object({
  id: z.string().uuid('Invalid resource ID'),
});

export const resourceQuerySchema = z.object({
  category: z.nativeEnum(ResourceCategory).optional(),
  search: z.string().optional(),
  available: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type CreateResourceInput = z.infer<typeof createResourceSchema>;
export type UpdateResourceInput = z.infer<typeof updateResourceSchema>;
export type ResourceIdParam = z.infer<typeof resourceIdParamSchema>;
export type ResourceQuery = z.infer<typeof resourceQuerySchema>;
