import axios from 'axios';
import { 
  ExplorerProfile, 
  ExplorerServiceRequest, 
  ExplorerServiceRequestForm,
  ExplorerProfileUpdateForm,
  ASServiceInterest,
  ExplorerASConnection,
  ASProfileForExplorer,
  ExplorerBrowseParams,
  ExplorerApiResponse,
  ChubutLocality,
  ExplorerReviewObligation,
  ExplorerReviewForm,
  ChatMessage,
  ChatMessageForm
} from '@/types/explorer';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

class ExplorerService {
  private api = axios.create({
    baseURL: API_BASE,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Explorer Profile Management
  async getProfile(): Promise<ExplorerApiResponse<ExplorerProfile>> {
    const response = await this.api.get('/explorer/profile');
    return response.data;
  }

  async updateProfile(data: ExplorerProfileUpdateForm): Promise<ExplorerApiResponse<null>> {
    const response = await this.api.put('/explorer/profile', data);
    return response.data;
  }

  // Service Requests (BUSCO ALBAÑIL PARA TRABAJO EN RAWSON)
  async createServiceRequest(data: ExplorerServiceRequestForm): Promise<ExplorerApiResponse<{ request_id: number; expires_at: string }>> {
    const response = await this.api.post('/explorer/service-request', data);
    return response.data;
  }

  async getMyServiceRequests(status = 'active'): Promise<ExplorerApiResponse<ExplorerServiceRequest[]>> {
    const response = await this.api.get(`/explorer/my-requests?status=${status}`);
    return response.data;
  }

  async getServiceRequestInterests(requestId: number): Promise<ExplorerApiResponse<ASServiceInterest[]>> {
    const response = await this.api.get(`/explorer/request/${requestId}/interests`);
    return response.data;
  }

  async acceptASInterest(interestId: number, finalAgreedPrice?: number): Promise<ExplorerApiResponse<{ connection_id: number; chat_room_id: string }>> {
    const response = await this.api.post('/explorer/accept-as', {
      interest_id: interestId,
      final_agreed_price: finalAgreedPrice
    });
    return response.data;
  }

  // AS Profile Browsing
  async browseAS(params: ExplorerBrowseParams): Promise<ExplorerApiResponse<{ profiles: any[]; total: number; has_more: boolean }>> {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, String(value));
    });
    
    const response = await this.api.get(`/explorer/browse-as?${queryParams}`);
    return response.data;
  }

  async getASProfile(asId: number): Promise<ExplorerApiResponse<ASProfileForExplorer>> {
    const response = await this.api.get(`/explorer/as-profile/${asId}`);
    return response.data;
  }

  // Chat System
  async getChatConnections(): Promise<ExplorerApiResponse<ExplorerASConnection[]>> {
    const response = await this.api.get('/explorer-chat/connections');
    return response.data;
  }

  async getChatMessages(chatRoomId: string, limit = 50, offset = 0): Promise<ExplorerApiResponse<ChatMessage[]>> {
    const response = await this.api.get(`/explorer-chat/${chatRoomId}/messages?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  async sendChatMessage(chatRoomId: string, data: ChatMessageForm): Promise<ExplorerApiResponse<ChatMessage>> {
    const response = await this.api.post(`/explorer-chat/${chatRoomId}/message`, data);
    return response.data;
  }

  // Mutual Confirmation System
  async confirmServiceCompletion(connectionId: number, confirmationData?: { comment?: string }): Promise<ExplorerApiResponse<{
    both_confirmed: boolean;
    connection_status: string;
    explorer_confirmed: boolean;
    as_confirmed: boolean;
    confirmation_id?: number;
  }>> {
    const response = await this.api.post(`/mutual-confirmation/confirm-completion/${connectionId}`, confirmationData || {});
    return response.data;
  }

  async getConfirmationStatus(connectionId: number): Promise<ExplorerApiResponse<{
    both_confirmed: boolean;
    user_confirmed: boolean;
    partner_confirmed: boolean;
    service_completed: boolean;
    confirmations: {
      explorer: {
        confirmed: boolean;
        confirmed_at?: string;
        message?: string;
        satisfaction?: string;
        service_delivered?: boolean;
      };
      as: {
        confirmed: boolean;
        confirmed_at?: string;
        message?: string;
        satisfaction?: string;
        payment_received?: boolean;
      };
    };
  }>> {
    const response = await this.api.get(`/mutual-confirmation/connection/${connectionId}/status`);
    return response.data;
  }

  async getMutualConfirmationBlockingStatus(): Promise<ExplorerApiResponse<{
    is_blocked: boolean;
    pending_confirmations_count: number;
    pending_reviews_count: number;
    message: string;
  }>> {
    const response = await this.api.get('/mutual-confirmation/blocking-status');
    return response.data;
  }

  async getConnectionDetails(connectionId: number): Promise<ExplorerApiResponse<ExplorerASConnection>> {
    const response = await this.api.get(`/explorer-chat/connection/${connectionId}`);
    return response.data;
  }

  // Review System
  async getPendingReviewObligations(): Promise<ExplorerApiResponse<{ obligations: ExplorerReviewObligation[]; total_pending: number; blocking_count: number }>> {
    const response = await this.api.get('/explorer-reviews/pending-obligations');
    return response.data;
  }

  async submitReview(data: ExplorerReviewForm): Promise<ExplorerApiResponse<{ review_id: number }>> {
    const response = await this.api.post('/explorer-reviews/submit', data);
    return response.data;
  }

  async getMyReviews(limit = 20, offset = 0): Promise<ExplorerApiResponse<any[]>> {
    const response = await this.api.get(`/explorer-reviews/my-reviews?limit=${limit}&offset=${offset}`);
    return response.data;
  }

  async getBlockingStatus(): Promise<ExplorerApiResponse<{ 
    is_blocked: boolean; 
    blocking_reviews_count: number; 
    pending_as_names: string; 
    message: string 
  }>> {
    const response = await this.api.get('/explorer-reviews/blocking-status');
    return response.data;
  }

  async updateReview(reviewId: number, data: Partial<ExplorerReviewForm>): Promise<ExplorerApiResponse<null>> {
    const response = await this.api.put(`/explorer-reviews/${reviewId}`, data);
    return response.data;
  }

  async getASReviews(asId: number, limit = 10, offset = 0, sortBy = 'recent'): Promise<ExplorerApiResponse<{
    reviews: any[];
    statistics: any;
    pagination: { limit: number; offset: number; has_more: boolean };
  }>> {
    const response = await this.api.get(`/explorer-reviews/as/${asId}?limit=${limit}&offset=${offset}&sort_by=${sortBy}`);
    return response.data;
  }

  // Role Switching
  async switchToProvider(reason?: string): Promise<ExplorerApiResponse<{ new_user_type: string; switched_at: string }>> {
    const response = await this.api.post('/role-switching/switch-to-provider', { switch_reason: reason });
    return response.data;
  }

  async switchToClient(reason?: string): Promise<ExplorerApiResponse<{ new_user_type: string; switched_at: string }>> {
    const response = await this.api.post('/role-switching/switch-to-client', { switch_reason: reason });
    return response.data;
  }

  async canSwitchRole(): Promise<ExplorerApiResponse<{
    can_switch: boolean;
    current_role: string;
    target_role: string;
    blocking_reasons: string[];
    recommendations: string[];
  }>> {
    const response = await this.api.get('/role-switching/can-switch');
    return response.data;
  }

  async getRoleSwitchHistory(): Promise<ExplorerApiResponse<any[]>> {
    const response = await this.api.get('/role-switching/history');
    return response.data;
  }

  async getRoleSwitchStats(): Promise<ExplorerApiResponse<any>> {
    const response = await this.api.get('/role-switching/stats');
    return response.data;
  }

  // Utilities
  async getChubutLocalities(): Promise<ExplorerApiResponse<ChubutLocality[]>> {
    // This would need to be added to a localities endpoint
    const response = await this.api.get('/localities/chubut');
    return response.data;
  }

  // Helper methods for form validation
  validateServiceRequest(data: ExplorerServiceRequestForm): string[] {
    const errors: string[] = [];
    
    if (!data.category_id) errors.push('Categoría es requerida');
    if (!data.title?.trim()) errors.push('Título es requerido');
    if (!data.description?.trim()) errors.push('Descripción es requerida');
    if (!data.locality?.trim()) errors.push('Localidad es requerida');
    
    if (data.budget_min && data.budget_max && data.budget_min > data.budget_max) {
      errors.push('El presupuesto mínimo no puede ser mayor al máximo');
    }
    
    if (data.preferred_date) {
      const selectedDate = new Date(data.preferred_date);
      const today = new Date();
      if (selectedDate < today) {
        errors.push('La fecha preferida no puede ser en el pasado');
      }
    }
    
    return errors;
  }

  validateReview(data: ExplorerReviewForm): string[] {
    const errors: string[] = [];
    
    if (!data.connection_id) errors.push('ID de conexión es requerido');
    if (!data.rating || data.rating < 1 || data.rating > 5) errors.push('Calificación debe ser entre 1 y 5');
    if (!data.comment?.trim()) errors.push('Comentario es requerido');
    
    // Validate optional ratings
    const optionalRatings = [
      'service_quality_rating', 
      'punctuality_rating', 
      'communication_rating', 
      'value_for_money_rating'
    ];
    
    optionalRatings.forEach(rating => {
      const value = data[rating as keyof ExplorerReviewForm] as number;
      if (value && (value < 1 || value > 5)) {
        errors.push(`${rating} debe ser entre 1 y 5`);
      }
    });
    
    return errors;
  }

  // Format helpers
  formatPrice(amount: number, currency = 'ARS'): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleString('es-AR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getUrgencyColor(urgency: string): string {
    const colors = {
      low: 'gray',
      medium: 'blue',
      high: 'orange',
      emergency: 'red'
    };
    return colors[urgency as keyof typeof colors] || 'gray';
  }

  calculateDaysRemaining(dateString: string): number {
    const targetDate = new Date(dateString);
    const today = new Date();
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const explorerService = new ExplorerService();
export default explorerService;