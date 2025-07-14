import api from './api';
import { 
  ApiResponse, 
  PaginatedResponse,
  TopProfessional,
  TrendingProfessional,
  UserRanking,
  RankingTier
} from '@/types';

export const rankingService = {
  // Get top professionals
  async getTopProfessionals(params?: {
    category?: string;
    location?: string;
    limit?: number;
    subscription_only?: boolean;
  }): Promise<{
    professionals: TopProfessional[];
    filters: {
      category?: string;
      location?: string;
      subscription_only?: boolean;
    };
  }> {
    const searchParams = new URLSearchParams();
    
    if (params?.category) searchParams.append('category', params.category);
    if (params?.location) searchParams.append('location', params.location);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.subscription_only) searchParams.append('subscription_only', params.subscription_only.toString());

    const response = await api.get<ApiResponse<{
      professionals: TopProfessional[];
      filters: {
        category?: string;
        location?: string;
        subscription_only?: boolean;
      };
    }>>(`/api/ranking/top-professionals?${searchParams.toString()}`);
    return response.data.data;
  },

  // Get my ranking
  async getMyRanking(): Promise<UserRanking> {
    const response = await api.get<ApiResponse<UserRanking>>('/api/ranking/my-ranking');
    return response.data.data;
  },

  // Get leaderboard
  async getLeaderboard(params?: {
    category?: string;
    city?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    leaderboard: TopProfessional[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    filters: {
      category?: string;
      city?: string;
    };
  }> {
    const searchParams = new URLSearchParams();
    
    if (params?.category) searchParams.append('category', params.category);
    if (params?.city) searchParams.append('city', params.city);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await api.get<ApiResponse<{
      leaderboard: TopProfessional[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
      filters: {
        category?: string;
        city?: string;
      };
    }>>(`/api/ranking/leaderboard?${searchParams.toString()}`);
    return response.data.data;
  },

  // Recalculate ranking
  async recalculateRanking(): Promise<{
    new_score: number;
    tier: RankingTier;
  }> {
    const response = await api.post<ApiResponse<{
      new_score: number;
      tier: RankingTier;
    }>>('/api/ranking/recalculate');
    return response.data.data;
  },

  // Get trending professionals
  async getTrendingProfessionals(params?: {
    category?: string;
    limit?: number;
  }): Promise<{
    trending_professionals: TrendingProfessional[];
    filter: {
      category?: string;
    };
  }> {
    const searchParams = new URLSearchParams();
    
    if (params?.category) searchParams.append('category', params.category);
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const response = await api.get<ApiResponse<{
      trending_professionals: TrendingProfessional[];
      filter: {
        category?: string;
      };
    }>>(`/api/ranking/trending?${searchParams.toString()}`);
    return response.data.data;
  },

  // Get ranking statistics
  async getStatistics(): Promise<{
    overview: {
      total_professionals: number;
      average_score: string;
      elite_count: number;
      expert_count: number;
      professional_count: number;
      premium_count: number;
      verified_count: number;
    };
    tier_distribution: {
      elite: number;
      expert: number;
      professional: number;
      starter: number;
    };
    category_breakdown: Array<{
      category: string;
      professional_count: number;
      average_score: string;
    }>;
    city_breakdown: Array<{
      city: string;
      professional_count: number;
      average_score: string;
    }>;
  }> {
    const response = await api.get<ApiResponse<{
      overview: {
        total_professionals: number;
        average_score: string;
        elite_count: number;
        expert_count: number;
        professional_count: number;
        premium_count: number;
        verified_count: number;
      };
      tier_distribution: {
        elite: number;
        expert: number;
        professional: number;
        starter: number;
      };
      category_breakdown: Array<{
        category: string;
        professional_count: number;
        average_score: string;
      }>;
      city_breakdown: Array<{
        city: string;
        professional_count: number;
        average_score: string;
      }>;
    }>>('/api/ranking/statistics');
    return response.data.data;
  },
};