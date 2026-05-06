import { Users, FileText, Flag, Heart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared/ui/Button';
import styles from './styles.module.css';
import type { UserFeedDto } from 'entities/activity';
import type { Subscription } from 'entities/user';

interface ActivityPanelProps {
	subscriptions: Subscription[];
	activities?: UserFeedDto[];
	reviewsCount: number;
	flagsCount: number;
	likesReceived: number;
	onUnsubscribe: (subscriptionId: string) => void;
}

export const ActivityPanel = ({
	subscriptions,
	activities = [],
	reviewsCount,
	flagsCount,
	likesReceived,
	onUnsubscribe,
}: ActivityPanelProps) => {
	const navigate = useNavigate();
	const [showAllSubs, setShowAllSubs] = useState(false);

	const handleOpenProfile = (userId: string) => {
		navigate(`/user/${userId}`);
	};

	const getActivityTarget = (activity: UserFeedDto) => {
		if (!activity.payload) return null;

		switch (activity.payload.type) {
			case 'REVIEW_WRITTEN':
			case 'REVIEW_LIKED':
				return activity.payload.companyId ? `/company/${activity.payload.companyId}` : null;
			case 'USER_FOLLOWED':
				return activity.payload.userId ? `/user/${activity.payload.userId}` : null;
			default:
				return null;
		}
	};

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
		<div className={styles.panel}>
			<h3 className={styles.title}>Активность</h3>

			<div className={styles.statsGrid}>
				<div className={styles.statItem}>
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

			{subscriptions.length > 0 && (
				<div className={styles.listSection}>
					<h4 className={styles.subtitle}>Подписки ({subscriptions.length})</h4>
					<div className={styles.list}>
						{(showAllSubs ? subscriptions : subscriptions.slice(0, 5)).map((subscription) => (
							<div key={subscription.id} className={styles.subscriptionItem}>
								<button
									className={styles.subscriptionInfo}
									onClick={() => handleOpenProfile(subscription.userId)}
									type="button"
								>
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
								</button>
								<Button
									onClick={() => onUnsubscribe(subscription.userId)}
									variant="secondary"
									size="small"
									className={styles.unsubscribeButton}
								>
									Отписаться
								</Button>
							</div>
						))}
						{subscriptions.length > 5 && (
							<button
								onClick={() => setShowAllSubs((prev) => !prev)}
								className={styles.showMore}
								type="button"
							>
								{showAllSubs ? 'Скрыть' : 'Показать все'}
							</button>
						)}
					</div>
				</div>
			)}

			{activities.length > 0 && (
				<div className={styles.listSection}>
					<h4 className={styles.subtitle}>Активность ({activities.length})</h4>
					<div className={styles.activityList}>
						{activities.slice(0, 5).map((activity) => {
							const activityTarget = getActivityTarget(activity);

							return activityTarget ? (
								<button
									key={activity.activityId}
									className={`${styles.activityItem} ${styles.activityButton}`}
									onClick={() => navigate(activityTarget)}
									type="button"
								>
									{formatActivityText(activity)}
								</button>
							) : (
								<div key={activity.activityId} className={styles.activityItem}>
									{formatActivityText(activity)}
								</div>
							);
						})}
					</div>
				</div>
			)}

		</div>
	);
};
