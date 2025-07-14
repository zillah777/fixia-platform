import api from './api';
import {
  WorkLocation,
  WorkCategory,
  ASAvailability,
  ASPricing,
  PortfolioItem,
  ASEducation,
  ValidationProgress,
  PrivacySettings,
  NotificationSettings,
  ServiceAnnouncement,
  ExplorerReport,
  ServiceRequest,
  ASDashboard,
  ASPremiumApiResponse,
  WorkLocationForm,
  WorkCategoryForm,
  AvailabilityForm,
  PricingForm,
  PortfolioForm,
  EducationForm,
  ServiceAnnouncementForm,
  ExplorerReportForm,
  ServiceRequestResponse
} from '../types/as-premium';

export const asPremiumService = {
  // WORK LOCATIONS
  async getWorkLocations(): Promise<WorkLocation[]> {
    const response = await api.get<ASPremiumApiResponse<WorkLocation[]>>('/as-premium/work-locations');
    return response.data.data;
  },

  async addWorkLocation(data: WorkLocationForm): Promise<void> {
    await api.post('/as-premium/work-locations', data);
  },

  async removeWorkLocation(id: number): Promise<void> {
    await api.delete(`/as-premium/work-locations/${id}`);
  },

  // WORK CATEGORIES
  async getWorkCategories(): Promise<WorkCategory[]> {
    const response = await api.get<ASPremiumApiResponse<WorkCategory[]>>('/as-premium/work-categories');
    return response.data.data;
  },

  async addWorkCategory(data: WorkCategoryForm): Promise<void> {
    await api.post('/as-premium/work-categories', data);
  },

  async removeWorkCategory(id: number): Promise<void> {
    await api.delete(`/as-premium/work-categories/${id}`);
  },

  // AVAILABILITY
  async getAvailability(): Promise<ASAvailability[]> {
    const response = await api.get<ASPremiumApiResponse<ASAvailability[]>>('/as-premium/availability');
    return response.data.data;
  },

  async setAvailability(data: AvailabilityForm): Promise<void> {
    await api.post('/as-premium/availability', data);
  },

  // PRICING
  async getPricing(): Promise<ASPricing[]> {
    const response = await api.get<ASPremiumApiResponse<ASPricing[]>>('/as-premium/pricing');
    return response.data.data;
  },

  async setPricing(data: PricingForm): Promise<void> {
    await api.post('/as-premium/pricing', data);
  },

  // PORTFOLIO
  async getPortfolio(): Promise<PortfolioItem[]> {
    const response = await api.get<ASPremiumApiResponse<PortfolioItem[]>>('/as-premium/portfolio');
    return response.data.data;
  },

  async addPortfolioItem(data: PortfolioForm): Promise<{ id: number }> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'portfolio_image' && value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.post<ASPremiumApiResponse<{ id: number }>>('/as-premium/portfolio', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  async removePortfolioItem(id: number): Promise<void> {
    await api.delete(`/as-premium/portfolio/${id}`);
  },
};

export const asSettingsService = {
  // EDUCATION & VALIDATION
  async getEducation(): Promise<ASEducation[]> {
    const response = await api.get<ASPremiumApiResponse<ASEducation[]>>('/as-settings/education');
    return response.data.data;
  },

  async addEducation(data: EducationForm): Promise<{ id: number }> {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'certificate_image' && value instanceof File) {
        formData.append(key, value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });

    const response = await api.post<ASPremiumApiResponse<{ id: number }>>('/as-settings/education', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  },

  async getValidationProgress(): Promise<ValidationProgress> {
    const response = await api.get<ASPremiumApiResponse<ValidationProgress>>('/as-settings/validation-progress');
    return response.data.data;
  },

  // PRIVACY SETTINGS
  async getPrivacySettings(): Promise<PrivacySettings> {
    const response = await api.get<ASPremiumApiResponse<PrivacySettings>>('/as-settings/privacy');
    return response.data.data;
  },

  async updatePrivacySettings(data: Partial<PrivacySettings>): Promise<void> {
    await api.put('/as-settings/privacy', data);
  },

  // NOTIFICATION SETTINGS
  async getNotificationSettings(): Promise<NotificationSettings> {
    const response = await api.get<ASPremiumApiResponse<NotificationSettings>>('/as-settings/notifications');
    return response.data.data;
  },

  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<void> {
    await api.put('/as-settings/notifications', data);
  },

  // EXPLORER REPORTS
  async reportExplorer(data: ExplorerReportForm): Promise<{ id: number }> {
    const response = await api.post<ASPremiumApiResponse<{ id: number }>>('/as-settings/report-explorer', data);
    return response.data.data;
  },

  async getMyReports(): Promise<ExplorerReport[]> {
    const response = await api.get<ASPremiumApiResponse<ExplorerReport[]>>('/as-settings/my-reports');
    return response.data.data;
  },
};

export const serviceManagementService = {
  // SERVICE ANNOUNCEMENTS
  async getAnnouncements(): Promise<ServiceAnnouncement[]> {
    const response = await api.get<ASPremiumApiResponse<ServiceAnnouncement[]>>('/service-management/announcements');
    return response.data.data;
  },

  async createAnnouncement(data: ServiceAnnouncementForm): Promise<{ id: number }> {
    const response = await api.post<ASPremiumApiResponse<{ id: number }>>('/service-management/announcements', data);
    return response.data.data;
  },

  async updateAnnouncement(id: number, data: Partial<ServiceAnnouncementForm>): Promise<void> {
    await api.put(`/service-management/announcements/${id}`, data);
  },

  async deleteAnnouncement(id: number): Promise<void> {
    await api.delete(`/service-management/announcements/${id}`);
  },

  // SERVICE REQUESTS
  async getServiceRequests(status: string = 'pending'): Promise<ServiceRequest[]> {
    const response = await api.get<ASPremiumApiResponse<ServiceRequest[]>>(`/service-management/requests`, {
      params: { status }
    });
    return response.data.data;
  },

  async getServiceRequest(id: number): Promise<ServiceRequest> {
    const response = await api.get<ASPremiumApiResponse<ServiceRequest>>(`/service-management/requests/${id}`);
    return response.data.data;
  },

  async respondToRequest(id: number, response: ServiceRequestResponse): Promise<void> {
    await api.post(`/service-management/requests/${id}/respond`, response);
  },

  // DASHBOARD
  async getDashboard(): Promise<ASDashboard> {
    const response = await api.get<ASPremiumApiResponse<ASDashboard>>('/service-management/dashboard');
    return response.data.data;
  },
};

// Combined service for convenience
export const asCombinedService = {
  ...asPremiumService,
  ...asSettingsService,
  ...serviceManagementService,
};

export default asCombinedService;