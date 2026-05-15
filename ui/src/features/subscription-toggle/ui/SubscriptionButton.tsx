/* eslint-disable @conarti/feature-sliced/layers-slices */
import { useProfile } from 'features/profile';
import { useSubscribeMutation, useUnsubscribeMutation } from 'features/subscribe';
import { useSubscriptionStatus } from 'features/subscribe';
import { UnsubscribeConfirmModal } from 'features/subscribe';
import { useState } from 'react';
import { Button } from 'shared/ui/Button';
import { Spinner } from 'shared/ui/Spinner';
import styles from './SubscriptionButton.module.css';
import type { UserId } from 'entities/user';

interface SubscriptionButtonProps {
  authorId: UserId;
  userNickname?: string;
  className?: string;
}

export const SubscriptionButton = ({ authorId, userNickname, className = '' }: SubscriptionButtonProps) => {
  const { profile: currentUserProfile } = useProfile();
  const currentUserId = currentUserProfile?.user?.id;
  const isOwnProfile = authorId === currentUserId;

  const { data: isSubscribed = false, isLoading: statusLoading } = useSubscriptionStatus(authorId, isOwnProfile);
  const subscribeMutation = useSubscribeMutation();
  const unsubscribeMutation = useUnsubscribeMutation();
  const [showConfirm, setShowConfirm] = useState(false);

  const isPending = subscribeMutation.isPending || unsubscribeMutation.isPending;

  if (isOwnProfile) return null;

  const handleToggle = () => {
    if (isSubscribed) {
      setShowConfirm(true);
    } else {
      subscribeMutation.mutate(authorId);
    }
  };

  const handleConfirmUnsubscribe = () => {
    unsubscribeMutation.mutate(authorId);
    setShowConfirm(false);
  };

  const handleCloseConfirm = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <Button
        variant={isSubscribed ? 'secondary' : 'primary'}
        onClick={handleToggle}
        disabled={isPending || statusLoading}
        className={`${styles.button} ${isSubscribed ? styles.buttonSubscribed : ''} ${isPending || statusLoading ? styles.buttonPending : ''} ${className}`.trim()}
      >
        <span className={styles.content}>
          {statusLoading || isPending ? <Spinner className={styles.spinner} /> : null}
          <span className={styles.label}>
            {statusLoading || isPending ? 'Обновляем...' : isSubscribed ? 'Отписаться' : 'Подписаться'}
          </span>
        </span>
      </Button>
      <UnsubscribeConfirmModal
        isOpen={showConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmUnsubscribe}
        userNickname={userNickname}
      />
    </>
  );
};
