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
  UserProfileData 
} from './types';


const AVATARS = [
  { id: '1', url: '/assets/avatars/avatar1.png' },
  { id: '2', url: '/assets/avatars/avatar2.png' },
  { id: '3', url: '/assets/avatars/avatar3.png' },
  { id: '4', url: '/assets/avatars/avatar4.png' },
  { id: '5', url: '/assets/avatars/avatar5.png' },
  { id: '6', url: '/assets/avatars/avatar6.png' },
];

const MOCK_ACHIEVEMENTS: Achievement[] = [];

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
    greenFlags: ['g1'],
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

const getMyUserInfo = async (): Promise<UserInfo> => {
  const res = await http.get<UserInfo>('/users/me/info');
  return res.data;
};

const mapAvatarDto = (avatar: AvatarDto): { id: string; url: string } => ({
  id: avatar.iconId,
  url: avatar.link,
});

const mapFlagGroups = (groups: FlagsResponse['greenFlags']): UserFlags['green'] =>
  (groups ?? []).flatMap((group) =>
    (group.flags ?? []).map((flagId) => ({
      id: flagId,
      name: flagId,
      priority: group.weight,
    })),
  );

const mapFlagsResponse = (data: FlagsResponse): UserFlags => ({
  green: mapFlagGroups(data.greenFlags),
  red: mapFlagGroups(data.redFlags),
});

const mapUserReview = (review: UserReviewItemDto): UserReview => ({
  id: review.reviewId,
  companyId: review.companyId ?? '',
  companyName: review.companyId ?? 'Компания',
  text: review.text ?? '',
  createdAt: review.createdAt,
  greenFlags: (review.flags ?? []).map((flag) => flag.id),
  redFlags: [],
  reactions: {
    likes: Math.max(review.score, 0),
    dislikes: Math.max(-review.score, 0),
    complaints: 0,
  },
});

export const getAvatars = async (): Promise<{ id: string; url: string }[]> => {
  return fetchWithMockFallback(
    async () => {
      const response = await http.get<AvatarDto[]>('/avatars');
      return { data: response.data.map(mapAvatarDto) };
    },
    AVATARS
  );
};

export const updateProfile = async (data: any): Promise<any> => {
  try {
    const response = await http.post('/users/info', data);
    return response;
  } catch (err) {
    console.log('Profile update error:', err);
    return { success: true };
  }
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
      const response = await http.get<FlagsResponse>(`/api/users/${userId}/flags`);
      return { data: mapFlagsResponse(response.data) };
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
  try {
    const [userInfo, avatarList, flags, achievements, reviews, activity, subscriptions] = await Promise.all([
      getMyUserInfo(),
      getAvatars(),
      fetchUserFlags(),
      fetchAchievements(),
      fetchUserReviews(),
      fetchActivity(),
      fetchSubscriptions()
    ]);

    const avatarUrl = avatarList.find((a: any) => a.id === userInfo.iconId)?.url || null;

    const user: User = {
      id: 'current-user-id', 
      nickname: userInfo.name,
      email: userInfo.email,
      avatarUrl,
      level: 1,
      levelLabel: 'Beginner',
      levelProgress: 0,
      education: userInfo.education,
      experience: userInfo.workExperience?.length > 0 
        ? `${userInfo.workExperience[0].specialization} с ${new Date(userInfo.workExperience[0].startedAt).getFullYear()}`
        : 'Без опыта',
      expertise: userInfo.specialization,
    };

    return {
      user,
      flags,
      achievements,
      reviews,
      activity,
      subscriptions
    };
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    return {
      user: {
        id: 'mock1',
        nickname: 'Mock User',
        email: 'mock@example.com',
        avatarUrl: AVATARS[0].url,
        level: 1,
        levelLabel: 'Beginner',
        levelProgress: 0,
        education: 'BACHELOR',
        experience: '5 years',
        expertise: 'Fullstack',
      },
      flags: MOCK_FLAGS,
      achievements: MOCK_ACHIEVEMENTS,
      reviews: MOCK_REVIEWS,
      activity: MOCK_ACTIVITY,
      subscriptions: MOCK_SUBSCRIPTIONS,
    };
  }
};

export const fetchUser = async (): Promise<User> => {
  try {
    const [userInfo, avatarList] = await Promise.all([getMyUserInfo(), getAvatars()]);
    const avatarUrl = avatarList.find((a) => a.id === userInfo.iconId)?.url || null;
    return {
      id: 'current-user-id',
      nickname: userInfo.name,
      email: userInfo.email,
      avatarUrl,
      level: 1,
      levelLabel: 'Beginner',
      levelProgress: 0,
      education: userInfo.education,
      experience: userInfo.workExperience?.length > 0
        ? `${userInfo.workExperience[0].specialization} с ${new Date(userInfo.workExperience[0].startedAt).getFullYear()}`
        : 'Без опыта',
      expertise: userInfo.specialization,
    };
  } catch {
    return {
      id: 'mock1',
      nickname: 'Mock User',
      email: 'mock@example.com',
      avatarUrl: AVATARS[0].url,
      level: 5,
      levelLabel: 'Senior',
      levelProgress: 75,
      education: 'BACHELOR',
      experience: '5 years',
      expertise: 'Fullstack',
    };
  }
};

export const fetchUserFlags = async (): Promise<UserFlags> => {
  return fetchWithMockFallback(
    async () => {
      const response = await http.get<FlagsResponse>('/api/users/me/flags');
      return { data: mapFlagsResponse(response.data) };
    },
    MOCK_FLAGS
  );
};

// import { gamificationApi } from 'entities/gamification';

// TODO: Enable gamification after fixing feature-sliced import rules
export const fetchAchievements = async (): Promise<Achievement[]> => [] as Achievement[];

export const fetchUserReviews = async (): Promise<UserReview[]> => {
  return fetchWithMockFallback(
    async () => {
      const response = await http.get<GetUserReviewsResponse>('/api/users/me/reviews');
      return { data: (response.data.reviews ?? []).map(mapUserReview) };
    },
    MOCK_REVIEWS
  );
};

export const fetchActivity = async (): Promise<ActivityItem[]> => {
  return fetchWithMockFallback(
    () => http.get('/activity'),
    MOCK_ACTIVITY
  );
};

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  return fetchWithMockFallback(
    () => http.get('/users/me/subscriptions'),
    MOCK_SUBSCRIPTIONS
  );
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
    await http.delete(`/users/${subscriptionId}/subscriptions`);
  } catch {
    console.log('Mock unsubscribe:', subscriptionId);
  }
};

export const userApi = {
  getAvatars,
  updateProfile,
  setUserFlags,
  fetchUserFlagsById,
  fetchProfile,
  fetchUser,
  fetchUserFlags,
  fetchAchievements,
  fetchUserReviews,
  fetchActivity,
  fetchSubscriptions,
  deleteReview,
  unsubscribe,
};
