/* eslint-disable react-hooks/exhaustive-deps */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from 'features/auth';
import {
	AlertTriangle,
	BadgeCheck,
	Building2,
	ClipboardList,
	Eye,
	Flag,
	LayoutGrid,
	PencilLine,
	RefreshCw,
	ShieldAlert,
	Trash2,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'shared/ui/Button';
import { CenterGlow } from 'shared/ui/CenterGlow';
import { HeaderGlow } from 'shared/ui/HeaderGlow';
import { Input } from 'shared/ui/Input';
import { Modal } from 'shared/ui/Modal';
import { Select } from 'shared/ui/Select';
import { Spinner } from 'shared/ui/Spinner';
import { TextAreaField } from 'shared/ui/TextAreaField';
import { useToast } from 'shared/ui/Toast';
import { UserNavButton } from 'shared/ui/UserNavButton';
import styles from './AdminPage.module.css';
import { adminApi } from '../model/adminApi';
import type {
	AdminCompanyDto,
	AdminFlagDto,
	CompanyRequestDto,
	CreateCompanyRequest,
	CreateFlagRequest,
	FlagCategory,
	ReviewReportDto,
	UpdateCompanyRequest,
	UpdateFlagRequest,
} from '../model/types';

type AdminSection = 'overview' | 'companies' | 'flags' | 'requests' | 'reports';

interface CompanyFormState {
	name: string;
	description: string;
	iconId: string;
	siteUrl: string;
	linkedinUrl: string;
	hrUrl: string;
}

interface FlagFormState {
	name: string;
	category: FlagCategory;
	description: string;
}

const PAGE_SIZE_OPTIONS = [
	{ value: '10', label: '10 / page' },
	{ value: '20', label: '20 / page' },
	{ value: '50', label: '50 / page' },
];

const FLAG_CATEGORY_OPTIONS = [
	{ value: 'Culture', label: 'Culture' },
	{ value: 'Management', label: 'Management' },
	{ value: 'Processes', label: 'Processes' },
	{ value: 'Communications', label: 'Communications' },
	{ value: 'Image', label: 'Image' },
	{ value: 'Compensation', label: 'Compensation' },
	{ value: 'Career', label: 'Career' },
	{ value: 'Balance', label: 'Balance' },
	{ value: 'Conditions', label: 'Conditions' },
	{ value: 'Values', label: 'Values' },
] satisfies Array<{ value: FlagCategory; label: string }>;

const emptyCompanyForm: CompanyFormState = {
	name: '',
	description: '',
	iconId: '',
	siteUrl: '',
	linkedinUrl: '',
	hrUrl: '',
};

const emptyFlagForm: FlagFormState = {
	name: '',
	category: 'Culture',
	description: '',
};

const formatDate = (value?: string | null) => {
	if (!value) return '—';

	return new Intl.DateTimeFormat('ru-RU', {
		dateStyle: 'medium',
		timeStyle: 'short',
	}).format(new Date(value));
};

const getErrorMessage = (error: unknown) => {
	if (error instanceof Error) {
		return error.message;
	}

	return 'Не удалось выполнить запрос';
};

const mapCompanyToForm = (company: AdminCompanyDto): CompanyFormState => ({
	name: company.name ?? '',
	description: company.description ?? '',
	iconId: company.iconId ?? '',
	siteUrl: company.siteUrl ?? '',
	linkedinUrl: company.linkedinUrl ?? '',
	hrUrl: company.hrUrl ?? '',
});

const mapFlagToForm = (flagItem: AdminFlagDto): FlagFormState => ({
	name: flagItem.name ?? '',
	category: flagItem.category,
	description: flagItem.description ?? '',
});

const normalizeCompanyPayload = (form: CompanyFormState): CreateCompanyRequest | UpdateCompanyRequest => ({
	name: form.name.trim(),
	description: form.description.trim() || null,
	iconId: form.iconId.trim() || null,
	siteUrl: form.siteUrl.trim() || null,
	linkedinUrl: form.linkedinUrl.trim() || null,
	hrUrl: form.hrUrl.trim() || null,
});

const normalizeFlagPayload = (form: FlagFormState): CreateFlagRequest | UpdateFlagRequest => ({
	name: form.name.trim(),
	category: form.category,
	description: form.description.trim(),
});

const isCompanyFormValid = (form: CompanyFormState) => form.name.trim().length > 0;
const isFlagFormValid = (form: FlagFormState) => form.name.trim().length > 0 && form.description.trim().length > 0;

export const AdminPage = () => {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { showToast } = useToast();
	const { state } = useAuth();

	const [activeSection, setActiveSection] = useState<AdminSection>('overview');

	const [companyQuery, setCompanyQuery] = useState('');
	const [companyTake, setCompanyTake] = useState(20);
	const [companyPage, setCompanyPage] = useState(1);
	const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
	const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
	const [editingCompany, setEditingCompany] = useState<AdminCompanyDto | null>(null);
	const [companyForm, setCompanyForm] = useState<CompanyFormState>(emptyCompanyForm);

	const [flagsQuery, setFlagsQuery] = useState('');
	const [flagsCategory, setFlagsCategory] = useState('');
	const [flagsTake, setFlagsTake] = useState(20);
	const [flagsPage, setFlagsPage] = useState(1);
	const [selectedFlagId, setSelectedFlagId] = useState<string | null>(null);
	const [isFlagModalOpen, setIsFlagModalOpen] = useState(false);
	const [editingFlag, setEditingFlag] = useState<AdminFlagDto | null>(null);
	const [flagForm, setFlagForm] = useState<FlagFormState>(emptyFlagForm);

	const [requestQuery, setRequestQuery] = useState('');
	const [requestStatus, setRequestStatus] = useState('');
	const [requestTake, setRequestTake] = useState(20);
	const [requestPage, setRequestPage] = useState(1);

	const [reportReason, setReportReason] = useState('');
	const [reportTake, setReportTake] = useState(20);
	const [reportPage, setReportPage] = useState(1);
	const [manualReviewId, setManualReviewId] = useState('');

	useEffect(() => {
		if (!state.loading && !state.isAuthenticated) {
			navigate('/login', { replace: true });
		}
	}, [navigate, state.isAuthenticated, state.loading]);

	const companiesQuery = useQuery({
		queryKey: ['admin', 'companies', companyQuery, companyTake, companyPage],
		queryFn: () =>
			adminApi.getCompanies({
				q: companyQuery.trim() || undefined,
				take: companyTake,
				pageNum: companyPage,
			}),
		enabled: state.isAuthenticated,
	});

	const companyDetailQuery = useQuery({
		queryKey: ['admin', 'company', selectedCompanyId],
		queryFn: () => adminApi.getCompany(selectedCompanyId as string),
		enabled: state.isAuthenticated && !!selectedCompanyId,
	});

	const flagsQueryResult = useQuery({
		queryKey: ['admin', 'flags', flagsQuery, flagsCategory, flagsTake, flagsPage],
		queryFn: () =>
			adminApi.getFlags({
				q: flagsQuery.trim() || undefined,
				category: flagsCategory || undefined,
				take: flagsTake,
				pageNum: flagsPage,
			}),
		enabled: state.isAuthenticated,
	});

	const flagDetailQuery = useQuery({
		queryKey: ['admin', 'flag', selectedFlagId],
		queryFn: () => adminApi.getFlag(selectedFlagId as string),
		enabled: state.isAuthenticated && !!selectedFlagId,
	});

	const companyRequestsQuery = useQuery({
		queryKey: ['admin', 'company-requests', requestQuery, requestStatus, requestTake, requestPage],
		queryFn: () =>
			adminApi.getCompanyRequests({
				q: requestQuery.trim() || undefined,
				status: requestStatus.trim() || undefined,
				take: requestTake,
				pageNum: requestPage,
			}),
		enabled: state.isAuthenticated,
	});

	const reviewReportsQuery = useQuery({
		queryKey: ['admin', 'review-reports', reportReason, reportTake, reportPage],
		queryFn: () =>
			adminApi.getReviewReports({
				reasonType: reportReason.trim() || undefined,
				take: reportTake,
				pageNum: reportPage,
			}),
		enabled: state.isAuthenticated,
	});

	const companyMutation = useMutation({
		mutationFn: async (payload: { companyId?: string; body: CreateCompanyRequest | UpdateCompanyRequest }) => {
			if (payload.companyId) {
				return adminApi.updateCompany(payload.companyId, payload.body);
			}

			return adminApi.createCompany(payload.body);
		},
		onSuccess: (company) => {
			showToast(editingCompany ? 'Компания обновлена' : 'Компания создана', 'success');
			setSelectedCompanyId(company.companyId);
			setIsCompanyModalOpen(false);
			setEditingCompany(null);
			setCompanyForm(emptyCompanyForm);
			void queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
			void queryClient.invalidateQueries({ queryKey: ['admin', 'company', company.companyId] });
		},
		onError: (error) => showToast(getErrorMessage(error), 'error'),
	});

	const deleteCompanyMutation = useMutation({
		mutationFn: (companyId: string) => adminApi.deleteCompany(companyId),
		onSuccess: () => {
			showToast('Компания удалена', 'success');
			setSelectedCompanyId(null);
			void queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
		},
		onError: (error) => showToast(getErrorMessage(error), 'error'),
	});

	const flagMutation = useMutation({
		mutationFn: async (payload: { flagId?: string; body: CreateFlagRequest | UpdateFlagRequest }) => {
			if (payload.flagId) {
				return adminApi.updateFlag(payload.flagId, payload.body);
			}

			return adminApi.createFlag(payload.body);
		},
		onSuccess: (flagItem) => {
			showToast(editingFlag ? 'Флаг обновлён' : 'Флаг создан', 'success');
			setSelectedFlagId(flagItem.flagId);
			setIsFlagModalOpen(false);
			setEditingFlag(null);
			setFlagForm(emptyFlagForm);
			void queryClient.invalidateQueries({ queryKey: ['admin', 'flags'] });
			void queryClient.invalidateQueries({ queryKey: ['admin', 'flag', flagItem.flagId] });
		},
		onError: (error) => showToast(getErrorMessage(error), 'error'),
	});

	const deleteFlagMutation = useMutation({
		mutationFn: (flagId: string) => adminApi.deleteFlag(flagId),
		onSuccess: () => {
			showToast('Флаг удалён', 'success');
			setSelectedFlagId(null);
			void queryClient.invalidateQueries({ queryKey: ['admin', 'flags'] });
		},
		onError: (error) => showToast(getErrorMessage(error), 'error'),
	});

	const deleteReviewMutation = useMutation({
		mutationFn: (reviewId: string) => adminApi.deleteReview(reviewId),
		onSuccess: () => {
			showToast('Отзыв удалён', 'success');
			setManualReviewId('');
			void queryClient.invalidateQueries({ queryKey: ['admin', 'review-reports'] });
		},
		onError: (error) => showToast(getErrorMessage(error), 'error'),
	});

	const companies = companiesQuery.data?.companies ?? [];
	const flags = flagsQueryResult.data?.flags ?? [];
	const requests = companyRequestsQuery.data?.requests ?? [];
	const reports = reviewReportsQuery.data?.reports ?? [];

	useEffect(() => {
		if (!selectedCompanyId && companies.length > 0) {
			setSelectedCompanyId(companies[0].companyId);
		}
	}, [companies, selectedCompanyId]);

	useEffect(() => {
		if (!selectedFlagId && flags.length > 0) {
			setSelectedFlagId(flags[0].flagId);
		}
	}, [flags, selectedFlagId]);

	const summaryItems = useMemo(
		() => [
			{
				key: 'companies',
				title: 'Компании',
				value: companiesQuery.data?.totalCount ?? 0,
				description: 'CRUD компаний и просмотр карточки по id',
				icon: Building2,
			},
			{
				key: 'flags',
				title: 'Флаги',
				value: flagsQueryResult.data?.totalCount ?? 0,
				description: 'Управление библиотекой флагов и категориями',
				icon: Flag,
			},
			{
				key: 'requests',
				title: 'Заявки',
				value: companyRequestsQuery.data?.totalCount ?? 0,
				description: 'Входящие заявки на добавление компаний',
				icon: ClipboardList,
			},
			{
				key: 'reports',
				title: 'Жалобы',
				value: reviewReportsQuery.data?.totalCount ?? 0,
				description: 'Модерация жалоб и удаление отзывов',
				icon: ShieldAlert,
			},
		],
		[
			companiesQuery.data?.totalCount,
			flagsQueryResult.data?.totalCount,
			companyRequestsQuery.data?.totalCount,
			reviewReportsQuery.data?.totalCount,
		],
	);

	const openCreateCompanyModal = () => {
		setEditingCompany(null);
		setCompanyForm(emptyCompanyForm);
		setIsCompanyModalOpen(true);
	};

	const openEditCompanyModal = async (company: AdminCompanyDto) => {
		try {
			const freshCompany = await adminApi.getCompany(company.companyId);
			setEditingCompany(freshCompany);
			setCompanyForm(mapCompanyToForm(freshCompany));
			setIsCompanyModalOpen(true);
		} catch (error) {
			showToast(getErrorMessage(error), 'error');
		}
	};

	const openCreateFlagModal = () => {
		setEditingFlag(null);
		setFlagForm(emptyFlagForm);
		setIsFlagModalOpen(true);
	};

	const openEditFlagModal = async (flagItem: AdminFlagDto) => {
		try {
			const freshFlag = await adminApi.getFlag(flagItem.flagId);
			setEditingFlag(freshFlag);
			setFlagForm(mapFlagToForm(freshFlag));
			setIsFlagModalOpen(true);
		} catch (error) {
			showToast(getErrorMessage(error), 'error');
		}
	};

	const submitCompanyForm = () => {
		if (!isCompanyFormValid(companyForm)) {
			showToast('Название компании обязательно', 'error');
			return;
		}

		void companyMutation.mutate({
			companyId: editingCompany?.companyId,
			body: normalizeCompanyPayload(companyForm),
		});
	};

	const submitFlagForm = () => {
		if (!isFlagFormValid(flagForm)) {
			showToast('Для флага нужны имя, категория и описание', 'error');
			return;
		}

		void flagMutation.mutate({
			flagId: editingFlag?.flagId,
			body: normalizeFlagPayload(flagForm),
		});
	};

	const handleDeleteCompany = (company: AdminCompanyDto) => {
		if (!window.confirm(`Удалить компанию "${company.name ?? company.companyId}"?`)) {
			return;
		}

		void deleteCompanyMutation.mutate(company.companyId);
	};

	const handleDeleteFlag = (flagItem: AdminFlagDto) => {
		if (!window.confirm(`Удалить флаг "${flagItem.name ?? flagItem.flagId}"?`)) {
			return;
		}

		void deleteFlagMutation.mutate(flagItem.flagId);
	};

	const handleDeleteReview = (reviewId: string) => {
		if (!window.confirm(`Удалить отзыв ${reviewId}?`)) {
			return;
		}

		void deleteReviewMutation.mutate(reviewId);
	};

	const sections = [
		{ id: 'overview', label: 'Обзор', icon: LayoutGrid },
		{ id: 'companies', label: 'Компании', icon: Building2 },
		{ id: 'flags', label: 'Флаги', icon: Flag },
		{ id: 'requests', label: 'Заявки', icon: ClipboardList },
		{ id: 'reports', label: 'Жалобы', icon: ShieldAlert },
	] as const;

	if (!state.isAuthenticated) {
		return null;
	}

	return (
		<div className={styles.page}>
			<HeaderGlow />
			<CenterGlow />

			<header className={styles.header}>
				<div className={styles.brandBlock}>
					<button className={styles.logoButton} onClick={() => navigate('/recommendations')} type="button">
						<img src="/assets/vibecheck-favicon.png" alt="VibeCheck" className={styles.logo} />
						<span className={styles.logoText}>VibeCheck Admin</span>
					</button>
					<div className={styles.headerText}>
						<h1 className={styles.title}>Админ-панель</h1>
						<p className={styles.subtitle}>
							Отдельная страница для модерации контента, компаний, флагов и входящих заявок.
						</p>
					</div>
				</div>
				<UserNavButton nickname="Admin" />
			</header>

			<main className={styles.main}>
				<section className={styles.hero}>
					<div className={styles.heroCopy}>
						<span className={styles.kicker}>ReviewService.Admin.Api</span>
						<h2 className={styles.heroTitle}>Все функции админского API на одном экране</h2>
						<p className={styles.heroText}>
							Списки, поиск, пагинация, просмотр деталей, создание, редактирование, удаление и ручная модерация отзывов.
						</p>
					</div>
					<div className={styles.heroActions}>
						<Button variant="secondary" size="medium" onClick={() => setActiveSection('companies')}>
							Перейти к компаниям
						</Button>
						<Button size="medium" onClick={() => setActiveSection('reports')}>
							Открыть модерацию
						</Button>
					</div>
				</section>

				<section className={styles.summaryGrid}>
					{summaryItems.map(({ key, title, value, description, icon: Icon }) => (
						<button
							key={key}
							type="button"
							className={styles.summaryCard}
							onClick={() => setActiveSection(key as AdminSection)}
						>
							<div className={styles.summaryIcon}>
								<Icon size={22} />
							</div>
							<div className={styles.summaryContent}>
								<span className={styles.summaryValue}>{value}</span>
								<span className={styles.summaryTitle}>{title}</span>
								<p className={styles.summaryDescription}>{description}</p>
							</div>
						</button>
					))}
				</section>

				<nav className={styles.sectionTabs}>
					{sections.map(({ id, label, icon: Icon }) => (
						<button
							key={id}
							type="button"
							className={`${styles.sectionTab} ${activeSection === id ? styles.sectionTabActive : ''}`}
							onClick={() => setActiveSection(id)}
						>
							<Icon size={18} />
							<span>{label}</span>
						</button>
					))}
				</nav>

				{activeSection === 'overview' && (
					<section className={styles.panel}>
						<div className={styles.panelHeader}>
							<div>
								<h3 className={styles.panelTitle}>Карта возможностей</h3>
								<p className={styles.panelText}>
									Экран покрывает все endpoints: CRUD компаний, CRUD флагов, чтение заявок, чтение жалоб и удаление отзывов.
								</p>
							</div>
						</div>
						<div className={styles.capabilityGrid}>
							<CapabilityCard
								title="Companies"
								items={[
									'Список компаний с q / take / pageNum',
									'Просмотр компании по companyId',
									'Создание, обновление и удаление компании',
								]}
							/>
							<CapabilityCard
								title="Flags"
								items={[
									'Список флагов с q / category / take / pageNum',
									'Просмотр флага по flagId',
									'Создание, обновление и удаление флага',
								]}
							/>
							<CapabilityCard
								title="Company Requests"
								items={[
									'Список заявок с фильтрами status / q',
									'Просмотр статуса, автора, дат и decision metadata',
								]}
							/>
							<CapabilityCard
								title="Review Reports"
								items={[
									'Список жалоб с фильтром reasonType',
									'Удаление отзыва по reviewId из карточки жалобы или вручную',
								]}
							/>
						</div>
					</section>
				)}

				{activeSection === 'companies' && (
					<section className={styles.panel}>
						<div className={styles.panelHeader}>
							<div>
								<h3 className={styles.panelTitle}>Компании</h3>
								<p className={styles.panelText}>Полный CRUD для карточек компаний.</p>
							</div>
							<div className={styles.panelActions}>
								<Button variant="secondary" size="small" onClick={() => void companiesQuery.refetch()}>
									<RefreshCw size={16} />
									Обновить
								</Button>
								<Button size="small" onClick={openCreateCompanyModal}>
									<BadgeCheck size={16} />
									Новая компания
								</Button>
							</div>
						</div>

						<div className={styles.toolbar}>
							<Input
								label="Поиск"
								placeholder="Название или фрагмент"
								value={companyQuery}
								onChange={(event) => {
									setCompanyQuery(event.target.value);
									setCompanyPage(1);
								}}
							/>
							<Select
								label="Размер страницы"
								value={String(companyTake)}
								options={PAGE_SIZE_OPTIONS}
								onChange={(value) => {
									setCompanyTake(Number(value));
									setCompanyPage(1);
								}}
							/>
						</div>

						<div className={styles.splitLayout}>
							<div className={styles.listColumn}>
								{companiesQuery.isLoading ? (
									<LoaderBlock />
								) : companies.length === 0 ? (
									<EmptyState title="Компании не найдены" text="Попробуйте изменить строку поиска или создать новую карточку." />
								) : (
									<>
										<div className={styles.cardList}>
											{companies.map((company) => (
												<EntityCard
													key={company.companyId}
													title={company.name ?? 'Без названия'}
													subtitle={company.siteUrl || company.companyId}
													meta={[
														`Создано: ${formatDate(company.createdAt)}`,
														`Обновлено: ${formatDate(company.updatedAt)}`,
													]}
													selected={selectedCompanyId === company.companyId}
													onSelect={() => setSelectedCompanyId(company.companyId)}
													onInspect={() => setSelectedCompanyId(company.companyId)}
													onEdit={() => void openEditCompanyModal(company)}
													onDelete={() => handleDeleteCompany(company)}
												/>
											))}
										</div>
										<Pagination
											page={companyPage}
											total={companiesQuery.data?.totalCount ?? 0}
											take={companyTake}
											onPageChange={setCompanyPage}
										/>
									</>
								)}
							</div>

							<div className={styles.detailColumn}>
								<DetailPanel
									title="Карточка компании"
									loading={companyDetailQuery.isLoading}
									empty={!selectedCompanyId}
									emptyText="Выберите компанию из списка, чтобы вызвать GET /api/companies/{companyId}."
								>
									{companyDetailQuery.data && (
										<dl className={styles.detailList}>
											<DetailItem label="Company ID" value={companyDetailQuery.data.companyId} />
											<DetailItem label="Название" value={companyDetailQuery.data.name} />
											<DetailItem label="Описание" value={companyDetailQuery.data.description} />
											<DetailItem label="Icon ID" value={companyDetailQuery.data.iconId} />
											<DetailItem label="Site URL" value={companyDetailQuery.data.siteUrl} />
											<DetailItem label="LinkedIn URL" value={companyDetailQuery.data.linkedinUrl} />
											<DetailItem label="HR URL" value={companyDetailQuery.data.hrUrl} />
											<DetailItem label="Создана" value={formatDate(companyDetailQuery.data.createdAt)} />
											<DetailItem label="Обновлена" value={formatDate(companyDetailQuery.data.updatedAt)} />
										</dl>
									)}
								</DetailPanel>
							</div>
						</div>
					</section>
				)}

				{activeSection === 'flags' && (
					<section className={styles.panel}>
						<div className={styles.panelHeader}>
							<div>
								<h3 className={styles.panelTitle}>Флаги</h3>
								<p className={styles.panelText}>CRUD для библиотеки флагов и фильтрация по категории.</p>
							</div>
							<div className={styles.panelActions}>
								<Button variant="secondary" size="small" onClick={() => void flagsQueryResult.refetch()}>
									<RefreshCw size={16} />
									Обновить
								</Button>
								<Button size="small" onClick={openCreateFlagModal}>
									<BadgeCheck size={16} />
									Новый флаг
								</Button>
							</div>
						</div>

						<div className={styles.toolbarWide}>
							<Input
								label="Поиск"
								placeholder="Название или описание"
								value={flagsQuery}
								onChange={(event) => {
									setFlagsQuery(event.target.value);
									setFlagsPage(1);
								}}
							/>
							<Select
								label="Категория"
								value={flagsCategory || 'all'}
								options={[{ value: 'all', label: 'Все категории' }, ...FLAG_CATEGORY_OPTIONS]}
								onChange={(value) => {
									setFlagsCategory(value === 'all' ? '' : value);
									setFlagsPage(1);
								}}
							/>
							<Select
								label="Размер страницы"
								value={String(flagsTake)}
								options={PAGE_SIZE_OPTIONS}
								onChange={(value) => {
									setFlagsTake(Number(value));
									setFlagsPage(1);
								}}
							/>
						</div>

						<div className={styles.splitLayout}>
							<div className={styles.listColumn}>
								{flagsQueryResult.isLoading ? (
									<LoaderBlock />
								) : flags.length === 0 ? (
									<EmptyState title="Флаги не найдены" text="Очистите фильтры или создайте новый флаг." />
								) : (
									<>
										<div className={styles.cardList}>
											{flags.map((flagItem) => (
												<EntityCard
													key={flagItem.flagId}
													title={flagItem.name ?? 'Без названия'}
													subtitle={flagItem.category}
													meta={[
														flagItem.description ?? 'Без описания',
														`Создано: ${formatDate(flagItem.createdAt)}`,
													]}
													selected={selectedFlagId === flagItem.flagId}
													onSelect={() => setSelectedFlagId(flagItem.flagId)}
													onInspect={() => setSelectedFlagId(flagItem.flagId)}
													onEdit={() => void openEditFlagModal(flagItem)}
													onDelete={() => handleDeleteFlag(flagItem)}
												/>
											))}
										</div>
										<Pagination
											page={flagsPage}
											total={flagsQueryResult.data?.totalCount ?? 0}
											take={flagsTake}
											onPageChange={setFlagsPage}
										/>
									</>
								)}
							</div>
							<div className={styles.detailColumn}>
								<DetailPanel
									title="Карточка флага"
									loading={flagDetailQuery.isLoading}
									empty={!selectedFlagId}
									emptyText="Выберите флаг из списка, чтобы вызвать GET /api/flags/{flagId}."
								>
									{flagDetailQuery.data && (
										<dl className={styles.detailList}>
											<DetailItem label="Flag ID" value={flagDetailQuery.data.flagId} />
											<DetailItem label="Название" value={flagDetailQuery.data.name} />
											<DetailItem label="Категория" value={flagDetailQuery.data.category} />
											<DetailItem label="Описание" value={flagDetailQuery.data.description} />
											<DetailItem label="Создан" value={formatDate(flagDetailQuery.data.createdAt)} />
										</dl>
									)}
								</DetailPanel>
							</div>
						</div>
					</section>
				)}

				{activeSection === 'requests' && (
					<section className={styles.panel}>
						<div className={styles.panelHeader}>
							<div>
								<h3 className={styles.panelTitle}>Заявки на компании</h3>
								<p className={styles.panelText}>GET /api/company-requests со статусом, поиском и пагинацией.</p>
							</div>
							<div className={styles.panelActions}>
								<Button variant="secondary" size="small" onClick={() => void companyRequestsQuery.refetch()}>
									<RefreshCw size={16} />
									Обновить
								</Button>
							</div>
						</div>

						<div className={styles.toolbarWide}>
							<Input
								label="Поиск"
								placeholder="Название заявки"
								value={requestQuery}
								onChange={(event) => {
									setRequestQuery(event.target.value);
									setRequestPage(1);
								}}
							/>
							<Input
								label="Статус"
								placeholder="Например: Pending"
								value={requestStatus}
								onChange={(event) => {
									setRequestStatus(event.target.value);
									setRequestPage(1);
								}}
							/>
							<Select
								label="Размер страницы"
								value={String(requestTake)}
								options={PAGE_SIZE_OPTIONS}
								onChange={(value) => {
									setRequestTake(Number(value));
									setRequestPage(1);
								}}
							/>
						</div>

						{companyRequestsQuery.isLoading ? (
							<LoaderBlock />
						) : requests.length === 0 ? (
							<EmptyState title="Заявки не найдены" text="Смените фильтры, чтобы увидеть другие заявки." />
						) : (
							<>
								<div className={styles.gridList}>
									{requests.map((requestItem) => (
										<RequestCard key={requestItem.requestId} request={requestItem} />
									))}
								</div>
								<Pagination
									page={requestPage}
									total={companyRequestsQuery.data?.totalCount ?? 0}
									take={requestTake}
									onPageChange={setRequestPage}
								/>
							</>
						)}
					</section>
				)}

				{activeSection === 'reports' && (
					<section className={styles.panel}>
						<div className={styles.panelHeader}>
							<div>
								<h3 className={styles.panelTitle}>Жалобы и модерация отзывов</h3>
								<p className={styles.panelText}>GET /api/review-reports и DELETE /api/reviews/{'{reviewId}'}.</p>
							</div>
							<div className={styles.panelActions}>
								<Button variant="secondary" size="small" onClick={() => void reviewReportsQuery.refetch()}>
									<RefreshCw size={16} />
									Обновить
								</Button>
							</div>
						</div>

						<div className={styles.reportTools}>
							<div className={styles.toolbarWide}>
								<Input
									label="Reason type"
									placeholder="Spam, Abuse, etc."
									value={reportReason}
									onChange={(event) => {
										setReportReason(event.target.value);
										setReportPage(1);
									}}
								/>
								<Select
									label="Размер страницы"
									value={String(reportTake)}
									options={PAGE_SIZE_OPTIONS}
									onChange={(value) => {
										setReportTake(Number(value));
										setReportPage(1);
									}}
								/>
							</div>
							<div className={styles.manualModeration}>
								<Input
									label="Удалить отзыв по UUID"
									placeholder="reviewId"
									value={manualReviewId}
									onChange={(event) => setManualReviewId(event.target.value)}
								/>
								<Button
									size="small"
									onClick={() => handleDeleteReview(manualReviewId.trim())}
									disabled={!manualReviewId.trim() || deleteReviewMutation.isPending}
								>
									<Trash2 size={16} />
									Удалить вручную
								</Button>
							</div>
						</div>

						{reviewReportsQuery.isLoading ? (
							<LoaderBlock />
						) : reports.length === 0 ? (
							<EmptyState title="Жалобы не найдены" text="Смените фильтр reasonType или обновите данные." />
						) : (
							<>
								<div className={styles.gridList}>
									{reports.map((report) => (
										<ReportCard
											key={report.reportId}
											report={report}
											onDeleteReview={() => handleDeleteReview(report.reviewId)}
										/>
									))}
								</div>
								<Pagination
									page={reportPage}
									total={reviewReportsQuery.data?.totalCount ?? 0}
									take={reportTake}
									onPageChange={setReportPage}
								/>
							</>
						)}
					</section>
				)}
			</main>

			<Modal isOpen={isCompanyModalOpen} onClose={() => setIsCompanyModalOpen(false)} className={styles.modalWide}>
				<div className={styles.modalBody}>
					<div className={styles.modalHeader}>
						<h3 className={styles.modalTitle}>{editingCompany ? 'Редактировать компанию' : 'Новая компания'}</h3>
						<p className={styles.modalText}>POST /api/companies и PUT /api/companies/{'{companyId}'}</p>
					</div>
					<div className={styles.formGrid}>
						<Input
							label="Название"
							value={companyForm.name}
							required
							onChange={(event) => setCompanyForm((prev) => ({ ...prev, name: event.target.value }))}
						/>
						<Input
							label="Icon ID"
							value={companyForm.iconId}
							onChange={(event) => setCompanyForm((prev) => ({ ...prev, iconId: event.target.value }))}
						/>
						<Input
							label="Site URL"
							value={companyForm.siteUrl}
							onChange={(event) => setCompanyForm((prev) => ({ ...prev, siteUrl: event.target.value }))}
						/>
						<Input
							label="LinkedIn URL"
							value={companyForm.linkedinUrl}
							onChange={(event) => setCompanyForm((prev) => ({ ...prev, linkedinUrl: event.target.value }))}
						/>
						<Input
							label="HR URL"
							value={companyForm.hrUrl}
							onChange={(event) => setCompanyForm((prev) => ({ ...prev, hrUrl: event.target.value }))}
						/>
						<div className={styles.formGridFull}>
							<TextAreaField
								label="Описание"
								value={companyForm.description}
								onChange={(value) => setCompanyForm((prev) => ({ ...prev, description: value }))}
								maxLength={1000}
							/>
						</div>
					</div>
					<div className={styles.modalActions}>
						<Button variant="secondary" size="small" onClick={() => setIsCompanyModalOpen(false)}>
							Отмена
						</Button>
						<Button size="small" onClick={submitCompanyForm} disabled={companyMutation.isPending}>
							{editingCompany ? 'Сохранить' : 'Создать'}
						</Button>
					</div>
				</div>
			</Modal>

			<Modal isOpen={isFlagModalOpen} onClose={() => setIsFlagModalOpen(false)} className={styles.modalNarrow}>
				<div className={styles.modalBody}>
					<div className={styles.modalHeader}>
						<h3 className={styles.modalTitle}>{editingFlag ? 'Редактировать флаг' : 'Новый флаг'}</h3>
						<p className={styles.modalText}>POST /api/flags и PUT /api/flags/{'{flagId}'}</p>
					</div>
					<div className={styles.formGrid}>
						<Input
							label="Название"
							value={flagForm.name}
							required
							onChange={(event) => setFlagForm((prev) => ({ ...prev, name: event.target.value }))}
						/>
						<Select
							label="Категория"
							value={flagForm.category}
							options={FLAG_CATEGORY_OPTIONS}
							onChange={(value) => setFlagForm((prev) => ({ ...prev, category: value as FlagCategory }))}
						/>
						<div className={styles.formGridFull}>
							<TextAreaField
								label="Описание"
								value={flagForm.description}
								required
								onChange={(value) => setFlagForm((prev) => ({ ...prev, description: value }))}
								maxLength={600}
							/>
						</div>
					</div>
					<div className={styles.modalActions}>
						<Button variant="secondary" size="small" onClick={() => setIsFlagModalOpen(false)}>
							Отмена
						</Button>
						<Button size="small" onClick={submitFlagForm} disabled={flagMutation.isPending}>
							{editingFlag ? 'Сохранить' : 'Создать'}
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
};

const LoaderBlock = () => (
	<div className={styles.loaderBlock}>
		<Spinner />
	</div>
);

const EmptyState = ({ title, text }: { title: string; text: string }) => (
	<div className={styles.emptyState}>
		<AlertTriangle size={28} />
		<h4>{title}</h4>
		<p>{text}</p>
	</div>
);

const CapabilityCard = ({ title, items }: { title: string; items: string[] }) => (
	<div className={styles.capabilityCard}>
		<h4 className={styles.capabilityTitle}>{title}</h4>
		<ul className={styles.capabilityList}>
			{items.map((item) => (
				<li key={item}>{item}</li>
			))}
		</ul>
	</div>
);

interface EntityCardProps {
	title: string;
	subtitle: string;
	meta: string[];
	selected: boolean;
	onSelect: () => void;
	onInspect: () => void;
	onEdit: () => void;
	onDelete: () => void;
}

const EntityCard = ({
	title,
	subtitle,
	meta,
	selected,
	onSelect,
	onInspect,
	onEdit,
	onDelete,
}: EntityCardProps) => (
	<button
		type="button"
		className={`${styles.entityCard} ${selected ? styles.entityCardSelected : ''}`}
		onClick={onSelect}
	>
		<div className={styles.entityHead}>
			<div>
				<h4 className={styles.entityTitle}>{title}</h4>
				<p className={styles.entitySubtitle}>{subtitle}</p>
			</div>
			<div className={styles.entityActions}>
				<IconActionButton label="Открыть" onClick={onInspect} icon={<Eye size={16} />} />
				<IconActionButton label="Редактировать" onClick={onEdit} icon={<PencilLine size={16} />} />
				<IconActionButton label="Удалить" onClick={onDelete} danger icon={<Trash2 size={16} />} />
			</div>
		</div>
		<div className={styles.metaList}>
			{meta.map((item) => (
				<span key={item} className={styles.metaChip}>
					{item}
				</span>
			))}
		</div>
	</button>
);

const DetailPanel = ({
	title,
	loading,
	empty,
	emptyText,
	children,
}: {
	title: string;
	loading: boolean;
	empty: boolean;
	emptyText: string;
	children: React.ReactNode;
}) => (
	<div className={styles.detailPanel}>
		<h4 className={styles.detailTitle}>{title}</h4>
		{loading ? <LoaderBlock /> : empty ? <p className={styles.detailEmpty}>{emptyText}</p> : children}
	</div>
);

const DetailItem = ({ label, value }: { label: string; value?: string | null }) => (
	<div className={styles.detailItem}>
		<dt>{label}</dt>
		<dd>{value?.trim() ? value : '—'}</dd>
	</div>
);

const RequestCard = ({ request }: { request: CompanyRequestDto }) => (
	<article className={styles.infoCard}>
		<div className={styles.infoCardTop}>
			<div>
				<h4 className={styles.infoCardTitle}>{request.name ?? 'Без названия'}</h4>
				<p className={styles.infoCardSubtitle}>{request.siteUrl || request.requestId}</p>
			</div>
			<span className={styles.statusBadge}>{request.status ?? 'Unknown'}</span>
		</div>
		<dl className={styles.infoDetails}>
			<DetailItem label="Request ID" value={request.requestId} />
			<DetailItem label="Requester" value={request.requesterUserId} />
			<DetailItem label="Создана" value={formatDate(request.createdAt)} />
			<DetailItem label="Решение" value={formatDate(request.decidedAt)} />
			<DetailItem label="Решил" value={request.decidedByUserId} />
		</dl>
	</article>
);

const ReportCard = ({
	report,
	onDeleteReview,
}: {
	report: ReviewReportDto;
	onDeleteReview: () => void;
}) => (
	<article className={styles.infoCard}>
		<div className={styles.infoCardTop}>
			<div>
				<h4 className={styles.infoCardTitle}>{report.companyName ?? 'Без компании'}</h4>
				<p className={styles.infoCardSubtitle}>reasonType: {report.reasonType ?? '—'}</p>
			</div>
			<Button size="small" onClick={onDeleteReview}>
				<Trash2 size={16} />
				Удалить отзыв
			</Button>
		</div>
		<dl className={styles.infoDetails}>
			<DetailItem label="Report ID" value={report.reportId} />
			<DetailItem label="Review ID" value={report.reviewId} />
			<DetailItem label="Reporter" value={report.reporterId} />
			<DetailItem label="Author" value={report.reviewAuthorId} />
			<DetailItem label="Company ID" value={report.companyId} />
			<DetailItem label="Создана жалоба" value={formatDate(report.createdAt)} />
			<DetailItem label="Создан отзыв" value={formatDate(report.reviewCreatedAt)} />
			<DetailItem label="Удалён отзыв" value={formatDate(report.reviewDeletedAt)} />
		</dl>
		<div className={styles.reportBodies}>
			<div className={styles.reportBody}>
				<span className={styles.reportLabel}>Текст причины</span>
				<p>{report.reasonText || '—'}</p>
			</div>
			<div className={styles.reportBody}>
				<span className={styles.reportLabel}>Текст отзыва</span>
				<p>{report.reviewText || '—'}</p>
			</div>
		</div>
	</article>
);

const Pagination = ({
	page,
	total,
	take,
	onPageChange,
}: {
	page: number;
	total: number;
	take: number;
	onPageChange: (page: number) => void;
}) => {
	const totalPages = Math.max(1, Math.ceil(total / take));

	return (
		<div className={styles.pagination}>
			<Button variant="secondary" size="small" onClick={() => onPageChange(page - 1)} disabled={page <= 1}>
				Назад
			</Button>
			<span className={styles.paginationLabel}>
				Страница {page} из {totalPages}
			</span>
			<Button
				variant="secondary"
				size="small"
				onClick={() => onPageChange(page + 1)}
				disabled={page >= totalPages}
			>
				Вперёд
			</Button>
		</div>
	);
};

const IconActionButton = ({
	label,
	icon,
	onClick,
	danger = false,
}: {
	label: string;
	icon: React.ReactNode;
	onClick: () => void;
	danger?: boolean;
}) => (
	<button
		type="button"
		aria-label={label}
		title={label}
		className={`${styles.iconAction} ${danger ? styles.iconActionDanger : ''}`}
		onClick={(event) => {
			event.stopPropagation();
			onClick();
		}}
	>
		{icon}
	</button>
);
