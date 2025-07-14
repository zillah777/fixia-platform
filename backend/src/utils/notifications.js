const { query } = require('../config/database');

/**
 * Crea una notificación con deduplicación
 * @param {Object} notification - Datos de la notificación
 * @returns {Promise<Object|null>} - Notificación creada o null si es duplicada
 */
const createNotification = async (notification) => {
  const { user_id, title, message, type, related_id } = notification;
  
  try {
    // Verificar duplicados recientes (últimos 5 minutos)
    const recentNotification = await query(`
      SELECT id FROM notifications 
      WHERE user_id = $1 AND type = $2 AND related_id = $3 
      AND created_at > NOW() - INTERVAL '5 minutes'
    `, [user_id, type, related_id]);
    
    if (recentNotification.rows.length > 0) {
      console.log(`⚠️  Notification deduplicated for user ${user_id}, type ${type}, related_id ${related_id}`);
      return null; // No crear duplicado
    }
    
    // Verificar preferencias del usuario
    const preferences = await query(`
      SELECT ${type}_notifications, email_notifications, push_notifications
      FROM notification_preferences 
      WHERE user_id = $1
    `, [user_id]);
    
    if (preferences.rows.length > 0) {
      const prefs = preferences.rows[0];
      const typeColumn = `${type}_notifications`;
      
      // Si existe la columna específica y está desactivada, no enviar
      if (prefs[typeColumn] === false) {
        console.log(`⚠️  Notification skipped - user ${user_id} has disabled ${type} notifications`);
        return null;
      }
      
      // Si las notificaciones generales están desactivadas, no enviar
      if (prefs.email_notifications === false && prefs.push_notifications === false) {
        console.log(`⚠️  Notification skipped - user ${user_id} has disabled all notifications`);
        return null;
      }
    }
    
    // Crear la notificación
    const result = await query(`
      INSERT INTO notifications (user_id, title, message, type, related_id)
      VALUES ($1, $2, $3, $4, $5) 
      RETURNING *
    `, [user_id, title, message, type, related_id]);
    
    console.log(`✅ Notification created for user ${user_id}, type ${type}`);
    return result.rows[0];
    
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

/**
 * Crea múltiples notificaciones de forma eficiente
 * @param {Array} notifications - Array de notificaciones
 * @returns {Promise<Array>} - Array de notificaciones creadas
 */
const createBulkNotifications = async (notifications) => {
  const createdNotifications = [];
  
  for (const notification of notifications) {
    try {
      const created = await createNotification(notification);
      if (created) {
        createdNotifications.push(created);
      }
    } catch (error) {
      console.error('Error creating bulk notification:', error);
      // Continuar con las demás notificaciones
    }
  }
  
  return createdNotifications;
};

/**
 * Plantillas de notificaciones para diferentes eventos
 */
const notificationTemplates = {
  // Notificaciones de reserva
  bookingCreated: (booking, service) => ({
    title: 'Nueva reserva recibida',
    message: `Tienes una nueva reserva para ${service.title} el ${booking.scheduled_date} a las ${booking.scheduled_time}`,
    type: 'booking'
  }),
  
  bookingConfirmed: (booking, service) => ({
    title: 'Reserva confirmada',
    message: `Tu reserva para ${service.title} ha sido confirmada para el ${booking.scheduled_date} a las ${booking.scheduled_time}`,
    type: 'booking'
  }),
  
  bookingCancelled: (booking, service) => ({
    title: 'Reserva cancelada',
    message: `La reserva para ${service.title} del ${booking.scheduled_date} ha sido cancelada`,
    type: 'booking'
  }),
  
  bookingCompleted: (booking, service) => ({
    title: 'Servicio completado',
    message: `El servicio ${service.title} ha sido completado. ¡Puedes dejar una reseña!`,
    type: 'booking'
  }),
  
  // Notificaciones de pago
  paymentApproved: (payment, service) => ({
    title: 'Pago aprobado',
    message: `Tu pago para ${service.title} ha sido aprobado exitosamente`,
    type: 'payment'
  }),
  
  paymentRejected: (payment, service) => ({
    title: 'Pago rechazado',
    message: `Tu pago para ${service.title} ha sido rechazado. Intenta con otro método`,
    type: 'payment'
  }),
  
  paymentReceived: (payment, service) => ({
    title: 'Pago recibido',
    message: `Has recibido un pago por ${service.title}`,
    type: 'payment'
  }),
  
  paymentRefunded: (payment, service) => ({
    title: 'Pago reembolsado',
    message: `Tu pago para ${service.title} ha sido reembolsado`,
    type: 'payment'
  }),
  
  // Notificaciones de reseña
  reviewReceived: (review, service) => ({
    title: 'Nueva reseña recibida',
    message: `Has recibido una reseña de ${review.rating} estrellas para ${service.title}`,
    type: 'review'
  }),
  
  // Notificaciones de chat
  messageReceived: (message, chatUser) => ({
    title: 'Nuevo mensaje',
    message: `${chatUser.first_name} te ha enviado un mensaje: ${message.content.substring(0, 50)}${message.content.length > 50 ? '...' : ''}`,
    type: 'chat'
  }),
  
  // Notificaciones del sistema
  accountVerified: () => ({
    title: 'Cuenta verificada',
    message: 'Tu cuenta ha sido verificada exitosamente. ¡Ya puedes ofrecer tus servicios!',
    type: 'system'
  }),
  
  accountSuspended: () => ({
    title: 'Cuenta suspendida',
    message: 'Tu cuenta ha sido suspendida. Contacta al soporte para más información.',
    type: 'system'
  }),
  
  serviceApproved: (service) => ({
    title: 'Servicio aprobado',
    message: `Tu servicio "${service.title}" ha sido aprobado y ahora es visible para los clientes`,
    type: 'system'
  }),
  
  serviceRejected: (service) => ({
    title: 'Servicio rechazado',
    message: `Tu servicio "${service.title}" ha sido rechazado. Revisa los comentarios y vuelve a enviarlo`,
    type: 'system'
  })
};

/**
 * Crea notificaciones para eventos específicos
 * @param {string} eventType - Tipo de evento
 * @param {Object} data - Datos del evento
 * @returns {Promise<Object|null>} - Notificación creada
 */
const createEventNotification = async (eventType, data) => {
  const template = notificationTemplates[eventType];
  if (!template) {
    console.error(`Unknown notification event type: ${eventType}`);
    return null;
  }
  
  const notificationData = template(data.primary, data.secondary);
  
  const notification = {
    user_id: data.user_id,
    title: notificationData.title,
    message: notificationData.message,
    type: notificationData.type,
    related_id: data.related_id || null
  };
  
  return await createNotification(notification);
};

/**
 * Limpiar notificaciones antiguas
 * @param {number} daysOld - Días de antigüedad
 * @returns {Promise<number>} - Número de notificaciones eliminadas
 */
const cleanupOldNotifications = async (daysOld = 30) => {
  const result = await query(`
    DELETE FROM notifications 
    WHERE created_at < NOW() - INTERVAL '${daysOld} days'
    AND is_read = true
  `);
  
  console.log(`🧹 Cleaned up ${result.rowCount} old notifications`);
  return result.rowCount;
};

/**
 * Obtener estadísticas de notificaciones
 * @param {number} userId - ID del usuario
 * @returns {Promise<Object>} - Estadísticas
 */
const getNotificationStats = async (userId) => {
  const result = await query(`
    SELECT 
      COUNT(*) as total_notifications,
      COUNT(CASE WHEN is_read = false THEN 1 END) as unread_notifications,
      COUNT(CASE WHEN type = 'booking' THEN 1 END) as booking_notifications,
      COUNT(CASE WHEN type = 'payment' THEN 1 END) as payment_notifications,
      COUNT(CASE WHEN type = 'review' THEN 1 END) as review_notifications,
      COUNT(CASE WHEN type = 'chat' THEN 1 END) as chat_notifications,
      COUNT(CASE WHEN type = 'system' THEN 1 END) as system_notifications,
      COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) as recent_notifications
    FROM notifications
    WHERE user_id = $1
  `, [userId]);
  
  return result.rows[0];
};

module.exports = {
  createNotification,
  createBulkNotifications,
  createEventNotification,
  cleanupOldNotifications,
  getNotificationStats,
  notificationTemplates
};