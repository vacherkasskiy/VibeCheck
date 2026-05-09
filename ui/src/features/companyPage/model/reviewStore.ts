import { create } from 'zustand';
import type { ReviewsSortGatewayEnum } from 'entities/company';

interface CompanyReviewStore {
  sortByCompanyId: Record<string, ReviewsSortGatewayEnum>;
  setSort: (companyId: string, sort: ReviewsSortGatewayEnum) => void;
  resetCompany: (companyId: string) => void;
}

export const useCompanyReviewStore = create<CompanyReviewStore>((set) => ({
  sortByCompanyId: {},
  setSort: (companyId, sort) =>
    set((state) => ({
      sortByCompanyId: {
        ...state.sortByCompanyId,
        [companyId]: sort,
      },
    })),
  resetCompany: (companyId) =>
    set((state) => {
      const next = { ...state.sortByCompanyId };
      delete next[companyId];

      return { sortByCompanyId: next };
    }),
}));
