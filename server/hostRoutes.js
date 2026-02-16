import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getEarningsSummary,
  getEarningsDetail,
  getHostProfile,
  getUpcomingBookings,
  getRecentReviews,
} from '../controllers/hostController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Earnings endpoints
router.get('/earnings/summary', getEarningsSummary);
router.get('/earnings/detail', getEarningsDetail);

// Host profile
router.get('/my-profile', getHostProfile);
router.get('/:id', getHostProfile);

// Bookings
router.get('/bookings', getUpcomingBookings);

// Reviews
router.get('/reviews', getRecentReviews);

export default router;