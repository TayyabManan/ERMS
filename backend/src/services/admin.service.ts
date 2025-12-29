import { BookingStatus } from '@prisma/client';
import { prisma } from '../config/database.js';

interface DashboardStats {
  totalUsers: number;
  totalResources: number;
  totalBookings: number;
  pendingBookings: number;
  approvedBookings: number;
  rejectedBookings: number;
  recentBookings: {
    id: string;
    title: string;
    status: BookingStatus;
    createdAt: Date;
    user: {
      firstName: string;
      lastName: string;
    };
    resource: {
      name: string;
    };
  }[];
  usersByRole: {
    role: string;
    count: number;
  }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const [
    totalUsers,
    totalResources,
    totalBookings,
    pendingBookings,
    approvedBookings,
    rejectedBookings,
    recentBookings,
    usersByRole,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.resource.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: BookingStatus.PENDING } }),
    prisma.booking.count({ where: { status: BookingStatus.APPROVED } }),
    prisma.booking.count({ where: { status: BookingStatus.REJECTED } }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        status: true,
        createdAt: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        resource: {
          select: {
            name: true,
          },
        },
      },
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    }),
  ]);

  return {
    totalUsers,
    totalResources,
    totalBookings,
    pendingBookings,
    approvedBookings,
    rejectedBookings,
    recentBookings,
    usersByRole: usersByRole.map((item) => ({
      role: item.role,
      count: item._count.role,
    })),
  };
};
