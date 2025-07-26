/**
 * Homepage Data - Centralized data management for homepage content
 * @fileoverview Contains all static data for the homepage to improve maintainability
 */
import {
  WrenchScrewdriverIcon,
  BoltIcon,
  SparklesIcon,
  CogIcon,
  FaceSmileIcon,
  PuzzlePieceIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  TrophyIcon,
  EyeIcon,
  HandRaisedIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export const SERVICE_CATEGORIES = [
  { 
    id: 'plomeria', 
    name: 'Plomería', 
    icon: WrenchScrewdriverIcon, 
    description: 'Reparaciones e instalaciones profesionales',
    bgColor: 'bg-primary-500',
    hoverColor: 'hover:bg-primary-600'
  },
  { 
    id: 'electricidad', 
    name: 'Electricidad', 
    icon: BoltIcon, 
    description: 'Instalaciones eléctricas certificadas',
    bgColor: 'bg-secondary-500',
    hoverColor: 'hover:bg-secondary-600'
  },
  { 
    id: 'limpieza', 
    name: 'Limpieza', 
    icon: SparklesIcon, 
    description: 'Servicios de limpieza especializados',
    bgColor: 'bg-success-500',
    hoverColor: 'hover:bg-success-600'
  },
  { 
    id: 'reparaciones', 
    name: 'Reparaciones', 
    icon: CogIcon, 
    description: 'Reparaciones y mantenimiento integral',
    bgColor: 'bg-info-500',
    hoverColor: 'hover:bg-info-600'
  },
  { 
    id: 'belleza', 
    name: 'Belleza', 
    icon: FaceSmileIcon, 
    description: 'Servicios de belleza y bienestar',
    bgColor: 'bg-warning-500',
    hoverColor: 'hover:bg-warning-600'
  },
  { 
    id: 'otros', 
    name: 'Otros', 
    icon: PuzzlePieceIcon, 
    description: 'Servicios especializados diversos',
    bgColor: 'bg-neutral-600',
    hoverColor: 'hover:bg-neutral-700'
  }
] as const;

export const TRUST_FEATURES = [
  {
    id: 'smart-matching',
    title: 'Matching Inteligente',
    description: 'Algoritmos avanzados que conectan tus necesidades específicas con el profesional perfecto',
    icon: CpuChipIcon,
    gradient: 'from-primary-500 to-primary-600',
    color: 'primary'
  },
  {
    id: 'verified-trust',
    title: '100% Verificado',
    description: 'Todos los profesionales pasan por un riguroso proceso de verificación y validación',
    icon: ShieldCheckIcon,
    gradient: 'from-success-500 to-success-600',
    color: 'success'
  },
  {
    id: 'guaranteed-quality',
    title: 'Calidad Garantizada',
    description: '98% de satisfacción del cliente con garantía de calidad en cada servicio',
    icon: TrophyIcon,
    gradient: 'from-secondary-500 to-secondary-600',
    color: 'secondary'
  }
] as const;

export const HOW_IT_WORKS_STEPS = [
  {
    id: 'discovery',
    title: 'Descubrimiento Inteligente',
    description: 'Nuestra tecnología comprende tu visión y localiza especialistas que no solo ejecutan, sino que elevan tu proyecto.',
    icon: EyeIcon
  },
  {
    id: 'connection',
    title: 'Conexión Estratégica',
    description: 'Más que una coincidencia: una alianza estratégica entre tu necesidad y el talento excepcional que la materializa.',
    icon: HandRaisedIcon
  },
  {
    id: 'excellence',
    title: 'Garantía de Excelencia',
    description: 'Un ecosistema de confianza que asegura resultados superiores y relaciones duraderas.',
    icon: CheckCircleIcon
  }
] as const;

export const FEATURED_PROFESSIONALS = [
  {
    id: 1,
    name: 'Carlos Rodríguez',
    profession: 'Plomero Certificado',
    rating: 4.9,
    reviews: 127,
    image: undefined,
    services: ['Plomería', 'Instalaciones'],
    location: 'Zona Centro'
  },
  {
    id: 2,
    name: 'Ana Martínez',
    profession: 'Electricista',
    rating: 4.8,
    reviews: 89,
    image: undefined,
    services: ['Electricidad', 'Instalaciones'],
    location: 'Zona Norte'
  },
  {
    id: 3,
    name: 'Roberto Silva',
    profession: 'Técnico Reparaciones',
    rating: 4.7,
    reviews: 156,
    image: undefined,
    services: ['Reparaciones', 'Mantenimiento'],
    location: 'Zona Sur'
  }
] as const;

export const TESTIMONIALS = [
  {
    id: 1,
    name: 'María González',
    rating: 5,
    comment: 'Excelente servicio, muy profesional y resolvió mi problema de plomería rápidamente.',
    service: 'Reparación de Plomería',
    date: '2024-01-15'
  },
  {
    id: 2,
    name: 'Juan López',
    rating: 5,
    comment: 'Encontré al electricista perfecto para mi hogar. Trabajo de calidad y precio justo.',
    service: 'Instalación Eléctrica',
    date: '2024-01-12'
  },
  {
    id: 3,
    name: 'Laura Fernández',
    rating: 4,
    comment: 'Muy buena experiencia usando Fixia. La plataforma es fácil de usar.',
    service: 'Limpieza de Hogar',
    date: '2024-01-10'
  }
] as const;

export const PLATFORM_STATS = [
  {
    id: 'specialists',
    value: '500+',
    label: 'Especialistas de Elite'
  },
  {
    id: 'projects',
    value: '2,000+',
    label: 'Proyectos Transformados'
  },
  {
    id: 'rating',
    value: '4.8',
    label: 'Calificación Promedio'
  },
  {
    id: 'excellence',
    value: '98%',
    label: 'Resultados Excepcionales'
  }
] as const;

export const STRUCTURED_DATA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Fx Fixia",
  "description": "Marketplace de servicios profesionales en Argentina",
  "url": "https://fixia.com.ar",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://fixia.com.ar/explorador/buscar-servicio?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
};