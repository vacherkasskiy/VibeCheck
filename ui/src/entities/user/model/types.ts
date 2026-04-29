export interface User {
  id: string;
  nickname: string;
  email: string;
  avatarUrl?: string | null;
  level: number;
  levelLabel: string;
  levelProgress: number;
  levelProgressCurrent?: number;
  levelProgressTarget?: number;
  education: string;
  experience: string;
  expertise: string;
}

export interface UserFlag {
  id: string;
  name: string;
  priority: number;
}

export interface UserFlags {
  green: UserFlag[];
  red: UserFlag[];
}

export interface AvatarDto {
  iconId: string;
  link: string;
}

export interface SetUserFlagsRequest {
  greenFlags: Array<{
    weight: 1 | 2 | 3;
    flags: string[];
  }>;
  redFlags: Array<{
    weight: 1 | 2 | 3;
    flags: string[];
  }>;
}

export interface Flag {
  id: string;
  name: string;
  category?: string;
  description?: string;
}

export interface FlagGroup {
  weight: 1 | 2 | 3;
  flags: string[] | null;
}

export type FlagsResponse = {
  greenFlags: FlagGroup[] | null;
  redFlags: FlagGroup[] | null;
};

export interface UserReviewItemDto {
  reviewId: string;
  authorId?: string | null;
  iconId: string | null;
  companyId?: string | null;
  text: string | null;
  score: number;
  createdAt: string;
  flags: Array<{
    id: string;
    name: string | null;
  }> | null;
}

export interface GetUserReviewsResponse {
  totalCount: number;
  reviews: UserReviewItemDto[] | null;
}

export interface Achievement {
  type: string;
  earnedAt: string | number | Date;
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt: string;
  color: string;
  status?: 'Completed' | 'InProgress' | 'NotStarted';
  progressCurrent?: number;
  progressTarget?: number;
}

export interface UserReview {
  id: string;
  companyId: string;
  companyName: string;
  text: string;
  createdAt: string;
  greenFlags: string[];
  redFlags: string[];
  reactions: {
    likes: number;
    dislikes: number;
    complaints: number;
  };
}

export interface ActivityItem {
  id: string;
  type: 'achievement_unlocked' | 'review_posted' | 'flag_updated' | 'subscription';
  userId: string;
  userNickname: string;
  userAvatarUrl?: string | null;
  description: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface Subscription {
  id: string;
  userId: string;
  nickname: string;
  avatarUrl?: string | null;
  subscribedAt: string;
}

export interface UserProfileData {
  user: User;
  flags: UserFlags;
  achievements: Achievement[];
  reviews: UserReview[];
  activity: ActivityItem[];
  subscriptions: Subscription[];
}
