import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';
import {
  CreateBookingInput,
  UpdateBookingInput,
  BookingIdParam,
  BookingQuery,
  ModerateBookingInput,
} from '../validators/booking.validator.js';
import { parsePagination } from '../types/index.js';

export const getUserBookings = async (
  req: Request<object, object, object, BookingQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pagination = parsePagination(req.query);
    const filters = {
      status: req.query.status,
      resourceId: req.query.resourceId,
    };

    const { bookings, total } = await bookingService.getUserBookings(
      req.user!.userId,
      filters,
      pagination
    );
    sendPaginated(res, bookings, pagination.page, pagination.limit, total, 'Bookings retrieved');
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (
  req: Request<BookingIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await bookingService.getBookingById(req.params.id, req.user!.userId);
    sendSuccess(res, booking, 'Booking retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (
  req: Request<object, object, CreateBookingInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await bookingService.createBooking(req.user!.userId, req.body);
    sendCreated(res, booking, 'Booking created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (
  req: Request<BookingIdParam, object, UpdateBookingInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await bookingService.updateBooking(req.params.id, req.user!.userId, req.body);
    sendSuccess(res, booking, 'Booking updated successfully');
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (
  req: Request<BookingIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await bookingService.cancelBooking(req.params.id, req.user!.userId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

// Admin functions
export const getAllBookings = async (
  req: Request<object, object, object, BookingQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pagination = parsePagination(req.query);
    const filters = {
      status: req.query.status,
      resourceId: req.query.resourceId,
    };

    const { bookings, total } = await bookingService.getAllBookings(filters, pagination);
    sendPaginated(res, bookings, pagination.page, pagination.limit, total, 'Bookings retrieved');
  } catch (error) {
    next(error);
  }
};

export const getAdminBookingById = async (
  req: Request<BookingIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await bookingService.getBookingById(req.params.id);
    sendSuccess(res, booking, 'Booking retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const approveBooking = async (
  req: Request<BookingIdParam, object, ModerateBookingInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await bookingService.approveBooking(req.params.id, req.body.adminNotes);
    sendSuccess(res, booking, 'Booking approved successfully');
  } catch (error) {
    next(error);
  }
};

export const rejectBooking = async (
  req: Request<BookingIdParam, object, ModerateBookingInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const booking = await bookingService.rejectBooking(req.params.id, req.body.adminNotes);
    sendSuccess(res, booking, 'Booking rejected successfully');
  } catch (error) {
    next(error);
  }
};
