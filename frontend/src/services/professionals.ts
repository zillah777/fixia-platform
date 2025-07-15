import api from './api';
import { 
  ApiResponse, 
  CompleteProfileData, 
  VerificationDocuments,
  CreateReferenceData,
  UserReference,
  CreatePortfolioData,
  PortfolioItem,
  AvailabilitySchedule,
  UserAvailability,
  CreateWorkLocationData,
  WorkLocation,
  ProfileCompletion,
  ExtendedUser
} from '@/types';

export const professionalsService = {
  // Complete profile
  async completeProfile(data: CompleteProfileData): Promise<ExtendedUser> {
    const response = await api.put<ApiResponse<ExtendedUser>>('/api/professionals/complete-profile', data);
    return response.data.data;
  },

  // Submit verification documents
  async submitVerification(documents: VerificationDocuments): Promise<{ dni_front_image: string; dni_back_image: string; selfie_with_dni_image: string }> {
    const formData = new FormData();
    if (documents.dni_front) {
      formData.append('dni_front', documents.dni_front);
    }
    if (documents.dni_back) {
      formData.append('dni_back', documents.dni_back);
    }
    if (documents.professional_license) {
      formData.append('professional_license', documents.professional_license);
    }

    const response = await api.post<ApiResponse<{ dni_front_image: string; dni_back_image: string; selfie_with_dni_image: string }>>(
      '/api/professionals/verification',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  // References
  async addReference(data: CreateReferenceData): Promise<UserReference> {
    const response = await api.post<ApiResponse<UserReference>>('/api/professionals/references', data);
    return response.data.data;
  },

  async getReferences(): Promise<UserReference[]> {
    const response = await api.get<ApiResponse<UserReference[]>>('/api/professionals/references');
    return response.data.data;
  },

  async deleteReference(id: number): Promise<void> {
    await api.delete(`/api/professionals/references/${id}`);
  },

  // Portfolio
  async addPortfolioItem(data: CreatePortfolioData): Promise<PortfolioItem> {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.completed_date) formData.append('completed_date', data.completed_date);
    if (data.category_id) formData.append('category_id', data.category_id.toString());
    if (data.images) {
      data.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }

    const response = await api.post<ApiResponse<PortfolioItem>>(
      '/api/professionals/portfolio',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data;
  },

  async getPortfolio(): Promise<PortfolioItem[]> {
    const response = await api.get<ApiResponse<PortfolioItem[]>>('/api/professionals/portfolio');
    return response.data.data;
  },

  async deletePortfolioItem(id: number): Promise<void> {
    await api.delete(`/api/professionals/portfolio/${id}`);
  },

  // Availability
  async setAvailability(schedules: AvailabilitySchedule[]): Promise<AvailabilitySchedule[]> {
    const response = await api.post<ApiResponse<AvailabilitySchedule[]>>('/api/professionals/availability', { schedules });
    return response.data.data;
  },

  async getAvailability(): Promise<UserAvailability[]> {
    const response = await api.get<ApiResponse<UserAvailability[]>>('/api/professionals/availability');
    return response.data.data;
  },

  // Work Locations
  async addWorkLocation(data: CreateWorkLocationData): Promise<WorkLocation> {
    const response = await api.post<ApiResponse<WorkLocation>>('/api/professionals/work-locations', data);
    return response.data.data;
  },

  async getWorkLocations(): Promise<WorkLocation[]> {
    const response = await api.get<ApiResponse<WorkLocation[]>>('/api/professionals/work-locations');
    return response.data.data;
  },

  // Profile completion
  async getProfileCompletion(): Promise<ProfileCompletion> {
    const response = await api.get<ApiResponse<ProfileCompletion>>('/api/professionals/profile-completion');
    return response.data.data;
  },
};