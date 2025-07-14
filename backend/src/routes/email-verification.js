const express = require('express');
const { execute } = require('../utils/database');
const { formatResponse, formatError } = require('../utils/helpers');
const EmailService = require('../services/emailService');

const router = express.Router();

/**
 * POST /api/email-verification/verify
 * Verificar token de email
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json(formatError('Token es requerido'));
    }

    // Verificar token
    const result = await EmailService.verifyEmailToken(token);

    if (!result.success) {
      return res.status(400).json(formatError(result.error));
    }

    // Obtener usuario verificado
    const [users] = await execute(
      'SELECT * FROM users WHERE id = ?',
      [result.userId]
    );

    if (users.length === 0) {
      return res.status(404).json(formatError('Usuario no encontrado'));
    }

    const user = users[0];

    // Enviar email de bienvenida
    try {
      await EmailService.sendWelcomeEmail(user, user.user_type);
      console.log(`✅ Welcome email sent to ${user.email}`);
    } catch (emailError) {
      console.error('⚠️ Failed to send welcome email:', emailError);
      // No fallar la verificación si el email falla
    }

    res.json(formatResponse({
      user_id: user.id,
      email: user.email,
      verified: true
    }, 'Email verificado exitosamente. ¡Bienvenido a Fixia!'));

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json(formatError('Error al verificar email'));
  }
});

/**
 * POST /api/email-verification/resend
 * Reenviar email de verificación
 */
router.post('/resend', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(formatError('Email es requerido'));
    }

    // Buscar usuario por email
    const [users] = await execute(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (users.length === 0) {
      return res.status(404).json(formatError('Usuario no encontrado'));
    }

    const user = users[0];

    // Verificar si ya está verificado
    if (user.email_verified) {
      return res.status(400).json(formatError('Este email ya está verificado'));
    }

    // Enviar nuevo email de verificación
    const emailResult = await EmailService.sendVerificationEmail(user, user.user_type);

    if (!emailResult.success) {
      return res.status(500).json(formatError('Error al enviar email de verificación'));
    }

    res.json(formatResponse({
      email: user.email,
      message_id: emailResult.messageId
    }, 'Email de verificación reenviado exitosamente'));

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json(formatError('Error al reenviar email de verificación'));
  }
});

/**
 * POST /api/email-verification/forgot-password
 * Solicitar recuperación de contraseña
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json(formatError('Email es requerido'));
    }

    // Buscar usuario por email
    const [users] = await execute(
      'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
      [email]
    );

    if (users.length === 0) {
      // Por seguridad, no revelar si el email existe o no
      return res.json(formatResponse({
        email: email
      }, 'Si el email existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña'));
    }

    const user = users[0];

    // Enviar email de recuperación
    const emailResult = await EmailService.sendPasswordResetEmail(user);

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      // No revelar el error por seguridad
    }

    res.json(formatResponse({
      email: email
    }, 'Si el email existe en nuestro sistema, recibirás instrucciones para recuperar tu contraseña'));

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json(formatError('Error al procesar solicitud'));
  }
});

/**
 * POST /api/email-verification/reset-password
 * Restablecer contraseña con token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json(formatError('Token y nueva contraseña son requeridos'));
    }

    if (newPassword.length < 6) {
      return res.status(400).json(formatError('La contraseña debe tener al menos 6 caracteres'));
    }

    // Verificar token de recuperación
    const result = await EmailService.verifyEmailToken(token, 'password_reset');

    if (!result.success) {
      return res.status(400).json(formatError(result.error));
    }

    // Hash nueva contraseña
    const { hashPassword } = require('../utils/helpers');
    const password_hash = await hashPassword(newPassword);

    // Actualizar contraseña
    await execute(
      'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [password_hash, result.userId]
    );

    res.json(formatResponse({
      user_id: result.userId
    }, 'Contraseña restablecida exitosamente'));

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json(formatError('Error al restablecer contraseña'));
  }
});

/**
 * GET /api/email-verification/status/:userId
 * Verificar estado de verificación de email
 */
router.get('/status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [users] = await execute(
      'SELECT id, email, email_verified, email_verified_at FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json(formatError('Usuario no encontrado'));
    }

    const user = users[0];

    res.json(formatResponse({
      user_id: user.id,
      email: user.email,
      verified: user.email_verified,
      verified_at: user.email_verified_at
    }, 'Estado de verificación obtenido'));

  } catch (error) {
    console.error('Get verification status error:', error);
    res.status(500).json(formatError('Error al obtener estado de verificación'));
  }
});

module.exports = router;