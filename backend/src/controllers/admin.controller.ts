import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service.js';
import { sendSuccess } from '../utils/response.js';

export const getDashboard = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await adminService.getDashboardStats();
    sendSuccess(res, stats, 'Dashboard stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};
