export const useSubscribeMutation = () => ({
  mutate: (_authorId: string | number) => undefined,
  isPending: false,
});

export const useUnsubscribeMutation = () => ({
  mutate: (_authorId: string | number) => undefined,
  isPending: false,
});
