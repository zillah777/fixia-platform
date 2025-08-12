'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

// Query keys for consistent cache management
export const QUERY_KEYS = {
  // User-related queries
  user: (userId?: number) => ['user', userId],
  userProfile: (userId?: number) => ['user', 'profile', userId],
  
  // Dashboard queries
  dashboardStats: (userType: 'provider' | 'customer', userId?: number) => 
    ['dashboard', 'stats', userType, userId],
  dashboardCritical: (userType: 'provider' | 'customer', userId?: number) => 
    ['dashboard', 'critical', userType, userId],
  dashboardDetailed: (userType: 'provider' | 'customer', userId?: number) => 
    ['dashboard', 'detailed', userType, userId],
  
  // Services queries
  services: (providerId?: number) => ['services', providerId],
  serviceDetails: (serviceId: number) => ['services', 'details', serviceId],
  
  // Marketplace queries  
  marketplace: (filters?: any) => ['marketplace', filters],
  professionals: (filters?: any) => ['professionals', filters],
  
  // Booking queries
  bookings: (userId?: number, type?: 'provider' | 'customer') => 
    ['bookings', userId, type],
  
  // Chat queries
  chats: (userId?: number) => ['chats', userId],
  chatMessages: (chatId: number) => ['chats', 'messages', chatId],
  
  // Reviews queries
  reviews: (userId?: number, type?: 'given' | 'received') => 
    ['reviews', userId, type],
} as const;

// Optimized dashboard data hook with progressive loading
export function useOptimizedDashboardData() {
  const { user } = useAuth();
  const userType = user?.user_type === 'provider' ? 'provider' : 'customer';
  
  // Critical data - loaded immediately
  const criticalQuery = useQuery({
    queryKey: QUERY_KEYS.dashboardCritical(userType, user?.id),
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/${userType}/critical`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch critical dashboard data');
      return response.json();
    },
    enabled: !!user?.id,
    staleTime: 1000 * 30, // 30 seconds for critical data
  });

  // Detailed data - loaded with slight delay for progressive enhancement
  const detailedQuery = useQuery({
    queryKey: QUERY_KEYS.dashboardDetailed(userType, user?.id),
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/${userType}/detailed`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch detailed dashboard data');
      return response.json();
    },
    enabled: !!user?.id && criticalQuery.isSuccess,
    staleTime: 1000 * 60 * 2, // 2 minutes for detailed data
  });

  return {
    // Critical data
    critical: criticalQuery.data,
    criticalLoading: criticalQuery.isLoading,
    criticalError: criticalQuery.error,
    
    // Detailed data
    detailed: detailedQuery.data,
    detailedLoading: detailedQuery.isLoading,
    detailedError: detailedQuery.error,
    
    // Combined loading states
    isInitialLoading: criticalQuery.isLoading,
    isFullyLoaded: criticalQuery.isSuccess && detailedQuery.isSuccess,
    
    // Refetch functions
    refetchCritical: criticalQuery.refetch,
    refetchDetailed: detailedQuery.refetch,
    refetchAll: () => {
      criticalQuery.refetch();
      detailedQuery.refetch();
    },
  };
}

// Optimized services hook with caching
export function useOptimizedServices(providerId?: number) {
  const { user } = useAuth();
  const effectiveProviderId = providerId || user?.id;
  
  return useQuery({
    queryKey: QUERY_KEYS.services(effectiveProviderId),
    queryFn: async () => {
      const response = await fetch(`/api/services?provider_id=${effectiveProviderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch services');
      return response.json();
    },
    enabled: !!effectiveProviderId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Optimized marketplace search with debounced queries
export function useOptimizedMarketplace(filters: any = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.marketplace(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
      
      const response = await fetch(`/api/marketplace?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch marketplace data');
      return response.json();
    },
    staleTime: 1000 * 60 * 3, // 3 minutes for marketplace data
    enabled: Object.keys(filters).length > 0 || !filters.search, // Always enabled unless waiting for search
  });
}

// Mutation hooks for common operations
export function useServiceMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (serviceData: any) => {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(serviceData),
      });
      if (!response.ok) throw new Error('Failed to create service');
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch services
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.services(user?.id) 
      });
      // Update dashboard data
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.dashboardCritical('provider', user?.id) 
      });
    },
  });
}

// Hook for updating user profile with optimistic updates
export function useProfileMutation() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (profileData: any) => {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(profileData),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      return response.json();
    },
    // Optimistic update
    onMutate: async (newProfile) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: QUERY_KEYS.userProfile(user?.id) 
      });

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData(
        QUERY_KEYS.userProfile(user?.id)
      );

      // Optimistically update to new value
      queryClient.setQueryData(
        QUERY_KEYS.userProfile(user?.id), 
        (old: any) => ({ ...old, ...newProfile })
      );

      // Return context object with snapshot
      return { previousProfile };
    },
    onError: (err, newProfile, context) => {
      // Revert on error
      if (context?.previousProfile) {
        queryClient.setQueryData(
          QUERY_KEYS.userProfile(user?.id),
          context.previousProfile
        );
      }
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ 
        queryKey: QUERY_KEYS.userProfile(user?.id) 
      });
    },
  });
}