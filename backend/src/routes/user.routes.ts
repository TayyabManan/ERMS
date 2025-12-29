import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  updateProfileSchema,
  updatePasswordSchema,
} from '../validators/user.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 */
router.get('/me', userController.getProfile);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Update current user profile
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       422:
 *         description: Validation error
 */
router.patch('/me', validate({ body: updateProfileSchema }), userController.updateProfile);

/**
 * @swagger
 * /users/me/password:
 *   patch:
 *     summary: Update current user password
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Current password is incorrect
 *       401:
 *         description: Unauthorized
 */
router.patch(
  '/me/password',
  validate({ body: updatePasswordSchema }),
  userController.updatePassword
);

/**
 * @swagger
 * /users/me:
 *   delete:
 *     summary: Delete current user account
 *     tags: [Users]
 *     responses:
 *       204:
 *         description: Account deleted successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/me', userController.deleteAccount);

export default router;
