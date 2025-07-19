const express = require('express');
const { execute } = require('../utils/database');
const { formatResponse, formatError } = require('../utils/helpers');
const { authenticateToken } = require('../middleware/auth');
const EmailService = require('../services/emailService');

const router = express.Router();

/**
 * POST /api/test-email
 * Enviar email de prueba para verificar configuración
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.user.id;

    // Verificar que el email coincide con el usuario autenticado
    const [users] = await execute(
      'SELECT * FROM users WHERE id = ? AND email = ? AND is_active = TRUE',
      [userId, email]
    );

    if (users.length === 0) {
      return res.status(404).json(formatError('Usuario no encontrado o email no coincide'));
    }

    const user = users[0];

    // Enviar email de prueba
    const emailResult = await EmailService.sendTestEmail(user);

    if (!emailResult.success) {
      return res.status(500).json(formatError('Error al enviar email de prueba'));
    }

    res.json(formatResponse({
      email: user.email,
      message_id: emailResult.messageId
    }, 'Email de prueba enviado exitosamente'));

  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json(formatError('Error al enviar email de prueba'));
  }
});

module.exports = router;