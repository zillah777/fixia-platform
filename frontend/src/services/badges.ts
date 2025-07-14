import api from './api';
import { Badge, UserBadge, BadgeProgress, BadgeCategory, BadgesApiResponse } from '../types/badges';

export const badgesService = {
  // Get all available badges
  async getAvailableBadges(category?: string): Promise<Record<string, Badge[]>> {
    const params = category ? { category } : {};
    const response = await api.get<BadgesApiResponse>('/badges/available', { params });
    return response.data.data.badges as Record<string, Badge[]>;
  },

  // Get current user's badges
  async getMyBadges(): Promise<UserBadge[]> {
    const response = await api.get<BadgesApiResponse>('/badges/my-badges');
    return response.data.data.badges as UserBadge[];
  },

  // Get badge progress for current user
  async getBadgeProgress(): Promise<{
    progress: Record<string, BadgeProgress[]>;
    summary: {
      total_badges: number;
      earned_badges: number;
      in_progress: number;
    };
  }> {
    const response = await api.get<BadgesApiResponse>('/badges/progress');
    return {
      progress: response.data.data.progress as Record<string, BadgeProgress[]>,
      summary: response.data.data.summary!
    };
  },

  // Get badges for a specific user (public)
  async getUserBadges(userId: number): Promise<Record<string, Badge[]>> {
    const response = await api.get<BadgesApiResponse>(`/badges/user/${userId}`);
    return response.data.data.badges as Record<string, Badge[]>;
  },

  // Check and award eligible badges
  async checkEligibility(): Promise<Badge[]> {
    const response = await api.post<BadgesApiResponse>('/badges/check-eligibility');
    return response.data.data.new_badges || [];
  },

  // Toggle badge visibility
  async updateBadgeVisibility(badgeId: number, isVisible: boolean): Promise<void> {
    await api.put(`/badges/${badgeId}/visibility`, { is_visible: isVisible });
  },

  // Get badge categories
  async getCategories(): Promise<BadgeCategory[]> {
    const response = await api.get<{ data: BadgeCategory[] }>('/badges/categories');
    return response.data.data;
  }
};

export default badgesService;