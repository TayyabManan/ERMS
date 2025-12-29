import { Role, BookingStatus, ResourceCategory } from '@prisma/client';

export { Role, BookingStatus, ResourceCategory };

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export const parsePagination = (query: PaginationQuery): PaginationParams => {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};
