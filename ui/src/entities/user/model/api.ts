import http from 'shared/api/http';

import type { 
  User, 
  UserFlags, 
  SaveUserFlagsRequest,
  Achievement, 
  UserReview, 
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

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: '1',
    type: 'first_review',
    name: 'First Review',
    description: 'Posted your first company review',
    iconUrl: '/icons/achievement1.png',
    unlockedAt: new Date().toISOString(),
    earnedAt: new Date().toISOString(),
    color: '#4CAF50',
  },
];

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

export const getAvatars = async (): Promise<{ id: string; url: string }[]> => {
  return fetchWithMockFallback(
    () => http.get('/api/users/avatars'),
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

export const saveUserFlags = async (data: SaveUserFlagsRequest): Promise<void> => {
  try {
    await http.post('/api/users/flags', data);
  } catch (error: any) {
    console.log('Save flags error:', error);
  }
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
      level: 5, // mock
      levelLabel: 'Senior',
      levelProgress: 75,
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
        level: 5,
        levelLabel: 'Senior',
        levelProgress: 75,
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
  return fetchWithMockFallback(
    () => http.get('/api/users/me'),
    {
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
    }
  );
};

export const fetchUserFlags = async (): Promise<UserFlags> => {
  return fetchWithMockFallback(
    () => http.get('/api/users/flags'),
    MOCK_FLAGS
  );
};

export const fetchAchievements = async (): Promise<Achievement[]> => {
  return fetchWithMockFallback(
    () => http.get('/api/users/achievements'),
    MOCK_ACHIEVEMENTS
  );
};

export const fetchUserReviews = async (): Promise<UserReview[]> => {
  return fetchWithMockFallback(
    () => http.get('/api/users/reviews'),
    MOCK_REVIEWS
  );
};

export const fetchActivity = async (): Promise<ActivityItem[]> => {
  return fetchWithMockFallback(
    () => http.get('/api/users/activity'),
    MOCK_ACTIVITY
  );
};

export const fetchSubscriptions = async (): Promise<Subscription[]> => {
  return fetchWithMockFallback(
    () => http.get('/api/users/subscriptions'),
    MOCK_SUBSCRIPTIONS
  );
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  try {
    await http.delete(`/api/users/reviews/${reviewId}`);
  } catch {
    console.log('Mock delete review:', reviewId);
  }
};

export const unsubscribe = async (subscriptionId: string): Promise<void> => {
  try {
    await http.delete(`/api/users/subscriptions/${subscriptionId}`);
  } catch {
    console.log('Mock unsubscribe:', subscriptionId);
  }
};

export const userApi = {
  getAvatars,
  updateProfile,
  saveUserFlags,
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

