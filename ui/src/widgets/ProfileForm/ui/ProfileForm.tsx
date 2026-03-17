import { Button } from '@shared/ui/Button';
import { InputField } from '@shared/ui/InputField';
import { Select } from '@shared/ui/Select';
import { useState } from 'react';
import { mockAuth } from 'shared/model/mockAuth';
import { AvatarSelector } from 'shared/ui/AvatarSelector';
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

const SEX_OPTIONS = [
	{ value: 'SEX_MALE', label: 'Мужской' },
	{ value: 'SEX_FEMALE', label: 'Женский' },
	{ value: 'SEX_OTHER', label: 'Другое' },
];

const EDUCATION_OPTIONS = [
	{ value: 'SCHOOL', label: 'Школа' },
	{ value: 'COLLEGE', label: 'Колледж/Техникум' },
	{ value: 'BACHELOR', label: 'Бакалавриат' },
	{ value: 'MASTER', label: 'Магистратура' },
	{ value: 'SPECIALIST', label: 'Специалитет' },
	{ value: 'PHD', label: 'Аспирантура' },
	{ value: 'DOCTORATE', label: 'Докторантура' },
	{ value: 'NONE', label: 'Нет образования' },
];

const INDUSTRY_OPTIONS = [
	{ value: 'IT', label: 'Информационные технологии' },
	{ value: 'FINANCE', label: 'Финансы и банки' },
	{ value: 'MEDIA', label: 'Медиа и маркетинг' },
	{ value: 'EDUCATION', label: 'Образование' },
	{ value: 'HEALTHCARE', label: 'Здравоохранение' },
	{ value: 'MANUFACTURING', label: 'Производство' },
	{ value: 'RETAIL', label: 'Розничная торговля' },
	{ value: 'HOSPITALITY', label: 'Гостиничный бизнес и рестораны' },
	{ value: 'TRANSPORT', label: 'Транспорт и логистика' },
	{ value: 'CONSTRUCTION', label: 'Строительство' },
	{ value: 'ENERGY', label: 'Энергетика' },
	{ value: 'AGRICULTURE', label: 'Сельское хозяйство' },
	{ value: 'GOVERNMENT', label: 'Государственная служба' },
	{ value: 'NGO', label: 'Некоммерческие организации' },
	{ value: 'OTHER', label: 'Другое' },
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

	const [isLoading, setIsLoading] = useState(false);
	const [generalError, setGeneralError] = useState('');

	const [avatars] = useState<Avatar[]>([
		{ id: '1', url: '/avatars/avatar1.svg' },
		{ id: '2', url: '/avatars/avatar2.svg' },
		{ id: '3', url: '/avatars/avatar3.svg' },
		{ id: '4', url: '/avatars/avatar4.svg' },
		{ id: '5', url: '/avatars/avatar5.svg' },
		{ id: '6', url: '/avatars/avatar6.svg' },
	]);

	const validateNickname = (value: string): string => {
		if (!value) {
			return 'Обязательное поле';
		}
		if (value.length < 3 || value.length > 30) {
			return 'Длина должна быть от 3 до 30 символов';
		}
		const nicknameRegex = /^[a-z0-9._]+$/;
		if (!nicknameRegex.test(value)) {
			return 'Разрешены только a-z, 0-9, _, .';
		}
		if (value.startsWith('.') || value.startsWith('_')) {
			return 'Не должно начинаться с . или _';
		}
		if (value.endsWith('.') || value.endsWith('_')) {
			return 'Не должно заканчиваться на . или _';
		}
		if (/[._]{2,}/.test(value)) {
			return 'Нет двойных спецсимволов';
		}
		return '';
	};

	const validateBirthDate = (value: string): string => {
		if (!value) {
			return 'Обязательное поле';
		}
		const dateRegex = /^\d{2}\.\d{2}\.\d{4}$/;
		if (!dateRegex.test(value)) {
			return 'Неверный формат даты';
		}
		const [day, month, year] = value.split('.').map(Number);
		const birth = new Date(year, month - 1, day);
		const today = new Date();
		const age = today.getFullYear() - birth.getFullYear();
		const monthDiff = today.getMonth() - birth.getMonth();
		const adjustedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate()) ? age - 1 : age;

		if (adjustedAge < 18) {
			return 'Возраст должен быть от 18 лет';
		}
		if (adjustedAge > 120) {
			return 'Укажите корректную дату рождения';
		}
		return '';
	};

	const handleNicknameChange = (value: string) => {
		setNickname(value.toLowerCase());
		setNicknameError(validateNickname(value.toLowerCase()));
	};

	const handleBirthDateChange = (value: string) => {
		const numericValue = value.replace(/\D/g, '');
		let formatted = '';
		if (numericValue.length >= 2) {
			formatted += numericValue.slice(0, 2) + '.';
			if (numericValue.length >= 4) {
				formatted += numericValue.slice(2, 4) + '.';
				if (numericValue.length >= 8) {
					formatted += numericValue.slice(4, 8);
				}
			} else {
				formatted += numericValue.slice(2);
			}
		} else {
			formatted = numericValue;
		}
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
			experiences.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
		);
	};

	const isFormValid = () => {
		return (
			avatarId !== null &&
			!nicknameError &&
			nickname.length > 0 &&
			!sexError &&
			sex.length > 0 &&
			!birthDateError &&
			birthDate.length > 0 &&
			!educationError &&
			education.length > 0 &&
			!industryError &&
			industry.length > 0
		);
	};

	const handleSubmit = async () => {
		setAvatarError(avatarId ? '' : 'Обязательное поле');
		setNicknameError(validateNickname(nickname));
		setSexError(sex ? '' : 'Обязательное поле');
		setBirthDateError(validateBirthDate(birthDate));
		setEducationError(education ? '' : 'Обязательное поле');
		setIndustryError(industry ? '' : 'Обязательное поле');

		if (!isFormValid()) return;

		setIsLoading(true);
		setGeneralError('');

		try {
			const [day, month, year] = birthDate.split('.');
			const res = await mockAuth.registerComplete({
				email,
				avatarId: avatarId!,
				nickname,
				sex: sex as any,
				birthDate: `${year}-${month}-${day}`,
				education: education as any,
				industry: industry as any,
				experiences: experiences.map((exp) => ({
					industry: exp.industry as any,
					startDate: exp.startDate.split('.').reverse().join('-'),
					endDate: exp.endDate ? exp.endDate.split('.').reverse().join('-') : null,
				})),
			});

			if (res.ok) {
				onSubmit();
			} else {
				setGeneralError(res.data.message || 'Не удалось сохранить профиль. Попробуйте позже.');
			}
		} catch {
			setGeneralError('Ошибка соединения. Проверьте интернет.');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
			
				<h1 className={styles.title}>Создать аккаунт</h1>
				<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<img src="/assets/vibecheck-favicon.png" alt="VibeCheck" style={{ width: 64, height: 50, borderRadius: 6 }} />
				</div>
				<p className={styles.subtitle}>Заполните свой профиль</p>
			</div>

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

			<div className={styles.experienceSection}>
				<p className={styles.experienceTitle}>Опыт работы (опционально)</p>

				{experiences.map((exp) => (
					<div key={exp.id} className={styles.experienceItem}>
						<Select
							options={INDUSTRY_OPTIONS}
							value={exp.industry}
							onChange={(value) => updateExperience(exp.id, 'industry', value)}
							placeholder="Сфера деятельности"
						/>
						<div className={styles.dateFields}>
							<InputField
								value={exp.startDate}
								onChange={(value) => updateExperience(exp.id, 'startDate', value)}
								placeholder="ДД.ММ.ГГГГ"
								maxLength={10} label={''}							/>
							<InputField
								value={exp.endDate}
								onChange={(value) => updateExperience(exp.id, 'endDate', value)}
								placeholder="ДД.ММ.ГГГГ (по настоящее время)"
								maxLength={10} label={''}							/>
						</div>
						<button
							type="button"
							className={styles.removeExperience}
							onClick={() => removeExperience(exp.id)}
						>
							Удалить
						</button>
					</div>
				))}

				<Button variant="secondary" onClick={addExperience}>
					+ Добавить опыт
				</Button>
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
