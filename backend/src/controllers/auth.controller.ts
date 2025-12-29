import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service.js';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response.js';
import { RegisterInput, LoginInput, RefreshTokenInput } from '../validators/auth.validator.js';

export const register = async (
  req: Request<object, object, RegisterInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    sendCreated(res, result, 'Registration successful');
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request<object, object, LoginInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const logout = async (
  req: Request<object, object, RefreshTokenInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await authService.logout(req.body.refreshToken);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request<object, object, RefreshTokenInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const tokens = await authService.refreshTokens(req.body.refreshToken);
    sendSuccess(res, tokens, 'Tokens refreshed successfully');
  } catch (error) {
    next(error);
  }
};
