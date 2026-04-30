import { useQuery } from '@tanstack/react-query';
import { useUserActivity } from 'entities/activity';
import { userApi } from 'entities/user';
import { useUserSubscriptions } from 'features/subscribe';
import { useParams } from 'react-router-dom';
import { Spinner } from 'shared/ui/Spinner';
import styles from './CombinedSubscriptionsActivity.module.css';
import type { UserFeedDto } from 'entities/activity/model/types';
import type { Subscription } from 'entities/user/model/types';

interface CombinedProps {
  userId: string;
}

export const CombinedSubscriptionsActivity = ({ userId }: CombinedProps) => {
  const { data: subscriptions = [], isLoading: subsLoading } = useUserSubscriptions(userId);
  const { data: activities = [] , isLoading: actLoading } = useUserActivity(userId, 5);

  const isLoading = subsLoading || actLoading;


  if (isLoading) {
    return (
      <section className={styles.section}>
        <Spinner />
      </section>
    );
  }

  const formatActivityText = (activity: UserFeedDto) => {
    if (!activity.payload || !activity.actor) return 'Активность';
    const actorName = activity.actor.name || 'Пользователь';
    switch (activity.payload.type) {
      case 'REVIEW_WRITTEN':
        return `${actorName} оставил отзыв о ${activity.payload.companyName}`;
      case 'REVIEW_LIKED':
        return `${actorName} оценил отзыв`;
      case 'ACHIEVEMENT_UNLOCKED':
        return `${actorName} получил достижение «${activity.payload.displayName}»`;
      case 'USER_FOLLOWED':
        return `${actorName} подписался на пользователя`;
      case 'LEVEL_UP':
        return `${actorName} достиг уровня ${activity.payload.newLevel}`;
      default:
        return 'Новое событие';
    }
  };

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Подписки и активность</h3>
      
      <div className={styles.subscriptions}>
        <h4 className={styles.subtitle}>Подписки ({subscriptions.length})</h4>
        {subscriptions.length === 0 ? (
          <p className={styles.empty}>Нет подписок</p>
        ) : (
          <ul className={styles.list}>
            {subscriptions.slice(0, 10).map((sub: Subscription) => (
              <li key={sub.id} className={styles.item}>{sub.nickname}</li>
            ))}
          </ul>
        )}
      </div>

      <div className={styles.activities}>
        <h4 className={styles.subtitle}>Недавняя активность ({activities.length})</h4>
        {activities.length === 0 ? (
          <p className={styles.empty}>Нет активности</p>
        ) : (
          <ul className={styles.list}>
            {activities.map((act) => (
              <li key={act.activityId} className={styles.item}>{formatActivityText(act)}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
