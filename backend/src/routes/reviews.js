const express = require('express');
const reviewsController = require('../controllers/reviewsController');
const { authMiddleware } = require('../middleware/auth');
const { reviewValidation } = require('../utils/validation');
const { sensitiveLimiter } = require('../middleware/security');

const router = express.Router();

// GET /api/reviews - Get reviews with filters (public)
router.get('/', reviewsController.getReviews);

// GET /api/reviews/:id - Get review details
router.get('/:id', reviewsController.getReviewById);

// POST /api/reviews - Create new review
router.post('/', authMiddleware, sensitiveLimiter, reviewValidation, reviewsController.createReview);

// PUT /api/reviews/:id - Update review
router.put('/:id', authMiddleware, reviewValidation, reviewsController.updateReview);

// DELETE /api/reviews/:id - Delete review
router.delete('/:id', authMiddleware, reviewsController.deleteReview);

// GET /api/reviews/provider/:providerId/stats - Get provider review statistics
router.get('/provider/:providerId/stats', reviewsController.getProviderReviewStats);

// GET /api/reviews/service/:serviceId/stats - Get service review statistics
router.get('/service/:serviceId/stats', reviewsController.getServiceReviewStats);

module.exports = router;