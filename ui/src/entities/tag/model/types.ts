export type Category = 'Культура' | 'Менеджмент' | 'Процессы' | 'Коммуникации' | 'Имидж' | 'Компенсации' | 'Карьера' | 'Баланс' | 'Условия' | 'Ценности';

export interface Tag {
  id: string;
  name: string;
  description: string;
  category: Category;
}

export interface SelectedTag {
  tag: Tag;
  priority: 1 | 2 | 3;
}

export const PRIORITY_OPTIONS = [
  { value: 1, label: 'Высокий (1)' },
  { value: 2, label: 'Средний (2)' },
  { value: 3, label: 'Низкий (3)' },
] as const;
