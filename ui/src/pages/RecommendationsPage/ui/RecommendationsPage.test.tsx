/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen } from '@testing-library/react';
import { ApiError } from 'shared/api/types';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecommendationsPage } from './RecommendationsPage';

const { useCompanySearchMock, navigateMock, authStateMock, requestLoginMock } = vi.hoisted(() => ({
	useCompanySearchMock: vi.fn(),
	navigateMock: vi.fn(),
	requestLoginMock: vi.fn(),
	authStateMock: {
		isAuthenticated: true,
		loading: false,
	},
}));

vi.mock('features/companySearch', () => ({
	useCompanySearch: useCompanySearchMock,
}));

vi.mock('features/auth', () => ({
	useAuth: () => ({
		state: authStateMock,
		requestLogin: requestLoginMock,
	}),
}));

vi.mock('shared/ui', () => ({
	HeaderGlow: () => <div data-testid="header-glow" />,
	CenterGlow: () => <div data-testid="center-glow" />,
}));

vi.mock('widgets/RecommendationsHeader', () => ({
	RecommendationsHeader: ({
		searchValue,
		onSearchChange,
	}: {
		searchValue: string;
		onSearchChange: (value: string) => void;
	}) => (
		<div>
			<div>query:{searchValue}</div>
			<button type="button" onClick={() => onSearchChange('backend')}>
				change search
			</button>
		</div>
	),
}));

vi.mock('widgets/CompanyList', () => ({
	CompanyList: ({
		items,
		pending,
		hasMore,
		onLoadMore,
		onCardClick,
	}: {
		items: Array<{ id: string }>;
		pending: boolean;
		hasMore: boolean;
		onLoadMore: () => void;
		onCardClick: (id: string) => void;
	}) => (
		<div>
			<div>items:{items.length}</div>
			<div>pending:{String(pending)}</div>
			<div>hasMore:{String(hasMore)}</div>
			<button type="button" onClick={onLoadMore}>
				load more
			</button>
			<button type="button" onClick={() => onCardClick('company-1')}>
				open company
			</button>
		</div>
	),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

describe('RecommendationsPage', () => {
	beforeEach(() => {
		useCompanySearchMock.mockReset();
		navigateMock.mockReset();
		requestLoginMock.mockReset();
		authStateMock.isAuthenticated = true;
		authStateMock.loading = false;
	});

	it('renders search and company list and wires handlers', () => {
		// Arrange
		const setQuery = vi.fn();
		const loadMore = vi.fn();

		useCompanySearchMock.mockReturnValue({
			query: 'frontend',
			setQuery,
			items: [{ id: 'company-1' }],
			total: 1,
			pending: false,
			hasMore: true,
			loadMore,
			error: null,
		});

		// Act
		render(<RecommendationsPage />);
		fireEvent.click(screen.getByRole('button', { name: 'change search' }));
		fireEvent.click(screen.getByRole('button', { name: 'load more' }));
		fireEvent.click(screen.getByRole('button', { name: 'open company' }));

		// Assert
		expect(screen.getByText('query:frontend')).toBeInTheDocument();
		expect(screen.getByText('items:1')).toBeInTheDocument();
		expect(setQuery).toHaveBeenCalledWith('backend');
		expect(loadMore).toHaveBeenCalledTimes(1);
		expect(navigateMock).toHaveBeenCalledWith('/company/company-1');
	});

	it('redirects to login when user is not authenticated', () => {
		authStateMock.isAuthenticated = false;
		useCompanySearchMock.mockReturnValue({
			query: '',
			setQuery: vi.fn(),
			items: [],
			total: 0,
			pending: false,
			hasMore: false,
			loadMore: vi.fn(),
			error: null,
		});

		render(<RecommendationsPage />);

		expect(requestLoginMock).toHaveBeenCalledWith(
			'Для доступа к рекомендациям необходимо войти в аккаунт.',
		);
	});

	it('redirects to blocked page when recommendations API returns 403', () => {
		useCompanySearchMock.mockReturnValue({
			query: '',
			setQuery: vi.fn(),
			items: [],
			total: 0,
			pending: false,
			hasMore: false,
			loadMore: vi.fn(),
			error: new ApiError('Доступ запрещён', 403),
		});

		render(<RecommendationsPage />);

		expect(navigateMock).toHaveBeenCalledWith('/blocked', { replace: true });
	});
});
