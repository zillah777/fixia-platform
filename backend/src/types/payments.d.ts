/**
 * PAYMENT SYSTEM TYPE DEFINITIONS  
 * TypeScript interfaces for payment processing and MercadoPago integration
 */

export interface PaymentRequest {
  booking_id: number;
  amount: number;
  currency: 'ARS' | 'USD' | 'EUR';
  payment_method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'mercadopago_wallet';
  description: string;
  payer_email: string;
  return_url?: string;
  cancel_url?: string;
  notification_url?: string;
}

export interface PaymentResponse {
  id: number;
  booking_id: number;
  amount: number;
  currency: string;
  payment_status: 'pending' | 'processing' | 'approved' | 'rejected' | 'cancelled' | 'refunded';
  payment_method: string;
  transaction_id: string | null;
  mercadopago_id: string | null;
  mercadopago_status: string | null;
  payment_url?: string;
  processed_at: string | null;
  expires_at: string | null;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface MercadoPagoPreference {
  id: string;
  init_point: string;
  sandbox_init_point: string;
  collector_id: number;
  client_id: string;
  items: MercadoPagoItem[];
  payer: MercadoPagoPayer;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  payment_methods: {
    excluded_payment_methods: any[];
    excluded_payment_types: any[];
    installments: number;
  };
  notification_url: string;
  external_reference: string;
  expires: boolean;
  expiration_date_from: string;
  expiration_date_to: string;
}

export interface MercadoPagoItem {
  id: string;
  title: string;
  description: string;
  picture_url?: string;
  category_id: string;
  quantity: number;
  currency_id: string;
  unit_price: number;
}

export interface MercadoPagoPayer {
  name: string;
  surname: string;
  email: string;
  phone?: {
    area_code: string;
    number: string;
  };
  identification?: {
    type: 'DNI' | 'CUIL' | 'CUIT';
    number: string;
  };
  address?: {
    street_name: string;
    street_number: number;
    zip_code: string;
  };
}

export interface MercadoPagoWebhookPayload {
  action: 'payment.created' | 'payment.updated';
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  id: number;
  live_mode: boolean;
  type: 'payment';
  user_id: string;
}

export interface MercadoPagoPaymentDetails {
  id: number;
  status: 'pending' | 'approved' | 'authorized' | 'in_process' | 'in_mediation' | 'rejected' | 'cancelled' | 'refunded' | 'charged_back';
  status_detail: string;
  operation_type: string;
  currency_id: string;
  description: string;
  live_mode: boolean;
  sponsor_id: number | null;
  processing_mode: string;
  merchant_account_id: string | null;
  taxes_amount: number;
  shipping_amount: number;
  collector_id: number;
  payer: {
    type: string;
    id: string;
    email: string;
    identification: {
      type: string;
      number: string;
    };
  };
  metadata: {
    [key: string]: any;
  };
  additional_info: {
    [key: string]: any;
  };
  external_reference: string;
  transaction_amount: number;
  transaction_amount_refunded: number;
  coupon_amount: number;
  differential_pricing_id: number | null;
  deduction_schema: string | null;
  installments: number;
  transaction_details: {
    payment_method_reference_id: string | null;
    net_received_amount: number;
    total_paid_amount: number;
    overpaid_amount: number;
    external_resource_url: string | null;
    installment_amount: number;
    financial_institution: string | null;
    payable_deferral_period: string | null;
    acquirer_reference: string | null;
  };
  fee_details: Array<{
    type: string;
    amount: number;
    fee_payer: string;
  }>;
  charges_details: any[];
  captured: boolean;
  binary_mode: boolean;
  call_for_authorize_id: string | null;
  statement_descriptor: string | null;
  card: {
    id: string | null;
    last_four_digits: string;
    first_six_digits: string;
    expiration_month: number;
    expiration_year: number;
    date_created: string;
    date_last_updated: string;
  } | null;
  notification_url: string | null;
  refunds: any[];
  processing_mode_v2: string | null;
  merchant_number: string | null;
  acquirer: string | null;
  merchant_services: {
    fraud_scoring: boolean;
    fraud_manual_review: boolean;
  };
}

export interface PaymentEscrow {
  id: number;
  payment_id: number;
  booking_id: number;
  amount: number;
  currency: string;
  status: 'held' | 'released' | 'refunded';
  held_until: string;
  release_conditions: string[];
  released_at: string | null;
  released_to_provider_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RefundRequest {
  payment_id: number;
  amount?: number; // If not provided, full refund
  reason: string;
  notes?: string;
}

export interface RefundResponse {
  id: number;
  payment_id: number;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  mercadopago_refund_id: string | null;
  reason: string;
  processed_at: string | null;
  created_at: string;
}

export interface PaymentStats {
  total_payments: number;
  total_amount: number;
  successful_payments: number;
  failed_payments: number;
  pending_payments: number;
  refunded_payments: number;
  success_rate: number;
  average_payment_amount: number;
  currency_breakdown: {
    [currency: string]: {
      count: number;
      amount: number;
    };
  };
  payment_method_breakdown: {
    [method: string]: {
      count: number;
      amount: number;
    };
  };
}

export interface PaymentNotification {
  type: 'payment_approved' | 'payment_rejected' | 'payment_pending' | 'refund_processed';
  payment_id: number;
  booking_id: number;
  user_id: number;
  provider_id: number;
  amount: number;
  currency: string;
  message: string;
  action_required: boolean;
  created_at: string;
}