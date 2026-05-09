import { create } from 'zustand';

interface CompanySearchStore {
  query: string;
  setQuery: (query: string) => void;
  reset: () => void;
}

export const useCompanySearchStore = create<CompanySearchStore>((set) => ({
  query: '',
  setQuery: (query) => set({ query }),
  reset: () => set({ query: '' }),
}));
