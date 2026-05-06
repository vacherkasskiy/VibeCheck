import { gamificationApi } from 'entities/gamification';
import http from 'shared/api/http';
import type { FeedPageDto } from 'entities/activity/model/types';

import type { 
  User, 
  AvatarDto,
  UserFlags, 
  FlagsResponse,
  SetUserFlagsRequest,
  Achievement, 
  UserReview, 
  GetUserReviewsResponse,
  UserReviewItemDto,
  Subscription, 
  CreateOrUpdateUserInfoDto,
  CreateUserReportDto,
  OnboardingStepDto,
  SubscriptionStatusDto,
  SubscriptionUserProfileDto,
  UserProfileData 
} from './types';
import type { GetLevelGatewayResponse, MyAchievementItemDto, UserAchievementItemDto } from 'entities/gamification';

type AvatarOption = { id: string; url: string };

const DEFAULT_AVATAR_URL = '/assets/avatars/avatar1.png';

const AVATAR_ID_TO_LOCAL_URL: Record<string, string> = {
  '1': '/assets/avatars/avatar1.png',
  '2': '/assets/avatars/avatar2.png',
  '3': '/assets/avatars/avatar3.png',
  '4': '/assets/avatars/avatar4.png',
  '5': '/assets/avatars/avatar5.png',
  '6': '/assets/avatars/avatar6.png',
  'viktor-avatar.png': '/assets/avatars/avatar1.png',
  'cat-avatar.png': '/assets/avatars/avatar2.png',
  'fox-avatar.png': '/assets/avatars/avatar3.png',
  'rabbit-avatar.png': '/assets/avatars/avatar4.png',
  'dog-avatar.png': '/assets/avatars/avatar5.png',
  'hedgehog-avatar.png': '/assets/avatars/avatar6.png',
  'panda-avatar.png': '/assets/avatars/avatar2.png',
  'turtle-avatar.png': '/assets/avatars/avatar3.png',
  'wolf-avatar.png': '/assets/avatars/avatar4.png',
};

const AVATARS: AvatarOption[] = Object.entries(AVATAR_ID_TO_LOCAL_URL).map(([id, url]) => ({
  id,
  url,
}));

const MOCK_ACHIEVEMENTS: Achievement[] = [];

const MOCK_LEVEL: GetLevelGatewayResponse = {
  currentLevel: 1,
  progress: {
    current: 0,
    target: 1,
  },
};

const EMPTY_FLAGS: UserFlags = {
  green: [],
  red: [],
};

interface UserInfo {
  name: string;
  iconId: string;
  email: string;
  education: string;
  specialization: string;
  workExperience: Array<{
    specialization: string;
    startedAt: string;
    finishedAt: string | null;
  }>;
}

interface FlagCatalogResponse {
  flags: Array<{
    id: string;
    name: string | null;
  }> | null;
}

interface ActivityFeedParams {
  limit: number;
  cursorCreatedAt?: string;
  cursorActivityId?: string;
}

const getMyUserInfo = async (): Promise<UserInfo> => {
  const res = await http.get<UserInfo>('/users/me/info');
  return res.data;
};

const getCurrentUserId = (): string => {
  const fallbackId = 'current-user-id';
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return fallbackId;

  const payload = accessToken.split('.')[1];
  if (!payload) return fallbackId;

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedPayload = normalizedPayload.padEnd(
      Math.ceil(normalizedPayload.length / 4) * 4,
      '=',
    );
    const decoded = JSON.parse(atob(paddedPayload)) as { sub?: unknown };
    return typeof decoded.sub === 'string' ? decoded.sub : fallbackId;
  } catch {
    return fallbackId;
  }
};

const getLocalAvatarUrl = (avatarId?: string | null): string =>
  (avatarId && AVATAR_ID_TO_LOCAL_URL[avatarId]) || DEFAULT_AVATAR_URL;

const getAvatarUrl = (
  avatarId: string | null | undefined,
  avatarList: AvatarOption[],
): string =>
  avatarList.find((avatar) => avatar.id === avatarId)?.url || getLocalAvatarUrl(avatarId);

const mapAvatarDto = (avatar: AvatarDto): AvatarOption => ({
  id: avatar.iconId,
  url: avatar.link || getLocalAvatarUrl(avatar.iconId),
});

const withLocalAvatarFallbacks = (avatars: AvatarOption[]): AvatarOption[] => {
  const knownIds = new Set(avatars.map((avatar) => avatar.id));

  return [
    ...avatars,
    ...AVATARS.filter((avatar) => !knownIds.has(avatar.id)),
  ];
};

let flagNameMapPromise: Promise<Map<string, string>> | null = null;

const fetchFlagNameMap = async (): Promise<Map<string, string>> => {
  if (!flagNameMapPromise) {
    flagNameMapPromise = http
      .get<FlagCatalogResponse>('/api/flags')
      .then((response) =>
        new Map(
          (response.data.flags ?? []).map((flag) => [
            flag.id,
            flag.name?.trim() || flag.id,
          ]),
        ),
      )
      .catch(() => new Map());
  }

  return flagNameMapPromise;
};

const getFlagName = (flagId: string, flagNames: Map<string, string>): string =>
  flagNames.get(flagId) ?? flagId;

const mapFlagGroups = (
  groups: FlagsResponse['greenFlags'],
  flagNames: Map<string, string>,
): UserFlags['green'] =>
  (groups ?? []).flatMap((group) =>
    (group.flags ?? []).map((flagId) => ({
      id: flagId,
      name: getFlagName(flagId, flagNames),
      priority: group.weight,
    })),
  );

const mapFlagsResponse = (
  data: FlagsResponse,
  flagNames: Map<string, string>,
): UserFlags => ({
  green: mapFlagGroups(data.greenFlags, flagNames),
  red: mapFlagGroups(data.redFlags, flagNames),
});

const mapReviewFlagName = (flag: { id: string; name: string | null }): string =>
  flag.name?.trim() || flag.id;

const mapUserReview = (review: UserReviewItemDto): UserReview => {
  const flags = (review.flags ?? []).map(mapReviewFlagName);

  return {
    id: review.reviewId,
    authorId: review.authorId ?? null,
    authorName: null,
    authorAvatarUrl: null,
    companyId: review.companyId ?? '',
    companyName: review.companyName?.trim() || review.companyId || 'Компания',
    text: review.text ?? '',
    createdAt: review.createdAt,
    flags,
    greenFlags: flags,
    redFlags: [],
    reactions: {
      likes: Math.max(review.score, 0),
      dislikes: Math.max(-review.score, 0),
      complaints: 0,
    },
  };
};

const mapSubscriptionDto = (
  subscription: SubscriptionUserProfileDto,
  avatarList: AvatarOption[],
): Subscription => ({
  id: subscription.userId,
  userId: subscription.userId,
  nickname: subscription.name?.trim() || 'Пользователь',
  avatarUrl: getAvatarUrl(subscription.iconId, avatarList),
  subscribedAt: new Date().toISOString(),
});

const getLevelProgressPercent = (level: GetLevelGatewayResponse): number => {
  const { current, target } = level.progress;
  if (target <= 0) return 100;
  return Math.min(100, Math.round((current / target) * 100));
};

const getLevelLabel = (level: GetLevelGatewayResponse): string => {
  const { current, target } = level.progress;
  if (target <= 0) return 'Максимальный уровень';
  return `${current}/${target} XP`;
};

const getAchievementColor = (status: MyAchievementItemDto['status']): string => {
  switch (status) {
    case 'Completed':
      return '#37b26c';
    case 'InProgress':
      return '#f0a030';
    default:
      return '#8f96a3';
  }
};

const mapAchievement = (achievement: MyAchievementItemDto): Achievement => ({
  id: achievement.achievementId,
  name: achievement.name ?? 'Достижение',
  description: achievement.description ?? '',
  iconUrl: achievement.iconUrl ?? '',
  type: achievement.status === 'Completed' ? 'special' : 'activity',
  earnedAt: achievement.obtainedAt ?? '',
  unlockedAt: achievement.obtainedAt ?? '',
  color: getAchievementColor(achievement.status),
  status: achievement.status,
  progressCurrent: achievement.progress.current,
  progressTarget: achievement.progress.target,
});

const mapUserAchievement = (achievement: UserAchievementItemDto): Achievement => ({
  id: achievement.achievementId,
  name: achievement.name ?? 'Достижение',
  description: '',
  iconUrl: achievement.iconUrl ?? '',
  type: 'special',
  earnedAt: achievement.obtainedAt ?? '',
  unlockedAt: achievement.obtainedAt ?? '',
  color: '#37b26c',
  status: 'Completed',
  progressCurrent: 1,
  progressTarget: 1,
});

const mapUser = (
  id: string,
  userInfo: UserInfo,
  avatarList: AvatarOption[],
  levelInfo: GetLevelGatewayResponse,
): User => {
  const avatarUrl = getAvatarUrl(userInfo.iconId, avatarList);

  return {
    id,
    nickname: userInfo.name,
    email: userInfo.email,
    avatarUrl,
    level: levelInfo.currentLevel,
    levelLabel: getLevelLabel(levelInfo),
    levelProgress: getLevelProgressPercent(levelInfo),
    levelProgressCurrent: levelInfo.progress.current,
    levelProgressTarget: levelInfo.progress.target,
    education: userInfo.education,
    experience: userInfo.workExperience?.length > 0
      ? `${userInfo.workExperience[0].specialization} с ${new Date(userInfo.workExperience[0].startedAt).getFullYear()}`
      : 'Без опыта',
    expertise: userInfo.specialization,
  };
};

export const getAvatars = async (): Promise<AvatarOption[]> => {
  try {
    const response = await http.get<AvatarDto[]>('/avatars');
    const avatars = Array.isArray(response.data) ? response.data.map(mapAvatarDto) : [];

    return withLocalAvatarFallbacks(avatars);
  } catch {
    return AVATARS;
  }
};

export const createProfile = async (data: CreateOrUpdateUserInfoDto): Promise<void> => {
  await http.post('/users/info', data);
};

export const updateProfile = async (data: CreateOrUpdateUserInfoDto | Record<string, unknown>): Promise<any> => {
  const response = await http.put('/users/info', data);
  return response;
};

export const createUserReport = async (
  userId: string,
  data: CreateUserReportDto,
): Promise<void> => {
  await http.post(`/users/${userId}/reports`, data);
};

export const getActualOnboardingStep = async (): Promise<OnboardingStepDto> => {
  const response = await http.get<OnboardingStepDto>('/onboarding/step');
  return response.data;
};

export const completeCurrentOnboardingStep = async (): Promise<void> => {
  await http.post('/onboarding/step');
};

export const setUserFlags = async (data: SetUserFlagsRequest): Promise<void> => {
  try {
    await http.put('/api/users/flags', data);
  } catch (error: any) {
    console.log('Set flags error:', error);
  }
};

export const fetchUserFlagsById = async (userId: string): Promise<UserFlags> => {
  return fetchWithMockFallback(
    async () => {
      const [response, flagNames] = await Promise.all([
        http.get<FlagsResponse>(`/api/users/${userId}/flags`),
        fetchFlagNameMap(),
      ]);
      return { data: mapFlagsResponse(response.data, flagNames) };
    },
    EMPTY_FLAGS
  );
};

const fetchWithMockFallback = async <T>(
  apiCall: () => Promise<{ data: T }>,
  mockData: T
): Promise<T> => {
  try {
    const response = await apiCall();
    return response.data;
  } catch {
    return mockData;
  }
};

export const fetchProfile = async (): Promise<UserProfileData> => {
  const [userInfo, avatarList, flags, achievements, levelInfo, reviews, subscriptions] = await Promise.all([
    getMyUserInfo(),
    getAvatars(),
    fetchUserFlags(),
    fetchAchievements(),
    fetchMyLevel(),
    fetchUserReviews(),
    fetchSubscriptions(),
  ]);

  return {
    user: mapUser(getCurrentUserId(), userInfo, avatarList, levelInfo),
    flags,
    achievements,
    reviews: reviews.map((review) => ({
      ...review,
      authorName: review.authorName ?? userInfo.name,
      authorAvatarUrl: review.authorAvatarUrl ?? getAvatarUrl(userInfo.iconId, avatarList),
    })),
    activity: [],
    subscriptions,
  };
};

export const fetchUser = async (): Promise<User> => {
  const [userInfo, avatarList, levelInfo] = await Promise.all([
    getMyUserInfo(),
    getAvatars(),
    fetchMyLevel(),
  ]);

  return mapUser(getCurrentUserId(), userInfo, avatarList, levelInfo);
};

export const fetchUserInfoById = async (userId: string): Promise<UserInfo> => {
  const response = await http.get<UserInfo>(`/users/${userId}/info`);
  return response.data;
};

export const fetchUserFlags = async (): Promise<UserFlags> => {
  return fetchWithMockFallback(
    async () => {
      const [response, flagNames] = await Promise.all([
        http.get<FlagsResponse>('/api/users/me/flags'),
        fetchFlagNameMap(),
      ]);
      return { data: mapFlagsResponse(response.data, flagNames) };
    },
    EMPTY_FLAGS
  );
};

export const fetchMyLevel = async (): Promise<GetLevelGatewayResponse> => {
  return fetchWithMockFallback(
    async () => {
      const data = await gamificationApi.getMyLevel();
      return { data };
    },
    MOCK_LEVEL,
  );
};

export const fetchAchievements = async (): Promise<Achievement[]> => {
  return fetchWithMockFallback(
    async () => {
      const response = await gamificationApi.getMyAchievements(100, 1, 'All');
      return { data: (response.achievements ?? []).map(mapAchievement) };
    },
    MOCK_ACHIEVEMENTS,
  );
};

export const fetchUserReviews = async (): Promise<UserReview[]> => {
  return fetchWithMockFallback(
    async () => {
      const response = await http.get<GetUserReviewsResponse>('/api/users/me/reviews');
      return { data: (response.data.reviews ?? []).map(mapUserReview) };
    },
    []
  );
};

export const fetchUserReviewsById = async (userId: string): Promise<UserReview[]> => {
  return fetchWithMockFallback(
    async () => {
      const response = await http.get<GetUserReviewsResponse>(`/api/users/${userId}/reviews`);
      return { data: (response.data.reviews ?? []).map(mapUserReview) };
    },
    []
  );
};

export const fetchActivity = async (
  params: ActivityFeedParams = { limit: 10 },
): Promise<FeedPageDto> => {
  return fetchWithMockFallback(
    () => http.get<FeedPageDto>('/activity', params),
    { totalCount: 0, activities: [] }
  );
};

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  return fetchWithMockFallback(
    async () => {
      const [response, avatarList] = await Promise.all([
        http.get<SubscriptionUserProfileDto[]>('/users/me/subscriptions'),
        getAvatars(),
      ]);
      return { data: (response.data ?? []).map((item) => mapSubscriptionDto(item, avatarList)) };
    },
    []
  );
};

export const fetchUserSubscriptions = async (userId: string): Promise<Subscription[]> => {
  return fetchWithMockFallback(
    async () => {
      const [response, avatarList] = await Promise.all([
        http.get<SubscriptionUserProfileDto[]>(`/users/${userId}/subscriptions`),
        getAvatars(),
      ]);
      return { data: (response.data ?? []).map((item) => mapSubscriptionDto(item, avatarList)) };
    },
    []
  );
};

export const fetchSubscriptionStatus = async (authorId: string): Promise<boolean> => {
  const response = await http.get<SubscriptionStatusDto>(`/users/${authorId}/subscriptions/status`);
  return response.data.status === 'ACTIVE';
};

export const subscribeToUser = async (authorId: string): Promise<void> => {
  await http.post(`/users/${authorId}/subscriptions`);
};

export const unsubscribeFromUser = async (authorId: string): Promise<void> => {
  await http.delete(`/users/${authorId}/subscriptions`);
};

export const fetchUserProfileById = async (userId: string): Promise<UserProfileData> => {
  const [userInfo, avatarList, flags, achievements, levelInfo, reviews, subscriptions] = await Promise.all([
    fetchUserInfoById(userId),
    getAvatars(),
    fetchUserFlagsById(userId),
    fetchWithMockFallback(
      async () => {
        const response = await gamificationApi.getUserAchievements(userId, 100, 1);
        return { data: (response.achievements ?? []).map(mapUserAchievement) };
      },
      MOCK_ACHIEVEMENTS,
    ),
    fetchWithMockFallback(
      async () => ({ data: await gamificationApi.getUserLevel(userId) }),
      MOCK_LEVEL,
    ),
    fetchUserReviewsById(userId),
    fetchUserSubscriptions(userId),
  ]);

  return {
    user: mapUser(userId, userInfo, avatarList, levelInfo),
    flags,
    achievements,
    reviews: reviews.map((review) => ({
      ...review,
      authorId: review.authorId ?? userId,
      authorName: review.authorName ?? userInfo.name,
      authorAvatarUrl: review.authorAvatarUrl ?? getAvatarUrl(userInfo.iconId, avatarList),
    })),
    activity: [],
    subscriptions,
  };
};

export const fetchUserPublicProfileById = async (userId: string): Promise<User> => {
  const [userInfo, avatarList, levelInfo] = await Promise.all([
    fetchUserInfoById(userId),
    getAvatars(),
    fetchWithMockFallback(
      async () => ({ data: await gamificationApi.getUserLevel(userId) }),
      MOCK_LEVEL,
    ),
  ]);

  return mapUser(userId, userInfo, avatarList, levelInfo);
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await http.delete(`/api/companies/reviews/${reviewId}`, {
      config: { data: { reviewId } },
    });
  } catch {
    console.log('Mock delete review:', reviewId);
  }
};

export const unsubscribe = async (subscriptionId: string): Promise<void> => {
  try {
    await unsubscribeFromUser(subscriptionId);
  } catch {
    console.log('Mock unsubscribe:', subscriptionId);
  }
};

export const userApi = {
  getAvatars,
  createProfile,
  updateProfile,
  createUserReport,
  getActualOnboardingStep,
  completeCurrentOnboardingStep,
  setUserFlags,
  fetchUserFlagsById,
  fetchUserProfileById,
  fetchUserPublicProfileById,
  fetchProfile,
  fetchUser,
  fetchUserFlags,
  fetchMyLevel,
  fetchAchievements,
  fetchUserReviews,
  fetchUserReviewsById,
  fetchActivity,
  fetchSubscriptions,
  fetchUserSubscriptions,
  fetchSubscriptionStatus,
  subscribeToUser,
  unsubscribeFromUser,
  deleteReview,
  unsubscribe,
};
