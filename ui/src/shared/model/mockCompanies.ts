/* Mock companies service: returns companies sorted/relevant to user preferences. */
import { mockAuth } from './mockAuth';

export interface CompanyFlag {
	id: string;
	name: string;
	count: number; 
}

export interface CompanyDTO {
	id: string;
	name: string;
	logoUrl?: string | null;
	description?: string;
	topFlags: CompanyFlag[]; 
}

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

// Seed dataset
const BASE_FLAGS = [
	{ id: 't1', name: 'Гибкий график' },
	{ id: 't2', name: 'Удаленная работа' },
	{ id: 't3', name: 'Дружелюбная атмосфера' },
	{ id: 't4', name: 'Открытая коммуникация' },
	{ id: 't5', name: 'Профессиональный рост' },
	{ id: 't6', name: 'Микроменеджмент' },
	{ id: 't7', name: 'Переработки' },
	{ id: 't8', name: 'Токсичная культура' },
	{ id: 't9', name: 'Дают печеньки' },
];

const SEED_COMPANIES: CompanyDTO[] = Array.from({ length: 120 }).map((_, i) => {
	const id = `c${i + 1}`;
	const name = `Компания ${i + 1}`;
	// pseudo-random flags
	const flags = BASE_FLAGS
		.map((f, idx) => ({ ...f, count: (((i + 3) * (idx + 7)) % 37) + 1 }))
		.sort((a, b) => b.count - a.count)
		.slice(0, 20);
	return {
		id,
		name,
		logoUrl: i % 3 === 0 ? null : undefined,
		description: `Описание компании ${i + 1}`,
		topFlags: flags,
	};
});

function relevanceScore(company: CompanyDTO): number {
	// Basic scoring against user prefs: +priority weight for green flags, -priority for red
	const user = mockAuth.getCurrentUser();
	if (!user || !user.preferences) return 0;
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
};
