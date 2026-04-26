export interface User {
  id: string;
  nickname: string;
  email: string;
  avatarUrl?: string | null;
  level: number;
  levelLabel: string;
  levelProgress: number; // 0-100
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

export interface SaveUserFlagsRequest {
  greenFlags: Array<{
    priority: number;
    flags: string[];
  }>;
  redFlags: Array<{
    priority: number;
    flags: string[];
  }>;
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

