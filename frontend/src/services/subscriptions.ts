import api from './api';
import { 
  ApiResponse, 
  PaginatedResponse,
  Subscription,
  UserSubscription,
  SubscriptionPayment,
  SubscriptionBenefits
} from '@/types';

export const subscriptionsService = {
  // Get subscription plans
  async getPlans(): Promise<Subscription[]> {
    const response = await api.get<ApiResponse<Subscription[]>>('/api/subscriptions/plans');
    return response.data.data;
  },

  // Get current subscription
  async getCurrentSubscription(): Promise<UserSubscription> {
    const response = await api.get<ApiResponse<UserSubscription>>('/api/subscriptions/current');
    return response.data.data;
  },

  // Upgrade subscription
  async upgradeSubscription(subscriptionId: number): Promise<{
    payment_id: number;
    payment_url: string;
    external_payment_id: string;
    amount: number;
    subscription: Subscription;
  }> {
    const response = await api.post<ApiResponse<{
      payment_id: number;
      payment_url: string;
      external_payment_id: string;
      amount: number;
      subscription: Subscription;
    }>>('/api/subscriptions/upgrade', { subscription_id: subscriptionId });
    return response.data.data;
  },

  // Confirm payment
  async confirmPayment(paymentId: number, externalPaymentId: string): Promise<{
    status: string;
    subscription_type: string;
    expires_at: string;
  }> {
    const response = await api.post<ApiResponse<{
      status: string;
      subscription_type: string;
      expires_at: string;
    }>>('/api/subscriptions/confirm-payment', {
      payment_id: paymentId,
      external_payment_id: externalPaymentId
    });
    return response.data.data;
  },

  // Get payment history
  async getPaymentHistory(page: number = 1, limit: number = 10): Promise<{
    payments: SubscriptionPayment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const response = await api.get<PaginatedResponse<SubscriptionPayment>>(
      `/api/subscriptions/payment-history?page=${page}&limit=${limit}`
    );
    return {
      payments: response.data.data.items,
      pagination: response.data.data.pagination
    };
  },

  // Cancel subscription
  async cancelSubscription(reason?: string): Promise<{ message: string }> {
    const response = await api.post<ApiResponse<{ message: string }>>('/api/subscriptions/cancel', { reason });
    return response.data.data;
  },

  // Get subscription benefits
  async getBenefits(): Promise<SubscriptionBenefits> {
    const response = await api.get<ApiResponse<SubscriptionBenefits>>('/api/subscriptions/benefits');
    return response.data.data;
  },
};