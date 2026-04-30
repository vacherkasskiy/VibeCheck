import { useQuery } from '@tanstack/react-query';
import { userApi } from 'entities/user';
import { useProfile } from 'features/profile';
import { ReviewsModal, AchievementsModal } from 'features/profile/modals';
import { UnsubscribeConfirmModal, useSubscribeMutation, useUnsubscribeMutation, useSubscriptionStatus } from 'features/subscribe';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from 'shared/ui/Button';
import { Spinner } from 'shared/ui/Spinner';
import { UserNavButton } from 'shared/ui/UserNavButton';
import { Achievements } from 'widgets/Achievements';
import { ActivityPanel } from 'widgets/ActivityPanel';
import { CombinedSubscriptionsActivity } from 'widgets/CombinedSubscriptionsActivity';
import { UserFlags } from 'widgets/UserFlags';
import { UserReviews } from 'widgets/UserReviews';
import styles from './UserProfilePage.module.css';
import type { UserProfileData } from 'entities/user';

export const UserProfilePage = () => {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const { profile: currentUserProfile } = useProfile();
	const currentUserId = currentUserProfile?.user?.id ?? '';
	const [profile, setProfile] = useState<UserProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showAchievementsModal, setShowAchievementsModal] = useState(false);
	const [showReviewsModal, setShowReviewsModal] = useState(false);
	const [showUnsubscribeModal, setShowUnsubscribeModal] = useState(false);

	const isOwnProfile = userId === currentUserId;

	const { data: isSubscribed = false, isLoading: statusLoading, error: statusError } = useSubscriptionStatus(userId, isOwnProfile);

	const subscribeMutation = useSubscribeMutation();
	const unsubscribeMutation = useUnsubscribeMutation();
	const isPending = subscribeMutation.isPending || unsubscribeMutation.isPending || statusLoading;
	const buttonDisabled = isPending || !!statusError;

	// Tooltip not supported in Button, error handled by disabled + data=false fallback

	useEffect(() => {
		const loadProfile = async () => {
			if (!userId) {
				setError('ID пользователя не указан');
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const profileData = await userApi.fetchUserProfileById(userId);
				setProfile(profileData);
			} catch (err) {
				setError('Ошибка загрузки профиля');
			} finally {
				setLoading(false);
			}
		};

		loadProfile();
	}, [userId]);

	const handleToggleSubscription = () => {
		if (!userId || isOwnProfile) return;
		if (isSubscribed) {
			setShowUnsubscribeModal(true);
		} else {
			subscribeMutation.mutate(userId);
		}
	};

	const handleConfirmUnsubscribe = () => {
		unsubscribeMutation.mutate(userId!);
		setShowUnsubscribeModal(false);
	};

	const handleCloseUnsubscribeModal = () => {
		setShowUnsubscribeModal(false);
	};

	const handleViewAllAchievements = () => {
		setShowAchievementsModal(true);
	};

	const handleViewAllReviews = () => {
		setShowReviewsModal(true);
	};

	const formatRegistrationDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString('ru-RU', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		});
	};

	if (loading) {
		return (
			<div className={styles.page}>
				<header className={styles.header}>
					<div
						className={styles.logoContainer}
						onClick={() => navigate('/recommendations')}
					>
						<img
							src="/assets/vibecheck-favicon.png"
							alt="VibeCheck"
							className={styles.logo}
						/>
						<span className={styles.logoText}>VibeCheck</span>
					</div>
				</header>
				<div className={styles.spinnerWrapper}>
					<Spinner />
				</div>
			</div>
		);
	}

	if (error || !profile) {
		return (
			<div className={styles.page}>
				<header className={styles.header}>
					<div
						className={styles.logoContainer}
						onClick={() => navigate('/recommendations')}
					>
						<img
							src="/assets/vibecheck-favicon.png"
							alt="VibeCheck"
							className={styles.logo}
						/>
						<span className={styles.logoText}>VibeCheck</span>
					</div>
				</header>
				<div className={styles.errorMessage}>
					<h2>Ошибка загрузки</h2>
					<p>{error || 'Не удалось загрузить профиль'}</p>
					<Button onClick={() => navigate('/recommendations')} variant="primary">
						Вернуться к списку
					</Button>
				</div>
			</div>
		);
	}

	const { user, flags, achievements, reviews } = profile;

	return (
		<div className={styles.page}>
			<header className={styles.header}>
				<div className={styles.logoContainer} onClick={() => navigate('/recommendations')}>
					<img
						src="/assets/vibecheck-favicon.png"
						alt="VibeCheck"
						className={styles.logo}
					/>
					<span className={styles.logoText}>VibeCheck</span>
				</div>
				<div className={styles.headerActions}>
					<UserNavButton
						avatarUrl={currentUserProfile?.user?.avatarUrl}
						nickname={currentUserProfile?.user?.nickname}
					/>
				</div>
			</header>

			<main className={styles.main}>
				<div className={styles.profileHeader}>
					<div className={styles.avatarSection}>
						<div className={styles.avatar}>
							{user.avatarUrl ? (
								<img src={user.avatarUrl} alt={user.nickname} />
							) : (
								<div className={styles.avatarPlaceholder}>
									{user.nickname.charAt(0).toUpperCase()}
								</div>
							)}
						</div>
					</div>

					<div className={styles.infoSection}>
						<h1 className={styles.nickname}>{user.nickname}</h1>
						<div className={styles.levelInfo}>
							<span className={styles.level}>Уровень {user.level}</span>
							<span className={styles.levelLabel}>{user.levelLabel}</span>
						</div>
						<div className={styles.registrationDate}>
						На платформе с {formatRegistrationDate(user.createdAt!)}

						</div>
					</div>

					{!isOwnProfile && (
						<div className={styles.actionsSection}>
	{isSubscribed ? (
		<Button
			variant="secondary"
			onClick={handleToggleSubscription}
			disabled={buttonDisabled}
		>
			{statusLoading ? <Spinner /> : null}
			{isPending ? 'Загрузка...' : 'Отписаться'}
		</Button>
	) : (
		<Button
			variant="primary"
			onClick={handleToggleSubscription}
			disabled={buttonDisabled}
		>
			{statusLoading ? <Spinner /> : null}
			{isPending ? 'Загрузка...' : 'Подписаться'}
		</Button>
	)}
						</div>
					)}
				</div>

		<div className={styles.sections}>
			<section className={styles.section}>
				<UserFlags flags={flags} onEditFlags={() => {}} />
			</section>

			<section className={styles.section}>
				<UserReviews
					reviews={reviews}
					onViewAll={handleViewAllReviews}
					onEdit={() => {}}
					onDelete={() => {}}
				/>
			</section>

			<section className={styles.section}>
				<Achievements
					achievements={achievements}
					onViewAll={handleViewAllAchievements}
				/>
			</section>

			<section className={styles.section}>
				<CombinedSubscriptionsActivity userId={userId!} />
			</section>
		</div>
			</main>

			<AchievementsModal
				isOpen={showAchievementsModal}
				onClose={() => setShowAchievementsModal(false)}
				achievements={achievements}
			/>

			<ReviewsModal
				isOpen={showReviewsModal}
				onClose={() => setShowReviewsModal(false)}
				reviews={reviews}
				onDelete={() => {}}
				canEdit={() => false}
			/>
			<UnsubscribeConfirmModal
				isOpen={showUnsubscribeModal}
				onClose={handleCloseUnsubscribeModal}
				onConfirm={handleConfirmUnsubscribe}
				userNickname={user.nickname}
			/>
		</div>
	);
};
