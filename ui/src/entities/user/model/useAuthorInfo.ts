import { useQuery } from '@tanstack/react-query';
import { fetchUserInfoById, getLocalAvatarUrl } from './api';

interface AuthorInfo {
  name: string;
  avatarUrl: string;
}

const DEFAULT_AUTHOR_INFO: AuthorInfo = {
  name: 'Пользователь',
  avatarUrl: '/assets/avatars/avatar1.png',
};

export const useAuthorInfo = (authorId: string | null | undefined) => {
  return useQuery({
    queryKey: ['authorInfo', authorId],
    queryFn: async (): Promise<AuthorInfo> => {
      if (!authorId) {
        return DEFAULT_AUTHOR_INFO;
      }

      try {
        const userInfo = await fetchUserInfoById(authorId);
        return {
          name: userInfo.name,
          avatarUrl: getLocalAvatarUrl(userInfo.iconId),
        };
      } catch {
        return DEFAULT_AUTHOR_INFO;
      }
    },
    enabled: !!authorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
