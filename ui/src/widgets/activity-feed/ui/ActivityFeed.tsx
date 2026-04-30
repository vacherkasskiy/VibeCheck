import { useInfiniteQuery } from '@tanstack/react-query';
import { ActivityCard } from 'entities/activity';
import { userApi } from 'entities/user';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { Button } from 'shared/ui/Button';
import { Spinner } from 'shared/ui/Spinner';
import styles from './ActivityFeed.module.css';

interface ActivityFeedProps {
  initialLimit?: number;
}

export const ActivityFeed = ({ initialLimit = 10 }: ActivityFeedProps) => {
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ['activityFeed'],
    queryFn: ({ pageParam }) => userApi.fetchActivity(pageParam || { limit: initialLimit }),
    initialPageParam: { limit: initialLimit },
    getNextPageParam: (lastPage) => {
      const activities = (lastPage as any).activities || [];
      if (activities.length < initialLimit) return undefined;
      const last = activities[activities.length - 1];
      return {
        limit: initialLimit,
        cursorCreatedAt: last.createdAt,
        cursorActivityId: last.activityId,
      };
    },
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  if (error) {
    return (
      <div className={styles.container}>
        <p>Не удалось загрузить активность</p>
        <Button onClick={() => window.location.reload()}>
          Попробовать снова
        </Button>
      </div>
    );
  }

  const activities = data?.pages?.flatMap((page) => (page as any).activities || []) || [];

  if (activities.length === 0 && !data) {
    return (
      <div className={styles.empty}>
        Пока нет активности. Подпишитесь на пользователей, чтобы видеть их обновления.
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.list}>
        {activities.map((activity) => (
          <ActivityCard key={activity.activityId} activity={activity} />
        ))}
      </div>
      <div ref={ref} className={styles.sentinel} />
      {isFetchingNextPage && (
        <div className={styles.loading}>
          <Spinner />
        </div>
      )}
    </div>
  );
};

