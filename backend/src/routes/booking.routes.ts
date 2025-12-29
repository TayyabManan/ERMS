import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createBookingSchema,
  updateBookingSchema,
  bookingIdParamSchema,
} from '../validators/booking.validator.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get current user's bookings
 *     tags: [Bookings]
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
 */
router.get('/', bookingController.getUserBookings);

/**
 * @swagger
 * /bookings/{id}:
 *   get:
 *     summary: Get booking by ID
 *     tags: [Bookings]
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
 *         description: Access denied
 *       404:
 *         description: Booking not found
 */
router.get(
  '/:id',
  validate({ params: bookingIdParamSchema }),
  bookingController.getBookingById
);

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resourceId
 *               - title
 *               - startTime
 *               - endTime
 *             properties:
 *               resourceId:
 *                 type: string
 *                 format: uuid
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Resource not available or time conflict
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Resource not found
 */
router.post('/', validate({ body: createBookingSchema }), bookingController.createBooking);

/**
 * @swagger
 * /bookings/{id}:
 *   patch:
 *     summary: Update a pending booking
 *     tags: [Bookings]
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
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startTime:
 *                 type: string
 *                 format: date-time
 *               endTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Only pending bookings can be edited
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Booking not found
 */
router.patch(
  '/:id',
  validate({ params: bookingIdParamSchema, body: updateBookingSchema }),
  bookingController.updateBooking
);

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Cancel a pending booking
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Booking cancelled successfully
 *       400:
 *         description: Only pending bookings can be cancelled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Access denied
 *       404:
 *         description: Booking not found
 */
router.delete(
  '/:id',
  validate({ params: bookingIdParamSchema }),
  bookingController.cancelBooking
);

export default router;
