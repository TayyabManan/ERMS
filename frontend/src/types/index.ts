export type Role = 'USER' | 'MODERATOR' | 'SUPER_ADMIN';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
export type ResourceCategory = 'ROOM' | 'EQUIPMENT' | 'VEHICLE' | 'OTHER';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isBlocked: boolean;
  profileImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  category: ResourceCategory;
  capacity: number | null;
  location: string | null;
  isAvailable: boolean;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  resourceId: string;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
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
    createdAt: string;
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
