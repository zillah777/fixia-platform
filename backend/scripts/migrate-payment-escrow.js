const { query } = require('../src/config/database');

async function createPaymentEscrowTables() {
  console.log('💰 Creating payment escrow and marketplace tables...');

  try {
    // Payment preferences table for tracking MercadoPago preferences
    await query(`
      CREATE TABLE IF NOT EXISTS payment_preferences (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
        preference_id VARCHAR(255) NOT NULL,
        external_reference VARCHAR(255) NOT NULL,
        checkout_url TEXT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'ARS',
        expires_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'expired', 'used')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payment escrow table for holding funds until service completion
    await query(`
      CREATE TABLE IF NOT EXISTS payment_escrow (
        id SERIAL PRIMARY KEY,
        payment_id INTEGER UNIQUE REFERENCES payments(id) ON DELETE CASCADE,
        total_amount DECIMAL(10,2) NOT NULL,
        platform_fee DECIMAL(10,2) NOT NULL,
        provider_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'disputed')),
        hold_until TIMESTAMP NOT NULL,
        released_at TIMESTAMP,
        refunded_at TIMESTAMP,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Provider payouts table for tracking payments to service providers
    await query(`
      CREATE TABLE IF NOT EXISTS provider_payouts (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'ARS',
        status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
        payout_method VARCHAR(50) DEFAULT 'mercadopago',
        external_payout_id VARCHAR(255),
        fee_amount DECIMAL(10,2) DEFAULT 0,
        net_amount DECIMAL(10,2),
        processed_at TIMESTAMP,
        failed_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Platform revenue table for tracking marketplace commissions
    await query(`
      CREATE TABLE IF NOT EXISTS platform_revenue (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        revenue_type VARCHAR(50) NOT NULL CHECK (revenue_type IN ('platform_fee', 'subscription_fee', 'premium_fee', 'processing_fee')),
        currency VARCHAR(3) DEFAULT 'ARS',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payment refunds table for tracking refund requests and processing
    await query(`
      CREATE TABLE IF NOT EXISTS payment_refunds (
        id SERIAL PRIMARY KEY,
        payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'ARS',
        reason TEXT NOT NULL,
        refund_type VARCHAR(20) DEFAULT 'full' CHECK (refund_type IN ('full', 'partial')),
        status VARCHAR(20) DEFAULT 'requested' CHECK (status IN ('requested', 'processing', 'completed', 'failed', 'cancelled')),
        mercadopago_refund_id VARCHAR(255),
        processed_at TIMESTAMP,
        failed_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Payment disputes table for handling payment disputes and chargebacks
    await query(`
      CREATE TABLE IF NOT EXISTS payment_disputes (
        id SERIAL PRIMARY KEY,
        payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
        dispute_type VARCHAR(50) NOT NULL CHECK (dispute_type IN ('chargeback', 'refund_request', 'service_dispute', 'fraud_claim')),
        status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved', 'escalated', 'closed')),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(3) DEFAULT 'ARS',
        reason TEXT NOT NULL,
        evidence_documents JSONB,
        resolution_notes TEXT,
        resolved_at TIMESTAMP,
        external_dispute_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add missing columns to existing payments table
    await query(`
      ALTER TABLE payments 
      ADD COLUMN IF NOT EXISTS mercadopago_payment_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS transaction_amount DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS net_received_amount DECIMAL(10,2),
      ADD COLUMN IF NOT EXISTS fee_details JSONB,
      ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1,
      ADD COLUMN IF NOT EXISTS payment_type VARCHAR(50),
      ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'ARS'
    `);

    // Update payment_webhooks table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS payment_webhooks (
        id SERIAL PRIMARY KEY,
        payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
        webhook_type VARCHAR(50) NOT NULL,
        webhook_data JSONB NOT NULL,
        processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(20) DEFAULT 'received' CHECK (status IN ('received', 'processed', 'failed', 'ignored')),
        error_message TEXT,
        retry_count INTEGER DEFAULT 0
      )
    `);

    // Create indexes for better performance
    console.log('📊 Creating performance indexes...');

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payment_preferences_booking_id ON payment_preferences(booking_id);
      CREATE INDEX IF NOT EXISTS idx_payment_preferences_preference_id ON payment_preferences(preference_id);
      CREATE INDEX IF NOT EXISTS idx_payment_preferences_status ON payment_preferences(status);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payment_escrow_payment_id ON payment_escrow(payment_id);
      CREATE INDEX IF NOT EXISTS idx_payment_escrow_status ON payment_escrow(status);
      CREATE INDEX IF NOT EXISTS idx_payment_escrow_hold_until ON payment_escrow(hold_until);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_provider_payouts_provider_id ON provider_payouts(provider_id);
      CREATE INDEX IF NOT EXISTS idx_provider_payouts_booking_id ON provider_payouts(booking_id);
      CREATE INDEX IF NOT EXISTS idx_provider_payouts_status ON provider_payouts(status);
      CREATE INDEX IF NOT EXISTS idx_provider_payouts_created_at ON provider_payouts(created_at);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_platform_revenue_booking_id ON platform_revenue(booking_id);
      CREATE INDEX IF NOT EXISTS idx_platform_revenue_revenue_type ON platform_revenue(revenue_type);
      CREATE INDEX IF NOT EXISTS idx_platform_revenue_created_at ON platform_revenue(created_at);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payment_refunds_payment_id ON payment_refunds(payment_id);
      CREATE INDEX IF NOT EXISTS idx_payment_refunds_status ON payment_refunds(status);
      CREATE INDEX IF NOT EXISTS idx_payment_refunds_created_at ON payment_refunds(created_at);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payment_disputes_payment_id ON payment_disputes(payment_id);
      CREATE INDEX IF NOT EXISTS idx_payment_disputes_status ON payment_disputes(status);
      CREATE INDEX IF NOT EXISTS idx_payment_disputes_dispute_type ON payment_disputes(dispute_type);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payments_mercadopago_payment_id ON payments(mercadopago_payment_id);
      CREATE INDEX IF NOT EXISTS idx_payments_status_created_at ON payments(status, created_at);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_payment_webhooks_payment_id ON payment_webhooks(payment_id);
      CREATE INDEX IF NOT EXISTS idx_payment_webhooks_webhook_type ON payment_webhooks(webhook_type);
      CREATE INDEX IF NOT EXISTS idx_payment_webhooks_status ON payment_webhooks(status);
    `);

    // Add triggers for automatic timestamp updates
    console.log('🔄 Creating update triggers...');

    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    const tables = [
      'payment_preferences',
      'payment_escrow', 
      'provider_payouts',
      'payment_refunds',
      'payment_disputes'
    ];

    for (const table of tables) {
      await query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at 
        BEFORE UPDATE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
      `);
    }

    console.log('✅ Payment escrow system tables created successfully');

    // Create sample platform revenue configuration
    await query(`
      INSERT INTO platform_revenue (booking_id, amount, revenue_type, description)
      SELECT 0, 0, 'platform_fee', 'Sistema de tarifas de plataforma inicializado'
      WHERE NOT EXISTS (SELECT 1 FROM platform_revenue WHERE revenue_type = 'platform_fee' AND booking_id = 0);
    `);

    console.log('✅ Payment escrow system setup completed');

  } catch (error) {
    console.error('❌ Error creating payment escrow tables:', error);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  createPaymentEscrowTables()
    .then(() => {
      console.log('✅ Payment escrow migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Payment escrow migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createPaymentEscrowTables };