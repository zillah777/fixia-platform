import api from './api';

export interface DashboardStats {
  total_services: number;
  active_services: number;
  pending_requests: number;
  completed_bookings: number;
  total_earnings: number;
  monthly_net_earnings?: number;
  average_rating: number;
  total_reviews: number;
  profile_completion: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  service_count?: number;
}

export interface FeaturedProfessional {
  id: number;
  first_name: string;
  last_name: string;
  profession: string;
  rating: number;
  reviews: number;
  image?: string;
  services: string[];
  location: string;
}

export interface Testimonial {
  id: number;
  customer_name: string;
  rating: number;
  comment: string;
  service: string;
  date: string;
}

/**
 * Dashboard API Services
 * TODO: Connect to real backend endpoints when available
 */

export const dashboardService = {
  // AS Dashboard Stats
  async getASDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await api.get('/api/dashboard/as-stats');
      return response.data.data.stats;
    } catch (error) {
      console.error('Error fetching AS dashboard stats:', error);
      // Throw error to be handled by components - don't provide fallback mock data
      throw new Error('No se pudieron cargar las estadísticas. Verifica tu conexión.');
    }
  },

  // Explorador Dashboard Stats
  async getExploradorDashboardStats(): Promise<any> {
    try {
      const response = await api.get('/api/dashboard/explorer-stats');
      return response.data.data; // Return full data including stats and recentActivity
    } catch (error) {
      console.error('Error fetching Explorador dashboard stats:', error);
      // Throw error to be handled by components - don't provide fallback mock data
      throw new Error('No se pudieron cargar las estadísticas del explorador. Verifica tu conexión.');
    }
  }
};

export const landingService = {
  // Service Categories for Landing Page
  async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await api.get('/api/categories/featured');
      return response.data.data.categories || [];
    } catch (error) {
      console.error('Error fetching service categories:', error);
      // Return empty array instead of mock data
      return [];
    }
  },

  // Featured Professionals for Landing Page
  async getFeaturedProfessionals(): Promise<FeaturedProfessional[]> {
    try {
      const response = await api.get('/api/professionals/featured');
      return response.data.data.professionals || [];
    } catch (error) {
      console.error('Error fetching featured professionals:', error);
      // Return empty array instead of mock data
      return [];
    }
  },

  // Testimonials for Landing Page
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      const response = await api.get('/api/testimonials/featured');
      return response.data.data.testimonials || [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      // Return empty array instead of mock data
      return [];
    }
  }
};

export default { dashboardService, landingService };