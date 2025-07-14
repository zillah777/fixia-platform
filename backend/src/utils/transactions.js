const { pool } = require('../config/database');

/**
 * Ejecuta una función dentro de una transacción
 * @param {Function} fn - Función a ejecutar dentro de la transacción
 * @returns {Promise<any>} - Resultado de la función
 */
const withTransaction = async (fn) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const result = await fn(client);
    
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Middleware para manejar transacciones automáticamente
 */
const transactionMiddleware = (fn) => {
  return async (req, res, next) => {
    try {
      const result = await withTransaction(async (client) => {
        req.client = client;
        return await fn(req, res, next);
      });
      
      return result;
    } catch (error) {
      console.error('Transaction error:', error);
      
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          error: 'Error en la transacción'
        });
      }
      
      next(error);
    }
  };
};

/**
 * Crear una reserva con verificación de concurrencia
 * @param {Object} client - Cliente de base de datos
 * @param {Object} bookingData - Datos de la reserva
 * @returns {Promise<Object>} - Reserva creada
 */
const createBookingWithLock = async (client, bookingData) => {
  const {
    customerId,
    providerId,
    serviceId,
    scheduledDate,
    scheduledTime,
    totalAmount,
    notes,
    customerAddress,
    customerLatitude,
    customerLongitude,
    durationMinutes,
    customerPhone,
    providerPhone
  } = bookingData;

  // Verificar conflictos con lock
  const conflictResult = await client.query(`
    SELECT id FROM bookings 
    WHERE provider_id = $1 
    AND scheduled_date = $2 
    AND scheduled_time = $3 
    AND status IN ('pending', 'confirmed', 'in_progress')
    FOR UPDATE
  `, [providerId, scheduledDate, scheduledTime]);

  if (conflictResult.rows.length > 0) {
    throw new Error('El profesional ya tiene una reserva en ese horario');
  }

  // Validar que la fecha sea futura
  const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
  const now = new Date();

  if (scheduledDateTime <= now) {
    throw new Error('No se pueden crear reservas en el pasado');
  }

  const maxFutureDate = new Date();
  maxFutureDate.setMonth(maxFutureDate.getMonth() + 6);

  if (scheduledDateTime > maxFutureDate) {
    throw new Error('No se pueden crear reservas con más de 6 meses de anticipación');
  }

  // Crear la reserva
  const result = await client.query(`
    INSERT INTO bookings (
      customer_id, provider_id, service_id, scheduled_date, scheduled_time,
      total_amount, notes, customer_address, customer_latitude, customer_longitude,
      duration_minutes, customer_phone, provider_phone
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *
  `, [
    customerId, providerId, serviceId, scheduledDate, scheduledTime,
    totalAmount, notes, customerAddress, customerLatitude, customerLongitude,
    durationMinutes, customerPhone, providerPhone
  ]);

  return result.rows[0];
};

/**
 * Actualizar estadísticas de servicio de forma atómica
 * @param {Object} client - Cliente de base de datos
 * @param {number} serviceId - ID del servicio
 * @returns {Promise<void>}
 */
const updateServiceRatingStats = async (client, serviceId) => {
  const statsResult = await client.query(`
    SELECT 
      COUNT(*) as total_reviews,
      COALESCE(AVG(rating), 0) as average_rating
    FROM reviews 
    WHERE service_id = $1
  `, [serviceId]);

  const stats = statsResult.rows[0];

  await client.query(`
    UPDATE services 
    SET 
      total_reviews = $1,
      average_rating = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `, [
    parseInt(stats.total_reviews),
    parseFloat(stats.average_rating),
    serviceId
  ]);
};

/**
 * Procesar pago de forma atómica
 * @param {Object} client - Cliente de base de datos
 * @param {Object} paymentData - Datos del pago
 * @returns {Promise<Object>} - Resultado del pago
 */
const processPaymentAtomic = async (client, paymentData) => {
  const { paymentId, status, externalId, bookingId } = paymentData;

  // Validar transiciones de estado
  const validStatusTransitions = {
    'pending': ['approved', 'rejected', 'cancelled'],
    'approved': ['refunded'],
    'rejected': [],
    'cancelled': [],
    'refunded': []
  };

  // Obtener estado actual
  const currentPayment = await client.query(`
    SELECT status FROM payments WHERE id = $1
  `, [paymentId]);

  const currentStatus = currentPayment.rows[0].status;

  if (!validStatusTransitions[currentStatus]?.includes(status)) {
    throw new Error(`No se puede cambiar el estado de ${currentStatus} a ${status}`);
  }

  // Actualizar pago
  const updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
  const updateValues = [status];
  let paramIndex = 2;

  if (externalId) {
    updateFields.push(`external_id = $${paramIndex}`);
    updateValues.push(externalId);
    paramIndex++;
  }

  updateValues.push(paymentId);

  const paymentResult = await client.query(`
    UPDATE payments 
    SET ${updateFields.join(', ')}
    WHERE id = $${paramIndex}
    RETURNING *
  `, updateValues);

  // Actualizar estado de reserva
  let bookingPaymentStatus = 'pending';
  if (status === 'approved') {
    bookingPaymentStatus = 'paid';
  } else if (status === 'rejected' || status === 'cancelled') {
    bookingPaymentStatus = 'failed';
  } else if (status === 'refunded') {
    bookingPaymentStatus = 'refunded';
  }

  await client.query(`
    UPDATE bookings 
    SET payment_status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
  `, [bookingPaymentStatus, bookingId]);

  return paymentResult.rows[0];
};

/**
 * Validar políticas de reembolso
 * @param {Object} payment - Datos del pago
 * @param {Object} booking - Datos de la reserva
 * @returns {boolean} - Si se puede reembolsar
 */
const validateRefundPolicy = (payment, booking) => {
  const paymentDate = new Date(payment.created_at);
  const now = new Date();
  const scheduledDateTime = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`);

  // No se puede reembolsar si el servicio ya comenzó o terminó
  if (['in_progress', 'completed'].includes(booking.status)) {
    throw new Error('No se puede reembolsar un servicio en progreso o completado');
  }

  // No se puede reembolsar dentro de las 24 horas previas
  const hoursUntilService = (scheduledDateTime - now) / (1000 * 60 * 60);
  if (hoursUntilService < 24) {
    throw new Error('No se permiten reembolsos dentro de las 24 horas previas al servicio');
  }

  // Política de reembolso completo hasta 48 horas antes
  const refundPercentage = hoursUntilService >= 48 ? 100 : 50;
  
  return {
    canRefund: true,
    refundPercentage
  };
};

/**
 * Verificar transiciones de estado válidas para bookings
 * @param {string} currentStatus - Estado actual
 * @param {string} newStatus - Nuevo estado
 * @param {string} userRole - Rol del usuario ('customer' o 'provider')
 * @returns {boolean} - Si la transición es válida
 */
const validateBookingStatusTransition = (currentStatus, newStatus, userRole) => {
  const validTransitions = {
    'pending': {
      'confirmed': ['provider'],
      'cancelled': ['customer', 'provider']
    },
    'confirmed': {
      'in_progress': ['provider'],
      'cancelled': ['customer', 'provider']
    },
    'in_progress': {
      'completed': ['provider'],
      'cancelled': ['provider'] // Solo proveedor puede cancelar servicio en progreso
    },
    'completed': {}, // Estado final
    'cancelled': {} // Estado final
  };

  const allowedTransitions = validTransitions[currentStatus];
  if (!allowedTransitions) {
    return false;
  }

  const allowedRoles = allowedTransitions[newStatus];
  if (!allowedRoles) {
    return false;
  }

  return allowedRoles.includes(userRole);
};

module.exports = {
  withTransaction,
  transactionMiddleware,
  createBookingWithLock,
  updateServiceRatingStats,
  processPaymentAtomic,
  validateRefundPolicy,
  validateBookingStatusTransition
};