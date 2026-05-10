/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanyList } from './CompanyList';

const { navigateMock, observeMock, disconnectMock } = vi.hoisted(() => ({
	navigateMock: vi.fn(),
	observeMock: vi.fn(),
	disconnectMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

vi.mock('entities/company', () => ({
	CompanyCard: ({
		company,
		onClick,
	}: {
		company: { companyId: string; name: string };
		onClick: (id: string) => void;
	}) => (
		<button type="button" onClick={() => onClick(company.companyId)}>
			{company.name}
		</button>
	),
}));

vi.mock('./CompanyCardSkeleton', () => ({
	CompanyCardSkeleton: () => <div>Loading skeleton</div>,
}));

describe('CompanyList', () => {
	beforeEach(() => {
		navigateMock.mockReset();
		observeMock.mockReset();
		disconnectMock.mockReset();

		class MockIntersectionObserver {
			callback: IntersectionObserverCallback;

			constructor(callback: IntersectionObserverCallback) {
				this.callback = callback;
			}

			observe = observeMock;
			disconnect = disconnectMock;
			unobserve = vi.fn();
			takeRecords = vi.fn(() => []);
			root = null;
			rootMargin = '';
			thresholds = [];
		}

		vi.stubGlobal('IntersectionObserver', MockIntersectionObserver as any);
	});

	it('renders loading skeletons when pending and empty', () => {
		// Arrange
		render(
			<CompanyList
				items={[]}
				pending={true}
				hasMore={false}
				onLoadMore={vi.fn()}
			/>,
		);

		// Act
		const skeletons = screen.getAllByText('Loading skeleton');

		// Assert
		expect(skeletons).toHaveLength(4);
	});

	it('renders empty state and navigates to add company page', () => {
		// Arrange
		render(
			<CompanyList
				items={[]}
				pending={false}
				hasMore={false}
				onLoadMore={vi.fn()}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Предложить компанию' }));

		// Assert
		expect(screen.getByText('Компания не найдена')).toBeInTheDocument();
		expect(navigateMock).toHaveBeenCalledWith('/add-company');
	});

	it('renders company items and uses custom card click handler', () => {
		// Arrange
		const onCardClick = vi.fn();
		render(
			<CompanyList
				items={[
					{ companyId: 'company-1', name: 'Acme' },
					{ companyId: 'company-2', name: 'Beta' },
				] as any}
				pending={false}
				hasMore={false}
				onLoadMore={vi.fn()}
				onCardClick={onCardClick}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Acme' }));

		// Assert
		expect(screen.getByRole('button', { name: 'Beta' })).toBeInTheDocument();
		expect(onCardClick).toHaveBeenCalledWith('company-1');
	});
});
