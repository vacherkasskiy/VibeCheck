import { useUserSubscriptions } from 'features/subscribe';
import { Spinner } from 'shared/ui/Spinner';
import styles from './CombinedSubscriptionsActivity.module.css';
import type { Subscription } from 'entities/user';

interface CombinedProps {
  userId: string;
}

export const CombinedSubscriptionsActivity = ({ userId }: CombinedProps) => {
  const { data: subscriptions = [], isLoading: subsLoading } = useUserSubscriptions(userId);

  const isLoading = subsLoading;


  if (isLoading) {
    return (
      <section className={styles.section}>
        <Spinner />
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <h3 className={styles.title}>Подписки</h3>
      
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
    </section>
  );
};
