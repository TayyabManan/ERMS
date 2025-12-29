import { z } from 'zod';
import { BookingStatus } from '@prisma/client';

export const createBookingSchema = z
  .object({
    resourceId: z.string().uuid('Invalid resource ID'),
    title: z.string().min(1, 'Title is required').max(100),
    description: z.string().max(500).optional(),
    startTime: z.string().datetime('Invalid start time format'),
    endTime: z.string().datetime('Invalid end time format'),
  })
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return end > start;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  )
  .refine(
    (data) => {
      const start = new Date(data.startTime);
      return start > new Date();
    },
    {
      message: 'Start time must be in the future',
      path: ['startTime'],
    }
  );

export const updateBookingSchema = z
  .object({
    title: z.string().min(1).max(100).optional(),
    description: z.string().max(500).nullable().optional(),
    startTime: z.string().datetime('Invalid start time format').optional(),
    endTime: z.string().datetime('Invalid end time format').optional(),
  })
  .refine(
    (data) => {
      if (data.startTime && data.endTime) {
        const start = new Date(data.startTime);
        const end = new Date(data.endTime);
        return end > start;
      }
      return true;
    },
    {
      message: 'End time must be after start time',
      path: ['endTime'],
    }
  );

export const bookingIdParamSchema = z.object({
  id: z.string().uuid('Invalid booking ID'),
});

export const bookingQuerySchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  resourceId: z.string().uuid().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export const moderateBookingSchema = z.object({
  adminNotes: z.string().max(500).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
export type BookingIdParam = z.infer<typeof bookingIdParamSchema>;
export type BookingQuery = z.infer<typeof bookingQuerySchema>;
export type ModerateBookingInput = z.infer<typeof moderateBookingSchema>;
