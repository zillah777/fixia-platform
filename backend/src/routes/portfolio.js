const express = require('express');
const portfolioController = require('../controllers/portfolioController');
const { authMiddleware } = require('../middleware/auth');
const { userTypeTransformMiddleware } = require('../middleware/userTypeTransform');
const {
  portfolioUploadLimiter,
  portfolioInteractionLimiter,
  validateFileUpload,
  sanitizePortfolioInput,
  enforcePrivacyControls,
  detectAbusePatterns,
  contentModerationFilter
} = require('../middleware/portfolioSecurity');

const router = express.Router();

// Apply middleware to all routes
router.use(userTypeTransformMiddleware);

/**
 * @swagger
 * components:
 *   schemas:
 *     PortfolioImage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Image ID
 *         title:
 *           type: string
 *           description: Image title
 *         description:
 *           type: string
 *           description: Image description
 *         file_path:
 *           type: string
 *           description: Original file path
 *         thumbnail_path:
 *           type: string
 *           description: Thumbnail file path
 *         views_count:
 *           type: integer
 *           description: Number of views
 *         likes_count:
 *           type: integer
 *           description: Number of likes
 *         is_featured:
 *           type: boolean
 *           description: Whether image is featured
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 */

/**
 * @swagger
 * /api/portfolio/upload:
 *   post:
 *     summary: Upload portfolio images
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Portfolio images (max 10 files, 10MB each)
 *               title:
 *                 type: string
 *                 description: Title for the images
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 description: Description for the images
 *                 maxLength: 2000
 *               category_id:
 *                 type: integer
 *                 description: Category ID
 *               tags:
 *                 type: string
 *                 description: JSON array of tags
 *               project_value:
 *                 type: number
 *                 description: Project value in ARS
 *               is_featured:
 *                 type: boolean
 *                 description: Whether to mark as featured
 *     responses:
 *       201:
 *         description: Images uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 images:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PortfolioImage'
 *       400:
 *         description: Invalid input or file validation failed
 *       429:
 *         description: Rate limit exceeded
 */
router.post('/upload',
  authMiddleware,
  portfolioUploadLimiter,
  detectAbusePatterns,
  sanitizePortfolioInput,
  contentModerationFilter,
  portfolioController.uploadPortfolioImages
);

/**
 * @swagger
 * /api/portfolio/{userId}:
 *   get:
 *     summary: Get portfolio for a professional
 *     tags: [Portfolio]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Professional user ID
 *       - in: query
 *         name: category_id
 *         schema:
 *           type: integer
 *         description: Filter by category
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
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [featured_first, most_viewed, most_liked, newest, oldest]
 *           default: featured_first
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Portfolio retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 images:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PortfolioImage'
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total_images:
 *                       type: integer
 *                     total_views:
 *                       type: integer
 *                     total_likes:
 *                       type: integer
 *       403:
 *         description: Portfolio is private or access denied
 *       404:
 *         description: User not found
 */
router.get('/:userId',
  enforcePrivacyControls,
  sanitizePortfolioInput,
  portfolioController.getPortfolio
);

/**
 * @swagger
 * /api/portfolio/image/{imageId}:
 *   put:
 *     summary: Update portfolio image
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 maxLength: 2000
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_featured:
 *                 type: boolean
 *               is_marketplace_visible:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Image updated successfully
 *       403:
 *         description: Not authorized to update this image
 *       404:
 *         description: Image not found
 */
router.put('/image/:imageId',
  authMiddleware,
  sanitizePortfolioInput,
  contentModerationFilter,
  portfolioController.updatePortfolioImage
);

/**
 * @swagger
 * /api/portfolio/image/{imageId}:
 *   delete:
 *     summary: Delete portfolio image
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Image ID
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       403:
 *         description: Not authorized to delete this image
 *       404:
 *         description: Image not found
 */
router.delete('/image/:imageId',
  authMiddleware,
  portfolioController.deletePortfolioImage
);

/**
 * @swagger
 * /api/portfolio/image/{imageId}/feature:
 *   post:
 *     summary: Set featured image
 *     tags: [Portfolio]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Image ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [profile, portfolio]
 *                 default: portfolio
 *                 description: Type of featured setting
 *     responses:
 *       200:
 *         description: Featured status updated successfully
 *       403:
 *         description: Not authorized to modify this image
 *       404:
 *         description: Image not found
 */
router.post('/image/:imageId/feature',
  authMiddleware,
  portfolioController.setFeaturedImage
);

module.exports = router;