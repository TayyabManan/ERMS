import { Response } from 'express';

interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
}

interface ErrorResponse {
  success: false;
  message: string;
  error: {
    code: string;
    details?: unknown[];
  };
}

interface PaginatedData<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response<SuccessResponse<T>> => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Resource created successfully'
): Response<SuccessResponse<T>> => {
  return sendSuccess(res, data, message, 201);
};

export const sendNoContent = (res: Response): Response => {
  return res.status(204).send();
};

export const sendError = (
  res: Response,
  message: string,
  code: string,
  statusCode = 500,
  details?: unknown[]
): Response<ErrorResponse> => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      ...(details && { details }),
    },
  });
};

export const sendPaginated = <T>(
  res: Response,
  items: T[],
  page: number,
  limit: number,
  total: number,
  message = 'Success'
): Response<SuccessResponse<PaginatedData<T>>> => {
  return sendSuccess(
    res,
    {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    message
  );
};
