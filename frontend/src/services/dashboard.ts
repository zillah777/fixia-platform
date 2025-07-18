import api from './api';

export interface DashboardStats {
  total_services: number;
  active_services: number;
  pending_requests: number;
  completed_bookings: number;
  total_earnings: number;
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
      // Fallback to default values if API fails
      return {
        total_services: 0,
        active_services: 0,
        pending_requests: 0,
        completed_bookings: 0,
        total_earnings: 0,
        average_rating: 0,
        total_reviews: 0,
        profile_completion: 50
      };
    }
  },

  // Explorador Dashboard Stats
  async getExploradorDashboardStats(): Promise<any> {
    try {
      const response = await api.get('/api/dashboard/explorer-stats');
      return response.data.data; // Return full data including stats and recentActivity
    } catch (error) {
      console.error('Error fetching Explorador dashboard stats:', error);
      // Fallback to default values if API fails
      return {
        stats: {
          activeBookings: 0,
          completedBookings: 0,
          totalSpent: 0,
          favoriteServices: 0,
          unreadMessages: 0
        },
        recentActivity: []
      };
    }
  }
};

export const landingService = {
  // Service Categories for Landing Page
  async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      // TODO: Replace with real API call
      // const response = await api.get('/categories/featured');
      // return response.data;
      
      // Mock data with service counts
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            { id: 'plomeria', name: 'Plomería', icon: '🔧', description: 'Reparaciones e instalaciones', service_count: 45 },
            { id: 'electricidad', name: 'Electricidad', icon: '⚡', description: 'Instalaciones eléctricas', service_count: 32 },
            { id: 'limpieza', name: 'Limpieza', icon: '🧹', description: 'Limpieza de hogar y oficinas', service_count: 67 },
            { id: 'reparaciones', name: 'Reparaciones', icon: '🔨', description: 'Reparaciones del hogar', service_count: 28 },
            { id: 'belleza', name: 'Belleza', icon: '💄', description: 'Servicios de belleza', service_count: 19 },
            { id: 'otros', name: 'Otros', icon: '🛠️', description: 'Más servicios disponibles', service_count: 156 }
          ]);
        }, 300);
      });
    } catch (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }
  },

  // Featured Professionals for Landing Page
  async getFeaturedProfessionals(): Promise<FeaturedProfessional[]> {
    try {
      // TODO: Replace with real API call
      // const response = await api.get('/professionals/featured');
      // return response.data;
      
      // Mock data with realistic profiles
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: 1,
              first_name: 'Carlos',
              last_name: 'Rodríguez',
              profession: 'Plomero Certificado',
              rating: 4.9,
              reviews: 127,
              services: ['Plomería', 'Instalaciones'],
              location: 'Zona Centro'
            },
            {
              id: 2,
              first_name: 'Ana',
              last_name: 'Martínez',
              profession: 'Electricista',
              rating: 4.8,
              reviews: 89,
              services: ['Electricidad', 'Instalaciones'],
              location: 'Zona Norte'
            },
            {
              id: 3,
              first_name: 'Roberto',
              last_name: 'Silva',
              profession: 'Técnico Reparaciones',
              rating: 4.7,
              reviews: 156,
              services: ['Reparaciones', 'Mantenimiento'],
              location: 'Zona Sur'
            }
          ]);
        }, 400);
      });
    } catch (error) {
      console.error('Error fetching featured professionals:', error);
      throw error;
    }
  },

  // Testimonials for Landing Page
  async getTestimonials(): Promise<Testimonial[]> {
    try {
      // TODO: Replace with real API call
      // const response = await api.get('/testimonials/featured');
      // return response.data;
      
      // Mock data
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: 1,
              customer_name: 'María González',
              rating: 5,
              comment: 'Excelente servicio, muy profesional y resolvió mi problema de plomería rápidamente.',
              service: 'Reparación de Plomería',
              date: '2024-01-15'
            },
            {
              id: 2,
              customer_name: 'Juan López',
              rating: 5,
              comment: 'Encontré al AS perfecto para mi hogar. Trabajo de calidad y precio justo.',
              service: 'Instalación Eléctrica',
              date: '2024-01-12'
            },
            {
              id: 3,
              customer_name: 'Laura Fernández',
              rating: 4,
              comment: 'Muy buena experiencia usando Fixia. La plataforma es fácil de usar.',
              service: 'Limpieza de Hogar',
              date: '2024-01-10'
            }
          ]);
        }, 200);
      });
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  }
};

export default { dashboardService, landingService };