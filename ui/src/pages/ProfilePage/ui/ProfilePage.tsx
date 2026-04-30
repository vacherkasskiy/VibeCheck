import { useUserActivity } from 'entities/activity';
import { userApi } from 'entities/user';
import { useProfile } from 'features/profile';
import { AchievementsModal, ReviewsModal, DeleteReviewModal } from 'features/profile/modals';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared/ui/Button';
import { Spinner } from 'shared/ui/Spinner';
import { useToast } from 'shared/ui/Toast';
import { UserNavButton } from 'shared/ui/UserNavButton';
import { Achievements } from 'widgets/Achievements';
import { ActivityPanel } from 'widgets/ActivityPanel';
import { ProfileHeader } from 'widgets/ProfileHeader';
import { UserFlags } from 'widgets/UserFlags';
import { UserReviews } from 'widgets/UserReviews';
import styles from './ProfilePage.module.css';

export const ProfilePage = () => {
	const navigate = useNavigate();
	const { showToast } = useToast();
	const { profile, loading, error } = useProfile();
	const { data: activities = [] } = useUserActivity(5, !!profile);
	const [showAchievementsModal, setShowAchievementsModal] = useState(false);
	const [showReviewsModal, setShowReviewsModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [reviewToDelete, setReviewToDelete] = useState<{
		id: string;
		companyName: string;
	} | null>(null);
	const [removedSubscriptionIds, setRemovedSubscriptionIds] = useState<string[]>([]);

	const handleEditProfile = () => {
		navigate('/profile/edit');
	};

	const handleNavToRecommendations = () => {
		if (!profile?.flags || (profile.flags.green.length + profile.flags.red.length === 0)) {
			showToast('Выберите хотя бы один green или red флаг на странице флагов, чтобы разблокировать рекомендации', 'error');
			navigate('/flags');
			return;
		}
		navigate('/recommendations');
	};

	const handleEditFlags = () => {
		navigate('/flags');
	};

	const handleViewAllAchievements = () => {
		setShowAchievementsModal(true);
	};

	const handleViewAllReviews = () => {
		setShowReviewsModal(true);
	};

	const handleEditReview = (reviewId: string) => {
		// TODO: Implement edit review modal
		console.log('Edit review:', reviewId);
	};

	const handleDeleteReview = (reviewId: string) => {
		const review = reviews.find((r) => r.id === reviewId);
		if (review) {
			setReviewToDelete({ id: reviewId, companyName: review.companyName });
			setShowDeleteModal(true);
		}
	};

	const handleConfirmDelete = () => {
		if (reviewToDelete) {
			// TODO: Implement delete review API call
			console.log('Deleting review:', reviewToDelete.id);
			setReviewToDelete(null);
			setShowDeleteModal(false);
		}
	};

	const handleUnsubscribe = async (authorId: string) => {
		try {
			await userApi.unsubscribeFromUser(authorId);
			setRemovedSubscriptionIds((prev) => [...prev, authorId]);
		} catch (err) {
			console.error('Failed to unsubscribe:', err);
		}
	};

	const canEditReview = (createdAt: string): boolean => {
		const created = new Date(createdAt).getTime();
		const now = Date.now();
		const fiveMinutes = 5 * 60 * 1000;
		return now - created <= fiveMinutes;
	};

	if (loading) {
		return (
			<div className={styles.page}>
				<header className={styles.header}>
					<div
						className={styles.logoContainer}
						onClick={handleNavToRecommendations}
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
						onClick={handleNavToRecommendations}
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
					<Button onClick={handleNavToRecommendations} variant="primary">
						Вернуться к списку
					</Button>
				</div>
			</div>
		);
	}

	const { user, flags, achievements, reviews, subscriptions } = profile;
	const visibleSubscriptions = subscriptions.filter(
		(subscription) => !removedSubscriptionIds.includes(subscription.userId),
	);

	return (
			<div className={styles.page}>
				<header className={styles.header}>
					<div className={styles.logoContainer} onClick={handleNavToRecommendations}>
						<img
							src="/assets/vibecheck-favicon.png"
							alt="VibeCheck"
							className={styles.logo}
						/>
						<span className={styles.logoText}>VibeCheck</span>
					</div>
					<div className={styles.headerActions}>
						<UserNavButton
							avatarUrl={profile?.user?.avatarUrl}
							nickname={profile?.user?.nickname}
						/>
					</div>
				</header>

			<main className={styles.main}>
				<ProfileHeader user={user} onEditProfile={handleEditProfile} />

				<div className={styles.sections}>
					<section className={styles.section}>
						<Achievements
							achievements={achievements}
							onViewAll={handleViewAllAchievements}
						/>
					</section>

					<section className={styles.section}>
						<UserFlags flags={flags} onEditFlags={handleEditFlags} />
					</section>

					<section className={styles.section}>
						<UserReviews
							reviews={reviews}
							onViewAll={handleViewAllReviews}
							onEdit={handleEditReview}
							onDelete={handleDeleteReview}
						/>
					</section>

					<section className={styles.section}>
						<ActivityPanel
							subscriptions={visibleSubscriptions}
							activities={activities}
							reviewsCount={reviews.length}
							flagsCount={flags.green.length + flags.red.length}
							likesReceived={reviews.reduce(
								(sum, review) => sum + review.reactions.likes,
								0,
							)}
							onUnsubscribe={handleUnsubscribe}
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
				onDelete={handleDeleteReview}
				canEdit={canEditReview}
			/>

			<DeleteReviewModal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				onConfirm={handleConfirmDelete}
				reviewCompanyName={reviewToDelete?.companyName || ''}
			/>
		</div>
	);
};
