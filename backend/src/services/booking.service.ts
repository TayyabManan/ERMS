import { Booking, BookingStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors.js';
import { CreateBookingInput, UpdateBookingInput } from '../validators/booking.validator.js';
import { PaginationParams } from '../types/index.js';

interface BookingFilters {
  status?: BookingStatus;
  resourceId?: string;
}

interface BookingWithDetails extends Booking {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  resource: {
    id: string;
    name: string;
    category: string;
  };
}

const bookingInclude = {
  user: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
    },
  },
  resource: {
    select: {
      id: true,
      name: true,
      category: true,
    },
  },
};

export const getUserBookings = async (
  userId: string,
  filters: BookingFilters,
  pagination: PaginationParams
): Promise<{ bookings: BookingWithDetails[]; total: number }> => {
  const where: Prisma.BookingWhereInput = { userId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.resourceId) {
    where.resourceId = filters.resourceId;
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: bookingInclude,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total };
};

export const getBookingById = async (
  bookingId: string,
  userId?: string
): Promise<BookingWithDetails> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: bookingInclude,
  });

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  // If userId is provided, verify ownership
  if (userId && booking.userId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  return booking;
};

export const createBooking = async (
  userId: string,
  data: CreateBookingInput
): Promise<BookingWithDetails> => {
  const startTime = new Date(data.startTime);
  const endTime = new Date(data.endTime);

  // Use transaction with serializable isolation to prevent race conditions
  const booking = await prisma.$transaction(
    async (tx) => {
      // Verify resource exists and is available
      const resource = await tx.resource.findUnique({
        where: { id: data.resourceId },
      });

      if (!resource) {
        throw new NotFoundError('Resource not found');
      }

      if (!resource.isAvailable) {
        throw new BadRequestError('Resource is not available for booking');
      }

      // Check for conflicting bookings within the transaction
      const conflictingBooking = await tx.booking.findFirst({
        where: {
          resourceId: data.resourceId,
          status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
          OR: [
            {
              AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
            },
            {
              AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
            },
            {
              AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
            },
          ],
        },
      });

      if (conflictingBooking) {
        throw new BadRequestError('Resource is already booked for this time slot');
      }

      // Create booking within the same transaction
      return tx.booking.create({
        data: {
          userId,
          resourceId: data.resourceId,
          title: data.title,
          description: data.description,
          startTime,
          endTime,
        },
        include: bookingInclude,
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );

  return booking;
};

export const updateBooking = async (
  bookingId: string,
  userId: string,
  data: UpdateBookingInput
): Promise<BookingWithDetails> => {
  // Use transaction with serializable isolation to prevent race conditions
  const updatedBooking = await prisma.$transaction(
    async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      if (booking.userId !== userId) {
        throw new ForbiddenError('Access denied');
      }

      if (booking.status !== BookingStatus.PENDING) {
        throw new BadRequestError('Only pending bookings can be edited');
      }

      const updateData: Prisma.BookingUpdateInput = {};

      if (data.title) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.startTime) updateData.startTime = new Date(data.startTime);
      if (data.endTime) updateData.endTime = new Date(data.endTime);

      // If times are being updated, check for conflicts within the transaction
      if (data.startTime || data.endTime) {
        const startTime = data.startTime ? new Date(data.startTime) : booking.startTime;
        const endTime = data.endTime ? new Date(data.endTime) : booking.endTime;

        const conflictingBooking = await tx.booking.findFirst({
          where: {
            id: { not: bookingId },
            resourceId: booking.resourceId,
            status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
            OR: [
              {
                AND: [{ startTime: { lte: startTime } }, { endTime: { gt: startTime } }],
              },
              {
                AND: [{ startTime: { lt: endTime } }, { endTime: { gte: endTime } }],
              },
              {
                AND: [{ startTime: { gte: startTime } }, { endTime: { lte: endTime } }],
              },
            ],
          },
        });

        if (conflictingBooking) {
          throw new BadRequestError('Resource is already booked for this time slot');
        }
      }

      return tx.booking.update({
        where: { id: bookingId },
        data: updateData,
        include: bookingInclude,
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    }
  );

  return updatedBooking;
};

export const cancelBooking = async (bookingId: string, userId: string): Promise<void> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (booking.userId !== userId) {
    throw new ForbiddenError('Access denied');
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new BadRequestError('Only pending bookings can be cancelled');
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: BookingStatus.CANCELLED },
  });
};

// Admin functions
export const getAllBookings = async (
  filters: BookingFilters,
  pagination: PaginationParams
): Promise<{ bookings: BookingWithDetails[]; total: number }> => {
  const where: Prisma.BookingWhereInput = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.resourceId) {
    where.resourceId = filters.resourceId;
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: bookingInclude,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where }),
  ]);

  return { bookings, total };
};

export const approveBooking = async (
  bookingId: string,
  adminNotes?: string
): Promise<BookingWithDetails> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new BadRequestError('Only pending bookings can be approved');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.APPROVED,
      adminNotes,
    },
    include: bookingInclude,
  });

  return updatedBooking;
};

export const rejectBooking = async (
  bookingId: string,
  adminNotes?: string
): Promise<BookingWithDetails> => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new NotFoundError('Booking not found');
  }

  if (booking.status !== BookingStatus.PENDING) {
    throw new BadRequestError('Only pending bookings can be rejected');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.REJECTED,
      adminNotes,
    },
    include: bookingInclude,
  });

  return updatedBooking;
};
