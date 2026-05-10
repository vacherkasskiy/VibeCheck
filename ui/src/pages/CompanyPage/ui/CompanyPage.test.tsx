/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanyPage } from './CompanyPage';

const {
	getMyInfoMock,
	useCompanyPageMock,
	useReviewModalMock,
	navigateMock,
	useParamsMock,
	useLocationMock,
	openModalMock,
	closeModalMock,
} = vi.hoisted(() => ({
	getMyInfoMock: vi.fn(),
	useCompanyPageMock: vi.fn(),
	useReviewModalMock: vi.fn(),
	navigateMock: vi.fn(),
	useParamsMock: vi.fn(),
	useLocationMock: vi.fn(),
	openModalMock: vi.fn(),
	closeModalMock: vi.fn(),
}));

vi.mock('entities/company', () => ({
	CompanyInfo: ({ company }: { company: { name: string } }) => <div>info:{company.name}</div>,
}));

vi.mock('features/auth', () => ({
	getMyInfo: getMyInfoMock,
}));

vi.mock('features/companyPage', () => ({
	useCompanyPage: useCompanyPageMock,
}));

vi.mock('features/reviewModal', () => ({
	useReviewModal: () => useReviewModalMock(),
	ReviewModal: ({
		isOpen,
		companyName,
	}: {
		isOpen: boolean;
		companyName: string;
	}) => <div>modal:{String(isOpen)}:{companyName}</div>,
}));

vi.mock('shared/ui', () => ({
	HeaderGlow: () => <div data-testid="header-glow" />,
	CenterGlow: () => <div data-testid="center-glow" />,
}));

vi.mock('shared/ui/UserNavButton', () => ({
	UserNavButton: ({ nickname }: { nickname?: string }) => <div>nav:{nickname ?? 'none'}</div>,
}));

vi.mock('./ReviewsSection', () => ({
	ReviewsSection: ({
		companyName,
		onEditReview,
	}: {
		companyName: string;
		onEditReview: (review: {
			reviewId: string;
			text: string;
			createdAt: string;
			flags: Array<{ id: string }>;
		}) => void;
	}) => (
		<div>
			<div>reviews:{companyName}</div>
			<button
				type="button"
				onClick={() =>
					onEditReview({
						reviewId: 'review-1',
						text: 'Review text',
						createdAt: '2026-01-01T00:00:00.000Z',
						flags: [{ id: 'flag-1' }],
					})
				}
			>
				edit review
			</button>
		</div>
	),
}));

vi.mock('./Top20FlagsSection', () => ({
	Top20FlagsSection: () => <div>flags section</div>,
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

	return {
		...actual,
		useNavigate: () => navigateMock,
		useParams: () => useParamsMock(),
		useLocation: () => useLocationMock(),
	};
});

describe('CompanyPage', () => {
	beforeEach(() => {
		getMyInfoMock.mockReset();
		useCompanyPageMock.mockReset();
		useReviewModalMock.mockReset();
		navigateMock.mockReset();
		useParamsMock.mockReset();
		useLocationMock.mockReset();
		openModalMock.mockReset();
		closeModalMock.mockReset();

		useParamsMock.mockReturnValue({ id: 'company-1' });
		useLocationMock.mockReturnValue({ pathname: '/company/company-1', state: null });
		getMyInfoMock.mockResolvedValue({ name: 'tester' });
		useReviewModalMock.mockReturnValue({
			isOpen: false,
			openModal: openModalMock,
			closeModal: closeModalMock,
			formData: { text: '', greenFlags: [], redFlags: [] },
			setGreenFlags: vi.fn(),
			setRedFlags: vi.fn(),
			setText: vi.fn(),
			canSubmit: false,
			canDelete: false,
			isEditMode: false,
			resetForm: vi.fn(),
			loading: false,
			error: null,
			submitReview: vi.fn(),
			deleteReview: vi.fn(),
		});
	});

	it('renders loading state', () => {
		// Arrange
		useCompanyPageMock.mockReturnValue({
			company: null,
			loading: true,
			error: null,
		});

		// Act
		render(<CompanyPage />);

		// Assert
		expect(screen.getByAltText('VibeCheck')).toBeInTheDocument();
		expect(screen.queryByText('info:')).not.toBeInTheDocument();
	});

	it('opens create and edit review flows and clears pending edit state', async () => {
		// Arrange
		useLocationMock.mockReturnValue({
			pathname: '/company/company-1',
			state: {
				editReview: {
					id: 'review-2',
					text: 'Pending review',
					createdAt: '2026-02-02T00:00:00.000Z',
				},
			},
		});
		useCompanyPageMock.mockReturnValue({
			company: { companyId: 'company-1', name: 'Acme' },
			loading: false,
			error: null,
		});

		// Act
		render(<CompanyPage />);
		await waitFor(() => {
			expect(openModalMock).toHaveBeenCalledWith({
				id: 'review-2',
				text: 'Pending review',
				greenFlags: [],
				redFlags: [],
				createdAt: '2026-02-02T00:00:00.000Z',
			});
		});
		fireEvent.click(screen.getByRole('button', { name: 'Написать отзыв' }));
		fireEvent.click(screen.getByRole('button', { name: 'edit review' }));

		// Assert
		expect(screen.getByText('info:Acme')).toBeInTheDocument();
		expect(screen.getByText('reviews:Acme')).toBeInTheDocument();
		expect(screen.getByText('nav:tester')).toBeInTheDocument();
		expect(navigateMock).toHaveBeenCalledWith('/company/company-1', {
			replace: true,
			state: null,
		});
		expect(openModalMock).toHaveBeenCalledTimes(3);
		expect(openModalMock).toHaveBeenNthCalledWith(
			2,
			expect.objectContaining({ type: 'click' }),
		);
		expect(openModalMock).toHaveBeenNthCalledWith(3, {
			id: 'review-1',
			text: 'Review text',
			greenFlags: ['flag-1'],
			redFlags: [],
			createdAt: '2026-01-01T00:00:00.000Z',
		});
	});
});
