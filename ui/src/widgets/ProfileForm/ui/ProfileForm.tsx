import { completeCurrentOnboardingStep, createMyInfo, createUserInfoDto, getAvatars } from 'features/auth';
import { useEffect, useState } from 'react';
import {
	dateToISO,
	EDUCATION_OPTIONS,
	formatDateInput,
	INDUSTRY_OPTIONS,
	SEX_OPTIONS,
	validateBirthDate,
	isRealDate,
} from 'shared/lib';
import { AvatarSelector } from 'shared/ui/AvatarSelector';
import { Button } from 'shared/ui/Button';
import { InputField } from 'shared/ui/InputField';
import { Select } from 'shared/ui/Select';
import styles from './styles.module.css';
import type { Avatar } from 'shared/ui/AvatarSelector';

export interface Experience {
	id: string;
	industry: string;
	startDate: string;
	endDate: string;
}

export interface ProfileFormProps {
	email: string;
	onSubmit: () => void;
	onBack: () => void;
}

const LOCAL_AVATARS: Avatar[] = [
	{ id: '1', url: '/avatars/avatar1.svg' },
	{ id: '2', url: '/avatars/avatar2.svg' },
	{ id: '3', url: '/avatars/avatar3.svg' },
	{ id: '4', url: '/avatars/avatar4.svg' },
	{ id: '5', url: '/avatars/avatar5.svg' },
	{ id: '6', url: '/avatars/avatar6.svg' },
];

export const ProfileForm = ({ email, onSubmit, onBack }: ProfileFormProps) => {
	const [avatarId, setAvatarId] = useState<string | null>(null);
	const [nickname, setNickname] = useState('');
	const [sex, setSex] = useState('');
	const [birthDate, setBirthDate] = useState('');
	const [education, setEducation] = useState('');
	const [industry, setIndustry] = useState('');
	const [experiences, setExperiences] = useState<Experience[]>([]);

	const [avatarError, setAvatarError] = useState('');
	const [nicknameError, setNicknameError] = useState('');
	const [sexError, setSexError] = useState('');
	const [birthDateError, setBirthDateError] = useState('');
	const [educationError, setEducationError] = useState('');
	const [industryError, setIndustryError] = useState('');
	const [experienceError, setExperienceError] = useState('');

	const [isLoading, setIsLoading] = useState(false);
	const [generalError, setGeneralError] = useState('');

	const [avatars, setAvatars] = useState<Avatar[]>(LOCAL_AVATARS);

	useEffect(() => {
		let isMounted = true;

		getAvatars()
			.then((items) => {
				if (!isMounted || items.length === 0) return;
				setAvatars(items.map((avatar) => ({ id: avatar.iconId, url: avatar.link })));
			})
			.catch(() => undefined);

		return () => {
			isMounted = false;
		};
	}, []);

	const validateNickname = (value: string): string => {
		if (!value) return 'Обязательное поле';
		if (value.length < 3 || value.length > 30) return 'Длина от 3 до 30 символов';
		if (!/^[a-z0-9._]+$/.test(value)) return 'Только a-z, 0-9, _, .';
		if (/^[._]/.test(value) || /[._]$/.test(value))
			return 'Не должно начинаться/заканчиваться на . или _';
		if (/[._]{2,}/.test(value)) return 'Нет двойных спецсимволов';
		return '';
	};

	const validateBirthDate = (value: string): string => {
		if (!value) return 'Обязательное поле';
		if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return 'Формат: ДД.ММ.ГГГГ';
		if (!isRealDate(value)) return 'Некорректная дата';
		const [day, month, year] = value.split('.').map(Number);
		const birth = new Date(year, month - 1, day);
		const today = new Date();
		let age = today.getFullYear() - birth.getFullYear();
		const m = today.getMonth() - birth.getMonth();
		if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
		if (age < 18) return 'Возраст от 18 лет';
		if (age > 120) return 'Некорректная дата';
		return '';
	};

	const handleNicknameChange = (value: string) => {
		const lower = value.toLowerCase();
		setNickname(lower);
		setNicknameError(validateNickname(lower));
	};

	const handleBirthDateChange = (value: string) => {
		const formatted = formatDateInput(value);
		setBirthDate(formatted);
		setBirthDateError(validateBirthDate(formatted));
	};

	const addExperience = () => {
		setExperiences([
			...experiences,
			{ id: Date.now().toString(), industry: '', startDate: '', endDate: '' },
		]);
	};

	const removeExperience = (id: string) => {
		setExperiences(experiences.filter((exp) => exp.id !== id));
	};

	const updateExperience = (id: string, field: keyof Experience, value: string) => {
		setExperiences(
			experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp)),
		);
		setExperienceError('');
	};

	const validateExperiences = (): string => {
		for (const exp of experiences) {
			const hasAnyValue = Boolean(exp.industry || exp.startDate || exp.endDate);
			if (!hasAnyValue) continue;
			if (!exp.industry) return 'Укажите сферу деятельности для каждого опыта';
			if (!exp.startDate) return 'Укажите дату начала для каждого опыта';
			if (!isRealDate(exp.startDate)) return 'Проверьте дату начала опыта';
			if (exp.endDate && !isRealDate(exp.endDate)) return 'Проверьте дату окончания опыта';
			if (exp.endDate) {
				const startedAt = new Date(dateToISO(exp.startDate)).getTime();
				const finishedAt = new Date(dateToISO(exp.endDate)).getTime();
				if (finishedAt < startedAt) return 'Дата окончания опыта не может быть раньше даты начала';
			}
		}

		return '';
	};

	const isFormValid = () =>
		avatarId &&
		!nicknameError &&
		nickname &&
		!sexError &&
		sex &&
		!birthDateError &&
		birthDate &&
		!educationError &&
		education &&
		!industryError &&
		industry;

	const handleSubmit = async () => {
		setAvatarError(avatarId ? '' : 'Обязательное поле');
		setNicknameError(validateNickname(nickname));
		setSexError(sex ? '' : 'Обязательное поле');
		setBirthDateError(validateBirthDate(birthDate));
		setEducationError(education ? '' : 'Обязательное поле');
		setIndustryError(industry ? '' : 'Обязательное поле');
		const nextExperienceError = validateExperiences();
		setExperienceError(nextExperienceError);

		if (!isFormValid() || nextExperienceError) return;

		setIsLoading(true);
		setGeneralError('');

		try {
			const birthDateISO = dateToISO(birthDate);
			const expWithISO = experiences
				.filter((exp) => exp.industry && exp.startDate)
				.map((exp) => ({
					industry: exp.industry,
					startDate: dateToISO(exp.startDate),
					endDate: exp.endDate ? dateToISO(exp.endDate) : null,
				}));
			const dto = createUserInfoDto({
				avatarId: avatarId!,
				nickname,
				sex: sex as any,
				birthDate: birthDateISO,
				education,
				industry,
				experiences: expWithISO,
			});
			await createMyInfo(dto);
			await completeCurrentOnboardingStep().catch(() => undefined);
			onSubmit();
		} catch (err: any) {
			setGeneralError(err.response?.data?.message || 'Ошибка сохранения профиля');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.titleBlock}>
				<p className={styles.eyebrow}>Шаг 3 из 3</p>
				<h1 className={styles.title}>Заполните профиль</h1>
				<p className={styles.subtitle}>
					Добавьте основные данные, чтобы профиль сразу выглядел полным и полезным.
				</p>
			</div>

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
						onChange={handleNicknameChange}
						placeholder="username"
						required
						error={nicknameError}
					/>
					<Select
						label="Пол"
						options={SEX_OPTIONS}
						value={sex}
						onChange={(v) => {
							setSex(v);
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
						onChange={(v) => {
							setEducation(v);
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
						onChange={(v) => {
							setIndustry(v);
							setIndustryError('');
						}}
						placeholder="Выберите сферу"
						required
						error={industryError}
					/>
				</div>
			</div>

			<div className={styles.section}>
				<div className={styles.sectionHeader}>
					<div>
						<h2 className={styles.sectionTitle}>Опыт работы</h2>
						<p className={styles.sectionDescription}>
							Эту часть можно пропустить, если опыта пока нет. Если добавляете опыт, указывайте сферу и дату начала.
						</p>
					</div>
					<Button variant="secondary" size="small" onClick={addExperience}>
						Добавить опыт
					</Button>
				</div>

				{experiences.length > 0 ? (
					<div className={styles.experienceList}>
						{experiences.map((exp, index) => (
							<div key={exp.id} className={styles.experienceCard}>
								<div className={styles.experienceCardHeader}>
									<h3 className={styles.experienceCardTitle}>Опыт #{index + 1}</h3>
									<button
										type="button"
										className={styles.removeExperience}
										onClick={() => removeExperience(exp.id)}
									>
										Удалить
									</button>
								</div>

								<div className={styles.fieldsGrid}>
									<Select
										label="Сфера"
										options={INDUSTRY_OPTIONS}
										value={exp.industry}
										onChange={(v) => updateExperience(exp.id, 'industry', v)}
										placeholder="Выберите сферу"
									/>
									<InputField
										label="Дата начала"
										value={exp.startDate}
										onChange={(v) =>
											updateExperience(exp.id, 'startDate', formatDateInput(v))
										}
										placeholder="ДД.ММ.ГГГГ"
										maxLength={10}
									/>
									<InputField
										label="Дата окончания"
										value={exp.endDate}
										onChange={(v) =>
											updateExperience(exp.id, 'endDate', formatDateInput(v))
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
						Опыт пока не добавлен. Его можно заполнить позже в настройках профиля.
					</div>
				)}

				{experienceError && <div className={styles.generalError}>{experienceError}</div>}
			</div>

			{generalError && <div className={styles.generalError}>{generalError}</div>}

			<div className={styles.submitButton}>
				<Button
					variant="primary"
					size="large"
					fullWidth
					onClick={handleSubmit}
					disabled={isLoading}
				>
					{isLoading ? 'Сохранение...' : 'Продолжить'}
				</Button>
			</div>
		</div>
	);
};
