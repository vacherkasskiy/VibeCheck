import type { CompanyDTO, CompanyFlag } from 'entities/company';

// Test company mock data for development/testing
// Use: navigate to `/company/test-company-001`

export const TEST_COMPANY_MOCK: CompanyDTO = {
  companyId: 'test-company-001',
  name: 'Тестовая Компания LLC',
  iconUrl: '/assets/vibecheck-favicon.png',
  weight: 1,
  description: 'Тестовая компания для демонстрации функционала VibeCheck. Здесь отображаются все фичи: топ флагов, поиск, отзывы, контакты.',
  links: {
    site: 'https://test-company.ru',
    linkedin: 'https://linkedin.com/company/test-company',
    hh: null,
  },
  topFlags: [
    { id: 't1', name: 'Гибкий график', count: 42 },
    { id: 't2', name: 'Удаленная работа', count: 38 },
    { id: 't3', name: 'Дружелюбная атмосфера', count: 35 },
    { id: 'c1', name: 'Дружелюбная команда', count: 32 },
    { id: 'm1', name: 'Честное руководство', count: 28 },
    { id: 's1', name: 'Достойная зарплата', count: 25 },
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
