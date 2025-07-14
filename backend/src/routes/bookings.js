const express = require('express');
const bookingsController = require('../controllers/bookingsController');
const { authMiddleware } = require('../middleware/auth');
const { bookingValidation } = require('../utils/validation');
const { sensitiveLimiter } = require('../middleware/security');

const router = express.Router();

// GET /api/bookings - Get user's bookings
router.get('/', authMiddleware, bookingsController.getBookings);

// GET /api/bookings/:id - Get booking details
router.get('/:id', authMiddleware, bookingsController.getBookingById);

// POST /api/bookings - Create new booking
router.post('/', authMiddleware, sensitiveLimiter, bookingValidation, bookingsController.createBooking);

// PUT /api/bookings/:id/status - Update booking status
router.put('/:id/status', authMiddleware, bookingsController.updateBookingStatus);

// DELETE /api/bookings/:id - Delete booking
router.delete('/:id', authMiddleware, bookingsController.deleteBooking);

// GET /api/bookings/stats - Get booking statistics
router.get('/stats', authMiddleware, bookingsController.getBookingStats);

module.exports = router;