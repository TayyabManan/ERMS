import { Request, Response, NextFunction } from 'express';
import * as resourceService from '../services/resource.service.js';
import { sendSuccess, sendCreated, sendNoContent, sendPaginated } from '../utils/response.js';
import {
  CreateResourceInput,
  UpdateResourceInput,
  ResourceIdParam,
  ResourceQuery,
} from '../validators/resource.validator.js';
import { parsePagination } from '../types/index.js';

export const getAllResources = async (
  req: Request<object, object, object, ResourceQuery>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pagination = parsePagination(req.query);
    const filters = {
      category: req.query.category,
      search: req.query.search,
      available: req.query.available !== undefined ? req.query.available === 'true' : undefined,
    };

    const { resources, total } = await resourceService.getAllResources(filters, pagination);
    sendPaginated(res, resources, pagination.page, pagination.limit, total, 'Resources retrieved');
  } catch (error) {
    next(error);
  }
};

export const getResourceById = async (
  req: Request<ResourceIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resource = await resourceService.getResourceById(req.params.id);
    sendSuccess(res, resource, 'Resource retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const createResource = async (
  req: Request<object, object, CreateResourceInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resource = await resourceService.createResource(req.body);
    sendCreated(res, resource, 'Resource created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateResource = async (
  req: Request<ResourceIdParam, object, UpdateResourceInput>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resource = await resourceService.updateResource(req.params.id, req.body);
    sendSuccess(res, resource, 'Resource updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteResource = async (
  req: Request<ResourceIdParam>,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await resourceService.deleteResource(req.params.id);
    sendNoContent(res);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = resourceService.getResourceCategories();
    sendSuccess(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};
