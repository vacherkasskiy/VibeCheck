export type AchievementStatus = 'Completed' | 'InProgress' | 'NotStarted';

export interface ProgressDto {
  current: number;
  target: number;
}

export interface ProgressIntDto {
  current: number;
  target: number;
}

export interface MyAchievementItemDto {
  achievementId: string;
  name: string | null;
  description: string | null;
  iconUrl: string | null;
  status: AchievementStatus;
  progress: ProgressDto;
  obtainedAt: string | null;
}

export interface GetMyAchievementsGatewayResponse {
  totalCount: number;
  achievements: MyAchievementItemDto[] | null;
}

export interface GetLevelGatewayResponse {
  currentLevel: number;
  progress: ProgressIntDto;
}

export interface MeResponse {
  isAuthenticated: boolean;
  subject: string | null;
  userId: string | null;
}

export interface IssueTokenResponse {
  accessToken: string | null;
  tokenType: string | null;
  expiresAtUtc: string;
}

// Filter for my achievements
export type MyAchievementsFilterStatus = 'All' | 'Completed' | 'Uncompleted';
