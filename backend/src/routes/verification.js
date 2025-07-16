const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { query } = require('../config/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/verifications');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const fieldName = file.fieldname; // dniFront, dniBack, selfie
    cb(null, `${req.user.id}-${fieldName}-${uniqueSuffix}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Solo se permiten archivos de imagen'));
    }
    cb(null, true);
  }
});

// POST /api/verification/dni
router.post('/dni', authMiddleware, upload.fields([
  { name: 'dniFront', maxCount: 1 },
  { name: 'dniBack', maxCount: 1 },
  { name: 'selfie', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = req.user.id;
    const files = req.files;

    // Validate that all required files are present
    if (!files.dniFront || !files.dniBack || !files.selfie) {
      return res.status(400).json({
        success: false,
        error: 'Todos los documentos son requeridos (DNI frente, DNI dorso, selfie)'
      });
    }

    // Get file paths
    const dniFrontPath = files.dniFront[0].filename;
    const dniBackPath = files.dniBack[0].filename;
    const selfiePath = files.selfie[0].filename;

    // Check if user already has a verification record
    const existingVerification = await query(
      'SELECT id FROM user_verifications WHERE user_id = $1',
      [userId]
    );

    if (existingVerification.rows.length > 0) {
      // Update existing verification
      await query(`
        UPDATE user_verifications 
        SET 
          dni_front_url = $1,
          dni_back_url = $2,
          selfie_url = $3,
          verification_status = 'pending',
          submitted_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $4
      `, [dniFrontPath, dniBackPath, selfiePath, userId]);
    } else {
      // Create new verification record
      await query(`
        INSERT INTO user_verifications (
          user_id,
          dni_front_url,
          dni_back_url,
          selfie_url,
          verification_status,
          submitted_at
        ) VALUES ($1, $2, $3, $4, 'pending', CURRENT_TIMESTAMP)
      `, [userId, dniFrontPath, dniBackPath, selfiePath]);
    }

    // Update user verification status
    await query(`
      UPDATE users 
      SET 
        verification_status = 'in_review',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [userId]);

    // TODO: Send notification to admin for review
    // TODO: Send confirmation email to user

    res.json({
      success: true,
      message: 'Documentos de verificación enviados correctamente',
      data: {
        status: 'in_review',
        submitted_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('DNI verification error:', error);
    
    // Clean up uploaded files in case of error
    if (req.files) {
      Object.values(req.files).flat().forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }

    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// GET /api/verification/status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        uv.verification_status,
        uv.submitted_at,
        uv.reviewed_at,
        uv.reviewer_notes,
        u.verification_status as user_verification_status
      FROM users u
      LEFT JOIN user_verifications uv ON u.id = uv.user_id
      WHERE u.id = $1
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const verification = result.rows[0];

    res.json({
      success: true,
      message: 'Estado de verificación obtenido',
      data: {
        status: verification.verification_status || 'not_submitted',
        user_status: verification.user_verification_status,
        submitted_at: verification.submitted_at,
        reviewed_at: verification.reviewed_at,
        notes: verification.reviewer_notes
      }
    });

  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/verification/approve/:userId (Admin only)
router.post('/approve/:userId', authMiddleware, async (req, res) => {
  try {
    // TODO: Add admin role check
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado'
      });
    }

    const { userId } = req.params;
    const { notes } = req.body;

    // Update verification status
    await query(`
      UPDATE user_verifications 
      SET 
        verification_status = 'approved',
        reviewed_at = CURRENT_TIMESTAMP,
        reviewer_id = $1,
        reviewer_notes = $2
      WHERE user_id = $3
    `, [req.user.id, notes, userId]);

    // Update user verification status
    await query(`
      UPDATE users 
      SET 
        verification_status = 'verified',
        is_verified = true,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [userId]);

    // TODO: Send approval notification to user

    res.json({
      success: true,
      message: 'Verificación aprobada exitosamente'
    });

  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// POST /api/verification/reject/:userId (Admin only)
router.post('/reject/:userId', authMiddleware, async (req, res) => {
  try {
    // TODO: Add admin role check
    if (req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Acceso denegado'
      });
    }

    const { userId } = req.params;
    const { notes } = req.body;

    // Update verification status
    await query(`
      UPDATE user_verifications 
      SET 
        verification_status = 'rejected',
        reviewed_at = CURRENT_TIMESTAMP,
        reviewer_id = $1,
        reviewer_notes = $2
      WHERE user_id = $3
    `, [req.user.id, notes, userId]);

    // Update user verification status
    await query(`
      UPDATE users 
      SET 
        verification_status = 'rejected',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [userId]);

    // TODO: Send rejection notification to user

    res.json({
      success: true,
      message: 'Verificación rechazada'
    });

  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;