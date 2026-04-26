import type { CompanyDTO, CompanyFlag } from 'entities/company';

// Test company mock data for development/testing
// Use: navigate to `/company/test-company-001`

export const TEST_COMPANY_MOCK: CompanyDTO = {
  id: 'test-company-001',
  name: 'Тестовая Компания LLC',
  site: 'https://test-company.ru',
  logoUrl: '/assets/vibecheck-favicon.png',
  description: 'Тестовая компания для демонстрации функционала VibeCheck. Здесь отображаются все фичи: топ флагов, поиск, отзывы, контакты.',
  topFlags: [
    { id: 't1', name: 'Гибкий график', count: 42 },
    { id: 't2', name: 'Удаленная работа', count: 38 },
    { id: 't3', name: 'Дружелюбная атмосфера', count: 35 },
    { id: 'c1', name: 'Дружелюбная команда', count: 32 },
    { id: 'm1', name: 'Честное руководство', count: 28 },
    { id: 's1', name: 'Достойная зарплата', count: 25 },
  ],
  contacts: [
    {
      id: 'c1',
      type: 'website',
      value: 'test-company.ru',
      url: 'https://test-company.ru',
    },
    {
      id: 'c2',
      type: 'email',
      value: 'hr@test-company.ru',
      url: 'mailto:hr@test-company.ru',
    },
    {
      id: 'c3',
      type: 'linkedin',
      value: 'linkedin.com/company/test-company',
      url: 'https://linkedin.com/company/test-company',
    },
  ],
  reviews: [
    {
      id: 'r1',
      authorId: 'user1',
      authorName: 'Иван Иванов',
      authorAvatarUrl: null,
      createdAt: '2024-01-15T10:30:00Z',
      position: 'Senior Developer',
      text: 'Отличная компания! Гибкий график и дружелюбная команда. Рекомендую!',
      flags: [{ id: 't1', name: 'Гибкий график', count: 1 }],
      reactions: { likes: 12, dislikes: 1 },
    },
    {
      id: 'r2',
      authorId: 'user2',
      authorName: 'Мария Петрова',
      authorAvatarUrl: null,
      createdAt: '2024-01-10T14:20:00Z',
      position: 'Product Manager',
      text: 'Хорошие условия, но иногда бывают переработки.',
      flags: [{ id: 't6', name: 'Микроменеджмент', count: 1 }],
      reactions: { likes: 8, dislikes: 2 },
    },
  ],
};

// Additional test flags for /flags endpoint (full list)
export const TEST_COMPANY_FLAGS_MOCK: CompanyFlag[] = [
  { id: 't1', name: 'Гибкий график', count: 42 },
  { id: 't2', name: 'Удаленная работа', count: 38 },
  { id: 't3', name: 'Дружелюбная атмосфера', count: 35 },
  { id: 't4', name: 'Открытая коммуникация', count: 30 },
  { id: 't5', name: 'Профессиональный рост', count: 28 },
  { id: 't6', name: 'Микроменеджмент', count: 15 },
  { id: 't7', name: 'Переработки', count: 12 },
  { id: 'c1', name: 'Дружелюбная команда', count: 32 },
  { id: 'm1', name: 'Честное руководство', count: 25 },
  // ... add more for testing search/pagination
  { id: 't25', name: 'Опционы', count: 5 },
];

