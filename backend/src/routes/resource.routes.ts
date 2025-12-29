import { Router } from 'express';
import * as resourceController from '../controllers/resource.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createResourceSchema,
  updateResourceSchema,
  resourceIdParamSchema,
} from '../validators/resource.validator.js';

const router = Router();

/**
 * @swagger
 * /resources:
 *   get:
 *     summary: Get all resources
 *     tags: [Resources]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [ROOM, EQUIPMENT, VEHICLE, OTHER]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: available
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Resources retrieved successfully
 */
router.get('/', resourceController.getAllResources);

/**
 * @swagger
 * /resources/categories:
 *   get:
 *     summary: Get all resource categories
 *     tags: [Resources]
 *     security: []
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
 */
router.get('/categories', resourceController.getCategories);

/**
 * @swagger
 * /resources/{id}:
 *   get:
 *     summary: Get resource by ID
 *     tags: [Resources]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Resource retrieved successfully
 *       404:
 *         description: Resource not found
 */
router.get(
  '/:id',
  validate({ params: resourceIdParamSchema }),
  resourceController.getResourceById
);

/**
 * @swagger
 * /resources:
 *   post:
 *     summary: Create a new resource (Admin only)
 *     tags: [Resources]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [ROOM, EQUIPMENT, VEHICLE, OTHER]
 *               capacity:
 *                 type: integer
 *               location:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: Resource created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post(
  '/',
  authenticate,
  isAdmin,
  validate({ body: createResourceSchema }),
  resourceController.createResource
);

/**
 * @swagger
 * /resources/{id}:
 *   patch:
 *     summary: Update a resource (Admin only)
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [ROOM, EQUIPMENT, VEHICLE, OTHER]
 *               capacity:
 *                 type: integer
 *               location:
 *                 type: string
 *               isAvailable:
 *                 type: boolean
 *               imageUrl:
 *                 type: string
 *     responses:
 *       200:
 *         description: Resource updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Resource not found
 */
router.patch(
  '/:id',
  authenticate,
  isAdmin,
  validate({ params: resourceIdParamSchema, body: updateResourceSchema }),
  resourceController.updateResource
);

/**
 * @swagger
 * /resources/{id}:
 *   delete:
 *     summary: Delete a resource (Admin only)
 *     tags: [Resources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Resource deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Resource not found
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validate({ params: resourceIdParamSchema }),
  resourceController.deleteResource
);

export default router;
