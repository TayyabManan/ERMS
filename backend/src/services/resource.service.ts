import { Resource, ResourceCategory, Prisma, BookingStatus } from '@prisma/client';
import { prisma } from '../config/database.js';
import { NotFoundError, BadRequestError } from '../utils/errors.js';
import { CreateResourceInput, UpdateResourceInput } from '../validators/resource.validator.js';
import { PaginationParams } from '../types/index.js';

interface ResourceFilters {
  category?: ResourceCategory;
  search?: string;
  available?: boolean;
}

export const getAllResources = async (
  filters: ResourceFilters,
  pagination: PaginationParams
): Promise<{ resources: Resource[]; total: number }> => {
  const where: Prisma.ResourceWhereInput = {};

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.available !== undefined) {
    where.isAvailable = filters.available;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { description: { contains: filters.search, mode: 'insensitive' } },
      { location: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.resource.count({ where }),
  ]);

  return { resources, total };
};

export const getResourceById = async (resourceId: string): Promise<Resource> => {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!resource) {
    throw new NotFoundError('Resource not found');
  }

  return resource;
};

export const createResource = async (data: CreateResourceInput): Promise<Resource> => {
  const resource = await prisma.resource.create({
    data: {
      name: data.name,
      description: data.description,
      category: data.category,
      capacity: data.capacity,
      location: data.location,
      isAvailable: data.isAvailable ?? true,
      imageUrl: data.imageUrl,
    },
  });

  return resource;
};

export const updateResource = async (
  resourceId: string,
  data: UpdateResourceInput
): Promise<Resource> => {
  const existing = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!existing) {
    throw new NotFoundError('Resource not found');
  }

  const resource = await prisma.resource.update({
    where: { id: resourceId },
    data,
  });

  return resource;
};

export const deleteResource = async (resourceId: string): Promise<void> => {
  const existing = await prisma.resource.findUnique({
    where: { id: resourceId },
  });

  if (!existing) {
    throw new NotFoundError('Resource not found');
  }

  // Check for active bookings (pending or approved) to prevent data loss
  const activeBookingsCount = await prisma.booking.count({
    where: {
      resourceId,
      status: { in: [BookingStatus.PENDING, BookingStatus.APPROVED] },
    },
  });

  if (activeBookingsCount > 0) {
    throw new BadRequestError(
      `Cannot delete resource with ${activeBookingsCount} active booking(s). Please reject or cancel all pending/approved bookings first.`
    );
  }

  await prisma.resource.delete({
    where: { id: resourceId },
  });
};

export const getResourceCategories = (): ResourceCategory[] => {
  return Object.values(ResourceCategory);
};
