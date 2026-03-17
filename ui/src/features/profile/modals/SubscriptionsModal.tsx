import { Users, X } from 'lucide-react';
import { Button } from 'shared/ui/Button';
import { Modal } from 'shared/ui/Modal';
import styles from './styles.module.css';
import type { Subscription } from 'entities/user';

interface SubscriptionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	subscriptions: Subscription[];
	onUnsubscribe: (subscriptionId: string) => void;
}

export const SubscriptionsModal = ({
	isOpen,
	onClose,
	subscriptions,
	onUnsubscribe,
}: SubscriptionsModalProps) => {
	return (
		<Modal isOpen={isOpen} onClose={onClose}>
			<div className={styles.modalContent}>
				<div className={styles.modalHeader}>
					<h2 className={styles.modalTitle}>
						<Users size={24} />
						Мои подписки
					</h2>
					<button className={styles.closeButton} onClick={onClose} type="button">
						<X size={20} />
					</button>
				</div>

				<div className={styles.subscriptionsList}>
					{subscriptions.length === 0 ? (
						<p className={styles.emptyMessage}>У вас пока нет подписок</p>
					) : (
						subscriptions.map((subscription) => (
							<div key={subscription.id} className={styles.subscriptionItem}>
								<div className={styles.subscriptionInfo}>
									{subscription.avatarUrl ? (
										<img
											src={subscription.avatarUrl}
											alt={subscription.nickname}
											className={styles.subscriptionAvatar}
										/>
									) : (
										<div className={styles.subscriptionAvatarPlaceholder}>
											{subscription.nickname.charAt(0).toUpperCase()}
										</div>
									)}
									<span className={styles.subscriptionNickname}>
										{subscription.nickname}
									</span>
								</div>
								<Button
									onClick={() => onUnsubscribe(subscription.id)}
									variant="secondary"
									size="small"
									className={styles.unsubscribeButton}
								>
									Отписаться
								</Button>
							</div>
						))
					)}
				</div>

				<div className={styles.modalFooter}>
					<Button onClick={onClose} variant="secondary" size="small">
						Закрыть
					</Button>
				</div>
			</div>
		</Modal>
	);
};
