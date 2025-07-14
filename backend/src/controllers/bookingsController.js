const { query } = require('../config/database');

// GET /api/bookings
exports.getBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { 
      status, 
      date_from, 
      date_to, 
      page = 1, 
      limit = 10,
      user_type = 'all' 
    } = req.query;

    let whereConditions = [];
    let params = [];
    let paramIndex = 1;

    // Filter by user role
    if (user_type === 'customer') {
      whereConditions.push(`b.customer_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    } else if (user_type === 'provider') {
      whereConditions.push(`b.provider_id = $${paramIndex}`);
      params.push(userId);
      paramIndex++;
    } else {
      // Default: show bookings where user is either customer or provider
      whereConditions.push(`(b.customer_id = $${paramIndex} OR b.provider_id = $${paramIndex})`);
      params.push(userId);
      paramIndex++;
    }

    // Status filter
    if (status) {
      whereConditions.push(`b.status = $${paramIndex}`);
      params.push(status);
      paramIndex++;
    }

    // Date range filter
    if (date_from) {
      whereConditions.push(`b.scheduled_date >= $${paramIndex}`);
      params.push(date_from);
      paramIndex++;
    }

    if (date_to) {
      whereConditions.push(`b.scheduled_date <= $${paramIndex}`);
      params.push(date_to);
      paramIndex++;
    }

    // Pagination
    const offset = (page - 1) * limit;
    params.push(parseInt(limit), offset);

    const bookingsQuery = `
      SELECT 
        b.id,
        b.customer_id,
        b.provider_id,
        b.service_id,
        b.scheduled_date,
        b.scheduled_time,
        b.total_amount,
        b.status,
        b.payment_status,
        b.notes,
        b.customer_address,
        b.customer_latitude,
        b.customer_longitude,
        b.created_at,
        b.updated_at,
        b.duration_minutes,
        b.customer_phone,
        b.provider_phone,
        s.title as service_title,
        s.description as service_description,
        s.category,
        uc.first_name as customer_first_name,
        uc.last_name as customer_last_name,
        uc.profile_photo_url as customer_photo,
        up.first_name as provider_first_name,
        up.last_name as provider_last_name,
        up.profile_photo_url as provider_photo
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users uc ON b.customer_id = uc.id
      JOIN users up ON b.provider_id = up.id
      WHERE ${whereConditions.join(' AND ')}
      ORDER BY b.scheduled_date DESC, b.scheduled_time DESC
      LIMIT $${paramIndex - 1} OFFSET $${paramIndex}
    `;

    const result = await query(bookingsQuery, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM bookings b
      WHERE ${whereConditions.slice(0, -2).join(' AND ')}
    `;
    
    const countResult = await query(countQuery, params.slice(0, -2));
    const total = parseInt(countResult.rows[0].total);

    res.json({
      success: true,
      message: 'Reservas obtenidas exitosamente',
      data: {
        bookings: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/bookings/:id
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await query(`
      SELECT 
        b.id,
        b.customer_id,
        b.provider_id,
        b.service_id,
        b.scheduled_date,
        b.scheduled_time,
        b.total_amount,
        b.status,
        b.payment_status,
        b.notes,
        b.customer_address,
        b.customer_latitude,
        b.customer_longitude,
        b.created_at,
        b.updated_at,
        b.duration_minutes,
        b.customer_phone,
        b.provider_phone,
        s.title as service_title,
        s.description as service_description,
        s.category,
        s.price,
        uc.first_name as customer_first_name,
        uc.last_name as customer_last_name,
        uc.profile_photo_url as customer_photo,
        uc.email as customer_email,
        up.first_name as provider_first_name,
        up.last_name as provider_last_name,
        up.profile_photo_url as provider_photo,
        up.email as provider_email
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users uc ON b.customer_id = uc.id
      JOIN users up ON b.provider_id = up.id
      WHERE b.id = $1 AND (b.customer_id = $2 OR b.provider_id = $2)
    `, [id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Reserva obtenida exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// POST /api/bookings
exports.createBooking = async (req, res) => {
  try {
    const customerId = req.user.id;
    const {
      service_id,
      scheduled_date,
      scheduled_time,
      notes,
      customer_address,
      customer_latitude,
      customer_longitude
    } = req.body;

    // Validation
    if (!service_id || !scheduled_date || !scheduled_time || !customer_address) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos requeridos deben ser proporcionados'
      });
    }

    // Check if service exists and get provider info
    const serviceResult = await query(`
      SELECT s.*, u.user_type, u.phone as provider_phone
      FROM services s
      JOIN users u ON s.provider_id = u.id
      WHERE s.id = $1 AND s.is_active = true
    `, [service_id]);

    if (serviceResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Servicio no encontrado'
      });
    }

    const service = serviceResult.rows[0];

    // Check if customer is trying to book their own service
    if (service.provider_id === customerId) {
      return res.status(400).json({
        success: false,
        error: 'No puedes reservar tu propio servicio'
      });
    }

    // Check if customer exists and get phone
    const customerResult = await query(
      'SELECT phone FROM users WHERE id = $1 AND user_type = $2',
      [customerId, 'customer']
    );

    if (customerResult.rows.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Solo los clientes pueden crear reservas'
      });
    }

    const customer = customerResult.rows[0];

    // Check for conflicting bookings (same provider, same date/time)
    const conflictResult = await query(`
      SELECT id FROM bookings 
      WHERE provider_id = $1 
      AND scheduled_date = $2 
      AND scheduled_time = $3 
      AND status IN ('pending', 'confirmed', 'in_progress')
    `, [service.provider_id, scheduled_date, scheduled_time]);

    if (conflictResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El profesional ya tiene una reserva en ese horario'
      });
    }

    // Create booking
    const result = await query(`
      INSERT INTO bookings (
        customer_id, provider_id, service_id, scheduled_date, scheduled_time,
        total_amount, notes, customer_address, customer_latitude, customer_longitude,
        duration_minutes, customer_phone, provider_phone
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      customerId, service.provider_id, service_id, scheduled_date, scheduled_time,
      service.price, notes, customer_address, customer_latitude, customer_longitude,
      service.duration_minutes, customer.phone, service.provider_phone
    ]);

    const booking = result.rows[0];

    // Create notification for provider
    await query(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [
      service.provider_id,
      'Nueva reserva recibida',
      `Tienes una nueva reserva para ${service.title} el ${scheduled_date} a las ${scheduled_time}`,
      'booking',
      booking.id
    ]);

    res.status(201).json({
      success: true,
      message: 'Reserva creada exitosamente',
      data: booking
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// PUT /api/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estado inválido'
      });
    }

    // Get booking details
    const bookingResult = await query(`
      SELECT b.*, s.title as service_title, 
             uc.first_name as customer_first_name, uc.last_name as customer_last_name,
             up.first_name as provider_first_name, up.last_name as provider_last_name
      FROM bookings b
      JOIN services s ON b.service_id = s.id
      JOIN users uc ON b.customer_id = uc.id
      JOIN users up ON b.provider_id = up.id
      WHERE b.id = $1
    `, [id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    const booking = bookingResult.rows[0];

    // Check permissions
    if (booking.customer_id !== userId && booking.provider_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para modificar esta reserva'
      });
    }

    // Business logic for status changes
    if (status === 'confirmed' && booking.provider_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Solo el profesional puede confirmar una reserva'
      });
    }

    if (status === 'cancelled' && booking.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: 'No se puede cancelar una reserva completada'
      });
    }

    // Update booking status
    const result = await query(`
      UPDATE bookings 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [status, id]);

    // Create notification for the other party
    const notificationUserId = booking.provider_id === userId ? booking.customer_id : booking.provider_id;
    const notificationTitle = `Reserva ${status === 'confirmed' ? 'confirmada' : 
                                        status === 'cancelled' ? 'cancelada' : 
                                        status === 'completed' ? 'completada' : 'actualizada'}`;
    const notificationMessage = `Tu reserva para ${booking.service_title} ha sido ${status === 'confirmed' ? 'confirmada' : 
                                                                                   status === 'cancelled' ? 'cancelada' : 
                                                                                   status === 'completed' ? 'completada' : 'actualizada'}`;

    await query(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5)
    `, [notificationUserId, notificationTitle, notificationMessage, 'booking', id]);

    // If completed, update user stats
    if (status === 'completed') {
      await query(`
        UPDATE users 
        SET completed_bookings_count = completed_bookings_count + 1
        WHERE id = $1
      `, [booking.provider_id]);
    }

    res.json({
      success: true,
      message: 'Estado de reserva actualizado exitosamente',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// DELETE /api/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if booking exists and user has permission
    const bookingResult = await query(`
      SELECT customer_id, provider_id, status
      FROM bookings 
      WHERE id = $1
    `, [id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    const booking = bookingResult.rows[0];

    if (booking.customer_id !== userId && booking.provider_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para eliminar esta reserva'
      });
    }

    // Only allow deletion if booking is pending or cancelled
    if (!['pending', 'cancelled'].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden eliminar reservas pendientes o canceladas'
      });
    }

    // Delete booking
    await query('DELETE FROM bookings WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Reserva eliminada exitosamente'
    });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// GET /api/bookings/stats
exports.getBookingStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const { user_type = 'provider' } = req.query;

    let userColumn = user_type === 'provider' ? 'provider_id' : 'customer_id';

    const statsResult = await query(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_bookings,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount END), 0) as total_earnings,
        COALESCE(AVG(CASE WHEN status = 'completed' THEN total_amount END), 0) as average_booking_value
      FROM bookings 
      WHERE ${userColumn} = $1
    `, [userId]);

    const stats = statsResult.rows[0];

    // Get monthly breakdown for the last 12 months
    const monthlyResult = await query(`
      SELECT 
        EXTRACT(YEAR FROM scheduled_date) as year,
        EXTRACT(MONTH FROM scheduled_date) as month,
        COUNT(*) as bookings,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN total_amount END), 0) as earnings
      FROM bookings 
      WHERE ${userColumn} = $1 
      AND scheduled_date >= CURRENT_DATE - INTERVAL '12 months'
      GROUP BY EXTRACT(YEAR FROM scheduled_date), EXTRACT(MONTH FROM scheduled_date)
      ORDER BY year DESC, month DESC
    `, [userId]);

    res.json({
      success: true,
      message: 'Estadísticas obtenidas exitosamente',
      data: {
        ...stats,
        total_bookings: parseInt(stats.total_bookings),
        pending_bookings: parseInt(stats.pending_bookings),
        confirmed_bookings: parseInt(stats.confirmed_bookings),
        in_progress_bookings: parseInt(stats.in_progress_bookings),
        completed_bookings: parseInt(stats.completed_bookings),
        cancelled_bookings: parseInt(stats.cancelled_bookings),
        total_earnings: parseFloat(stats.total_earnings),
        average_booking_value: parseFloat(stats.average_booking_value),
        monthly_breakdown: monthlyResult.rows.map(row => ({
          year: parseInt(row.year),
          month: parseInt(row.month),
          bookings: parseInt(row.bookings),
          earnings: parseFloat(row.earnings)
        }))
      }
    });

  } catch (error) {
    console.error('Get booking stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};