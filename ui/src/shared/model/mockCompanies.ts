/* Mock companies service: returns companies sorted/relevant to user preferences. */
import type { 
	CompanyFlag, 
	CompanyContact, 
	ReviewReaction, 
	CompanyReview, 
	CompanyDTO 
} from 'entities/company';

type MockUserPrefs = {
  preferences: {
    green: Array<{id: string; priority: number}>;
    red: Array<{id: string; priority: number}>;
  };
};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Extended tag dataset with 100 diverse tags from mockCompanies20
const ALL_TAGS: Record<string, string> = {
	// Original tags (t1-t25)
	't1': 'Гибкий график',
	't2': 'Удаленная работа',
	't3': 'Дружелюбная атмосфера',
	't4': 'Открытая коммуникация',
	't5': 'Профессиональный рост',
	't6': 'Микроменеджмент',
	't7': 'Переработки',
	't8': 'Токсичная культура',
	't9': 'Дают печеньки',
	't10': 'Карьерный рост',
	't11': 'Обучение',
	't12': 'Командировки',
	't13': 'Бонусы',
	't14': 'ДМС',
	't15': 'Спортзал',
	't16': 'Корпоративы',
	't17': 'Выгорание',
	't18': 'Низкая зарплата',
	't19': 'Интересные задачи',
	't20': 'Современный стек',
	't21': 'Код-ревью',
	't22': 'Техдолг',
	't23': 'Английский',
	't24': 'Релокация',
	't25': 'Опционы',
	// Culture tags (c1-c10)
	'c1': 'Дружелюбная команда',
	'c2': 'Токсичная атмосфера',
	'c3': 'Открытые люди',
	'c4': 'Всё по шаблону',
	'c5': 'Реально сплочённые',
	'c6': 'Дух соревнования',
	'c7': 'Много бумажек',
	'c8': 'Можно быть собой',
	'c9': 'Доверяют',
	'c10': 'Всё под контролем',
	// Management tags (m1-m10)
	'm1': 'Честное руководство',
	'm2': 'Полный бардак',
	'm3': 'Всё стабильно',
	'm4': 'Строгая структура',
	'm5': 'Помогают',
	'm6': 'Всё решают сверху',
	'm7': 'Дают пробовать',
	'm8': 'Много ответственности',
	'm9': 'Сильное давление',
	'm10': 'Уважают людей',
	// Process tags (p1-p10)
	'p1': 'Всё чётко',
	'p2': 'Вечные задержки',
	'p3': 'Двигаются быстро',
	'p4': 'Следят за качеством',
	'p5': 'Креативят',
	'p6': 'Скучные задачи',
	'p7': 'Думают наперёд',
	'p8': 'Планируют всё',
	'p9': 'Горят дедлайны',
	'p10': 'Расставляют приоритеты',
	// Communication tags (k1-k10)
	'k1': 'Командный дух',
	'k2': 'Интриги за спиной',
	'k3': 'Можно говорить открыто',
	'k4': 'Дают фидбэк',
	'k5': 'Каждый сам по себе',
	'k6': 'Вместе решают',
	'k7': 'Доверительная атмосфера',
	'k8': 'Постоянное напряжение',
	'k9': 'Всё понятно',
	'k10': 'Закрытые разговоры',
	// Image tags (i1-i10)
	'i1': 'Надёжная репутация',
	'i2': 'Сомнительный бренд',
	'i3': 'Профи в своём деле',
	'i4': 'Немного старомодно',
	'i5': 'Идут в ногу со временем',
	'i6': 'Без лишнего шума',
	'i7': 'Бывают скандалы',
	'i8': 'Компания растёт',
	'i9': 'Кризисный период',
	'i10': 'Привлекательное место',
	// Salary tags (s1-s10)
	's1': 'Достойная зарплата',
	's2': 'Низкие оклады',
	's3': 'Платят вовремя',
	's4': 'Бонусы за результат',
	's5': 'Всё по минимуму',
	's6': 'Прозрачные условия',
	's7': 'Серая схема',
	's8': 'Социальный пакет',
	's9': 'Без бонусов',
	's10': 'Рост без денег',
	// Career tags (r1-r10)
	'r1': 'Можно расти',
	'r2': 'Стеклянный потолок',
	'r3': 'Помогают развиваться',
	'r4': 'Нет карьерного роста',
	'r5': 'Понятные цели',
	'r6': 'Любят своих',
	'r7': 'Частая смена кадров',
	'r8': 'Сильная команда',
	'r9': 'Ставят задачи на вырост',
	'r10': 'Мало обучения',
	// Balance tags (b1-b10)
	'b1': 'Нормальный график',
	'b2': 'Переработки',
	'b3': 'Гибкий режим',
	'b4': 'Выходные не выходные',
	'b5': 'Ценят личное время',
	'b6': 'Дистанционка',
	'b7': '24/7 режим',
	'b8': 'Комфортный ритм',
	// Office tags (u1-u10)
	'u1': 'Крутой офис',
	'u2': 'Старый офис',
	'u3': 'Удалённая работа',
	'u4': 'Шумно и тесно',
	'u5': 'Заботятся об удобстве',
	'u6': 'Минимальные условия',
	'u7': 'Современное оборудование',
	'u8': 'Проблемы с техникой',
	// Values tags (v1-v10)
	'v1': 'Разделяют ценности',
	'v2': 'Только про прибыль',
	'v3': 'Заботятся о сотрудниках',
	'v4': 'Двойные стандарты',
};

// Helper to get random tags with counts
function getRandomTags(count: number): CompanyFlag[] {
	const keys = Object.keys(ALL_TAGS);
	const shuffled = [...keys].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, count).map((id) => ({
		id,
		name: ALL_TAGS[id],
		count: Math.floor(Math.random() * 50) + 5,
	}));
}

// Helper to generate contacts
function generateContacts(index: number): CompanyContact[] {
	const contacts: CompanyContact[] = [
		{ id: `c-${index}-1`, type: 'website', value: `company${index + 1}.ru`, url: `https://company${index + 1}.ru` },
	];
	if (index % 3 !== 0) contacts.push({ id: `c-${index}-2`, type: 'email', value: `hr@company${index + 1}.ru`, url: `mailto:hr@company${index + 1}.ru` });
	if (index % 2 === 0) contacts.push({ id: `c-${index}-3`, type: 'linkedin', value: `linkedin.com/company/${index + 1}`, url: `https://linkedin.com/company/${index + 1}` });
	return contacts;
}

// Helper to generate reviews
function generateReviews(companyIndex: number, count: number): CompanyReview[] {
	const positions = ['Разработчик', 'Менеджер', 'Дизайнер', 'Аналитик', 'DevOps', 'QA', 'Product Owner', 'HR'];
	const texts = [
		'Отличная компания с дружелюбной атмосферой. Руководство честное и открытое.',
		'Хорошие условия работы, достойная зарплата. Интересные проекты.',
		'Гибкий график, удаленка по желанию. Коллектив сплоченный.',
		'Есть переработки, но компенсируются отгулами. Баланс работа-жизнь.',
		'Современный стек технологий, интересные задачи.',
		'Отличный офис, все условия для комфортной работы.',
		'Бывают сложные периоды, но руководство держит команду в курсе.',
		'Микроменеджмент иногда напрягает, но в целом нормально.',
		'Стартап с амбициозными целями. Движутся быстро, иногда хаотично.',
		'Большая корпорация со всеми плюсами и минусами.',
	];
	
	return Array.from({ length: count }).map((_, rIdx) => ({
		id: `review-${companyIndex}-${rIdx}`,
		authorId: `user-${(companyIndex * 10 + rIdx) % 50 + 1}`,
		authorName: `Сотрудник ${rIdx + 1}`,
		authorAvatarUrl: rIdx % 3 === 0 ? null : undefined,
		createdAt: new Date(Date.now() - (rIdx * 86400000 * 14)).toISOString(),
		position: positions[(companyIndex + rIdx) % positions.length],
		text: texts[(companyIndex + rIdx) % texts.length],
		flags: getRandomTags(3 + Math.floor(Math.random() * 4)),
		reactions: { likes: Math.floor(Math.random() * 30) + 2, dislikes: Math.floor(Math.random() * 5) },
	}));
}

// 20 realistic companies with detailed descriptions
const REALISTIC_COMPANIES_DATA = [
	{ id: 'comp-001', name: 'ТехноСфера', desc: 'Крупная IT-компания, разрабатывающая облачные решения для бизнеса. Фокус на инновациях и устойчивом развитии.', flags: ['c1','m1','s1','r3','b3','u1','p4','k3','i3','v3','c5','m5','s8','r1','b1','u5','p1','k1','i8','v1'] },
	{ id: 'comp-002', name: 'ФинансГрупп', desc: 'Финтех-стартап, создающий решения для цифровых платежей. Динамичная среда с возможностью быстрого роста.', flags: ['i8','p3','r9','s4','m7','c6','b2','p9','m8','r1','i5','k6','s1','u3','c3','p5','m5','b7','v3','k4'] },
	{ id: 'comp-003', name: 'ЭкоЛогистик', desc: 'Логистическая компания с фокусом на экологичность. Развиваем зеленые технологии доставки.', flags: ['v1','c8','m10','b5','s3','i1','c1','u1','m3','p1','k7','r3','s6','b8','c5','i6','m5','u5','k9','b3'] },
	{ id: 'comp-004', name: 'ГеймДев Про', desc: 'Студия разработки мобильных игр. Креативная атмосфера, молодой коллектив.', flags: ['p5','c3','u1','m7','r8','k1','s4','p3','c8','i10','m5','b3','u7','k3','r3','s8','c5','p1','v3','b1'] },
	{ id: 'comp-005', name: 'КонсалтПлюс', desc: 'Консалтинговая компания. Работаем с крупными корпорациями, сложные проекты.', flags: ['s1','r9','i3','m8','b2','p4','r1','s4','m9','k8','p9','c6','i1','m1','r8','s6','p7','k4','u1','b7'] },
	{ id: 'comp-006', name: 'МедиаХаб', desc: 'Медиахолдинг с несколькими digital-проектами. Быстрая среда, много молодых специалистов.', flags: ['p5','c3','m7','i5','k3','b3','u3','c8','r3','p3','s8','m5','k1','i10','c1','u7','p2','b2','v3','r1'] },
	{ id: 'comp-007', name: 'Банк Будущего', desc: 'Цифровой банк с современным подходом. Стабильность плюс гибкость.', flags: ['m3','s8','i1','s1','u1','p4','m4','r1','s3','c10','p8','i5','m10','u7','c7','b1','k9','s6','r3','v1'] },
	{ id: 'comp-008', name: 'СтартапXYZ', desc: 'Молодой стартап в сфере AI. Ищем энтузиастов для работы в условиях неопределенности.', flags: ['i8','r9','p3','m7','s4','c6','p5','u7','r1','k3','m2','b2','p9','c3','i5','m8','u3','s2','k6','v3'] },
	{ id: 'comp-009', name: 'РитейлГрупп', desc: 'Сеть магазинов электроники. Большая компания с развитой корпоративной культурой.', flags: ['m3','i1','s3','m4','p1','c4','m6','k10','s9','r4','c10','p8','i4','m10','b1','s1','u2','k5','r6','p6'] },
	{ id: 'comp-010', name: 'ОбразованиеОнлайн', desc: 'EdTech платформа для корпоративного обучения. Миссия - сделать обучение доступным.', flags: ['v1','r3','c8','m10','b5','p5','k3','u3','c1','m5','s8','i3','r1','b3','k7','p4','c5','v3','u7','s1'] },
	{ id: 'comp-011', name: 'МаркетПро', desc: 'Маркетинговое агентство полного цикла. Работаем с крупными брендами, высокий темп.', flags: ['p3','r9','s4','i3','c6','p5','b2','m8','k1','p9','r1','u1','c3','m9','s1','i10','p4','k8','b7','m5'] },
	{ id: 'comp-012', name: 'ТелекомСолюшнс', desc: 'Телекоммуникационная компания. Стабильный бизнес, консервативный подход.', flags: ['m3','s3','i1','b1','m4','s8','c4','i4','p1','m6','c10','k10','r4','p8','u2','s1','m10','c7','p6','k5'] },
	{ id: 'comp-013', name: 'ХелсТек', desc: 'Медицинский технологический стартап. Работаем над улучшением здравоохранения.', flags: ['v1','r3','i3','m10','c8','b5','p5','u3','s8','c1','k3','m5','r1','i8','b3','k7','p4','v3','u7','s1'] },
	{ id: 'comp-014', name: 'ФудТех', desc: 'Сервис доставки еды с собственными кухнями. Быстрый рост, много данных.', flags: ['i8','p3','s4','r9','m7','c6','b2','p9','u7','k1','r1','s1','c3','m8','p5','i5','b3','v3','m5','k4'] },
	{ id: 'comp-015', name: 'СтройИнвест', desc: 'Девелоперская компания. Крупные проекты, долгий цикл, стабильность.', flags: ['m3','i1','s3','p1','m4','s8','c4','b1','p8','m6','c10','i4','r6','u2','s1','k10','p6','m10','c7','k5'] },
	{ id: 'comp-016', name: 'КриптоЛаб', desc: 'Блокчейн-стартап. Работаем с DeFi, Web3. Высокие риски, высокие награды.', flags: ['i8','p3','r9','s4','m7','c6','p5','u7','r1','k3','m2','b2','p9','c3','i5','m8','u3','s2','k6','v3'] },
	{ id: 'comp-017', name: 'АвтоПартс', desc: 'Производитель автокомпонентов. Традиционный бизнес, проверенные процессы.', flags: ['m3','s3','i1','b1','m4','s8','c4','i4','p1','m6','c10','k10','r4','p8','u2','s1','m10','c7','p6','k5'] },
	{ id: 'comp-018', name: 'НейроСофт', desc: 'Разработка ПО на базе нейросетей. Передовые технологии, сильная R&D команда.', flags: ['i3','p5','r8','u7','m7','c3','s4','p3','i5','k3','r3','b3','m5','s8','c1','v1','r1','u3','k1','p4'] },
	{ id: 'comp-019', name: 'ТрэвелТек', desc: 'Платформа для бронирования путешествий. Восстанавливаемся после кризиса, ищем новые модели.', flags: ['i9','m3','s3','b1','p1','c4','m5','k7','r3','u3','s1','c1','p5','v3','b3','i5','m10','k3','r1','u7'] },
	{ id: 'comp-020', name: 'ЭнергоСбыт', desc: 'Энергетическая компания. Государственная поддержка, стабильность, социальная ответственность.', flags: ['m3','i1','s8','s3','b1','m4','p1','c10','v1','m10','s6','k9','r4','p8','u2','c4','s1','i4','p6','k5'] },
];

// Generate 20 realistic companies
const REALISTIC_COMPANIES: CompanyDTO[] = REALISTIC_COMPANIES_DATA.map((comp, idx) => {
	const tagCounts = comp.flags.map((flagId, fIdx) => ({
		id: flagId,
		name: ALL_TAGS[flagId] || flagId,
		count: 50 - fIdx * 2 + Math.floor(Math.random() * 10),
	}));

	return {
		id: comp.id,
		name: comp.name,
		description: comp.desc,
		logoUrl: null,
		topFlags: tagCounts,
		contacts: generateContacts(idx),
		reviews: generateReviews(idx, 5 + Math.floor(Math.random() * 10)),
	};
});

// Generate detailed company data with reviews and contacts for auto-generated companies
function generateCompanyDetails(index: number): Partial<CompanyDTO> {
	const contacts: CompanyContact[] = [
		{
			id: `contact-${index}-1`,
			type: 'website',
			value: `company${index + 1}.ru`,
			url: `https://company${index + 1}.ru`,
		},
		{
			id: `contact-${index}-2`,
			type: 'email',
			value: `hr@company${index + 1}.ru`,
			url: `mailto:hr@company${index + 1}.ru`,
		},
	];
	
	if (index % 2 === 0) {
		contacts.push({
			id: `contact-${index}-3`,
			type: 'linkedin',
			value: `linkedin.com/company/company${index + 1}`,
			url: `https://linkedin.com/company/company${index + 1}`,
		});
	}
	
	if (index % 3 === 0) {
		contacts.push({
			id: `contact-${index}-4`,
			type: 'telegram',
			value: `@company${index + 1}`,
			url: `https://t.me/company${index + 1}`,
		});
	}

	// Generate reviews
	const reviewCount = 3 + (index % 5);
	const reviews: CompanyReview[] = Array.from({ length: reviewCount }).map((_, rIdx) => {
		const reviewFlags = getRandomTags(3 + Math.floor(Math.random() * 4));
		
		return {
			id: `review-${index}-${rIdx}`,
			authorId: `user-${(index * 10 + rIdx) % 50 + 1}`,
			authorName: `Пользователь ${rIdx + 1}`,
			authorAvatarUrl: rIdx % 2 === 0 ? null : undefined,
			createdAt: new Date(Date.now() - (rIdx * 86400000 * 7)).toISOString(),
			position: ['Разработчик', 'Менеджер', 'Дизайнер', 'Аналитик', 'DevOps'][rIdx % 5],
			text: `Отличная компания для работы! ${index % 2 === 0 ? 'Очень доволен коллективом и условиями.' : 'Есть над чем работать, но в целом неплохо.'}`,
			flags: reviewFlags,
			reactions: {
				likes: 5 + (index * rIdx) % 20,
				dislikes: (index * rIdx) % 5,
			},
		};
	});

	return {
		contacts,
		reviews,
	};
}

// Generate 100 auto-generated companies
const AUTO_GENERATED_COMPANIES: CompanyDTO[] = Array.from({ length: 100 }).map((_, i) => {
	const id = `c${i + 21}`;
	const name = `Компания ${i + 21}`;
	// pseudo-random flags
	const flagKeys = Object.keys(ALL_TAGS);
	const shuffled = [...flagKeys].sort(() => 0.5 - Math.random());
	const flags = shuffled.slice(0, 20).map((key, idx) => ({
		id: key,
		name: ALL_TAGS[key],
		count: (((i + 3) * (idx + 7)) % 37) + 1,
	})).sort((a, b) => b.count - a.count);
	
	const details = generateCompanyDetails(i);
	
	return {
		id,
		name,
		logoUrl: i % 3 === 0 ? null : undefined,
		description: `Описание компании ${i + 21}. Это тестовая компания для демонстрации функционала страницы компании. Здесь может быть подробное описание деятельности, миссии и ценностей компании.`,
		topFlags: flags,
		contacts: details.contacts,
		reviews: details.reviews,
	};
});

// Combined seed companies: 20 realistic + 100 auto-generated
const SEED_COMPANIES: CompanyDTO[] = [...REALISTIC_COMPANIES, ...AUTO_GENERATED_COMPANIES];

function relevanceScore(company: CompanyDTO): number {
	// Stub no user prefs
  const user: MockUserPrefs = { preferences: { green: [], red: [] } };
	const { green = [], red = [] } = user.preferences;
	let score = 0;
	for (const f of company.topFlags) {
		const g = green.find((x) => x.id === f.id);
		if (g) score += (4 - g.priority) * f.count; // priority 1 -> 3 weight, 2 -> 2, 3 -> 1
		const r = red.find((x) => x.id === f.id);
		if (r) score -= (4 - r.priority) * f.count;
	}
	return score;
}

export const mockCompanies = {
	async fetchCompanies(params: { q?: string; offset?: number; limit?: number }) {
		const { q = '', offset = 0, limit = 10 } = params || {};
		await delay(600);
		const query = q.trim().toLowerCase();
		let list = SEED_COMPANIES;
		if (query) {
			list = list.filter(
				(c) => c.name.toLowerCase().includes(query) || (c.description || '').toLowerCase().includes(query)
			);
		}
		// sort by relevance first, then by name stable
		list = list
			.map((c) => ({ c, s: relevanceScore(c) }))
			.sort((a, b) => b.s - a.s || a.c.name.localeCompare(b.c.name))
			.map((x) => x.c);
		const total = list.length;
		const slice = list.slice(offset, offset + limit);
		return { ok: true, status: 200, data: { items: slice, total } } as const;
	},

	async fetchCompanyById(id: string): Promise<{ ok: true; status: number; data: CompanyDTO } | { ok: false; status: number; error: string }> {
		await delay(400);
		const company = SEED_COMPANIES.find(c => c.id === id);
		if (!company) {
			return { ok: false, status: 404, error: 'Company not found' };
		}
		return { ok: true, status: 200, data: company };
	},
};
