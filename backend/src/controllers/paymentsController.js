const { query } = require('../config/database');
const mercadopagoService = require('../services/mercadopagoService');
const { logger } = require('../utils/smartLogger');

// GET /api/payments
exports.getPayments = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      status,
      payment_method,
      date_from,
      date_to,
      user_type = 'all',
      page = 1,
      limit = 10
    } = req.query;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Filter by user role
    if (user_type === 'customer') {
      whereConditions.push(`p.customer_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    } else if (user_type === 'provider') {
      whereConditions.push(`b.provider_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    } else {
      // Default: show payments where user is either customer or provider
      whereConditions.push(`(p.customer_id = $${paramIndex} OR b.provider_id = $${paramIndex})`);
      params.push(userId);
      paramIndex++;
    }

    // Status filter
    if (status) {
      whereConditions.push(`p.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Payment method filter
    if (payment_method) {
      whereConditions.push(`p.payment_method = $${paramIndex}`);
      params.push(payment_method);
      paramIndex++;
    }

    // Date range filter
    if (date_from) {
      whereConditions.push(`p.created_at >= $${paramIndex}`);
      params.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereConditions.push(`p.created_at <= $${paramIndex}`);
      params.push(date_to);
      paramIndex++;
    }

    // Pagination
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), offset);

    const paymentsQuery = `
      SELECT 
        p.id,
        p.booking_id,
        p.customer_id,
        p.amount,
        p.payment_method,
        p.external_id,
        p.status,
        p.created_at,
        p.updated_at,
        b.scheduled_date,
        b.scheduled_time,
        s.title as service_title,
        CASE 
          WHEN p.customer_id = $1 THEN CONCAT(up.first_name, ' ', up.last_name)
          ELSE CONCAT(uc.first_name, ' ', uc.last_name)
        END as other_user_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      JOIN users uc ON p.customer_id = uc.id
      JOIN users up ON b.provider_id = up.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex - 1} OFFSET $${paramIndex}
    `;

    const result = await query(paymentsQuery, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE ${whereConditions.slice(0, -2).join(' AND ')}
    `;
    
    const countResult = await query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    return res.paginated(result.rows, {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }, 'Pagos obtenidos exitosamente');

  } catch (error) {
    logger.error('Get payments error:', error);
    return res.dbError(error, 'Error al obtener los pagos');
  }
};

// GET /api/payments/:id
exports.getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        p.id,
        p.booking_id,
        p.customer_id,
        p.amount,
        p.payment_method,
        p.external_id,
        p.status,
        p.created_at,
        p.updated_at,
        b.scheduled_date,
        b.scheduled_time,
        b.provider_id,
        b.customer_address,
        b.notes,
        s.title as service_title,
        s.description as service_description,
        s.category,
        s.duration_minutes,
        uc.first_name as customer_first_name,
        uc.last_name as customer_last_name,
        uc.email as customer_email,
        uc.phone as customer_phone,
        up.first_name as provider_first_name,
        up.last_name as provider_last_name,
        up.email as provider_email,
        up.phone as provider_phone
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      JOIN users uc ON p.customer_id = uc.id
      JOIN users up ON b.provider_id = up.id
      WHERE p.id = $1 AND (p.customer_id = $2 OR b.provider_id = $2)
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.notFound('Pago no encontrado');
    }

    return res.success(result.rows[0], 'Pago obtenido exitosamente');

  } catch (error) {
    logger.error('Get payment by ID error:', error);
    return res.dbError(error, 'Error al obtener el pago');
  }
};

// POST /api/payments
exports.createPayment = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { booking_id, payment_method } = req.body;

    // Validation
    if (!booking_id || !payment_method) {
      return res.validation({ missing_fields: ['booking_id', 'payment_method'] }, 'El ID de la reserva y el método de pago son requeridos');
    }

    // Check if booking exists and belongs to the customer
    const bookingResult = await query(`
      SELECT b.*, s.title as service_title, s.price
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      WHERE b.id = $1 AND b.customer_id = $2
    `, [booking_id, customerId]);

    if (bookingResult.rows.length === 0) {
      return res.notFound('Reserva no encontrada');
    }

    const booking = bookingResult.rows[0];

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return res.error('Solo se pueden procesar pagos para reservas confirmadas', 400, {
        error_type: 'booking_not_confirmed',
        booking_status: booking.status
      });
    }

    // Check if payment already exists
    const existingPaymentResult = await query(
      'SELECT id FROM payments WHERE booking_id = $1',
      [booking_id]
    );

    if (existingPaymentResult.rows.length > 0) {
      return res.error('Esta reserva ya tiene un pago procesado', 409, {
        error_type: 'payment_already_exists',
        existing_payment_id: existingPaymentResult.rows[0].id
      });
    }

    // Create MercadoPago payment preference for escrow transaction
    const paymentPreference = await mercadopagoService.createBookingPayment({
      bookingId: booking_id,
      customerId: customerId,
      providerId: booking.provider_id,
      serviceTitle: booking.service_title,
      serviceDescription: `Servicio de ${booking.service_title}`,
      amount: parseFloat(booking.price),
      customerEmail: req.user.email,
      customerName: `${req.user.first_name} ${req.user.last_name}`,
      providerName: 'Proveedor' // You might want to join with provider data
    });

    const external_id = paymentPreference.preference_id;

    // Create payment record with MercadoPago integration
    const result = await query(`
      INSERT INTO payments (booking_id, customer_id, amount, payment_method, external_id, status, currency)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [booking_id, customerId, booking.price, payment_method, external_id, 'pending', 'ARS']);

    const payment = result.rows[0];

    // Create notification for provider
    await query(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      booking.provider_id,
      'Pago iniciado',
      `Se ha iniciado el pago para la reserva de ${booking.service_title}`,
      'payment',
      payment.id
    ]);

    return res.success({
      payment,
      payment_url: paymentPreference.checkout_url,
      preference_id: paymentPreference.preference_id,
      expires_at: paymentPreference.expires_at,
      amount: booking.price,
      currency: 'ARS'
    }, 'Pago creado exitosamente', 201);

  } catch (error) {
    logger.error('Create payment error:', error);
    return res.dbError(error, 'Error al crear el pago');
  }
};

// PUT /api/payments/:id/status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, external_id } = req.body;

    const validStatuses = ['pending', 'approved', 'rejected', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.validation({ valid_statuses: validStatuses, provided_status: status }, 'Estado de pago inválido');
    }

    // Get payment details
    const paymentResult = await query(`
      SELECT p.*, b.customer_id, b.provider_id, b.service_id, s.title as service_title
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      WHERE p.id = $1
    `, [id]);

    if (paymentResult.rows.length === 0) {
      return res.notFound('Pago no encontrado');
    }

    const payment = paymentResult.rows[0];

    // Update payment status
    const updateFields = ['status = $1', 'updated_at = CURRENT_TIMESTAMP'];
    const updateValues = [status];
    let paramIndex = 2;

    if (external_id) {
      updateFields.push(`external_id = $${paramIndex}`);
      updateValues.push(external_id);
      paramIndex++;
    }

    updateValues.push(id);

    const result = await query(`
      UPDATE payments 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `, updateValues);

    // Update booking payment status
    let bookingPaymentStatus = 'pending';
    if (status === 'approved') {
      bookingPaymentStatus = 'paid';
    } else if (status === 'rejected' || status === 'cancelled') {
      bookingPaymentStatus = 'failed';
    } else if (status === 'refunded') {
      bookingPaymentStatus = 'refunded';
    }

    await query(`
      UPDATE bookings 
      SET payment_status = $1
      WHERE id = $2
    `, [bookingPaymentStatus, payment.booking_id]);

    // Create notifications
    const customerNotification = {
      user_id: payment.customer_id,
      title: `Pago ${status === 'approved' ? 'aprobado' : 
                   status === 'rejected' ? 'rechazado' : 
                   status === 'cancelled' ? 'cancelado' : 
                   status === 'refunded' ? 'reembolsado' : 'actualizado'}`,
      message: `Tu pago para ${payment.service_title} ha sido ${status === 'approved' ? 'aprobado' : 
                                                                status === 'rejected' ? 'rechazado' : 
                                                                status === 'cancelled' ? 'cancelado' : 
                                                                status === 'refunded' ? 'reembolsado' : 'actualizado'}`,
      type: 'payment'
    };

    const providerNotification = {
      user_id: payment.provider_id,
      title: `Pago ${status === 'approved' ? 'recibido' : 'actualizado'}`,
      message: status === 'approved' ? 
        `Has recibido un pago por ${payment.service_title}` :
        `El pago para ${payment.service_title} ha sido ${status === 'rejected' ? 'rechazado' : 
                                                         status === 'cancelled' ? 'cancelado' : 
                                                         status === 'refunded' ? 'reembolsado' : 'actualizado'}`,
      type: 'payment'
    };

    await query(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)
    `, [
      customerNotification.user_id, customerNotification.title, customerNotification.message, 
      customerNotification.type, id,
      providerNotification.user_id, providerNotification.title, providerNotification.message, 
      providerNotification.type, id
    ]);

    return res.success(result.rows[0], 'Estado de pago actualizado exitosamente');

  } catch (error) {
    logger.error('Update payment status error:', error);
    return res.dbError(error, 'Error al actualizar el estado del pago');
  }
};

// POST /api/payments/:id/refund
exports.requestRefund = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { reason } = req.body;

    // Get payment details
    const paymentResult = await query(`
      SELECT p.*, b.customer_id, b.provider_id, b.service_id, s.title as service_title
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN services s ON b.service_id = s.id
      WHERE p.id = $1
    `, [id]);

    if (paymentResult.rows.length === 0) {
      return res.notFound('Pago no encontrado');
    }

    const payment = paymentResult.rows[0];

    // Check if user has permission to request refund
    if (payment.customer_id !== userId) {
      return res.error('Solo el cliente puede solicitar un reembolso', 403, {
        error_type: 'unauthorized_refund_request'
      });
    }

    // Check if payment is eligible for refund
    if (payment.status !== 'approved') {
      return res.error('Solo se pueden reembolsar pagos aprobados', 400, {
        error_type: 'payment_not_eligible_for_refund',
        current_status: payment.status
      });
    }

    // In a real implementation, this would integrate with payment processor
    // For now, we'll just update the status to indicate refund was requested
    await query(`
      UPDATE payments 
      SET status = 'refunded', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [id]);

    // Update booking payment status
    await query(`
      UPDATE bookings 
      SET payment_status = 'refunded'
      WHERE id = $1
    `, [payment.booking_id]);

    // Create notifications
    await query(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $9, $10)
    `, [
      payment.customer_id,
      'Reembolso procesado',
      `Tu reembolso para ${payment.service_title} ha sido procesado`,
      'payment',
      id,
      payment.provider_id,
      'Pago reembolsado',
      `El pago para ${payment.service_title} ha sido reembolsado`,
      'payment',
      id
    ]);

    return res.success({
      payment_id: id,
      status: 'refunded',
      reason
    }, 'Reembolso procesado exitosamente');

  } catch (error) {
    logger.error('Request refund error:', error);
    return res.dbError(error, 'Error al procesar el reembolso');
  }
};

// GET /api/payments/stats
exports.getPaymentStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { user_type = 'provider' } = req.query;

    let userCondition = '';
    if (user_type === 'provider') {
      userCondition = 'b.provider_id = $1';
    } else {
      userCondition = 'p.customer_id = $1';
    }

    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_payments,
        COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN p.status = 'approved' THEN 1 END) as approved_payments,
        COUNT(CASE WHEN p.status = 'rejected' THEN 1 END) as rejected_payments,
        COUNT(CASE WHEN p.status = 'cancelled' THEN 1 END) as cancelled_payments,
        COUNT(CASE WHEN p.status = 'refunded' THEN 1 END) as refunded_payments,
        COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.amount END), 0) as total_earnings,
        COALESCE(AVG(CASE WHEN p.status = 'approved' THEN p.amount END), 0) as average_payment
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE ${userCondition}
    `, [userId]);

    const stats = statsResult.rows[0];

    // Get monthly breakdown for the last 12 months
    const monthlyResult = await query(`
      SELECT 
        EXTRACT(YEAR FROM p.created_at) as year,
        EXTRACT(MONTH FROM p.created_at) as month,
        COUNT(*) as payments,
        COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.amount END), 0) as earnings
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE ${userCondition}
      AND p.created_at >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY EXTRACT(YEAR FROM p.created_at), EXTRACT(MONTH FROM p.created_at)
      ORDER BY year DESC, month DESC
    `, [userId]);

    return res.success({
      total_payments: parseInt(stats.total_payments),
      pending_payments: parseInt(stats.pending_payments),
      approved_payments: parseInt(stats.approved_payments),
      rejected_payments: parseInt(stats.rejected_payments),
      cancelled_payments: parseInt(stats.cancelled_payments),
      refunded_payments: parseInt(stats.refunded_payments),
      total_earnings: parseFloat(stats.total_earnings),
      average_payment: parseFloat(stats.average_payment),
      monthly_breakdown: monthlyResult.rows.map(row => ({
        year: parseInt(row.year),
        month: parseInt(row.month),
        payments: parseInt(row.payments),
        earnings: parseFloat(row.earnings)
      }))
    }, 'Estadísticas de pagos obtenidas exitosamente');

  } catch (error) {
    logger.error('Get payment stats error:', error);
    return res.dbError(error, 'Error al obtener estadísticas de pagos');
  }
};

// GET /api/payments/earnings
exports.getEarnings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { year, month } = req.query;

    let dateCondition = '';
    let params = [userId];
    let paramIndex = 2;

    if (year) {
      dateCondition += ` AND EXTRACT(YEAR FROM p.created_at) = $${paramIndex}`;
      params.push(parseInt(year));
      paramIndex++;
    }

    if (month) {
      dateCondition += ` AND EXTRACT(MONTH FROM p.created_at) = $${paramIndex}`;
      params.push(parseInt(month));
      paramIndex++;
    }

    const earningsResult = await query(`
      SELECT 
        COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.amount END), 0) as total_earnings,
        COUNT(CASE WHEN p.status = 'approved' THEN 1 END) as completed_payments,
        COUNT(CASE WHEN p.status = 'pending' THEN 1 END) as pending_payments,
        COALESCE(AVG(CASE WHEN p.status = 'approved' THEN p.amount END), 0) as average_payment
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE b.provider_id = $1 ${dateCondition}
    `, params);

    const earnings = earningsResult.rows[0];

    // Get monthly breakdown for the current year
    const monthlyResult = await query(`
      SELECT 
        EXTRACT(YEAR FROM p.created_at) as year,
        EXTRACT(MONTH FROM p.created_at) as month,
        COALESCE(SUM(CASE WHEN p.status = 'approved' THEN p.amount END), 0) as earnings,
        COUNT(CASE WHEN p.status = 'approved' THEN 1 END) as payments
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE b.provider_id = $1 
      AND EXTRACT(YEAR FROM p.created_at) = EXTRACT(YEAR FROM CURRENT_DATE)
      GROUP BY EXTRACT(YEAR FROM p.created_at), EXTRACT(MONTH FROM p.created_at)
      ORDER BY year, month
    `, [userId]);

    return res.success({
      total_earnings: parseFloat(earnings.total_earnings),
      completed_payments: parseInt(earnings.completed_payments),
      pending_payments: parseInt(earnings.pending_payments),
      average_payment: parseFloat(earnings.average_payment),
      monthly_breakdown: monthlyResult.rows.map(row => ({
        year: parseInt(row.year),
        month: parseInt(row.month),
        earnings: parseFloat(row.earnings),
        payments: parseInt(row.payments)
      }))
    }, 'Ganancias obtenidas exitosamente');

  } catch (error) {
    logger.error('Get earnings error:', error);
    return res.dbError(error, 'Error al obtener las ganancias');
  }
};