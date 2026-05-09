import { Award, MessageSquare, TrendingUp, UserPlus, Heart } from 'lucide-react';
import { useMemo, useState } from 'react';
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

type ActivityTab = 'all' | 'activity' | 'following';

const TABS: Array<{ id: ActivityTab; label: string }> = [
	{ id: 'all', label: 'Все' },
	{ id: 'activity', label: 'Моя активность' },
	{ id: 'following', label: 'Подписки' },
];

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
	const [activeTab, setActiveTab] = useState<ActivityTab>('all');

	const handleOpenProfile = (userId: string) => {
		navigate(`/user/${userId}`);
	};

	const formatRelativeTime = (dateString?: string) => {
		if (!dateString) return 'Недавно';
		const date = new Date(dateString);
		const diff = Date.now() - date.getTime();
		const minute = 60 * 1000;
		const hour = 60 * minute;
		const day = 24 * hour;

		if (diff < minute) return 'только что';
		if (diff < hour) return `${Math.max(1, Math.floor(diff / minute))}м назад`;
		if (diff < day) return `${Math.max(1, Math.floor(diff / hour))}ч назад`;
		if (diff < 7 * day) return `${Math.max(1, Math.floor(diff / day))}д назад`;

		return date.toLocaleDateString('ru-RU', {
			day: 'numeric',
			month: 'short',
		});
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

	const getActivityMeta = (activity: UserFeedDto) => {
		if (!activity.payload || !activity.actor) {
			return {
				text: 'Новое событие',
				icon: MessageSquare,
			};
		}

		const actorName = activity.actor.name || 'Пользователь';

		switch (activity.payload.type) {
			case 'REVIEW_WRITTEN':
				return {
					text: `${actorName} posted a new review`,
					icon: MessageSquare,
				};
			case 'REVIEW_LIKED':
				return {
					text: `${actorName} liked a review`,
					icon: Heart,
				};
			case 'ACHIEVEMENT_UNLOCKED':
				return {
					text: `${actorName} unlocked "${activity.payload.displayName || 'Achievement'}"`,
					icon: Award,
				};
			case 'USER_FOLLOWED':
				return {
					text: `${actorName} started following a user`,
					icon: UserPlus,
				};
			case 'LEVEL_UP':
				return {
					text: `${actorName} reached level ${activity.payload.newLevel || '?'}`,
					icon: TrendingUp,
				};
			default:
				return {
					text: 'New activity',
					icon: MessageSquare,
				};
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

	const visibleSubscriptions = useMemo(
		() => (showAllSubs ? subscriptions : subscriptions.slice(0, 5)),
		[showAllSubs, subscriptions],
	);

	const visibleActivities = useMemo(() => activities.slice(0, 5), [activities]);

	const hasActivityFeed = activities.length > 0 || subscriptions.length > 0;

	return (
		<div className={styles.panel}>
			<h3 className={styles.title}>Активность</h3>

			<div className={styles.feedSection}>
				<div className={styles.tabs}>
					{TABS.map((tab) => (
						<button
							key={tab.id}
							type="button"
							className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
							onClick={() => setActiveTab(tab.id)}
						>
							{tab.label}
						</button>
					))}
				</div>

				{!hasActivityFeed && (
					<div className={styles.emptyState}>
						<p className={styles.emptyText}>Здесь пока нет активности</p>
					</div>
				)}

				{hasActivityFeed && activeTab !== 'following' && (
					<div className={styles.activityFeed}>
						{visibleActivities.length > 0 ? (
							visibleActivities.map((activity) => {
								const activityTarget = getActivityTarget(activity);
								const { icon: Icon, text } = getActivityMeta(activity);
								const content = (
									<>
										<div className={styles.activityIconWrap}>
											<Icon size={20} className={styles.activityIcon} />
										</div>
										<div className={styles.activityContent}>
											<div className={styles.activityHeadline}>{text}</div>
											<div className={styles.activityTime}>
												{formatRelativeTime(activity.createdAt)}
											</div>
										</div>
									</>
								);

								return activityTarget ? (
									<button
										key={activity.activityId}
										className={`${styles.activityCard} ${styles.activityCardButton}`}
										onClick={() => navigate(activityTarget)}
										type="button"
									>
										{content}
									</button>
								) : (
									<div key={activity.activityId} className={styles.activityCard}>
										{content}
									</div>
								);
							})
						) : (
							<div className={styles.emptyState}>
								<p className={styles.emptyText}>Событий пока нет</p>
							</div>
						)}
					</div>
				)}

				{hasActivityFeed && activeTab === 'following' && (
					<div className={styles.followingSection}>
						{visibleSubscriptions.length > 0 ? (
							<div className={styles.followingList}>
								{visibleSubscriptions.map((subscription) => (
									<div key={subscription.id} className={styles.followingCard}>
										<button
											className={styles.followingProfile}
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
											<div className={styles.followingContent}>
												<div className={styles.subscriptionNickname}>
													{subscription.nickname}
												</div>
												<div className={styles.followingMeta}>Following</div>
											</div>
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
							</div>
						) : (
							<div className={styles.emptyState}>
								<p className={styles.emptyText}>Подписок пока нет</p>
							</div>
						)}

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
				)}
			</div>
		</div>
	);
};
