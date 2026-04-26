import { useProfile } from 'features/profile';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CenterGlow, HeaderGlow } from 'shared/ui';
import { AvatarSelector } from 'shared/ui/AvatarSelector';
import { Button } from 'shared/ui/Button';
import { InputField } from 'shared/ui/InputField';
import { Spinner } from 'shared/ui/Spinner';
import { TextAreaField } from 'shared/ui/TextAreaField';
import { UserNavButton } from 'shared/ui/UserNavButton';
import styles from './EditProfilePage.module.css';
import type { Avatar } from 'shared/ui/AvatarSelector';

export const EditProfilePage = () => {
	const navigate = useNavigate();
	const { profile, loading, error, updateProfile } = useProfile();

	const [avatarId, setAvatarId] = useState<string | null>(null);
	const [nickname, setNickname] = useState('');
	const [experience, setExperience] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState('');

	const [avatars] = useState<Avatar[]>([
		{ id: '1', url: '/assets/avatars/avatar1.png' },
		{ id: '2', url: '/assets/avatars/avatar2.png' },
		{ id: '3', url: '/assets/avatars/avatar3.png' },
		{ id: '4', url: '/assets/avatars/avatar4.png' },
		{ id: '5', url: '/assets/avatars/avatar5.png' },
		{ id: '6', url: '/assets/avatars/avatar6.png' },
	]);

	useEffect(() => {
		if (profile?.user) {
			const user = profile.user;
			setNickname(user.nickname);
			setExperience(user.experience);
			if (user.avatarUrl) {
				const avatar = avatars.find((a) => a.url === user.avatarUrl);
				if (avatar) {
					setAvatarId(avatar.id);
				}
			}
		}
	}, [profile, avatars]);

	const handleSave = async () => {
		if (!nickname.trim()) {
			setSaveError('Имя не может быть пустым');
			return;
		}

		setIsSaving(true);
		setSaveError('');

		try {
			const selectedAvatar = avatars.find((a) => a.id === avatarId);
			const avatarUrl = selectedAvatar?.url || profile?.user?.avatarUrl;

			await updateProfile({
				nickname,
				experience,
				avatarUrl,
			});

			navigate('/profile');
		} catch (err) {
			setSaveError('Не удалось сохранить изменения. Попробуйте позже.');
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		navigate('/profile');
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
					<Button onClick={() => navigate('/profile')} variant="primary">
						Вернуться к профилю
					</Button>
				</div>
			</div>
		);
	}

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
						avatarUrl={profile?.user?.avatarUrl}
						nickname={profile?.user?.nickname}
					/>
				</div>
			</header>

			<main className={styles.main}>
				<div className={styles.container}>
					<h1 className={styles.title}>Редактирование профиля</h1>

					<div className={styles.form}>
						{/* Аватар */}
						<div className={styles.section}>
							<h2 className={styles.sectionTitle}>Аватар</h2>
							<AvatarSelector
								avatars={avatars}
								selectedId={avatarId}
								onSelect={(id) => setAvatarId(id)}
							/>
						</div>

						{/* Имя */}
						<div className={styles.section}>
							<h2 className={styles.sectionTitle}>Имя</h2>
							<InputField
								label="Никнейм"
								value={nickname}
								onChange={setNickname}
								placeholder="Введите никнейм"
								required
							/>
						</div>

						{/* Опыт работы */}
						<div className={styles.section}>
							<h2 className={styles.sectionTitle}>Опыт работы</h2>
							<TextAreaField
								label="Опыт работы"
								value={experience}
								onChange={setExperience}
								placeholder="Расскажите о вашем опыте работы..."
							/>
						</div>

						{/* Ошибка сохранения */}
						{saveError && <div className={styles.error}>{saveError}</div>}

						{/* Кнопки */}
						<div className={styles.buttons}>
							<Button
								variant="secondary"
								size="small"
								onClick={handleCancel}
								disabled={isSaving}
							>
								Отмена
							</Button>
							<Button
								variant="primary"
								size="small"
								onClick={handleSave}
								disabled={isSaving}
							>
								{isSaving ? 'Сохранение...' : 'Сохранить изменения'}
							</Button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};
