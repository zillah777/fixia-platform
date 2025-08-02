const express = require('express');
const marketplaceController = require('../controllers/marketplaceController');
const { authMiddleware } = require('../middleware/auth');
const { userTypeTransformMiddleware } = require('../middleware/userTypeTransform');
const {
  marketplaceBrowseLimiter,
  sanitizePortfolioInput
} = require('../middleware/portfolioSecurity');

const router = express.Router();

// Apply middleware to all routes
router.use(userTypeTransformMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     MarketplaceProfessional:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Professional ID
 *         first_name:
 *           type: string
 *           description: First name
 *         last_name:
 *           type: string
 *           description: Last name
 *         professional_title:
 *           type: string
 *           description: Professional title
 *         location:
 *           type: string
 *           description: Location
 *         average_rating:
 *           type: number
 *           description: Average rating
 *         review_count:
 *           type: integer
 *           description: Number of reviews
 *         portfolio_images_count:
 *           type: integer
 *           description: Number of portfolio images
 *         min_price:
 *           type: number
 *           description: Minimum service price
 *         max_price:
 *           type: number
 *           description: Maximum service price
 *         is_featured:
 *           type: boolean
 *           description: Whether professional is featured
 *         categories:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 */

/**
 * @swagger
 * /api/marketplace/professionals:
 *   get:
 *     summary: Browse professionals in marketplace
 *     tags: [Marketplace]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: locality
 *         schema:
 *           type: string
 *         description: Filter by locality
 *       - in: query
 *         name: latitude
 *         schema:
 *           type: number
 *         description: Latitude for distance search
 *       - in: query
 *         name: longitude
 *         schema:
 *           type: number
 *         description: Longitude for distance search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           default: 10
 *         description: Search radius in kilometers
 *       - in: query
 *         name: min_rating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: min_price
 *         schema:
 *           type: number
 *         description: Minimum price filter
 *       - in: query
 *         name: max_price
 *         schema:
 *           type: number
 *         description: Maximum price filter
 *       - in: query
 *         name: has_portfolio
 *         schema:
 *           type: boolean
 *         description: Filter professionals with portfolio
 *       - in: query
 *         name: is_verified
 *         schema:
 *           type: boolean
 *         description: Filter verified professionals
 *       - in: query
 *         name: is_premium
 *         schema:
 *           type: boolean
 *         description: Filter premium professionals
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [available, busy, all]
 *           default: all
 *         description: Filter by availability status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [ranking, rating, price_low, price_high, newest, distance]
 *           default: ranking
 *         description: Sort order
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
 *         description: Professionals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 professionals:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MarketplaceProfessional'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     total_items:
 *                       type: integer
 *                 filters_applied:
 *                   type: object
 *                   description: Applied filters summary
 *       429:
 *         description: Rate limit exceeded
 */
router.get('/professionals',
  marketplaceBrowseLimiter,
  sanitizePortfolioInput,
  marketplaceController.browseProfessionals
);

/**
 * @swagger
 * /api/marketplace/featured:
 *   get:
 *     summary: Get featured professionals
 *     tags: [Marketplace]
 *     parameters:
 *       - in: query
 *         name: feature_type
 *         schema:
 *           type: string
 *           enum: [all, homepage, category, location, premium, trending]
 *           default: all
 *         description: Type of featured content
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Category ID for category-featured professionals
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Location for location-featured professionals
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 20
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Featured professionals retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 featured_professionals:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/MarketplaceProfessional'
 *                       - type: object
 *                         properties:
 *                           feature_type:
 *                             type: string
 *                           feature_priority:
 *                             type: integer
 */
router.get('/featured',
  marketplaceBrowseLimiter,
  marketplaceController.getFeaturedProfessionals
);

/**
 * @swagger
 * /api/marketplace/trending:
 *   get:
 *     summary: Get trending portfolio content
 *     tags: [Marketplace]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: time_period
 *         schema:
 *           type: string
 *           default: "7"
 *         description: Time period in days
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *           maximum: 50
 *         description: Maximum number of results
 *     responses:
 *       200:
 *         description: Trending content retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 trending_portfolio:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       thumbnail_path:
 *                         type: string
 *                       views_count:
 *                         type: integer
 *                       likes_count:
 *                         type: integer
 *                       trending_score:
 *                         type: number
 *                       professional_name:
 *                         type: string
 */
router.get('/trending',
  marketplaceBrowseLimiter,
  sanitizePortfolioInput,
  marketplaceController.getTrendingPortfolio
);

/**
 * @swagger
 * /api/marketplace/professional/{professionalId}:
 *   get:
 *     summary: Get professional detail for marketplace
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: professionalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Professional ID
 *     responses:
 *       200:
 *         description: Professional details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 professional:
 *                   allOf:
 *                     - $ref: '#/components/schemas/MarketplaceProfessional'
 *                     - type: object
 *                       properties:
 *                         services:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               title:
 *                                 type: string
 *                               price:
 *                                 type: number
 *                         recent_reviews:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               rating:
 *                                 type: integer
 *                               comment:
 *                                 type: string
 *                               client_name:
 *                                 type: string
 *                         is_favorited:
 *                           type: boolean
 *       404:
 *         description: Professional not found
 */
router.get('/professional/:professionalId',
  marketplaceController.getProfessionalDetail
);

module.exports = router;