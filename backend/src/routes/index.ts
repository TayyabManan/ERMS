import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import resourceRoutes from './resource.routes.js';
import bookingRoutes from './booking.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/resources', resourceRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);

export default router;
