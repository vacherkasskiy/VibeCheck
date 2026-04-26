import { createUserInfoDto, updateMyInfo } from 'features/auth';
import { useState } from 'react';
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
	{ value: 'HOSPITALITY', label: 'Гостиничный бизнес' },
	{ value: 'TRANSPORT', label: 'Транспорт и логистика' },
	{ value: 'CONSTRUCTION', label: 'Строительство' },
	{ value: 'ENERGY', label: 'Энергетика' },
	{ value: 'AGRICULTURE', label: 'Сельское хозяйство' },
	{ value: 'GOVERNMENT', label: 'Госслужба' },
	{ value: 'NGO', label: 'Некоммерческие организации' },
	{ value: 'OTHER', label: 'Другое' },
];

const dateToISO = (dateStr: string): string => {
	const [day, month, year] = dateStr.split('.').map(Number);
	return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`;
};

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
		const numeric = value.replace(/\D/g, '').slice(0, 8);
		let formatted = numeric;
		if (numeric.length >= 2) formatted = numeric.slice(0, 2) + '.' + numeric.slice(2);
		if (numeric.length >= 4)
			formatted = numeric.slice(0, 2) + '.' + numeric.slice(2, 4) + '.' + numeric.slice(4);
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

		if (!isFormValid()) return;

		setIsLoading(true);
		setGeneralError('');

		try {
			const birthDateISO = dateToISO(birthDate);
			const expWithISO = experiences.map((exp) => ({
				industry: exp.industry,
				startDate: dateToISO(exp.startDate),
				endDate: exp.endDate ? dateToISO(exp.endDate) : null,
			}));
			const dto = createUserInfoDto({
				email,
				avatarId: avatarId!,
				nickname,
				sex: sex as any,
				birthDate: birthDateISO,
				education,
				industry,
				experiences: expWithISO,
			});
			await updateMyInfo(dto);
			onSubmit();
		} catch (err: any) {
			setGeneralError(err.response?.data?.message || 'Ошибка сохранения профиля');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.container}>
			<div className={styles.header}>
				<h1 className={styles.title}>Создать аккаунт</h1>
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

			<div className={styles.experienceSection}>
				<p className={styles.experienceTitle}>Опыт работы (опционально)</p>
				{experiences.map((exp) => (
					<div key={exp.id} className={styles.experienceItem}>
						<Select
							options={INDUSTRY_OPTIONS}
							value={exp.industry}
							onChange={(v) => updateExperience(exp.id, 'industry', v)}
							placeholder="Сфера деятельности"
						/>
						<div className={styles.dateFields}>
							<InputField
								value={exp.startDate}
								onChange={(v) => updateExperience(exp.id, 'startDate', v)}
								placeholder="ДД.ММ.ГГГГ"
								maxLength={10}
								label=""
							/>
							<InputField
								value={exp.endDate}
								onChange={(v) => updateExperience(exp.id, 'endDate', v)}
								placeholder="ДД.ММ.ГГГГ"
								maxLength={10}
								label=""
							/>
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
