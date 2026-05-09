import { createUserInfoDto, getAvatars, getMyInfo, updateMyInfo } from 'features/auth';
import { useProfile } from 'features/profile';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	dateToISO,
	EDUCATION_OPTIONS,
	formatDateInput,
	INDUSTRY_OPTIONS,
	isoToDisplayDate,
	isRealDate,
	mapEducationLevelToFormValue,
	mapSpecializationToIndustryValue,
	SEX_OPTIONS,
	validateBirthDate,
} from 'shared/lib';
import { CenterGlow, HeaderGlow } from 'shared/ui';
import { AvatarSelector } from 'shared/ui/AvatarSelector';
import { Button } from 'shared/ui/Button';
import { InputField } from 'shared/ui/InputField';
import { Select } from 'shared/ui/Select';
import { Spinner } from 'shared/ui/Spinner';
import { UserNavButton } from 'shared/ui/UserNavButton';
import styles from './EditProfilePage.module.css';
import type { Avatar } from 'shared/ui/AvatarSelector';
import type { UserInfoDto } from 'entities/user';

type ExperienceFormItem = {
	id: string;
	industry: string;
	startDate: string;
	endDate: string;
};

const LOCAL_AVATARS: Avatar[] = [
	{ id: '1', url: '/assets/avatars/avatar1.png' },
	{ id: '2', url: '/assets/avatars/avatar2.png' },
	{ id: '3', url: '/assets/avatars/avatar3.png' },
	{ id: '4', url: '/assets/avatars/avatar4.png' },
	{ id: '5', url: '/assets/avatars/avatar5.png' },
	{ id: '6', url: '/assets/avatars/avatar6.png' },
];

export const EditProfilePage = () => {
	const navigate = useNavigate();
	const { profile, loading, error } = useProfile();

	const [avatarId, setAvatarId] = useState<string | null>(null);
	const [nickname, setNickname] = useState('');
	const [sex, setSex] = useState('');
	const [birthDate, setBirthDate] = useState('');
	const [education, setEducation] = useState('');
	const [industry, setIndustry] = useState('');
	const [experiences, setExperiences] = useState<ExperienceFormItem[]>([]);
	const [avatars, setAvatars] = useState<Avatar[]>(LOCAL_AVATARS);
	const [rawProfile, setRawProfile] = useState<UserInfoDto | null>(null);
	const [detailsLoading, setDetailsLoading] = useState(true);

	const [avatarError, setAvatarError] = useState('');
	const [sexError, setSexError] = useState('');
	const [birthDateError, setBirthDateError] = useState('');
	const [educationError, setEducationError] = useState('');
	const [industryError, setIndustryError] = useState('');
	const [experienceError, setExperienceError] = useState('');
	const [isSaving, setIsSaving] = useState(false);
	const [saveError, setSaveError] = useState('');

	useEffect(() => {
		let ignore = false;

		const fetchEditProfileData = async () => {
			try {
				setDetailsLoading(true);
				const [userInfo, avatarItems] = await Promise.all([
					getMyInfo(),
					getAvatars().catch(() => []),
				]);

				if (ignore) return;

				const nextAvatars =
					avatarItems.length > 0
						? avatarItems.map((avatar) => ({ id: avatar.iconId, url: avatar.link }))
						: LOCAL_AVATARS;

				setAvatars(nextAvatars);
				setRawProfile(userInfo);
				setAvatarId(userInfo.iconId || nextAvatars[0]?.id || null);
				setNickname(userInfo.name);
				setSex(userInfo.sex ?? '');
				setBirthDate(isoToDisplayDate(userInfo.birthday));
				setEducation(mapEducationLevelToFormValue(userInfo.education));
				setIndustry(mapSpecializationToIndustryValue(userInfo.specialization));
				setExperiences(
					(userInfo.workExperience ?? []).map((experience, index) => ({
						id: `${experience.startedAt}-${index}`,
						industry: mapSpecializationToIndustryValue(experience.specialization),
						startDate: isoToDisplayDate(experience.startedAt),
						endDate: isoToDisplayDate(experience.finishedAt),
					})),
				);
			} catch {
				if (!ignore) {
					setSaveError('Не удалось загрузить данные для редактирования профиля.');
				}
			} finally {
				if (!ignore) {
					setDetailsLoading(false);
				}
			}
		};

		fetchEditProfileData();

		return () => {
			ignore = true;
		};
	}, []);

	const pageError = error || (!detailsLoading && !rawProfile ? 'Не удалось загрузить профиль' : '');

	const handleBirthDateChange = (value: string) => {
		const formatted = formatDateInput(value);
		setBirthDate(formatted);
		setBirthDateError(validateBirthDate(formatted));
	};

	const addExperience = () => {
		setExperiences((prev) => [
			...prev,
			{ id: Date.now().toString(), industry: '', startDate: '', endDate: '' },
		]);
	};

	const removeExperience = (id: string) => {
		setExperiences((prev) => prev.filter((experience) => experience.id !== id));
	};

	const updateExperience = (id: string, field: keyof ExperienceFormItem, value: string) => {
		setExperiences((prev) =>
			prev.map((experience) =>
				experience.id === id ? { ...experience, [field]: value } : experience,
			),
		);
		setExperienceError('');
	};

	const validateExperiences = () => {
		for (const experience of experiences) {
			const hasAnyValue = Boolean(
				experience.industry || experience.startDate || experience.endDate,
			);
			if (!hasAnyValue) continue;
			if (!experience.industry) return 'Укажите сферу деятельности для каждого опыта';
			if (!experience.startDate) return 'Укажите дату начала для каждого опыта';
			if (!isRealDate(experience.startDate)) return 'Проверьте дату начала опыта';
			if (experience.endDate && !isRealDate(experience.endDate)) {
				return 'Проверьте дату окончания опыта';
			}

			if (experience.endDate) {
				const startedAt = new Date(dateToISO(experience.startDate)).getTime();
				const finishedAt = new Date(dateToISO(experience.endDate)).getTime();
				if (finishedAt < startedAt) {
					return 'Дата окончания опыта не может быть раньше даты начала';
				}
			}
		}

		return '';
	};

	const canSave = useMemo(
		() =>
			Boolean(avatarId) &&
			Boolean(sex) &&
			Boolean(birthDate) &&
			Boolean(education) &&
			Boolean(industry) &&
			!avatarError &&
			!sexError &&
			!birthDateError &&
			!educationError &&
			!industryError &&
			!experienceError &&
			!isSaving,
		[
			avatarError,
			avatarId,
			birthDate,
			birthDateError,
			education,
			educationError,
			experienceError,
			industry,
			industryError,
			isSaving,
			sex,
			sexError,
		],
	);

	const handleSave = async () => {
		const nextAvatarError = avatarId ? '' : 'Обязательное поле';
		const nextSexError = sex ? '' : 'Обязательное поле';
		const nextBirthDateError = validateBirthDate(birthDate);
		const nextEducationError = education ? '' : 'Обязательное поле';
		const nextIndustryError = industry ? '' : 'Обязательное поле';
		const nextExperienceError = validateExperiences();

		setAvatarError(nextAvatarError);
		setSexError(nextSexError);
		setBirthDateError(nextBirthDateError);
		setEducationError(nextEducationError);
		setIndustryError(nextIndustryError);
		setExperienceError(nextExperienceError);

		if (
			!rawProfile ||
			nextAvatarError ||
			nextSexError ||
			nextBirthDateError ||
			nextEducationError ||
			nextIndustryError ||
			nextExperienceError
		) {
			return;
		}

		setIsSaving(true);
		setSaveError('');

		try {
			const dto = createUserInfoDto({
				avatarId: avatarId!,
				nickname: rawProfile.name,
				sex: sex as UserInfoDto['sex'],
				birthDate: dateToISO(birthDate),
				education,
				industry,
				experiences: experiences
					.filter((experience) => experience.industry && experience.startDate)
					.map((experience) => ({
						industry: experience.industry,
						startDate: dateToISO(experience.startDate),
						endDate: experience.endDate ? dateToISO(experience.endDate) : null,
					})),
			});
			await updateMyInfo(dto);

			navigate('/profile');
		} catch {
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

	if (loading || detailsLoading) {
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

	if (pageError || !profile || !rawProfile) {
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
					<p>{pageError || 'Не удалось загрузить профиль'}</p>
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
					<div className={styles.titleBlock}>
						<p className={styles.eyebrow}>Редактирование профиля</p>
						<h1 className={styles.title}>Обновите данные профиля</h1>
						<p className={styles.subtitle}>
							Здесь можно изменить все регистрационные данные профиля, кроме никнейма.
						</p>
					</div>

					<div className={styles.form}>
						<div className={styles.section}>
							<h2 className={styles.sectionTitle}>Аватар</h2>
							<AvatarSelector
								avatars={avatars}
								selectedId={avatarId}
								onSelect={(id) => {
									setAvatarId(id);
									setAvatarError('');
								}}
								required
								error={avatarError}
							/>
						</div>

						<div className={styles.section}>
							<h2 className={styles.sectionTitle}>Основные данные</h2>
							<div className={styles.fieldsGrid}>
								<InputField
									label="Никнейм"
									value={nickname}
									onChange={() => undefined}
									placeholder="Никнейм"
									disabled
									readOnly
								/>
								<Select
									label="Пол"
									options={SEX_OPTIONS}
									value={sex}
									onChange={(value) => {
										setSex(value);
										setSexError('');
									}}
									placeholder="Выберите пол"
									required
									error={sexError}
								/>
								<InputField
									label="Дата рождения"
									value={birthDate}
									onChange={handleBirthDateChange}
									placeholder="ДД.ММ.ГГГГ"
									required
									error={birthDateError}
									maxLength={10}
								/>
								<Select
									label="Образование"
									options={EDUCATION_OPTIONS}
									value={education}
									onChange={(value) => {
										setEducation(value);
										setEducationError('');
									}}
									placeholder="Выберите образование"
									required
									error={educationError}
								/>
								<Select
									label="Сфера деятельности"
									options={INDUSTRY_OPTIONS}
									value={industry}
									onChange={(value) => {
										setIndustry(value);
										setIndustryError('');
									}}
									placeholder="Выберите сферу"
									required
									error={industryError}
								/>
							</div>
							<p className={styles.hint}>Никнейм зафиксирован и не редактируется со страницы профиля.</p>
						</div>

						<div className={styles.section}>
							<div className={styles.sectionHeader}>
								<div>
									<h2 className={styles.sectionTitle}>Опыт работы</h2>
									<p className={styles.sectionDescription}>
										Добавьте один или несколько периодов опыта. Поля можно оставить пустыми, если опыта пока нет.
									</p>
								</div>
								<Button variant="secondary" size="small" onClick={addExperience}>
									Добавить опыт
								</Button>
							</div>

							{experiences.length > 0 ? (
								<div className={styles.experienceList}>
									{experiences.map((experience, index) => (
										<div key={experience.id} className={styles.experienceCard}>
											<div className={styles.experienceCardHeader}>
												<h3 className={styles.experienceCardTitle}>Опыт #{index + 1}</h3>
												<button
													type="button"
													className={styles.removeExperience}
													onClick={() => removeExperience(experience.id)}
												>
													Удалить
												</button>
											</div>
											<div className={styles.fieldsGrid}>
												<Select
													label="Сфера"
													options={INDUSTRY_OPTIONS}
													value={experience.industry}
													onChange={(value) =>
														updateExperience(experience.id, 'industry', value)
													}
													placeholder="Выберите сферу"
												/>
												<InputField
													label="Дата начала"
													value={experience.startDate}
													onChange={(value) =>
														updateExperience(
															experience.id,
															'startDate',
															formatDateInput(value),
														)
													}
													placeholder="ДД.ММ.ГГГГ"
													maxLength={10}
												/>
												<InputField
													label="Дата окончания"
													value={experience.endDate}
													onChange={(value) =>
														updateExperience(
															experience.id,
															'endDate',
															formatDateInput(value),
														)
													}
													placeholder="ДД.ММ.ГГГГ"
													maxLength={10}
												/>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className={styles.emptyExperience}>
									Опыт пока не добавлен. При необходимости можно заполнить позже.
								</div>
							)}

							{experienceError && <div className={styles.error}>{experienceError}</div>}
						</div>

						<div className={styles.section}>
							<h2 className={styles.sectionTitle}>Никнейм</h2>
							<InputField
								label="Никнейм"
								value={nickname}
								onChange={() => undefined}
								placeholder="Никнейм"
								disabled
								readOnly
							/>
							<p className={styles.hint}>
								Никнейм используется как публичный идентификатор профиля и сейчас недоступен для редактирования.
							</p>
						</div>

						{saveError && <div className={styles.error}>{saveError}</div>}

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
								disabled={!canSave}
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
