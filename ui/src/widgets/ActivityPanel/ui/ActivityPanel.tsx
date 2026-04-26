import { SubscriptionsModal } from 'features/profile/modals';
import { Users, FileText, Flag, Heart } from 'lucide-react';
import { useState } from 'react';
import { Button } from 'shared/ui/Button';
import styles from './styles.module.css';
import type { Subscription } from 'entities/user';

interface ActivityPanelProps {
	subscriptions: Subscription[];
	reviewsCount: number;
	flagsCount: number;
	likesReceived: number;
	onUnsubscribe: (subscriptionId: string) => void;
}

export const ActivityPanel = ({
	subscriptions,
	reviewsCount,
	flagsCount,
	likesReceived,
	onUnsubscribe,
}: ActivityPanelProps) => {
	const [showSubscriptionsModal, setShowSubscriptionsModal] = useState(false);

	return (
		<div className={styles.panel}>
			<h3 className={styles.title}>Активность</h3>

			<div className={styles.statsGrid}>
				<div
					className={styles.statItem}
					onClick={() => setShowSubscriptionsModal(true)}
					role="button"
					tabIndex={0}
				>
					<div className={styles.statIcon}>
						<Users size={20} />
					</div>
					<div className={styles.statInfo}>
						<span className={styles.statValue}>{subscriptions.length}</span>
						<span className={styles.statLabel}>Подписок</span>
					</div>
				</div>

				<div className={styles.statItem}>
					<div className={styles.statIcon}>
						<FileText size={20} />
					</div>
					<div className={styles.statInfo}>
						<span className={styles.statValue}>{reviewsCount}</span>
						<span className={styles.statLabel}>Отзывов</span>
					</div>
				</div>

				<div className={styles.statItem}>
					<div className={styles.statIcon}>
						<Flag size={20} />
					</div>
					<div className={styles.statInfo}>
						<span className={styles.statValue}>{flagsCount}</span>
						<span className={styles.statLabel}>Флагов</span>
					</div>
				</div>

				<div className={styles.statItem}>
					<div className={styles.statIcon}>
						<Heart size={20} />
					</div>
					<div className={styles.statInfo}>
						<span className={styles.statValue}>{likesReceived}</span>
						<span className={styles.statLabel}>Лайков</span>
					</div>
				</div>
			</div>

			<Button
				variant="secondary"
				size="small"
				onClick={() => setShowSubscriptionsModal(true)}
				className={styles.viewSubscriptionsButton}
			>
				<Users size={16} />
				Мои подписки
			</Button>

			<SubscriptionsModal
				isOpen={showSubscriptionsModal}
				onClose={() => setShowSubscriptionsModal(false)}
				subscriptions={subscriptions}
				onUnsubscribe={onUnsubscribe}
			/>
		</div>
	);
};
