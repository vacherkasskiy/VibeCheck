import { useProfile } from 'features/profile';
import { ReviewsModal, AchievementsModal } from 'features/profile/modals';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CenterGlow, HeaderGlow } from 'shared/ui';
import { Button } from 'shared/ui/Button';
import { Spinner } from 'shared/ui/Spinner';
import { UserNavButton } from 'shared/ui/UserNavButton';
import { Achievements } from 'widgets/Achievements';
import { UserFlags } from 'widgets/UserFlags';
import { UserReviews } from 'widgets/UserReviews';
import styles from './UserProfilePage.module.css';
import type { UserProfileData, User } from 'entities/user';

const fetchUserProfile = async (userId: string): Promise<UserProfileData | null> => {
	// TODO: Replace with actual API call
	return {
		user: {
			id: userId,
			nickname: 'User_' + userId.slice(0, 4),
			email: 'user@example.com',
			avatarUrl: null,
			level: 5,
			levelLabel: 'Опытный',
			levelProgress: 65,
			education: '',
			experience: '',
			expertise: '',
		},
		flags: {
			green: [],
			red: [],
		},
		achievements: [],
		reviews: [],
		activity: [],
		subscriptions: [],
	};
};

// Mock function to check if current user is subscribed to this user
const checkSubscription = async (userId: string): Promise<boolean> => {
	// TODO: Replace with actual API call
	return false;
};

// Mock function to subscribe to user
const subscribeToUser = async (userId: string): Promise<void> => {
	// TODO: Replace with actual API call
	console.log('Subscribed to user:', userId);
};

// Mock function to unsubscribe from user
const unsubscribeFromUser = async (userId: string): Promise<void> => {
	// TODO: Replace with actual API call
	console.log('Unsubscribed from user:', userId);
};

export const UserProfilePage = () => {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const { profile: currentUserProfile } = useProfile();
	const [profile, setProfile] = useState<UserProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isSubscribed, setIsSubscribed] = useState(false);
	const [subscribing, setSubscribing] = useState(false);
	const [showAchievementsModal, setShowAchievementsModal] = useState(false);
	const [showReviewsModal, setShowReviewsModal] = useState(false);

	useEffect(() => {
		const loadProfile = async () => {
			if (!userId) {
				setError('ID пользователя не указан');
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const [profileData, subscriptionStatus] = await Promise.all([
					fetchUserProfile(userId),
					checkSubscription(userId),
				]);

				if (!profileData) {
					setError('Пользователь не найден');
				} else {
					setProfile(profileData);
					setIsSubscribed(subscriptionStatus);
				}
			} catch (err) {
				setError('Ошибка загрузки профиля');
			} finally {
				setLoading(false);
			}
		};

		loadProfile();
	}, [userId]);

	const handleSubscribe = async () => {
		if (!userId || subscribing) return;

		try {
			setSubscribing(true);
			await subscribeToUser(userId);
			setIsSubscribed(true);
		} catch (err) {
			console.error('Failed to subscribe:', err);
		} finally {
			setSubscribing(false);
		}
	};

	const handleUnsubscribe = async () => {
		if (!userId || subscribing) return;

		try {
			setSubscribing(true);
			await unsubscribeFromUser(userId);
			setIsSubscribed(false);
		} catch (err) {
			console.error('Failed to unsubscribe:', err);
		} finally {
			setSubscribing(false);
		}
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
				<HeaderGlow />
				<CenterGlow />
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
				<HeaderGlow />
				<CenterGlow />
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
			<HeaderGlow />
			<CenterGlow />
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
							На платформе с {formatRegistrationDate('2024-01-15')}
						</div>
					</div>

					<div className={styles.actionsSection}>
						{isSubscribed ? (
							<Button
								variant="secondary"
								onClick={handleUnsubscribe}
								disabled={subscribing}
							>
								{subscribing ? 'Загрузка...' : 'Отписаться'}
							</Button>
						) : (
							<Button
								variant="primary"
								onClick={handleSubscribe}
								disabled={subscribing}
							>
								{subscribing ? 'Загрузка...' : 'Подписаться'}
							</Button>
						)}
					</div>
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
		</div>
	);
};
