import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { AppError, ValidationError } from '../utils/errors.js';
import { sendError } from '../utils/response.js';
import { env } from '../config/env.js';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error in development
  if (env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendError(res, 'Validation failed', 'VALIDATION_ERROR', 422, details);
    return;
  }

  // Handle custom validation errors
  if (err instanceof ValidationError) {
    sendError(res, err.message, err.code, err.statusCode, err.details);
    return;
  }

  // Handle custom app errors
  if (err instanceof AppError) {
    sendError(res, err.message, err.code, err.statusCode);
    return;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    sendError(res, 'Invalid token', 'INVALID_TOKEN', 401);
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendError(res, 'Token expired', 'TOKEN_EXPIRED', 401);
    return;
  }

  // Handle Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as unknown as { code: string; meta?: { target?: string[] } };
    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target?.join(', ') || 'field';
      sendError(res, `A record with this ${target} already exists`, 'DUPLICATE_ENTRY', 409);
      return;
    }
    if (prismaError.code === 'P2025') {
      sendError(res, 'Record not found', 'NOT_FOUND', 404);
      return;
    }
  }

  // Default to 500 internal server error
  const message = env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  sendError(res, message, 'INTERNAL_ERROR', 500);
};

export const notFoundHandler = (_req: Request, res: Response): void => {
  sendError(res, 'Route not found', 'ROUTE_NOT_FOUND', 404);
};
