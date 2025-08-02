const express = require('express');
const favoritesController = require('../controllers/favoritesController');
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
 *     ExplorerFavorite:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Favorite ID
 *         favorite_type:
 *           type: string
 *           enum: [professional, service, portfolio_image]
 *           description: Type of favorited item
 *         category:
 *           type: string
 *           enum: [general, urgent, future, inspiration]
 *           description: Favorite category
 *         priority:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *           description: Priority level
 *         private_notes:
 *           type: string
 *           description: Private notes about the favorite
 *         created_at:
 *           type: string
 *           format: date-time
 *         professional_info:
 *           type: object
 *           description: Professional details (when favorite_type is professional)
 *         service_info:
 *           type: object
 *           description: Service details (when favorite_type is service)
 *         portfolio_image_info:
 *           type: object
 *           description: Portfolio image details (when favorite_type is portfolio_image)
 */

/**
 * @swagger
 * /api/favorites/add:
 *   post:
 *     summary: Add item to favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - favorite_type
 *             properties:
 *               favorite_type:
 *                 type: string
 *                 enum: [professional, service, portfolio_image]
 *                 description: Type of item to favorite
 *               favorited_user_id:
 *                 type: integer
 *                 description: Professional ID (required for professional type)
 *               favorited_service_id:
 *                 type: integer
 *                 description: Service ID (required for service type)
 *               favorited_image_id:
 *                 type: integer
 *                 description: Portfolio image ID (required for portfolio_image type)
 *               category:
 *                 type: string
 *                 enum: [general, urgent, future, inspiration]
 *                 default: general
 *                 description: Favorite category
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 default: 3
 *                 description: Priority level
 *               private_notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Private notes
 *     responses:
 *       201:
 *         description: Item added to favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 favorite:
 *                   $ref: '#/components/schemas/ExplorerFavorite'
 *       400:
 *         description: Invalid input or missing required fields
 *       403:
 *         description: Only clients can add favorites
 *       404:
 *         description: Target item not found
 *       409:
 *         description: Item already in favorites
 */
router.post('/add',
  authMiddleware,
  portfolioInteractionLimiter,
  sanitizePortfolioInput,
  favoritesController.addToFavorites
);

/**
 * @swagger
 * /api/favorites/mine:
 *   get:
 *     summary: Get user's favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: favorite_type
 *         schema:
 *           type: string
 *           enum: [all, professional, service, portfolio_image]
 *           default: all
 *         description: Filter by favorite type
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [all, general, urgent, future, inspiration]
 *           default: all
 *         description: Filter by category
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [priority, newest, oldest, alphabetical]
 *           default: priority
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
 *         description: Favorites retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 favorites:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExplorerFavorite'
 *                 summary:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       favorite_type:
 *                         type: string
 *                       category:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *                     total_items:
 *                       type: integer
 *       403:
 *         description: Only clients can view favorites
 */
router.get('/mine',
  authMiddleware,
  sanitizePortfolioInput,
  favoritesController.getFavorites
);

/**
 * @swagger
 * /api/favorites/{favoriteId}:
 *   delete:
 *     summary: Remove item from favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: favoriteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Favorite ID
 *     responses:
 *       200:
 *         description: Item removed from favorites successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       403:
 *         description: Only clients can remove favorites
 *       404:
 *         description: Favorite not found
 */
router.delete('/:favoriteId',
  authMiddleware,
  favoritesController.removeFromFavorites
);

/**
 * @swagger
 * /api/favorites/{favoriteId}:
 *   put:
 *     summary: Update favorite (notes, category, priority)
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: favoriteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Favorite ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 enum: [general, urgent, future, inspiration]
 *                 description: Update category
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Update priority
 *               private_notes:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Update notes
 *     responses:
 *       200:
 *         description: Favorite updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 favorite:
 *                   $ref: '#/components/schemas/ExplorerFavorite'
 *       400:
 *         description: No fields provided for update
 *       403:
 *         description: Only clients can update favorites
 *       404:
 *         description: Favorite not found
 */
router.put('/:favoriteId',
  authMiddleware,
  sanitizePortfolioInput,
  favoritesController.updateFavorite
);

/**
 * @swagger
 * /api/favorites/bulk:
 *   post:
 *     summary: Bulk operations on favorites
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *               - favorite_ids
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [delete, update_category, update_priority]
 *                 description: Bulk operation type
 *               favorite_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of favorite IDs
 *               category:
 *                 type: string
 *                 enum: [general, urgent, future, inspiration]
 *                 description: Category for update_category action
 *               priority:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Priority for update_priority action
 *     responses:
 *       200:
 *         description: Bulk operation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 affected_count:
 *                   type: integer
 *       400:
 *         description: Invalid action or missing required fields
 *       403:
 *         description: Some favorites don't belong to user or not client
 */
router.post('/bulk',
  authMiddleware,
  sanitizePortfolioInput,
  favoritesController.bulkUpdateFavorites
);

module.exports = router;