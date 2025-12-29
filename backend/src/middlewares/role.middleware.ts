import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { ForbiddenError, UnauthorizedError } from '../utils/errors.js';

const roleHierarchy: Record<Role, number> = {
  USER: 1,
  MODERATOR: 2,
  SUPER_ADMIN: 3,
};

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
};

export const requireMinRole = (minRole: Role) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required'));
      return;
    }

    const userRoleLevel = roleHierarchy[req.user.role];
    const requiredRoleLevel = roleHierarchy[minRole];

    if (userRoleLevel < requiredRoleLevel) {
      next(new ForbiddenError('Insufficient permissions'));
      return;
    }

    next();
  };
};

export const isAdmin = requireMinRole(Role.MODERATOR);
export const isSuperAdmin = requireRole(Role.SUPER_ADMIN);
