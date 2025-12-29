import { Request, Response, NextFunction } from 'express';
import * as userService from '../services/user.service.js';
import { sendSuccess, sendNoContent, sendPaginated } from '../utils/response.js';
import {
  UpdateProfileInput,
  UpdatePasswordInput,
  UserIdParam,
  UpdateUserRoleInput,
  BlockUserInput,
} from '../validators/user.validator.js';
import { parsePagination, PaginationQuery } from '../types/index.js';

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.getUserById(req.user!.userId);
    sendSuccess(res, user, 'Profile retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request<object, object, UpdateProfileInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.updateProfile(req.user!.userId, req.body);
    sendSuccess(res, user, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: Request<object, object, UpdatePasswordInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await userService.updatePassword(req.user!.userId, req.body);
    sendSuccess(res, null, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await userService.deleteAccount(req.user!.userId);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

// Admin functions
export const getAllUsers = async (
  req: Request<object, object, object, PaginationQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pagination = parsePagination(req.query);
    const { users, total } = await userService.getAllUsers(pagination);
    sendPaginated(res, users, pagination.page, pagination.limit, total, 'Users retrieved');
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (
  req: Request<UserIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.getUserById(req.params.id);
    sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const blockUser = async (
  req: Request<UserIdParam, object, BlockUserInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.blockUser(
      req.user!.userId,
      req.user!.role,
      req.params.id,
      req.body.isBlocked
    );
    const message = req.body.isBlocked ? 'User blocked successfully' : 'User unblocked successfully';
    sendSuccess(res, user, message);
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (
  req: Request<UserIdParam, object, UpdateUserRoleInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await userService.updateUserRole(
      req.user!.userId,
      req.user!.role,
      req.params.id,
      req.body.role
    );
    sendSuccess(res, user, 'User role updated successfully');
  } catch (error) {
    next(error);
  }
};
