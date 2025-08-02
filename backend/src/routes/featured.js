const express = require('express');
const featuredController = require('../controllers/featuredController');
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
 *     FeaturedPlacement:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Placement ID
 *         user_id:
 *           type: integer
 *           description: Professional user ID
 *         feature_type:
 *           type: string
 *           enum: [homepage, category, location, premium, trending]
 *           description: Type of featured placement
 *         feature_priority:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           description: Priority level (higher = more prominent)
 *         target_category_id:
 *           type: integer
 *           description: Target category ID (for category features)
 *         target_location:
 *           type: string
 *           description: Target location (for location features)
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: Start date (null for immediate)
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: End date (null for no expiration)
 *         cost:
 *           type: number
 *           description: Cost in ARS
 *         impressions_count:
 *           type: integer
 *           description: Number of impressions
 *         clicks_count:
 *           type: integer
 *           description: Number of clicks
 *         conversions_count:
 *           type: integer
 *           description: Number of conversions
 *         is_active:
 *           type: boolean
 *           description: Whether placement is active
 *     FeaturedAnalytics:
 *       type: object
 *       properties:
 *         placement_info:
 *           $ref: '#/components/schemas/FeaturedPlacement'
 *         performance_summary:
 *           type: object
 *           properties:
 *             total_impressions:
 *               type: integer
 *             total_clicks:
 *               type: integer
 *             total_conversions:
 *               type: integer
 *             ctr:
 *               type: string
 *               description: Click-through rate percentage
 *             conversion_rate:
 *               type: string
 *               description: Conversion rate percentage
 *             roi_percentage:
 *               type: string
 *               description: Return on investment percentage
 */

/**
 * @swagger
 * /api/featured/create:
 *   post:
 *     summary: Create featured professional placement (Admin only)
 *     tags: [Featured]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - feature_type
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: Professional user ID
 *               feature_type:
 *                 type: string
 *                 enum: [homepage, category, location, premium, trending]
 *                 description: Type of featured placement
 *               feature_priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 1
 *                 description: Priority level
 *               target_category_id:
 *                 type: integer
 *                 description: Target category (for category features)
 *               target_location:
 *                 type: string
 *                 description: Target location (for location features)
 *               start_date:
 *                 type: string
 *                 format: date-time
 *                 description: Start date (optional)
 *               end_date:
 *                 type: string
 *                 format: date-time
 *                 description: End date (optional)
 *               cost:
 *                 type: number
 *                 default: 0
 *                 description: Cost in ARS
 *               description:
 *                 type: string
 *                 description: Placement description
 *     responses:
 *       201:
 *         description: Featured placement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 featured_placement:
 *                   $ref: '#/components/schemas/FeaturedPlacement'
 *       400:
 *         description: Invalid input or user not eligible
 *       403:
 *         description: Admin access required
 *       404:
 *         description: User not found
 *       409:
 *         description: Conflicting placement already exists
 */
router.post('/create',
  authMiddleware,
  sanitizePortfolioInput,
  featuredController.createFeaturedPlacement
);

/**
 * @swagger
 * /api/featured/list:
 *   get:
 *     summary: Get featured placements (Admin only)
 *     tags: [Featured]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: feature_type
 *         schema:
 *           type: string
 *           enum: [all, homepage, category, location, premium, trending]
 *           default: all
 *         description: Filter by feature type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, expired, scheduled, all]
 *           default: active
 *         description: Filter by status
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by specific user
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Featured placements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 featured_placements:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/FeaturedPlacement'
 *                       - type: object
 *                         properties:
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           professional_title:
 *                             type: string
 *                           ctr_percentage:
 *                             type: number
 *                           conversion_rate_percentage:
 *                             type: number
 *                           roi_percentage:
 *                             type: number
 *                 summary:
 *                   type: object
 *                   properties:
 *                     total_placements:
 *                       type: integer
 *                     active_placements:
 *                       type: integer
 *                     total_cost:
 *                       type: number
 *                     overall_ctr:
 *                       type: string
 *                 pagination:
 *                   type: object
 *       403:
 *         description: Admin access required
 */
router.get('/list',
  authMiddleware,
  sanitizePortfolioInput,
  featuredController.getFeaturedPlacements
);

/**
 * @swagger
 * /api/featured/{placementId}:
 *   put:
 *     summary: Update featured placement (Admin only)
 *     tags: [Featured]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placementId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Placement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               feature_priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *               target_category_id:
 *                 type: integer
 *               target_location:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date-time
 *               end_date:
 *                 type: string
 *                 format: date-time
 *               cost:
 *                 type: number
 *               description:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Placement updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 featured_placement:
 *                   $ref: '#/components/schemas/FeaturedPlacement'
 *       400:
 *         description: No fields provided for update
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Placement not found
 */
router.put('/:placementId',
  authMiddleware,
  sanitizePortfolioInput,
  featuredController.updateFeaturedPlacement
);

/**
 * @swagger
 * /api/featured/{placementId}/click:
 *   post:
 *     summary: Track featured professional click
 *     tags: [Featured]
 *     parameters:
 *       - in: path
 *         name: placementId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Placement ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               click_source:
 *                 type: string
 *                 enum: [homepage, search, category, direct]
 *                 default: unknown
 *                 description: Source of the click
 *               session_id:
 *                 type: string
 *                 description: User session ID
 *               referrer_url:
 *                 type: string
 *                 description: Referrer URL
 *     responses:
 *       200:
 *         description: Click tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 professional:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *       404:
 *         description: Placement not found or not active
 */
router.post('/:placementId/click',
  portfolioInteractionLimiter,
  featuredController.trackFeaturedClick
);

/**
 * @swagger
 * /api/featured/{placementId}/analytics:
 *   get:
 *     summary: Get featured professional performance analytics (Admin only)
 *     tags: [Featured]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placementId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Placement ID
 *       - in: query
 *         name: time_period
 *         schema:
 *           type: string
 *           default: "30"
 *         description: Time period in days
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
 *                   $ref: '#/components/schemas/FeaturedAnalytics'
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Placement not found
 */
router.get('/:placementId/analytics',
  authMiddleware,
  sanitizePortfolioInput,
  featuredController.getFeaturedAnalytics
);

module.exports = router;