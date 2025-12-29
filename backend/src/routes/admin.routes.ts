import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as userController from '../controllers/user.controller.js';
import * as bookingController from '../controllers/booking.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { isAdmin, isSuperAdmin } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  userIdParamSchema,
  updateUserRoleSchema,
  blockUserSchema,
} from '../validators/user.validator.js';
import {
  bookingIdParamSchema,
  moderateBookingSchema,
} from '../validators/booking.validator.js';

const router = Router();

// All routes require authentication and admin role
router.use(authenticate);
router.use(isAdmin);

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Admin]
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/dashboard', adminController.getDashboard);

// User management routes

/**
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     tags: [Admin]
 *     parameters:
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
 *         description: Users retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/users', userController.getAllUsers);

/**
 * @swagger
 * /admin/users/{id}:
 *   get:
 *     summary: Get user by ID (Admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.get(
  '/users/:id',
  validate({ params: userIdParamSchema }),
  userController.getUserById
);

/**
 * @swagger
 * /admin/users/{id}/block:
 *   patch:
 *     summary: Block or unblock a user (Admin only)
 *     tags: [Admin]
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
 *             required:
 *               - isBlocked
 *             properties:
 *               isBlocked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User blocked/unblocked successfully
 *       400:
 *         description: Cannot block yourself
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch(
  '/users/:id/block',
  validate({ params: userIdParamSchema, body: blockUserSchema }),
  userController.blockUser
);

/**
 * @swagger
 * /admin/users/{id}/role:
 *   patch:
 *     summary: Update user role (Super Admin only)
 *     tags: [Admin]
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
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [USER, MODERATOR, SUPER_ADMIN]
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       400:
 *         description: Cannot change your own role
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: User not found
 */
router.patch(
  '/users/:id/role',
  isSuperAdmin,
  validate({ params: userIdParamSchema, body: updateUserRoleSchema }),
  userController.updateUserRole
);

// Booking moderation routes

/**
 * @swagger
 * /admin/bookings:
 *   get:
 *     summary: Get all bookings (Admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, APPROVED, REJECTED, CANCELLED]
 *       - in: query
 *         name: resourceId
 *         schema:
 *           type: string
 *           format: uuid
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
 *         description: Bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/bookings', bookingController.getAllBookings);

/**
 * @swagger
 * /admin/bookings/{id}:
 *   get:
 *     summary: Get booking by ID (Admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.get(
  '/bookings/:id',
  validate({ params: bookingIdParamSchema }),
  bookingController.getAdminBookingById
);

/**
 * @swagger
 * /admin/bookings/{id}/approve:
 *   patch:
 *     summary: Approve a booking (Admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking approved successfully
 *       400:
 *         description: Only pending bookings can be approved
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.patch(
  '/bookings/:id/approve',
  validate({ params: bookingIdParamSchema, body: moderateBookingSchema }),
  bookingController.approveBooking
);

/**
 * @swagger
 * /admin/bookings/{id}/reject:
 *   patch:
 *     summary: Reject a booking (Admin only)
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               adminNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking rejected successfully
 *       400:
 *         description: Only pending bookings can be rejected
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 */
router.patch(
  '/bookings/:id/reject',
  validate({ params: bookingIdParamSchema, body: moderateBookingSchema }),
  bookingController.rejectBooking
);

export default router;
