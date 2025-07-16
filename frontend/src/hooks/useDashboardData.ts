import { useState, useEffect } from 'react';
import { dashboardService, landingService, DashboardStats } from '@/services/dashboard';

/**
 * Custom Hook for AS Dashboard Data
 * Handles loading states, error handling, and data fetching
 */
export const useASDashboardData = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getASDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = async () => {
    await fetchStats();
  };

  return { stats, loading, error, refetch };
};

/**
 * Custom Hook for Landing Page Data
 * Manages service categories, professionals, and testimonials
 */
export const useLandingData = () => {
  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLandingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all data in parallel for better performance
        const [categoriesData, professionalsData, testimonialsData] = await Promise.all([
          landingService.getServiceCategories(),
          landingService.getFeaturedProfessionals(),
          landingService.getTestimonials()
        ]);

        setCategories(categoriesData);
        setProfessionals(professionalsData);
        setTestimonials(testimonialsData);
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos');
        console.error('Landing data error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLandingData();
  }, []);

  return { categories, professionals, testimonials, loading, error };
};

/**
 * Custom Hook for Explorador Dashboard Data
 */
export const useExploradorDashboardData = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getExploradorDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar estadísticas');
      console.error('Explorador dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const refetch = async () => {
    await fetchStats();
  };

  return { stats, loading, error, refetch };
};