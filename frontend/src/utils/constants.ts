import { Category } from '@/types';

// Service Categories
export const SERVICE_CATEGORIES: Category[] = [
  { id: 1, name: 'Plomería', description: 'Servicios de plomería', is_active: true, created_at: '' },
  { id: 2, name: 'Electricidad', description: 'Servicios eléctricos', is_active: true, created_at: '' },
  { id: 3, name: 'Limpieza', description: 'Servicios de limpieza', is_active: true, created_at: '' },
  { id: 4, name: 'Reparaciones', description: 'Servicios de reparación', is_active: true, created_at: '' },
  { id: 5, name: 'Belleza', description: 'Servicios de belleza', is_active: true, created_at: '' },
  { id: 6, name: 'Otros', description: 'Otros servicios', is_active: true, created_at: '' },
];

// Booking Status
export const BOOKING_STATUS_LABELS = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  in_progress: 'En progreso',
  completed: 'Completada',
  cancelled: 'Cancelada',
};

export const BOOKING_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Payment Status
export const PAYMENT_STATUS_LABELS = {
  pending: 'Pendiente',
  paid: 'Pagado',
  failed: 'Falló',
  refunded: 'Reembolsado',
};

export const PAYMENT_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800',
};

// User Types - Unified terminology
export const USER_TYPE_LABELS = {
  customer: 'Explorador',
  provider: 'AS (Agente de Servicio)',
  client: 'Explorador', // Legacy support
  professional: 'AS (Agente de Servicio)', // Legacy support
} as const;

// User Type Navigation Labels
export const USER_TYPE_NAV_LABELS = {
  customer: 'Explorador',
  provider: 'Profesional',
} as const;

// User Type Paths - Unified routing system
export const USER_TYPE_PATHS = {
  customer: {
    dashboard: '/explorador/dashboard',
    profile: '/explorador/perfil',
    chats: '/explorador/chats',
    marketplace: '/explorador/marketplace',
    settings: '/explorador/cambiar-password',
  },
  provider: {
    dashboard: '/as/dashboard',
    profile: '/as/perfil', 
    chats: '/as/chats',
    services: '/as/servicios',
    portfolio: '/as/portafolio',
    settings: '/as/configuracion',
  },
} as const;

// Navigation Items - Dynamic per user type
export const NAVIGATION_ITEMS = {
  customer: [
    {
      key: 'dashboard',
      label: 'Inicio',
      icon: 'Home',
      path: '/explorador/dashboard',
      description: 'Tu panel principal para buscar profesionales',
    },
    {
      key: 'marketplace',
      label: 'Encontrar Profesional',
      icon: 'Search',
      path: '/explorador/marketplace',
      description: 'Encuentra profesionales verificados para tu proyecto',
    },
    {
      key: 'chats',
      label: 'Mensajes',
      icon: 'MessageSquare',
      path: '/explorador/chats',
      description: 'Conversaciones con profesionales',
    },
  ],
  provider: [
    {
      key: 'dashboard',
      label: 'Inicio',
      icon: 'Home', 
      path: '/as/dashboard',
      description: 'Tu panel principal con resumen de trabajos y solicitudes',
    },
    {
      key: 'services',
      label: 'Mis Trabajos',
      icon: 'Briefcase',
      path: '/as/servicios',
      description: 'Agrega, edita y gestiona los trabajos que ofreces',
    },
    {
      key: 'portfolio',
      label: 'Mis Fotos',
      icon: 'Images',
      path: '/as/portafolio',
      description: 'Sube fotos de trabajos que hayas hecho para mostrar tu calidad',
    },
    {
      key: 'chats',
      label: 'Mensajes',
      icon: 'MessageSquare',
      path: '/as/chats',
      description: 'Conversaciones con exploradores',
    },
  ],
  common: [
    {
      key: 'plans',
      label: 'Mejorar Cuenta',
      icon: 'Crown',
      path: '/planes',
      description: 'Mejora tu cuenta para más beneficios',
      badge: 'Nuevo',
    },
  ],
} as const;

// Notification Types
export const NOTIFICATION_TYPE_LABELS = {
  booking: 'Reserva',
  payment: 'Pago',
  review: 'Reseña',
  chat: 'Mensaje',
  system: 'Sistema',
};

// Time slots for bookings
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00'
];

// Rating options
export const RATING_OPTIONS = [
  { value: 1, label: '1 estrella - Muy malo' },
  { value: 2, label: '2 estrellas - Malo' },
  { value: 3, label: '3 estrellas - Regular' },
  { value: 4, label: '4 estrellas - Bueno' },
  { value: 5, label: '5 estrellas - Excelente' },
];

// Duration options (in minutes)
export const DURATION_OPTIONS = [
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 90, label: '1.5 horas' },
  { value: 120, label: '2 horas' },
  { value: 180, label: '3 horas' },
  { value: 240, label: '4 horas' },
  { value: 300, label: '5 horas' },
  { value: 360, label: '6 horas' },
  { value: 480, label: '8 horas' },
];

// Price ranges
export const PRICE_RANGES = [
  { label: 'Menos de $5,000', min: 0, max: 5000 },
  { label: '$5,000 - $10,000', min: 5000, max: 10000 },
  { label: '$10,000 - $20,000', min: 10000, max: 20000 },
  { label: '$20,000 - $50,000', min: 20000, max: 50000 },
  { label: 'Más de $50,000', min: 50000, max: null },
];

// Distance options (in kilometers)
export const DISTANCE_OPTIONS = [
  { value: 5, label: '5 km' },
  { value: 10, label: '10 km' },
  { value: 20, label: '20 km' },
  { value: 50, label: '50 km' },
  { value: 100, label: '100 km' },
];

// App Configuration
export const APP_CONFIG = {
  name: 'Fixia',
  description: 'Plataforma de servicios profesionales en Chubut',
  url: process.env['NEXT_PUBLIC_APP_URL'] || 'http://localhost:3000',
  api_url: process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:5000',
  google_maps_api_key: process.env['NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'],
  mercadopago_public_key: process.env['NEXT_PUBLIC_MP_PUBLIC_KEY'],
  fcm_vapid_key: process.env['NEXT_PUBLIC_FCM_VAPID_KEY'],
};

// Default coordinates (Rawson, Chubut)
export const DEFAULT_COORDINATES = {
  lat: -43.300389,
  lng: -65.102222,
};

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 50;

// File upload limits
export const FILE_UPLOAD_LIMITS = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  maxFiles: 5,
};

// Phone regex for Argentina
export const PHONE_REGEX = /^(\+54|0)?[1-9]\d{8,9}$/;

// Email regex
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;