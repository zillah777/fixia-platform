const mercadopagoService = require('../services/mercadopagoService');
const { query } = require('../config/database');

/**
 * MercadoPago Webhook Controller
 * Handles real-time payment notifications from MercadoPago
 * 
 * Security considerations:
 * - Validates webhook signatures (when implemented)
 * - Idempotent processing to handle duplicate notifications
 * - Comprehensive error handling and logging
 * - Rate limiting applied at middleware level
 */

/**
 * Handle MercadoPago payment notifications
 * POST /api/webhooks/mercadopago
 */
exports.handleMercadoPagoWebhook = async (req, res) => {
  const startTime = Date.now();
  const webhookId = `wh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  try {
    console.log(`🔔 [${webhookId}] MercadoPago webhook received:`, {
      type: req.body.type,
      action: req.body.action,
      data_id: req.body.data?.id,
      headers: {
        'x-signature': req.headers['x-signature'],
        'x-request-id': req.headers['x-request-id'],
        'user-agent': req.headers['user-agent']
      }
    });

    // Validate webhook format
    if (!req.body.type || !req.body.data) {
      console.warn(`⚠️ [${webhookId}] Invalid webhook format:`, req.body);
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook format'
      });
    }

    const { type, action, data, date_created } = req.body;

    // Check for duplicate webhook processing (idempotency)
    const existingWebhook = await checkDuplicateWebhook(data.id, type);
    if (existingWebhook) {
      console.log(`🔄 [${webhookId}] Duplicate webhook detected, skipping processing`);
      return res.status(200).json({
        success: true,
        message: 'Webhook already processed',
        webhook_id: webhookId
      });
    }

    // Process webhook based on type
    let result;
    switch (type) {
      case 'payment':
        result = await mercadopagoService.processWebhook({
          type: 'payment',
          data: { id: data.id },
          action,
          date_created
        });
        break;

      case 'merchant_order':
        result = await mercadopagoService.processWebhook({
          type: 'merchant_order',
          data: { id: data.id },
          action,
          date_created
        });
        break;

      case 'plan':
      case 'subscription':
        // Handle subscription webhooks if needed
        console.log(`📋 [${webhookId}] Subscription webhook received:`, type);
        result = { processed: true, reason: 'Subscription webhooks not yet implemented' };
        break;

      default:
        console.warn(`⚠️ [${webhookId}] Unhandled webhook type: ${type}`);
        result = { processed: false, reason: `Unhandled webhook type: ${type}` };
    }

    // Log webhook processing result
    await logWebhookProcessing(webhookId, req.body, result, Date.now() - startTime);

    if (result.processed) {
      console.log(`✅ [${webhookId}] Webhook processed successfully:`, result);
      return res.status(200).json({
        success: true,
        message: 'Webhook processed successfully',
        webhook_id: webhookId,
        processing_time: Date.now() - startTime
      });
    } else {
      console.warn(`⚠️ [${webhookId}] Webhook not processed:`, result.reason);
      return res.status(200).json({
        success: true,
        message: 'Webhook received but not processed',
        reason: result.reason,
        webhook_id: webhookId
      });
    }

  } catch (error) {
    logger.error(`❌ [${webhookId}] Error processing webhook:`, error);
    
    // Log failed webhook for retry mechanism
    await logWebhookProcessing(webhookId, req.body, { error: error.message }, Date.now() - startTime);

    // Always return 200 to prevent MercadoPago from retrying
    // We'll implement our own retry mechanism
    return res.status(200).json({
      success: false,
      error: 'Internal processing error',
      webhook_id: webhookId
    });
  }
};

/**
 * Handle payment completion webhook (custom endpoint for service completion)
 * POST /api/webhooks/payment-completion
 */
exports.handlePaymentCompletion = async (req, res) => {
  try {
    const { booking_id, completion_type = 'automatic' } = req.body;
    const userId = req.user?.id;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        error: 'booking_id es requerido'
      });
    }

    // Verify booking exists and is in completed state
    const bookingResult = await query(`
      SELECT b.*, p.status as payment_status, p.id as payment_id
      FROM bookings b
      LEFT JOIN payments p ON b.id = p.booking_id
      WHERE b.id = $1
    `, [booking_id]);

    if (bookingResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    const booking = bookingResult.rows[0];

    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden procesar pagos para servicios completados'
      });
    }

    if (booking.payment_status !== 'approved') {
      return res.status(400).json({
        success: false,
        error: 'El pago debe estar aprobado para liberar los fondos'
      });
    }

    // Release escrow funds to provider
    const escrowResult = await mercadopagoService.releaseEscrowFunds(booking_id);

    // Update booking to mark payment as released
    await query(`
      UPDATE bookings 
      SET payment_status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
    `, [booking_id]);

    console.log(`💰 Escrow funds released for booking ${booking_id}:`, escrowResult);

    res.json({
      success: true,
      message: 'Fondos liberados exitosamente al proveedor',
      data: {
        booking_id: parseInt(booking_id),
        provider_amount: escrowResult.provider_amount,
        platform_fee: escrowResult.platform_fee,
        completion_type
      }
    });

  } catch (error) {
    logger.error('❌ Error processing payment completion:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Handle refund request webhook
 * POST /api/webhooks/refund-request
 */
exports.handleRefundRequest = async (req, res) => {
  try {
    const { payment_id, amount, reason = 'Solicitud del usuario' } = req.body;
    const userId = req.user?.id;

    if (!payment_id) {
      return res.status(400).json({
        success: false,
        error: 'payment_id es requerido'
      });
    }

    // Verify user permission for refund
    const paymentResult = await query(`
      SELECT p.*, b.customer_id, b.provider_id, b.status as booking_status
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      WHERE p.id = $1
    `, [payment_id]);

    if (paymentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Pago no encontrado'
      });
    }

    const payment = paymentResult.rows[0];

    // Only customer or admin can request refund
    if (userId && payment.customer_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permisos para solicitar este reembolso'
      });
    }

    // Process refund through MercadoPago
    const refundResult = await mercadopagoService.processRefund(payment_id, amount, reason);

    console.log(`💸 Refund processed for payment ${payment_id}:`, refundResult);

    res.json({
      success: true,
      message: 'Reembolso procesado exitosamente',
      data: {
        refund_id: refundResult.refund_id,
        amount: refundResult.amount,
        status: refundResult.status
      }
    });

  } catch (error) {
    logger.error('❌ Error processing refund request:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
};

/**
 * Get webhook processing status and logs
 * GET /api/webhooks/status/:webhook_id
 */
exports.getWebhookStatus = async (req, res) => {
  try {
    const { webhook_id } = req.params;

    const result = await query(`
      SELECT * FROM webhook_logs 
      WHERE webhook_id = $1 
      ORDER BY created_at DESC
    `, [webhook_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Webhook no encontrado'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });

  } catch (error) {
    logger.error('❌ Error getting webhook status:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Test webhook endpoint for development
 * POST /api/webhooks/test
 */
exports.testWebhook = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      error: 'Endpoint no disponible en producción'
    });
  }

  try {
    const { type = 'payment', data_id = 'test_123' } = req.body;

    const testWebhook = {
      type,
      action: 'payment.updated',
      data: { id: data_id },
      date_created: new Date().toISOString()
    };

    console.log('🧪 Processing test webhook:', testWebhook);

    // Process as if it's a real webhook
    req.body = testWebhook;
    return await exports.handleMercadoPagoWebhook(req, res);

  } catch (error) {
    logger.error('❌ Error processing test webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

/**
 * Helper function to check for duplicate webhook processing
 */
async function checkDuplicateWebhook(dataId, type) {
  try {
    const result = await query(`
      SELECT id FROM webhook_logs 
      WHERE data_id = $1 AND webhook_type = $2 AND status = 'processed'
      LIMIT 1
    `, [dataId, type]);

    return result.rows.length > 0;
  } catch (error) {
    logger.error('❌ Error checking duplicate webhook:', error);
    return false; // Continue processing if we can't check
  }
}

/**
 * Helper function to log webhook processing for audit and debugging
 */
async function logWebhookProcessing(webhookId, webhookData, result, processingTime) {
  try {
    await query(`
      INSERT INTO webhook_logs (
        webhook_id, webhook_type, data_id, webhook_data, 
        processing_result, processing_time, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    `, [
      webhookId,
      webhookData.type,
      webhookData.data?.id,
      JSON.stringify(webhookData),
      JSON.stringify(result),
      processingTime,
      result.processed ? 'processed' : (result.error ? 'failed' : 'skipped')
    ]);
  } catch (error) {
    logger.error('❌ Error logging webhook processing:', error);
    // Don't throw - logging failure shouldn't break webhook processing
  }
}