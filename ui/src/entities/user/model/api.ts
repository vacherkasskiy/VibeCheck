import { gamificationApi } from 'entities/gamification';
import http from 'shared/api/http';

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
  ActivityItem, 
  Subscription, 
  CreateOrUpdateUserInfoDto,
  CreateUserReportDto,
  OnboardingStepDto,
  SubscriptionStatusDto,
  SubscriptionUserProfileDto,
  UserProfileData 
} from './types';
import type { GetLevelGatewayResponse, MyAchievementItemDto, UserAchievementItemDto } from 'entities/gamification';


const AVATARS = [
  { id: '1', url: '/assets/avatars/avatar1.png' },
  { id: '2', url: '/assets/avatars/avatar2.png' },
  { id: '3', url: '/assets/avatars/avatar3.png' },
  { id: '4', url: '/assets/avatars/avatar4.png' },
  { id: '5', url: '/assets/avatars/avatar5.png' },
  { id: '6', url: '/assets/avatars/avatar6.png' },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [];

const MOCK_LEVEL: GetLevelGatewayResponse = {
  currentLevel: 1,
  progress: {
    current: 0,
    target: 1,
  },
};

const MOCK_FLAGS: UserFlags = {
  green: [{ id: 'g1', name: 'Great Team', priority: 1 }],
  red: [{ id: 'r1', name: 'Poor Management', priority: 1 }],
};

const MOCK_REVIEWS: UserReview[] = [
  {
    id: 'r1',
    companyId: 'c1',
    companyName: 'Tech Corp',
    text: 'Great place to work!',
    createdAt: new Date().toISOString(),
    flags: ['Great Team'],
    greenFlags: ['Great Team'],
    redFlags: [],
    reactions: { likes: 5, dislikes: 0, complaints: 0 },
  },
];

const MOCK_ACTIVITY: ActivityItem[] = [
  {
    id: 'a1',
    type: 'achievement_unlocked',
    userId: 'u1',
    userNickname: 'Test User',
    userAvatarUrl: AVATARS[0].url,
    description: 'Unlocked First Review achievement',
    timestamp: new Date().toISOString(),
  },
];

const MOCK_SUBSCRIPTIONS: Subscription[] = [
  {
    id: 's1',
    userId: 'u1',
    nickname: 'Friend User',
    avatarUrl: AVATARS[1].url,
    subscribedAt: new Date().toISOString(),
  },
];

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

const MOCK_USER_INFO: UserInfo = {
  name: 'Пользователь',
  iconId: '1',
  email: '',
  education: '',
  specialization: '',
  workExperience: [],
};

const getMyUserInfo = async (): Promise<UserInfo> => {
  const res = await http.get<UserInfo>('/users/me/info');
  return res.data;
};

const mapAvatarDto = (avatar: AvatarDto): { id: string; url: string } => ({
  id: avatar.iconId,
  url: avatar.link,
});

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
  avatarList: Array<{ id: string; url: string }>,
): Subscription => ({
  id: subscription.userId,
  userId: subscription.userId,
  nickname: subscription.name?.trim() || 'Пользователь',
  avatarUrl: avatarList.find((avatar) => avatar.id === subscription.iconId)?.url || null,
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
  avatarList: Array<{ id: string; url: string }>,
  levelInfo: GetLevelGatewayResponse,
): User => {
  const avatarUrl = avatarList.find((avatar) => avatar.id === userInfo.iconId)?.url || null;

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

export const getAvatars = async (): Promise<{ id: string; url: string }[]> => {
  return fetchWithMockFallback(
    async () => {
      const response = await http.get<AvatarDto[]>('/avatars');
      return { data: response.data.map(mapAvatarDto) };
    },
    AVATARS
  );
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
    MOCK_FLAGS
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
  const [userInfo, avatarList, flags, achievements, levelInfo, reviews, activity, subscriptions] = await Promise.all([
    fetchWithMockFallback(async () => ({ data: await getMyUserInfo() }), MOCK_USER_INFO),
    getAvatars(),
    fetchUserFlags(),
    fetchAchievements(),
    fetchMyLevel(),
    fetchUserReviews(),
    fetchActivity(),
    fetchSubscriptions(),
  ]);

  return {
    user: mapUser('current-user-id', userInfo, avatarList, levelInfo),
    flags,
    achievements,
    reviews: reviews.map((review) => ({
      ...review,
      authorName: review.authorName ?? userInfo.name,
      authorAvatarUrl: review.authorAvatarUrl ?? avatarList.find((avatar) => avatar.id === userInfo.iconId)?.url ?? null,
    })),
    activity,
    subscriptions,
  };
};

export const fetchUser = async (): Promise<User> => {
  const [userInfo, avatarList, levelInfo] = await Promise.all([
    fetchWithMockFallback(async () => ({ data: await getMyUserInfo() }), MOCK_USER_INFO),
    getAvatars(),
    fetchMyLevel(),
  ]);

  return mapUser('current-user-id', userInfo, avatarList, levelInfo);
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
    MOCK_FLAGS
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
    MOCK_REVIEWS
  );
};

export const fetchUserReviewsById = async (userId: string): Promise<UserReview[]> => {
  return fetchWithMockFallback(
    async () => {
      const response = await http.get<GetUserReviewsResponse>(`/api/users/${userId}/reviews`);
      return { data: (response.data.reviews ?? []).map(mapUserReview) };
    },
    MOCK_REVIEWS.map((review) => ({ ...review, authorId: userId }))
  );
};

export const fetchActivity = async (params?: { limit: number; cursorCreatedAt?: string; cursorActivityId?: string }): Promise<any> => {
  return fetchWithMockFallback(
    () => http.get('/activity', { params }),
    { activities: MOCK_ACTIVITY }
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
    MOCK_SUBSCRIPTIONS
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
  return fetchWithMockFallback(
    async () => {
      const response = await http.get<SubscriptionStatusDto>(`/users/${authorId}/subscriptions/status`);
      return { data: response.data.status === 'ACTIVE' };
    },
    false
  );
};

export const subscribeToUser = async (authorId: string): Promise<void> => {
  await http.post(`/users/${authorId}/subscriptions`);
};

export const unsubscribeFromUser = async (authorId: string): Promise<void> => {
  await http.delete(`/users/${authorId}/subscriptions`);
};

export const fetchUserProfileById = async (userId: string): Promise<UserProfileData> => {
  const [userInfo, avatarList, flags, achievements, levelInfo, reviews, subscriptions] = await Promise.all([
    fetchWithMockFallback(async () => ({ data: await fetchUserInfoById(userId) }), MOCK_USER_INFO),
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
      authorAvatarUrl: review.authorAvatarUrl ?? avatarList.find((avatar) => avatar.id === userInfo.iconId)?.url ?? null,
    })),
    activity: [],
    subscriptions,
  };
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
