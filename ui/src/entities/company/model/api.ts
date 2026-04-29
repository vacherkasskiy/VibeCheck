import http from 'shared/api/http';
import type { 
  CreateCompanyRequest, 
  CreateCompanyResponse,
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
        companies: Array.from({ length: Math.min(take, 5) }, () => ({ ...TEST_COMPANY_MOCK, companyId: `test-${Math.random().toString(36).slice(2)}` })),
        totalCount: 100,
      };
    }
    
    const response: AxiosResponse<FetchCompaniesResponse> = await http.get('/api/companies', {
      query: searchQuery,
      take,
      pageNum,
    });
    return response.data;
  },

  async fetchCompanyById(id: string): Promise<CompanyDTO> {
    if (id.startsWith('test-')) {
      return { ...TEST_COMPANY_MOCK, companyId: id };
    }
    
    const response: AxiosResponse<CompanyDTO> = await http.get(`/api/companies/${id}`);
    return response.data;
  },

  async fetchCompanyFlags(companyId: string, params: FetchCompanyFlagsParams): Promise<FetchCompanyFlagsResponse> {
    if (companyId.startsWith('test-')) {
      const { q = '', take = 50, pageNum = 1 } = params;
      const filtered = TEST_COMPANY_FLAGS_MOCK.filter(f => !q || (f.name ?? '').toLowerCase().includes(q.toLowerCase()));
      return {
        companyId,
        flags: filtered.slice(0, take),
        totalCount: filtered.length,
      };
    }
    
    const { q = '', take = 50, pageNum = 1 } = params;
    const response: AxiosResponse<FetchCompanyFlagsResponse> = await http.get(`/api/companies/${companyId}/flags`, {
      q,
      take,
      pageNum,
    });
    return response.data;
  },

  async createCompany(params: CreateCompanyRequest): Promise<CreateCompanyResponse> {
    const response: AxiosResponse<CreateCompanyResponse> = await http.post('/api/companies', params);
    return response.data;
  },
};
