const { body, validationResult } = require('express-validator');
const validator = require('validator');

// Security helper functions
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return validator.escape(input.trim());
};

const validateEmail = (email) => {
  return validator.isEmail(email) && email.length <= 255;
};

const validatePassword = (password) => {
  return password && password.length >= 8 && password.length <= 128;
};

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Datos de entrada inválidos',
      details: errors.array()
    });
  }
  next();
};

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .isLength({ min: 8, max: 128 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número'),
  body('first_name')
    .isLength({ min: 2, max: 50 })
    .trim()
    .escape()
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('El nombre debe tener entre 2 y 50 caracteres y solo contener letras'),
  body('last_name')
    .isLength({ min: 2, max: 50 })
    .trim()
    .escape()
    .matches(/^[a-zA-ZÀ-ÿ\s]+$/)
    .withMessage('El apellido debe tener entre 2 y 50 caracteres y solo contener letras'),
  body('user_type')
    .isIn(['customer', 'client', 'provider'])
    .withMessage('Tipo de usuario inválido'),
  body('phone')
    .optional()
    .isMobilePhone('es-AR')
    .withMessage('Número de teléfono inválido'),
  handleValidationErrors
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email inválido'),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida'),
  handleValidationErrors
];

const serviceValidation = [
  body('title')
    .isLength({ min: 5, max: 200 })
    .trim()
    .withMessage('El título debe tener entre 5 y 200 caracteres'),
  body('description')
    .isLength({ min: 20, max: 1000 })
    .trim()
    .withMessage('La descripción debe tener entre 20 y 1000 caracteres'),
  body('category')
    .isIn(['plomeria', 'electricidad', 'limpieza', 'reparaciones', 'belleza', 'otros'])
    .withMessage('Categoría inválida'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número válido mayor a 0'),
  body('duration_minutes')
    .isInt({ min: 15, max: 480 })
    .withMessage('La duración debe estar entre 15 y 480 minutos'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('La dirección no puede exceder 500 caracteres'),
  body('latitude')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud inválida'),
  body('longitude')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud inválida'),
  handleValidationErrors
];

const bookingValidation = [
  body('service_id')
    .isInt({ min: 1 })
    .withMessage('ID de servicio inválido'),
  body('scheduled_date')
    .isISO8601()
    .withMessage('Fecha inválida'),
  body('scheduled_time')
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Hora inválida (formato HH:MM)'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Las notas no pueden exceder 500 caracteres'),
  body('customer_address')
    .isLength({ min: 10, max: 500 })
    .withMessage('La dirección debe tener entre 10 y 500 caracteres'),
  body('customer_latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitud inválida'),
  body('customer_longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitud inválida'),
  handleValidationErrors
];

const reviewValidation = [
  body('booking_id')
    .isInt({ min: 1 })
    .withMessage('ID de reserva inválido'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('La calificación debe estar entre 1 y 5'),
  body('comment')
    .optional()
    .isLength({ max: 500 })
    .withMessage('El comentario no puede exceder 500 caracteres'),
  handleValidationErrors
];

const messageValidation = [
  body('content')
    .isLength({ min: 1, max: 1000 })
    .trim()
    .withMessage('El mensaje debe tener entre 1 y 1000 caracteres'),
  body('message_type')
    .optional()
    .isIn(['text', 'image'])
    .withMessage('Tipo de mensaje inválido'),
  handleValidationErrors
];

// Payment validation
const paymentValidation = [
  body('booking_id')
    .isInt({ min: 1 })
    .withMessage('ID de reserva inválido'),
  body('payment_method')
    .isIn(['credit_card', 'debit_card', 'transfer', 'cash'])
    .withMessage('Método de pago inválido'),
  handleValidationErrors
];

// Notification validation
const notificationValidation = [
  body('user_id')
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
  body('title')
    .isLength({ min: 1, max: 255 })
    .trim()
    .escape()
    .withMessage('El título debe tener entre 1 y 255 caracteres'),
  body('message')
    .isLength({ min: 1, max: 1000 })
    .trim()
    .escape()
    .withMessage('El mensaje debe tener entre 1 y 1000 caracteres'),
  body('type')
    .isIn(['booking', 'payment', 'review', 'chat', 'system'])
    .withMessage('Tipo de notificación inválido'),
  handleValidationErrors
];

module.exports = {
  registerValidation,
  loginValidation,
  serviceValidation,
  bookingValidation,
  reviewValidation,
  messageValidation,
  paymentValidation,
  notificationValidation,
  handleValidationErrors,
  sanitizeInput,
  validateEmail,
  validatePassword
};