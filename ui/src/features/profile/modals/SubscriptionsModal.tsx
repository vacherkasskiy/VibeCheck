import { useState } from 'react';
import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';
import styles from './SubscriptionsModal.module.css';
import type { UserId } from 'entities/user';
import type { Subscription } from 'entities/user';

interface SubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionsModal = ({ isOpen, onClose }: SubscriptionsModalProps) => {
  const userId: UserId = 'currentUserId'; // TODO: pass as prop or from useProfile
  const subscriptions: Subscription[] = []; // Mock until subscribe impl complete
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('');

  const handleUnsubscribeClick = (subscriptionId: string) => {
    setSelectedSubscriptionId(subscriptionId);
    setShowUnsubscribe(true);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className={styles.content}>
        <h2>Мои подписки ({subscriptions.length})</h2>
        {subscriptions.length === 0 ? (
          <p>Нет активных подписок</p>
        ) : (
          <ul>
            {subscriptions.map((sub: Subscription) => (
              <li key={sub.id}>
                {sub.nickname}
                <Button 
                  variant="secondary" 
                  size="small"
                  onClick={() => handleUnsubscribeClick(sub.id)}
                >
                  Отписаться
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* UnsubscribeConfirmModal - TODO: uncomment when subscribe feature complete */}
    </Modal>
  );
};
