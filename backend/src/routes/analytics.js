const express = require('express');
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');
const { userTypeTransformMiddleware } = require('../middleware/userTypeTransform');
const {
  portfolioInteractionLimiter,
  sanitizePortfolioInput
} = require('../middleware/portfolioSecurity');

const router = express.Router();

// Apply middleware to all routes
router.use(userTypeTransformMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     AnalyticsOverview:
 *       type: object
 *       properties:
 *         total_images:
 *           type: integer
 *           description: Total portfolio images
 *         total_views:
 *           type: integer
 *           description: Total portfolio views
 *         total_likes:
 *           type: integer
 *           description: Total portfolio likes
 *         engagement_rate:
 *           type: number
 *           description: Engagement rate percentage
 *         performance_score:
 *           type: number
 *           description: Overall performance score
 *     ViewTrend:
 *       type: object
 *       properties:
 *         date:
 *           type: string
 *           format: date
 *         views:
 *           type: integer
 *         unique_viewers:
 *           type: integer
 *     PortfolioImageAnalytics:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         views_count:
 *           type: integer
 *         likes_count:
 *           type: integer
 *         view_sources:
 *           type: object
 *           description: Breakdown of view sources
 *         reaction_breakdown:
 *           type: object
 *           description: Breakdown of reactions
 */

/**
 * @swagger
 * /api/analytics/portfolio-view/{imageId}:
 *   post:
 *     summary: Track portfolio image view
 *     tags: [Analytics]
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Portfolio image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               view_source:
 *                 type: string
 *                 enum: [portfolio, marketplace, search, direct, trending]
 *                 default: direct
 *                 description: Source of the view
 *               session_id:
 *                 type: string
 *                 description: User session ID
 *               referrer_url:
 *                 type: string
 *                 description: Referrer URL
 *               user_agent:
 *                 type: string
 *                 description: User agent string
 *     responses:
 *       200:
 *         description: View tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 view_id:
 *                   type: integer
 *                 is_duplicate:
 *                   type: boolean
 *       403:
 *         description: Image not accessible or private
 *       404:
 *         description: Image not found
 */
router.post('/portfolio-view/:imageId',
  portfolioInteractionLimiter,
  analyticsController.trackPortfolioView
);

/**
 * @swagger
 * /api/analytics/portfolio-like/{imageId}:
 *   post:
 *     summary: Like/unlike portfolio image
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Portfolio image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reaction_type:
 *                 type: string
 *                 enum: [like, love, wow, helpful]
 *                 default: like
 *                 description: Type of reaction
 *     responses:
 *       200:
 *         description: Reaction processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 action:
 *                   type: string
 *                   enum: [liked, unliked, updated]
 *                 reaction_type:
 *                   type: string
 *                 likes_count:
 *                   type: integer
 *       404:
 *         description: Image not found
 */
router.post('/portfolio-like/:imageId',
  authMiddleware,
  portfolioInteractionLimiter,
  analyticsController.togglePortfolioLike
);

/**
 * @swagger
 * /api/analytics/professional/{professionalId}:
 *   get:
 *     summary: Get professional analytics dashboard
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: professionalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Professional ID (use 'me' for own analytics)
 *       - in: query
 *         name: time_period
 *         schema:
 *           type: string
 *           default: "30"
 *         description: Time period in days
 *       - in: query
 *         name: include_detailed
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include detailed analytics
 *     responses:
 *       200:
 *         description: Analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analytics:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       $ref: '#/components/schemas/AnalyticsOverview'
 *                     trends:
 *                       type: object
 *                       properties:
 *                         views_growth:
 *                           type: number
 *                         daily_views:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/ViewTrend'
 *                         source_breakdown:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               view_source:
 *                                 type: string
 *                               views:
 *                                 type: integer
 *                     top_performing:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           engagement_score:
 *                             type: number
 *                     time_period:
 *                       type: string
 *       403:
 *         description: Not authorized to view these analytics
 *       404:
 *         description: Professional not found
 */
router.get('/professional/:professionalId',
  authMiddleware,
  sanitizePortfolioInput,
  analyticsController.getProfessionalAnalytics
);

/**
 * @swagger
 * /api/analytics/portfolio-image/{imageId}:
 *   get:
 *     summary: Get portfolio image analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Portfolio image ID
 *     responses:
 *       200:
 *         description: Image analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 image_analytics:
 *                   $ref: '#/components/schemas/PortfolioImageAnalytics'
 *       403:
 *         description: Not authorized to view these analytics
 *       404:
 *         description: Image not found
 */
router.get('/portfolio-image/:imageId',
  authMiddleware,
  analyticsController.getPortfolioImageAnalytics
);

module.exports = router;