import http from 'shared/api/http';
import type { 
  CreateCompanyRequest, 
  FetchCompaniesResponse, 
  FetchCompanyFlagsResponse 
} from './companyApiTypes';
import type { CompanyDTO, CompanyFlag } from './types';
import type { AxiosResponse } from 'axios';

interface FetchCompaniesParams {
  query?: string;
  take?: number;
  pageNum?: number;
  q?: string;
}

interface FetchCompanyFlagsParams {
  q?: string;
  take?: number;
  pageNum?: number;
}

// TEMP: Mock test company for demo - remove when backend ready
const TEST_COMPANY_MOCK: CompanyDTO = {
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

// Test flags for full list
const TEST_COMPANY_FLAGS_MOCK: CompanyFlag[] = [
  { id: 't1', name: 'Гибкий график', count: 42 },
  { id: 't2', name: 'Удаленная работа', count: 38 },
  { id: 't3', name: 'Дружелюбная атмосфера', count: 35 },
  { id: 't4', name: 'Открытая коммуникация', count: 30 },
  { id: 't5', name: 'Профессиональный рост', count: 28 },
  { id: 't6', name: 'Микроменеджмент', count: 15 },
  { id: 't7', name: 'Переработки', count: 12 },
  { id: 'c1', name: 'Дружелюбная команда', count: 32 },
  { id: 'm1', name: 'Честное руководство', count: 25 },
  { id: 's1', name: 'Достойная зарплата', count: 20 },
  { id: 't25', name: 'Опционы', count: 5 },
];

export const companyApi = {
  async fetchCompanies(params: FetchCompaniesParams): Promise<FetchCompaniesResponse> {
    const { query = '', take = 20, pageNum = 1, q = '' } = params;
    const searchQuery = query || q;
    
    if (!searchQuery.trim()) {
      return {
        items: Array.from({ length: Math.min(take, 5) }, () => ({ ...TEST_COMPANY_MOCK, id: `test-${Math.random().toString(36).slice(2)}` })),
        total: 100,
      };
    }
    
    const response: AxiosResponse<FetchCompaniesResponse> = await http.get('/api/companies', {
      params: {
        query: searchQuery,
        take,
        pageNum,
      },
    });
    return response.data;
  },

  async fetchCompanyById(id: string): Promise<CompanyDTO> {
    if (id.startsWith('test-')) {
      return { ...TEST_COMPANY_MOCK, id };
    }
    
    const response: AxiosResponse<CompanyDTO> = await http.get(`/api/companies/${id}`);
    return response.data;
  },

  async fetchCompanyFlags(companyId: string, params: FetchCompanyFlagsParams): Promise<FetchCompanyFlagsResponse> {
    if (companyId.startsWith('test-')) {
      const { q = '', take = 50, pageNum = 1 } = params;
      const filtered = TEST_COMPANY_FLAGS_MOCK.filter(f => !q || f.name.toLowerCase().includes(q.toLowerCase()));
      return {
        items: filtered.slice(0, take),
        total: filtered.length,
      };
    }
    
    const { q = '', take = 50, pageNum = 1 } = params;
    const response: AxiosResponse<FetchCompanyFlagsResponse> = await http.get(`/api/companies/${companyId}/flags`, {
      params: {
        q,
        take,
        pageNum,
      },
    });
    return response.data;
  },

  async createCompany(params: CreateCompanyRequest): Promise<CompanyDTO> {
    const response: AxiosResponse<CompanyDTO> = await http.post('/api/companies', params);
    return response.data;
  },
};

