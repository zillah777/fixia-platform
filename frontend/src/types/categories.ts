// Service Categories Types

export interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  parent_category?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GroupedCategories {
  [parentCategory: string]: ServiceCategory[];
}

export interface CategoryGroup {
  name: string;
  count: number;
  slug: string;
}

export interface PopularCategory extends ServiceCategory {
  announcements_count: number;
}

// API Response types
export interface CategoriesApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Search parameters
export interface CategorySearchParams {
  q: string;
  parent_category?: string;
}

// Category constants for easy reference
export const CATEGORY_GROUPS = {
  HOME_FAMILY: 'Servicios para el hogar y la familia',
  BEAUTY_PERSONAL: 'Belleza, estética y cuidado personal',
  MAINTENANCE_REPAIRS: 'Mantenimiento y reparaciones',
  GARDENING_OUTDOORS: 'Jardinería y espacios exteriores',
  VEHICLES: 'Servicios de vehículos',
  TECHNOLOGY: 'Tecnología y electrónica',
  EDUCATION: 'Educación y formación',
  EVENTS_ENTERTAINMENT: 'Eventos y entretenimiento',
  SEWING_CRAFTS: 'Costura y manualidades',
  LOGISTICS_PROCEDURES: 'Logística y trámites',
  PROFESSIONAL_SERVICES: 'Servicios profesionales',
  ART_CREATIVITY: 'Arte y creatividad',
  OTHER_SERVICES: 'Otros servicios útiles o curiosos'
} as const;

export type CategoryGroupKey = keyof typeof CATEGORY_GROUPS;
export type CategoryGroupValue = typeof CATEGORY_GROUPS[CategoryGroupKey];

// Category icons mapping for quick access
export const CATEGORY_ICONS = {
  // Home and Family
  'Niñera / Cuidado de niños': '👶',
  'Cuidado de personas mayores': '👴',
  'Cuidador de personas con discapacidad': '♿',
  'Enfermería a domicilio': '👩‍⚕️',
  'Cocinero a domicilio / Chef para eventos': '👨‍🍳',
  'Lavado y planchado de ropa': '👕',
  'Limpieza de casas / Limpieza profunda': '🧹',
  'Limpieza de patios y jardines': '🌿',
  'Paseador de perros': '🐕',
  'Cuidado de mascotas (pet sitting)': '🐱',
  'Adiestramiento canino': '🎾',
  'Transporte escolar': '🚌',

  // Beauty and Personal Care
  'Peluquero/a': '💇',
  'Barbería a domicilio': '💈',
  'Maquilladora profesional': '💄',
  'Manicura y pedicura': '💅',
  'Depilación': '🪒',
  'Masajes terapéuticos': '💆',
  'Estética facial/corporal': '✨',
  'Spa móvil': '🧖‍♀️',
  'Entrenador personal': '🏋️',

  // Maintenance and Repairs
  'Plomero': '🚰',
  'Electricista': '⚡',
  'Gasista matriculado': '🔥',
  'Albañil': '🧱',
  'Pintor': '🎨',
  'Herrero': '⚒️',
  'Carpintero': '🪚',
  'Techista': '🏠',
  'Instalador de aires acondicionados': '❄️',
  'Instalación de cámaras de seguridad': '📹',
  'Cerrajero': '🔑',
  'Reparación de electrodomésticos': '🔧',
  'Arreglo de muebles': '🪑',
  'Instalación de muebles': '🔨',

  // Gardening and Outdoors
  'Jardinería general': '🌱',
  'Diseño de jardines': '🌺',
  'Poda de árboles': '🌳',
  'Limpieza de terrenos baldíos': '🏞️',
  'Mantenimiento de piletas': '🏊',
  'Colocación de cercos': '🚧',

  // Technology and Electronics
  'Técnico en computadoras': '💻',
  'Reparación de celulares': '📱',
  'Instalación de redes WiFi': '📶',
  'Reparación de consolas y periféricos': '🎮',
  'Clases de informática': '🖥️',
  'Community manager / manejo de redes': '📱',
  'Soporte técnico remoto': '🖱️',
  'Instalación de sistemas de seguridad': '🔒',

  // Professional Services
  'Abogado/a': '⚖️',
  'Contador/a': '📊',
  'Traductor/a': '🌐',
  'Diseñador gráfico': '🎨',
  'Desarrollador web / apps': '💻',
  'Arquitecto/a': '🏗️',
  'Psicólogo/a': '🧠',
  'Coach ontológico / personal': '🎯',
  'Asesor financiero / inversiones': '💰',
  'Diseñador de interiores': '🏠',
} as const;

// Helper functions
export const getCategoryIcon = (categoryName: string): string => {
  return CATEGORY_ICONS[categoryName as keyof typeof CATEGORY_ICONS] || '🔧';
};

export const getCategoryGroupSlug = (groupName: string): string => {
  return groupName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .trim();
};

export const formatCategoryForDisplay = (category: ServiceCategory) => ({
  ...category,
  displayIcon: getCategoryIcon(category.name),
  groupSlug: category.parent_category ? getCategoryGroupSlug(category.parent_category) : undefined
});