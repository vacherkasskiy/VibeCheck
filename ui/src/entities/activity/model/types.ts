export interface UserProfileDto {
  userId?: string;
  name?: string;
  iconId?: string;
}

export type PayloadType = 
  | 'REVIEW_WRITTEN'
  | 'REVIEW_LIKED'
  | 'ACHIEVEMENT_UNLOCKED'
  | 'USER_FOLLOWED'
  | 'LEVEL_UP';

export interface ReviewWrittenInfoDto {
  type: 'REVIEW_WRITTEN';
  reviewId?: string;
  companyId?: string;
  companyName?: string;
}

export interface ReviewLikedInfoDto {
  type: 'REVIEW_LIKED';
  reviewId?: string;
  reviewAuthorId?: string;
  companyId?: string;
  companyName?: string;
}

export interface AchievementGrantedInfoDto {
  type: 'ACHIEVEMENT_UNLOCKED';
  achievementId?: string;
  displayName?: string;
}

export interface UserFollowedInfoDto {
  type: 'USER_FOLLOWED';
  userId?: string;
  displayName?: string;
}

export interface UserLevelUpInfoDto {
  type: 'LEVEL_UP';
  newLevel?: number;
}

export type Payload = 
  | ReviewWrittenInfoDto
  | ReviewLikedInfoDto
  | AchievementGrantedInfoDto
  | UserFollowedInfoDto
  | UserLevelUpInfoDto;

export interface UserFeedDto {
  activityId?: string;
  actor?: UserProfileDto;
  createdAt?: string;
  payload?: Payload;
}

export interface FeedPageDto {
  totalCount?: number;
  activities?: UserFeedDto[];
}

// Type guard
export const isReviewWritten = (payload: Payload): payload is ReviewWrittenInfoDto => payload.type === 'REVIEW_WRITTEN';
export const isReviewLiked = (payload: Payload): payload is ReviewLikedInfoDto => payload.type === 'REVIEW_LIKED';
export const isAchievementGranted = (payload: Payload): payload is AchievementGrantedInfoDto => payload.type === 'ACHIEVEMENT_UNLOCKED';
export const isUserFollowed = (payload: Payload): payload is UserFollowedInfoDto => payload.type === 'USER_FOLLOWED';
export const isUserLevelUp = (payload: Payload): payload is UserLevelUpInfoDto => payload.type === 'LEVEL_UP';
