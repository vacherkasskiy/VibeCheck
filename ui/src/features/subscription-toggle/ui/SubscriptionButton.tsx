/* eslint-disable @conarti/feature-sliced/layers-slices */
import { useProfile } from 'features/profile';
import { useSubscribeMutation, useUnsubscribeMutation } from 'features/subscribe';
import { useSubscriptionStatus } from 'features/subscribe';
import { UnsubscribeConfirmModal } from 'features/subscribe';
import { useState } from 'react';
import { Button } from 'shared/ui/Button';
import { Spinner } from 'shared/ui/Spinner';
import type { UserId } from 'entities/user';

interface SubscriptionButtonProps {
  authorId: UserId;
}

export const SubscriptionButton = ({ authorId }: SubscriptionButtonProps) => {
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
      >
        {statusLoading || isPending ? (
          <Spinner />
        ) : isSubscribed ? (
          'Отписаться'
        ) : (
          'Подписаться'
        )}
      </Button>
      <UnsubscribeConfirmModal
        isOpen={showConfirm}
        onClose={handleCloseConfirm}
        onConfirm={handleConfirmUnsubscribe}
        userNickname="" // pass from prop or context
      />
    </>
  );
};

