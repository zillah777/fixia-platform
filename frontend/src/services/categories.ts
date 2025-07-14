import api from './api';
import {
  ServiceCategory,
  GroupedCategories,
  CategoryGroup,
  PopularCategory,
  CategoriesApiResponse,
  CategorySearchParams
} from '../types/categories';

export const categoriesService = {
  // Get all categories
  async getAllCategories(): Promise<ServiceCategory[]> {
    const response = await api.get<CategoriesApiResponse<ServiceCategory[]>>('/categories');
    return response.data.data;
  },

  // Get categories grouped by parent category
  async getGroupedCategories(): Promise<GroupedCategories> {
    const response = await api.get<CategoriesApiResponse<GroupedCategories>>('/categories', {
      params: { grouped: true }
    });
    return response.data.data;
  },

  // Get parent category groups
  async getParentGroups(): Promise<CategoryGroup[]> {
    const response = await api.get<CategoriesApiResponse<CategoryGroup[]>>('/categories/parent-groups');
    return response.data.data;
  },

  // Get categories by parent group
  async getCategoriesByParent(parentName: string): Promise<ServiceCategory[]> {
    const encodedParentName = encodeURIComponent(parentName);
    const response = await api.get<CategoriesApiResponse<ServiceCategory[]>>(`/categories/by-parent/${encodedParentName}`);
    return response.data.data;
  },

  // Search categories
  async searchCategories(params: CategorySearchParams): Promise<ServiceCategory[]> {
    const response = await api.get<CategoriesApiResponse<ServiceCategory[]>>('/categories/search', {
      params
    });
    return response.data.data;
  },

  // Get specific category by ID
  async getCategoryById(id: number): Promise<ServiceCategory> {
    const response = await api.get<CategoriesApiResponse<ServiceCategory>>(`/categories/${id}`);
    return response.data.data;
  },

  // Get popular categories (based on service announcements)
  async getPopularCategories(limit: number = 10): Promise<PopularCategory[]> {
    const response = await api.get<CategoriesApiResponse<PopularCategory[]>>('/categories/stats/popular', {
      params: { limit }
    });
    return response.data.data;
  },

  // Helper methods for common operations
  async getCategoriesForAS(): Promise<ServiceCategory[]> {
    // Get all categories that AS can use for their services
    return this.getAllCategories();
  },

  async getCategoriesForSearch(): Promise<GroupedCategories> {
    // Get grouped categories for search/filter interfaces
    return this.getGroupedCategories();
  },

  // Get categories for a specific group (commonly used ones)
  async getHomeAndFamilyCategories(): Promise<ServiceCategory[]> {
    return this.getCategoriesByParent('Servicios para el hogar y la familia');
  },

  async getBeautyCategories(): Promise<ServiceCategory[]> {
    return this.getCategoriesByParent('Belleza, estética y cuidado personal');
  },

  async getMaintenanceCategories(): Promise<ServiceCategory[]> {
    return this.getCategoriesByParent('Mantenimiento y reparaciones');
  },

  async getTechnologyCategories(): Promise<ServiceCategory[]> {
    return this.getCategoriesByParent('Tecnología y electrónica');
  },

  async getEducationCategories(): Promise<ServiceCategory[]> {
    return this.getCategoriesByParent('Educación y formación');
  },

  async getEventsCategories(): Promise<ServiceCategory[]> {
    return this.getCategoriesByParent('Eventos y entretenimiento');
  },

  async getProfessionalCategories(): Promise<ServiceCategory[]> {
    return this.getCategoriesByParent('Servicios profesionales');
  },

  // Utility function to format categories for dropdowns/selects
  async getCategoriesForSelect(): Promise<Array<{ value: number; label: string; group: string; icon: string }>> {
    const categories = await this.getAllCategories();
    return categories.map(category => ({
      value: category.id,
      label: category.name,
      group: category.parent_category || 'Otros',
      icon: category.icon
    }));
  },

  // Get trending categories based on recent activity
  async getTrendingCategories(): Promise<ServiceCategory[]> {
    const popular = await this.getPopularCategories(5);
    return popular.map(({ announcements_count, ...category }) => category);
  }
};

export default categoriesService;