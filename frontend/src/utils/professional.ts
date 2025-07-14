import { ExtendedUser, ProfileCompletion, RankingTier } from '@/types';

// Professional utility functions

export const getSubscriptionBadgeColor = (type: string): string => {
  switch (type) {
    case 'premium':
      return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    case 'basic':
      return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    case 'free':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export const getSubscriptionLabel = (type: string): string => {
  switch (type) {
    case 'premium':
      return 'Premium';
    case 'basic':
      return 'Básico';
    case 'free':
      return 'Gratuito';
    default:
      return 'Sin plan';
  }
};

export const getVerificationStatusColor = (status: string): string => {
  switch (status) {
    case 'verified':
      return 'bg-green-100 text-green-800';
    case 'in_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-gray-100 text-gray-600';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export const getVerificationStatusLabel = (status: string): string => {
  switch (status) {
    case 'verified':
      return 'Verificado';
    case 'in_review':
      return 'En revisión';
    case 'rejected':
      return 'Rechazado';
    case 'pending':
      return 'Pendiente';
    default:
      return 'Sin verificar';
  }
};

export const calculateProfileStrength = (user: ExtendedUser): {
  strength: 'weak' | 'medium' | 'strong' | 'excellent';
  score: number;
  color: string;
} => {
  const score = user.profile_completion_percentage || 0;
  
  if (score >= 90) {
    return { strength: 'excellent', score, color: 'text-green-600' };
  } else if (score >= 70) {
    return { strength: 'strong', score, color: 'text-blue-600' };
  } else if (score >= 50) {
    return { strength: 'medium', score, color: 'text-yellow-600' };
  } else {
    return { strength: 'weak', score, color: 'text-red-600' };
  }
};

export const getProfileStrengthLabel = (strength: string): string => {
  switch (strength) {
    case 'excellent':
      return 'Excelente';
    case 'strong':
      return 'Fuerte';
    case 'medium':
      return 'Medio';
    case 'weak':
      return 'Débil';
    default:
      return 'Sin datos';
  }
};

export const formatExperience = (years: number): string => {
  if (years === 0) return 'Sin experiencia especificada';
  if (years === 1) return '1 año de experiencia';
  return `${years} años de experiencia`;
};

export const getDayOfWeekLabel = (dayOfWeek: number): string => {
  const days = [
    'Domingo',
    'Lunes', 
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado'
  ];
  return days[dayOfWeek] || 'Día inválido';
};

export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime} - ${endTime}`;
};

export const getRankingTierColor = (tier: RankingTier): string => {
  return tier.color;
};

export const getRankingTierIcon = (tier: RankingTier): string => {
  return tier.icon;
};

export const formatRankingScore = (score: number): string => {
  return `${score}/100`;
};

export const getCompletionProgress = (completion: ProfileCompletion): {
  percentage: number;
  status: 'poor' | 'fair' | 'good' | 'excellent';
  color: string;
  message: string;
} => {
  const { percentage } = completion;
  
  if (percentage >= 90) {
    return {
      percentage,
      status: 'excellent',
      color: 'bg-green-500',
      message: '¡Perfil excelente! Tienes todas las características necesarias.'
    };
  } else if (percentage >= 70) {
    return {
      percentage,
      status: 'good',
      color: 'bg-blue-500',
      message: 'Buen perfil. Completa algunos detalles más para mejorar tu visibilidad.'
    };
  } else if (percentage >= 50) {
    return {
      percentage,
      status: 'fair',
      color: 'bg-yellow-500',
      message: 'Perfil regular. Agrega más información para atraer más clientes.'
    };
  } else {
    return {
      percentage,
      status: 'poor',
      color: 'bg-red-500',
      message: 'Perfil incompleto. Completa tu información para recibir más solicitudes.'
    };
  }
};

export const getNextCompletionStep = (completion: ProfileCompletion): string | null => {
  if (completion.pending_steps.length === 0) return null;
  return completion.pending_steps[0];
};

export const formatMobilityStatus = (hasMobility: boolean): string => {
  return hasMobility ? 'Cuenta con movilidad propia' : 'Sin movilidad propia';
};

export const getReportTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'no_show': 'No se presentó',
    'poor_service': 'Servicio deficiente',
    'inappropriate_behavior': 'Comportamiento inapropiado',
    'fake_profile': 'Perfil falso',
    'pricing_issue': 'Problema de precios',
    'other': 'Otro'
  };
  return labels[type] || type;
};

export const getReportStatusColor = (status: string): string => {
  switch (status) {
    case 'resolved':
      return 'bg-green-100 text-green-800';
    case 'investigating':
      return 'bg-yellow-100 text-yellow-800';
    case 'dismissed':
      return 'bg-gray-100 text-gray-600';
    case 'pending':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

export const getReportStatusLabel = (status: string): string => {
  switch (status) {
    case 'resolved':
      return 'Resuelto';
    case 'investigating':
      return 'Investigando';
    case 'dismissed':
      return 'Desestimado';
    case 'pending':
      return 'Pendiente';
    default:
      return status;
  }
};

export const calculateTrustLevel = (verificationScore: number): {
  level: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  label: string;
  color: string;
} => {
  if (verificationScore >= 80) {
    return { level: 'very_high', label: 'Confianza Muy Alta', color: 'text-green-600' };
  } else if (verificationScore >= 60) {
    return { level: 'high', label: 'Confianza Alta', color: 'text-blue-600' };
  } else if (verificationScore >= 40) {
    return { level: 'medium', label: 'Confianza Media', color: 'text-yellow-600' };
  } else if (verificationScore >= 20) {
    return { level: 'low', label: 'Confianza Baja', color: 'text-orange-600' };
  } else {
    return { level: 'very_low', label: 'Confianza Muy Baja', color: 'text-red-600' };
  }
};

export const isSubscriptionActive = (expiresAt?: string): boolean => {
  if (!expiresAt) return false;
  return new Date(expiresAt) > new Date();
};

export const getDaysUntilExpiration = (expiresAt?: string): number | null => {
  if (!expiresAt) return null;
  const now = new Date();
  const expiration = new Date(expiresAt);
  const diffTime = expiration.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const shouldShowSubscriptionWarning = (expiresAt?: string): boolean => {
  const daysLeft = getDaysUntilExpiration(expiresAt);
  return daysLeft !== null && daysLeft <= 7;
};

export const formatSubscriptionExpiration = (expiresAt?: string): string => {
  const daysLeft = getDaysUntilExpiration(expiresAt);
  if (daysLeft === null) return 'Sin fecha de expiración';
  if (daysLeft === 0) return 'Expira hoy';
  if (daysLeft === 1) return 'Expira mañana';
  return `Expira en ${daysLeft} días`;
};