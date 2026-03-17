import type { 
  User, 
  UserFlags, 
  Achievement, 
  UserReview, 
  ActivityItem, 
  Subscription,
  UserProfileData 
} from './types';

// Mock data for development - replace with actual API calls
const mockUser: User = {
  id: '1',
  nickname: 'Алексей Разработчик',
  email: 'alexey@example.com',
  avatarUrl: '/assets/avatars/avatar1.png',
  level: 12,
  levelLabel: 'Эксперт-рецензент',
  levelProgress: 75,
  education: 'Высшее техническое',
  experience: '5 лет в IT',
  expertise: 'Frontend разработка, React, TypeScript',
};

const mockFlags: UserFlags = {
  green: [
    { id: 'c1', name: 'Дружелюбная команда', priority: 1 },
    { id: 'm5', name: 'Помогают', priority: 2 },
    { id: 'p1', name: 'Всё чётко', priority: 3 },
    { id: 's1', name: 'Достойная зарплата', priority: 4 },
    { id: 'b3', name: 'Гибкий режим', priority: 5 },
  ],
  red: [
    { id: 'c2', name: 'Токсичная атмосфера', priority: 1 },
    { id: 'm9', name: 'Сильное давление', priority: 2 },
    { id: 'b2', name: 'Переработки', priority: 3 },
  ],
};

const mockAchievements: Achievement[] = [
  { id: '1', name: 'Первый отзыв', description: 'Оставили первый отзыв о компании', iconUrl: '📝', earnedAt: '2024-01-15', unlockedAt: '2024-01-15', type: 'review', color: '#4ADE80' },
  { id: '2', name: 'Мастер флагов', description: 'Выбрали более 10 флагов', iconUrl: '🚩', earnedAt: '2024-02-20', unlockedAt: '2024-02-20', type: 'flag', color: '#60A5FA' },
  { id: '3', name: 'Полезный рецензент', description: 'Получили более 50 лайков', iconUrl: '👍', earnedAt: '2024-03-10', unlockedAt: '2024-03-10', type: 'review', color: '#F472B6' },
  { id: '4', name: 'Активный пользователь', description: 'Входили 30 дней подряд', iconUrl: '🔥', earnedAt: '2024-03-25', unlockedAt: '2024-03-25', type: 'activity', color: '#FB923C' },
  { id: '5', name: 'Топ-автор', description: 'Вошли в топ-10% рецензентов', iconUrl: '🏆', earnedAt: '2024-04-05', unlockedAt: '2024-04-05', type: 'ranking', color: '#A78BFA' },
  { id: '6', name: 'Ранний пользователь', description: 'Присоединились в первый месяц', iconUrl: '🚀', earnedAt: '2024-01-01', unlockedAt: '2024-01-01', type: 'special', color: '#34D399' },
  { id: '7', name: 'Детальный рецензент', description: 'Написали 5+ отзывов по 500+ символов', iconUrl: '✍️', earnedAt: '2024-02-15', unlockedAt: '2024-02-15', type: 'review', color: '#818CF8' },
];

const mockReviews: UserReview[] = [
  {
    id: '1',
    companyId: '1',
    companyName: 'Яндекс',
    text: 'Отличная компания с хорошими условиями и балансом работы и личной жизни. Команда поддерживает, проекты интересные. Особенно ценю гибкий график и возможность работать удалённо. Рекомендую всем, кто хочет развиваться в IT.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    greenFlags: ['Дружелюбная команда', 'Гибкий режим', 'Всё чётко'],
    redFlags: [],
    reactions: { likes: 24, dislikes: 2, complaints: 0 },
  },
  {
    id: '2',
    companyId: '2',
    companyName: 'СберТех',
    text: 'Быстро развивающаяся компания с множеством возможностей для обучения. Однако иногда приходится работать в авральном режиме, и давление со стороны руководства может быть сильным. Но карьерный рост реальный.',
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    greenFlags: ['Можно расти', 'Современное оборудование'],
    redFlags: ['Сильное давление', 'Переработки'],
    reactions: { likes: 12, dislikes: 5, complaints: 1 },
  },
  {
    id: '3',
    companyId: '3',
    companyName: 'Тинькофф',
    text: 'Классная атмосфера в команде, реально дружелюбные коллеги. Зарплата выше рынка, плюс есть бонусы за результат. Единственный минус — иногда приходится быть на связи в выходные, но это не критично.',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    greenFlags: ['Дружелюбная команда', 'Достойная зарплата', 'Бонусы за результат'],
    redFlags: ['Выходные не выходные'],
    reactions: { likes: 31, dislikes: 3, complaints: 0 },
  },
];

const mockActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'achievement_unlocked',
    userId: '2',
    userNickname: 'SarahDev',
    userAvatarUrl: null,
    description: 'unlocked "First Review" achievement',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    type: 'review_posted',
    userId: '3',
    userNickname: 'MikeCoder',
    userAvatarUrl: null,
    description: 'posted a review for "Google"',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: '3',
    type: 'flag_updated',
    userId: '2',
    userNickname: 'SarahDev',
    userAvatarUrl: null,
    description: 'updated their flags',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
];

const mockSubscriptions: Subscription[] = [
  { id: '1', userId: '2', nickname: 'SarahDev', avatarUrl: null, subscribedAt: '2024-01-15' },
  { id: '2', userId: '3', nickname: 'MikeCoder', avatarUrl: null, subscribedAt: '2024-02-01' },
  { id: '3', userId: '4', nickname: 'JanePM', avatarUrl: null, subscribedAt: '2024-02-20' },
  { id: '4', userId: '5', nickname: 'TomDesigner', avatarUrl: null, subscribedAt: '2024-03-05' },
];

export const userApi = {
  fetchProfile: async (): Promise<UserProfileData> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      user: mockUser,
      flags: mockFlags,
      achievements: mockAchievements,
      reviews: mockReviews,
      activity: mockActivity,
      subscriptions: mockSubscriptions,
    };
  },

  fetchUser: async (): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockUser;
  },

  fetchUserFlags: async (): Promise<UserFlags> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockFlags;
  },

  fetchAchievements: async (): Promise<Achievement[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockAchievements;
  },

  fetchUserReviews: async (): Promise<UserReview[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockReviews;
  },

  fetchActivity: async (): Promise<ActivityItem[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockActivity;
  },

  fetchSubscriptions: async (): Promise<Subscription[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockSubscriptions;
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Deleted review:', reviewId);
  },

  unsubscribe: async (subscriptionId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('Unsubscribed from:', subscriptionId);
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockUser, ...data };
  },
};
