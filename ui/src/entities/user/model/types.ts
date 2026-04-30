export type UserId = string;

export interface User {
  id: UserId;
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
  createdAt?: string;
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

export type Sex = 'SEX_MALE' | 'SEX_FEMALE' | 'SEX_OTHER';

export type EducationLevel =
  | 'EDUCATION_LEVEL_NONE'
  | 'EDUCATION_LEVEL_PRIMARY'
  | 'EDUCATION_LEVEL_BASIC'
  | 'EDUCATION_LEVEL_SECONDARY'
  | 'EDUCATION_LEVEL_SECONDARY_PROFESSIONAL'
  | 'EDUCATION_LEVEL_INCOMPLETE_HIGHER'
  | 'EDUCATION_LEVEL_BACHELOR'
  | 'EDUCATION_LEVEL_SPECIALIST'
  | 'EDUCATION_LEVEL_MASTER'
  | 'EDUCATION_LEVEL_POSTGRADUATE'
  | 'EDUCATION_LEVEL_DOCTORATE'
  | 'EDUCATION_LEVEL_RESIDENCY'
  | 'EDUCATION_LEVEL_ADJUNCTURE';

export type Specialization =
  | 'SPECIALTY_IT'
  | 'SPECIALTY_DESIGN'
  | 'SPECIALTY_MARKETING'
  | 'SPECIALTY_FINANCE'
  | 'SPECIALTY_HR'
  | 'SPECIALTY_SALES'
  | 'SPECIALTY_LOGISTICS'
  | 'SPECIALTY_LAW'
  | 'SPECIALTY_EDUCATION'
  | 'SPECIALTY_MEDICINE'
  | 'SPECIALTY_CONSTRUCTION'
  | 'SPECIALTY_ENGINEERING'
  | 'SPECIALTY_ART'
  | 'SPECIALTY_TOURISM'
  | 'SPECIALTY_MEDIA'
  | 'SPECIALTY_ANALYTICS'
  | 'SPECIALTY_PROJECT_MANAGEMENT'
  | 'SPECIALTY_SPORT'
  | 'SPECIALTY_OTHER';

export interface WorkExperienceDto {
  specialization: Specialization;
  startedAt: string;
  finishedAt: string | null;
}

export interface CreateOrUpdateUserInfoDto {
  name: string;
  iconId: string;
  sex: Sex;
  birthday: string;
  education: EducationLevel;
  specialization: Specialization;
  workExperience?: WorkExperienceDto[];
}

export interface UserInfoDto extends CreateOrUpdateUserInfoDto {
  email: string;
  workExperience: WorkExperienceDto[];
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
  companyName?: string | null;
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
  authorId?: string | null;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  companyId: string;
  companyName: string;
  text: string;
  createdAt: string;
  flags: string[];
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

export interface SubscriptionUserProfileDto {
  userId: string;
  name?: string | null;
  iconId?: string | null;
}

export interface SubscriptionStatusDto {
  authorId: string;
  subscriberId: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type ReportReasonType =
  | 'SPAM_OR_ADVERTISEMENT'
  | 'FRAUD_OR_EXTORTION'
  | 'HARASSMENT_OR_INSULT'
  | 'HATE_SPEECH'
  | 'THREAT_OR_VIOLENCE'
  | 'PERSONAL_DATA'
  | 'MISLEADING_INFORMATION'
  | 'OFF_TOPIC_OR_LOW_QUALITY'
  | 'OTHER';

export interface CreateUserReportDto {
  reportId: string;
  reasonType: ReportReasonType;
  reasonText: string;
}

export interface OnboardingStepDto {
  currentStep: string;
}

export interface UserProfileData {
  user: User;
  flags: UserFlags;
  achievements: Achievement[];
  reviews: UserReview[];
  activity: ActivityItem[];
  subscriptions: Subscription[];
}
