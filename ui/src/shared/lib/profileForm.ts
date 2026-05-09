import type { EducationLevel, Specialization } from 'entities/user/model/types';

export const SEX_OPTIONS = [
	{ value: 'SEX_MALE', label: 'Мужской' },
	{ value: 'SEX_FEMALE', label: 'Женский' },
	{ value: 'SEX_OTHER', label: 'Другое' },
];

export const EDUCATION_OPTIONS = [
	{ value: 'NONE', label: 'Нет образования' },
	{ value: 'SCHOOL', label: 'Школа' },
	{ value: 'COLLEGE', label: 'Колледж/Техникум' },
	{ value: 'BACHELOR', label: 'Бакалавриат' },
	{ value: 'MASTER', label: 'Магистратура' },
	{ value: 'SPECIALIST', label: 'Специалитет' },
	{ value: 'PHD', label: 'Аспирантура' },
	{ value: 'DOCTORATE', label: 'Докторантура' },
];

export const INDUSTRY_OPTIONS = [
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

export const formatDateInput = (value: string): string => {
	const numeric = value.replace(/\D/g, '').slice(0, 8);
	let formatted = numeric;
	if (numeric.length >= 2) formatted = `${numeric.slice(0, 2)}.${numeric.slice(2)}`;
	if (numeric.length >= 4) {
		formatted = `${numeric.slice(0, 2)}.${numeric.slice(2, 4)}.${numeric.slice(4)}`;
	}
	return formatted;
};

export const isRealDate = (value: string): boolean => {
	if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return false;
	const [day, month, year] = value.split('.').map(Number);
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
	);
};

export const validateBirthDate = (value: string): string => {
	if (!value) return 'Обязательное поле';
	if (!/^\d{2}\.\d{2}\.\d{4}$/.test(value)) return 'Формат: ДД.ММ.ГГГГ';
	if (!isRealDate(value)) return 'Некорректная дата';

	const [day, month, year] = value.split('.').map(Number);
	const birth = new Date(year, month - 1, day);
	const today = new Date();
	let age = today.getFullYear() - birth.getFullYear();
	const monthDiff = today.getMonth() - birth.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
	if (age < 18) return 'Возраст от 18 лет';
	if (age > 120) return 'Некорректная дата';
	return '';
};

export const dateToISO = (dateStr: string): string => {
	const [day, month, year] = dateStr.split('.').map(Number);
	return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00Z`;
};

export const isoToDisplayDate = (value: string | null | undefined): string => {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return `${String(date.getUTCDate()).padStart(2, '0')}.${String(date.getUTCMonth() + 1).padStart(2, '0')}.${date.getUTCFullYear()}`;
};

export const mapEducationLevelToFormValue = (education: EducationLevel): string => {
	const map: Record<EducationLevel, string> = {
		EDUCATION_LEVEL_NONE: 'NONE',
		EDUCATION_LEVEL_PRIMARY: 'SCHOOL',
		EDUCATION_LEVEL_BASIC: 'SCHOOL',
		EDUCATION_LEVEL_SECONDARY: 'SCHOOL',
		EDUCATION_LEVEL_SECONDARY_PROFESSIONAL: 'COLLEGE',
		EDUCATION_LEVEL_INCOMPLETE_HIGHER: 'BACHELOR',
		EDUCATION_LEVEL_BACHELOR: 'BACHELOR',
		EDUCATION_LEVEL_SPECIALIST: 'SPECIALIST',
		EDUCATION_LEVEL_MASTER: 'MASTER',
		EDUCATION_LEVEL_POSTGRADUATE: 'PHD',
		EDUCATION_LEVEL_DOCTORATE: 'DOCTORATE',
		EDUCATION_LEVEL_RESIDENCY: 'PHD',
		EDUCATION_LEVEL_ADJUNCTURE: 'PHD',
	};

	return map[education] ?? 'NONE';
};

export const mapSpecializationToIndustryValue = (specialization: Specialization): string => {
	const map: Record<Specialization, string> = {
		SPECIALTY_IT: 'IT',
		SPECIALTY_DESIGN: 'MEDIA',
		SPECIALTY_MARKETING: 'MEDIA',
		SPECIALTY_FINANCE: 'FINANCE',
		SPECIALTY_HR: 'OTHER',
		SPECIALTY_SALES: 'RETAIL',
		SPECIALTY_LOGISTICS: 'TRANSPORT',
		SPECIALTY_LAW: 'GOVERNMENT',
		SPECIALTY_EDUCATION: 'EDUCATION',
		SPECIALTY_MEDICINE: 'HEALTHCARE',
		SPECIALTY_CONSTRUCTION: 'CONSTRUCTION',
		SPECIALTY_ENGINEERING: 'MANUFACTURING',
		SPECIALTY_ART: 'MEDIA',
		SPECIALTY_TOURISM: 'HOSPITALITY',
		SPECIALTY_MEDIA: 'MEDIA',
		SPECIALTY_ANALYTICS: 'IT',
		SPECIALTY_PROJECT_MANAGEMENT: 'OTHER',
		SPECIALTY_SPORT: 'OTHER',
		SPECIALTY_OTHER: 'OTHER',
	};

	return map[specialization] ?? 'OTHER';
};
