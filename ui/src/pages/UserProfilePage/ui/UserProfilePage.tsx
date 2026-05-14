import { userApi } from 'entities/user';
import { useProfile } from 'features/profile';
import { SubscriptionButton } from 'features/subscription-toggle';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { translateEducation, translateExperience, translateSpecialization } from 'shared/lib';
import { Button } from 'shared/ui/Button';
import { CenterGlow } from 'shared/ui/CenterGlow';
import { HeaderGlow } from 'shared/ui/HeaderGlow';
import { Spinner } from 'shared/ui/Spinner';
import { UserNavButton } from 'shared/ui/UserNavButton';
import { FooterLinks } from 'widgets/FooterLinks';
import styles from './UserProfilePage.module.css';
import type { User } from 'entities/user';

export const UserProfilePage = () => {
	const { userId } = useParams<{ userId: string }>();
	const navigate = useNavigate();
	const { profile: currentUserProfile, loading: currentUserLoading } = useProfile();
	const currentUserId = currentUserProfile?.user?.id ?? '';
	const [profile, setProfile] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const isOwnProfile = !!userId && !!currentUserId && userId === currentUserId;

	useEffect(() => {
		if (isOwnProfile) {
			navigate('/profile', { replace: true });
		}
	}, [isOwnProfile, navigate]);

	useEffect(() => {
		const loadProfile = async () => {
			if (!userId) {
				setError('ID пользователя не указан');
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				const profileData = await userApi.fetchUserPublicProfileById(userId);
				setProfile(profileData);
			} catch (err) {
				setError('Ошибка загрузки профиля');
			} finally {
				setLoading(false);
			}
		};

		loadProfile();
	}, [userId]);

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

	const user = profile;

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
				<section className={styles.profileHero}>
					<div className={styles.heroAccent} />
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
						<div className={styles.identityRow}>
							<h1 className={styles.nickname}>{user.nickname}</h1>
							<div className={styles.levelInfo}>
								<span className={styles.level}>Уровень {user.level}</span>
								<span className={styles.levelLabel}>{user.levelLabel}</span>
							</div>
						</div>
						<div className={styles.registrationDate}>
							{user.createdAt && `На платформе с ${formatRegistrationDate(user.createdAt)}`}
						</div>
						<p className={styles.profileSummary}>
							Публичный профиль участника сообщества VibeCheck. Здесь можно быстро оценить бэкграунд пользователя и подписаться на его активность.
						</p>
						<div className={styles.details}>
							<div className={styles.detailItem}>
								<span className={styles.detailLabel}>Образование</span>
								<span className={styles.detailValue}>{translateEducation(user.education)}</span>
							</div>
							<div className={styles.detailItem}>
								<span className={styles.detailLabel}>Опыт</span>
								<span className={styles.detailValue}>{translateExperience(user.experience)}</span>
							</div>
							<div className={styles.detailItem}>
								<span className={styles.detailLabel}>Специализация</span>
								<span className={styles.detailValue}>{translateSpecialization(user.expertise)}</span>
							</div>
						</div>
					</div>

					{!isOwnProfile && (
						<div className={styles.actionsSection}>
							<div className={styles.actionsCard}>
								<span className={styles.actionsEyebrow}>Активность автора</span>
								<h2 className={styles.actionsTitle}>Следить за обновлениями</h2>
								<p className={styles.actionsText}>
									Подписка добавит автора в ваш список активности и позволит быстрее возвращаться к его профилю.
								</p>
								<SubscriptionButton
									authorId={user.id}
									userNickname={user.nickname}
									className={styles.subscribeButton}
								/>
							</div>
						</div>
					)}
				</section>

			</main>
			<FooterLinks />
		</div>
	);
};
