export const useSubscriptionStatus = (
  _authorId?: string | number,
  isOwnProfile?: boolean
) => ({
  data: false,
  isLoading: isOwnProfile ? false : false,
  error: null as Error | null,
});
