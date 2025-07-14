export interface Badge {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  category: 'verification' | 'experience' | 'performance' | 'milestone' | 'special';
  criteria: {
    type: string;
    value?: any;
    [key: string]: any;
  };
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserBadge extends Badge {
  earned_at: string;
  is_visible: boolean;
  progress_data?: any;
}

export interface BadgeProgress extends Badge {
  current_progress: number;
  target_progress: number;
  progress_data?: any;
  last_updated: string;
  is_earned: boolean;
  progress_percentage: number;
}

export interface BadgeCategory {
  value: string;
  label: string;
  description: string;
  icon: string;
}

export interface BadgesApiResponse {
  success: boolean;
  message: string;
  data: {
    badges?: Badge[] | Record<string, Badge[]>;
    progress?: Record<string, BadgeProgress[]>;
    summary?: {
      total_badges: number;
      earned_badges: number;
      in_progress: number;
    };
    new_badges?: Badge[];
    count?: number;
    total?: number;
  };
}