const EDUCATION_LABELS: Record<string, string> = {
	EDUCATION_LEVEL_NONE: 'Не указано',
	EDUCATION_LEVEL_PRIMARY: 'Начальное образование',
	EDUCATION_LEVEL_BASIC: 'Основное общее',
	EDUCATION_LEVEL_SECONDARY: 'Среднее общее',
	EDUCATION_LEVEL_SECONDARY_PROFESSIONAL: 'Среднее профессиональное',
	EDUCATION_LEVEL_INCOMPLETE_HIGHER: 'Неоконченное высшее',
	EDUCATION_LEVEL_BACHELOR: 'Бакалавриат',
	EDUCATION_LEVEL_SPECIALIST: 'Специалитет',
	EDUCATION_LEVEL_MASTER: 'Магистратура',
	EDUCATION_LEVEL_POSTGRADUATE: 'Аспирантура',
	EDUCATION_LEVEL_DOCTORATE: 'Докторантура',
	EDUCATION_LEVEL_RESIDENCY: 'Ординатура',
	EDUCATION_LEVEL_ADJUNCTURE: 'Адъюнктура',
};

const SPECIALIZATION_LABELS: Record<string, string> = {
	SPECIALTY_IT: 'IT',
	SPECIALTY_DESIGN: 'Дизайн',
	SPECIALTY_MARKETING: 'Маркетинг',
	SPECIALTY_FINANCE: 'Финансы',
	SPECIALTY_HR: 'HR',
	SPECIALTY_SALES: 'Продажи',
	SPECIALTY_LOGISTICS: 'Логистика',
	SPECIALTY_LAW: 'Юриспруденция',
	SPECIALTY_EDUCATION: 'Образование',
	SPECIALTY_MEDICINE: 'Медицина',
	SPECIALTY_CONSTRUCTION: 'Строительство',
	SPECIALTY_ENGINEERING: 'Инженерия',
	SPECIALTY_ART: 'Искусство',
	SPECIALTY_TOURISM: 'Туризм',
	SPECIALTY_MEDIA: 'Медиа',
	SPECIALTY_ANALYTICS: 'Аналитика',
	SPECIALTY_PROJECT_MANAGEMENT: 'Проектный менеджмент',
	SPECIALTY_SPORT: 'Спорт',
	SPECIALTY_OTHER: 'Другое',
};

const translateByMap = (value: string | null | undefined, map: Record<string, string>) => {
	if (!value) return 'Не указано';
	return map[value] ?? value;
};

export const translateEducation = (value: string | null | undefined) =>
	translateByMap(value, EDUCATION_LABELS);

export const translateSpecialization = (value: string | null | undefined) =>
	translateByMap(value, SPECIALIZATION_LABELS);

export const translateExperience = (value: string | null | undefined) => {
	if (!value) return 'Не указано';
	if (value === 'Без опыта') return value;

	const match = value.match(/^(SPECIALTY_[A-Z_]+)\s+с\s+(.+)$/);
	if (!match) return value;

	const [, specialization, since] = match;
	return `${translateSpecialization(specialization)} с ${since}`;
};
