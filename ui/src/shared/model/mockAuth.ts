/* Mock authentication service to run UI without backend */

type Sex = 'SEX_MALE' | 'SEX_FEMALE' | 'SEX_OTHER';

type Education =
	| 'SCHOOL'
	| 'COLLEGE'
	| 'BACHELOR'
	| 'MASTER'
	| 'SPECIALIST'
	| 'PHD'
	| 'DOCTORATE'
	| 'NONE';

type Industry =
	| 'IT'
	| 'FINANCE'
	| 'MEDIA'
	| 'EDUCATION'
	| 'HEALTHCARE'
	| 'MANUFACTURING'
	| 'RETAIL'
	| 'HOSPITALITY'
	| 'TRANSPORT'
	| 'CONSTRUCTION'
	| 'ENERGY'
	| 'AGRICULTURE'
	| 'GOVERNMENT'
	| 'NGO'
	| 'OTHER';

export interface ExperienceDTO {
	industry: Industry | '';
	startDate: string; // YYYY-MM-DD
	endDate: string | null; // YYYY-MM-DD or null
}

export interface UserProfile {
	email: string;
	passwordHash: string; // plain for mock
	verified: boolean;
	avatarId?: string | null;
	nickname?: string;
	sex?: Sex | '';
	birthDate?: string; // YYYY-MM-DD
	education?: Education | '';
	industry?: Industry | '';
	experiences?: ExperienceDTO[];
	preferences?: { green: { id: string; priority: 1 | 2 | 3 }[]; red: { id: string; priority: 1 | 2 | 3 }[] };
}

interface Session {
	token: string;
	email: string;
}

const LS_USERS = 'mock_users';
const LS_SESSION = 'mock_session';
const LS_VERIFICATION = 'mock_verifications'; // { [email]: { code, expiresAt } }

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const loadUsers = (): Record<string, UserProfile> => {
	try {
		const raw = localStorage.getItem(LS_USERS);
		return raw ? (JSON.parse(raw) as Record<string, UserProfile>) : {};
	} catch {
		return {};
	}
};

const saveUsers = (users: Record<string, UserProfile>) => {
	localStorage.setItem(LS_USERS, JSON.stringify(users));
};

const loadSession = (): Session | null => {
	try {
		const raw = localStorage.getItem(LS_SESSION);
		return raw ? (JSON.parse(raw) as Session) : null;
	} catch {
		return null;
	}
};

const saveSession = (session: Session | null) => {
	if (!session) localStorage.removeItem(LS_SESSION);
	else localStorage.setItem(LS_SESSION, JSON.stringify(session));
};

interface VerificationEntry { code: string; expiresAt: number }

const loadVerifications = (): Record<string, VerificationEntry> => {
	try {
		const raw = localStorage.getItem(LS_VERIFICATION);
		return raw ? (JSON.parse(raw) as Record<string, VerificationEntry>) : {};
	} catch {
		return {};
	}
};

const saveVerifications = (data: Record<string, VerificationEntry>) => {
	localStorage.setItem(LS_VERIFICATION, JSON.stringify(data));
};

const randomToken = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

const hash = (s: string) => s; // no real hash in mock

export const mockAuth = {
	async registerInit(params: { email: string; password: string }) {
		await delay(500);
		const users = loadUsers();
		const email = params.email.toLowerCase();
		if (users[email]) {
			return {
				ok: false,
				status: 409,
				data: { code: 'EMAIL_EXISTS', message: 'Email уже зарегистрирован' },
			};
		}
		users[email] = {
			email,
			passwordHash: hash(params.password),
			verified: false,
		};
		saveUsers(users);
		const verifications = loadVerifications();
		verifications[email] = { code: '000000', expiresAt: Date.now() + 10 * 60 * 1000 };
		saveVerifications(verifications);
		return { ok: true, status: 200, data: { message: 'Verification code sent' } };
	},

	async registerResend(params: { email: string }) {
		await delay(400);
		const email = params.email.toLowerCase();
		const users = loadUsers();
		if (!users[email]) {
			return { ok: false, status: 404, data: { message: 'User not found' } };
		}
		const verifications = loadVerifications();
		verifications[email] = { code: '000000', expiresAt: Date.now() + 10 * 60 * 1000 };
		saveVerifications(verifications);
		return { ok: true, status: 200, data: { message: 'Resent' } };
	},

	async registerVerify(params: { email: string; code: string }) {
		await delay(400);
		const email = params.email.toLowerCase();
		const verifications = loadVerifications();
		const entry = verifications[email];
		if (!entry || entry.code !== params.code || entry.expiresAt < Date.now()) {
			return { ok: false, status: 400, data: { message: 'Неверный код' } };
		}
		const users = loadUsers();
		if (!users[email]) return { ok: false, status: 404, data: { message: 'User not found' } };
		users[email].verified = true;
		saveUsers(users);
		delete verifications[email];
		saveVerifications(verifications);
		return { ok: true, status: 200, data: { message: 'Verified' } };
	},

	async registerComplete(params: {
		email: string;
		avatarId: string;
		nickname: string;
		sex: Sex;
		birthDate: string; // YYYY-MM-DD
		education: Education;
		industry: Industry;
		experiences: ExperienceDTO[];
	}) {
		await delay(500);
		const email = params.email.toLowerCase();
		const users = loadUsers();
		const user = users[email];
		if (!user) return { ok: false, status: 404, data: { message: 'User not found' } };
		if (!user.verified)
			return { ok: false, status: 400, data: { message: 'User not verified' } };
		users[email] = {
			...user,
			avatarId: params.avatarId,
			nickname: params.nickname,
			sex: params.sex,
			birthDate: params.birthDate,
			education: params.education,
			industry: params.industry,
			experiences: params.experiences,
		};
		saveUsers(users);
		return { ok: true, status: 200, data: { message: 'Profile saved' } };
	},

	async login(params: { email: string; password: string }) {
		await delay(500);
		const email = params.email.toLowerCase();
		const users = loadUsers();
		const user = users[email];
		if (!user || user.passwordHash !== hash(params.password)) {
			return { ok: false, status: 401, data: { message: 'Неверный email или пароль' } };
		}
		if (!user.verified) {
			return { ok: false, status: 403, data: { code: 'ACCOUNT_UNVERIFIED', message: 'Аккаунт не подтвержден' } };
		}
		const token = randomToken();
		saveSession({ token, email });
		return { ok: true, status: 200, data: { accessToken: token, refreshToken: token } };
	},

	async googleUrl() {
		await delay(200);
		return { ok: true, status: 200, data: { url: '#' } };
	},

	getCurrentUser(): Omit<UserProfile, 'passwordHash'> | null {
		const session = loadSession();
		if (!session) return null;
		const users = loadUsers();
		const user = users[session.email];
		if (!user) return null;
		 
		const { passwordHash, ...safe } = user;
		return safe;
	},

	saveFlags(prefs: { green: { id: string; priority: 1 | 2 | 3 }[]; red: { id: string; priority: 1 | 2 | 3 }[] }) {
		const session = loadSession();
		if (!session) return { ok: false, status: 401, data: { message: 'Not authenticated' } };
		const users = loadUsers();
		const user = users[session.email];
		if (!user) return { ok: false, status: 404, data: { message: 'User not found' } };
		user.preferences = { green: prefs.green, red: prefs.red };
		saveUsers(users);
		return { ok: true, status: 200, data: { message: 'Saved' } };
	},

	logout() {
		saveSession(null);
	},
};
