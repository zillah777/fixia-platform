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
    try {
      const response = await api.get<CategoriesApiResponse<ServiceCategory[]>>('/api/categories');
      
      // Deduplicate categories by name (keep the first occurrence)
      const categories = response.data.data;
      const seenNames = new Set<string>();
      const uniqueCategories = categories.filter(category => {
        if (seenNames.has(category.name)) {
          return false;
        }
        seenNames.add(category.name);
        return true;
      });
      
      return uniqueCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback categories if API fails
      return [
        { id: 1, name: 'Plomería', icon: '🔧', group_name: 'Mantenimiento y reparaciones', parent_category: 'Mantenimiento y reparaciones', description: 'Servicios de plomería y fontanería', is_active: true },
        { id: 2, name: 'Electricidad', icon: '⚡', group_name: 'Mantenimiento y reparaciones', parent_category: 'Mantenimiento y reparaciones', description: 'Servicios eléctricos e iluminación', is_active: true },
        { id: 3, name: 'Carpintería', icon: '🔨', group_name: 'Mantenimiento y reparaciones', parent_category: 'Mantenimiento y reparaciones', description: 'Trabajos en madera y carpintería', is_active: true },
        { id: 4, name: 'Limpieza', icon: '🧹', group_name: 'Servicios para el hogar y la familia', parent_category: 'Servicios para el hogar y la familia', description: 'Servicios de limpieza doméstica', is_active: true },
        { id: 5, name: 'Jardinería', icon: '🌱', group_name: 'Jardinería y espacios exteriores', parent_category: 'Jardinería y espacios exteriores', description: 'Cuidado de jardines y plantas', is_active: true },
        { id: 6, name: 'Pintura', icon: '🎨', group_name: 'Mantenimiento y reparaciones', parent_category: 'Mantenimiento y reparaciones', description: 'Pintura de interiores y exteriores', is_active: true },
        { id: 7, name: 'Albañilería', icon: '🧱', group_name: 'Mantenimiento y reparaciones', parent_category: 'Mantenimiento y reparaciones', description: 'Trabajos de construcción y albañilería', is_active: true },
        { id: 8, name: 'Reparación de electrodomésticos', icon: '🔌', group_name: 'Mantenimiento y reparaciones', parent_category: 'Mantenimiento y reparaciones', description: 'Reparación de electrodomésticos', is_active: true },
        { id: 9, name: 'Cuidado de niños', icon: '👶', group_name: 'Servicios para el hogar y la familia', parent_category: 'Servicios para el hogar y la familia', description: 'Niñeras y cuidado infantil', is_active: true },
        { id: 10, name: 'Belleza y estética', icon: '💄', group_name: 'Belleza, estética y cuidado personal', parent_category: 'Belleza, estética y cuidado personal', description: 'Servicios de belleza a domicilio', is_active: true }
      ];
    }
  },

  // Get categories grouped by parent category
  async getGroupedCategories(): Promise<GroupedCategories> {
    const response = await api.get<CategoriesApiResponse<GroupedCategories>>('/api/categories', {
      params: { grouped: true }
    });
    
    // Deduplicate categories within each group
    const groupedData = response.data.data;
    const deduplicatedGroups: GroupedCategories = {};
    
    for (const [groupName, categories] of Object.entries(groupedData)) {
      const seenNames = new Set<string>();
      const uniqueCategories = categories.filter(category => {
        if (seenNames.has(category.name)) {
          return false;
        }
        seenNames.add(category.name);
        return true;
      });
      deduplicatedGroups[groupName] = uniqueCategories;
    }
    
    return deduplicatedGroups;
  },

  // Get parent category groups
  async getParentGroups(): Promise<CategoryGroup[]> {
    const response = await api.get<CategoriesApiResponse<CategoryGroup[]>>('/api/categories/parent-groups');
    return response.data.data;
  },

  // Get categories by parent group
  async getCategoriesByParent(parentName: string): Promise<ServiceCategory[]> {
    const encodedParentName = encodeURIComponent(parentName);
    const response = await api.get<CategoriesApiResponse<ServiceCategory[]>>(`/api/categories/by-parent/${encodedParentName}`);
    return response.data.data;
  },

  // Search categories
  async searchCategories(params: CategorySearchParams): Promise<ServiceCategory[]> {
    const response = await api.get<CategoriesApiResponse<ServiceCategory[]>>('/api/categories/search', {
      params
    });
    return response.data.data;
  },

  // Get specific category by ID
  async getCategoryById(id: number): Promise<ServiceCategory> {
    const response = await api.get<CategoriesApiResponse<ServiceCategory>>(`/api/categories/${id}`);
    return response.data.data;
  },

  // Get popular categories (based on service announcements)
  async getPopularCategories(limit: number = 10): Promise<PopularCategory[]> {
    const response = await api.get<CategoriesApiResponse<PopularCategory[]>>('/api/categories/stats/popular', {
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