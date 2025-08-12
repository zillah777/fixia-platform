import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardService, landingService, DashboardStats, ServiceCategory, FeaturedProfessional, Testimonial } from '@/services/dashboard';
import { QUERY_KEYS } from './useOptimizedQueries';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Custom Hook for AS Dashboard Data with React Query Optimization
 * Handles loading states, error handling, and intelligent caching
 */
export const useASDashboardData = () => {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: QUERY_KEYS.dashboardStats('provider', user?.id),
    queryFn: async () => {
      const data = await dashboardService.getASDashboardStats();
      return data;
    },
    enabled: !!user?.id && user.user_type === 'provider',
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  return { 
    stats: query.data, 
    loading: query.isLoading, 
    error: query.error?.message || null, 
    refetch: query.refetch 
  };
};

/**
 * Custom Hook for Landing Page Data with React Query Optimization
 * Manages service categories, professionals, and testimonials with intelligent caching
 */
export const useLandingData = () => {
  // Categories query with longer cache time (categories change infrequently)
  const categoriesQuery = useQuery({
    queryKey: ['landing', 'categories'],
    queryFn: () => landingService.getServiceCategories(),
    staleTime: 1000 * 60 * 15, // 15 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  });

  // Professionals query with medium cache time
  const professionalsQuery = useQuery({
    queryKey: ['landing', 'professionals'],
    queryFn: () => landingService.getFeaturedProfessionals(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });

  // Testimonials query with longer cache time (testimonials change infrequently)
  const testimonialsQuery = useQuery({
    queryKey: ['landing', 'testimonials'],
    queryFn: () => landingService.getTestimonials(),
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Combine loading states for progressive loading
  const isInitialLoading = categoriesQuery.isLoading || professionalsQuery.isLoading;
  const isFullyLoaded = categoriesQuery.isSuccess && professionalsQuery.isSuccess && testimonialsQuery.isSuccess;

  // Combine errors
  const error = categoriesQuery.error?.message || 
                professionalsQuery.error?.message || 
                testimonialsQuery.error?.message || 
                null;

  return { 
    categories: categoriesQuery.data || [], 
    professionals: professionalsQuery.data || [], 
    testimonials: testimonialsQuery.data || [], 
    loading: isInitialLoading,
    testimonialsLoading: testimonialsQuery.isLoading,
    isFullyLoaded,
    error,
    refetch: () => {
      categoriesQuery.refetch();
      professionalsQuery.refetch(); 
      testimonialsQuery.refetch();
    }
  };
};

// Type for Explorador Dashboard Data
interface ExploradorDashboardData {
  stats: {
    activeBookings: number;
    completedBookings: number;
    totalSpent: number;
    favoriteServices: number;
    unreadMessages: number;
  };
  recentActivity: any[];
}

/**
 * Custom Hook for Explorador Dashboard Data with React Query Optimization
 */
export const useExploradorDashboardData = () => {
  const { user } = useAuth();
  
  const query = useQuery({
    queryKey: QUERY_KEYS.dashboardStats('customer', user?.id),
    queryFn: async () => {
      const data = await dashboardService.getExploradorDashboardStats();
      return data;
    },
    enabled: !!user?.id && user.user_type === 'customer',
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: true,
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
  });

  return { 
    stats: query.data, 
    loading: query.isLoading, 
    error: query.error?.message || null, 
    refetch: query.refetch 
  };
};