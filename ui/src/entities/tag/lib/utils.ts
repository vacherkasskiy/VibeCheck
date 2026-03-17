import { ALL_TAGS } from '../model/mock';
import type { Tag } from '../model/types';

export const groupByCategory = (tags: Tag[]): [string, Tag[]][] => {
  const groups = new Map<string, Tag[]>();
  for (const tag of tags) {
    if (!groups.has(tag.category)) groups.set(tag.category, []);
    groups.get(tag.category)!.push(tag);
  }
  return Array.from(groups.entries());
};

export const filterTags = (tags: Tag[], query: string, excludeIds: string[]): Tag[] => {
  const q = query.trim().toLowerCase();
  const excludeSet = new Set(excludeIds);
  return tags.filter((t) => {
    if (excludeSet.has(t.id)) return false;
    if (!q) return true;
    return t.name.toLowerCase().includes(q);
  });
};

export const getAllTags = (): Tag[] => ALL_TAGS;
