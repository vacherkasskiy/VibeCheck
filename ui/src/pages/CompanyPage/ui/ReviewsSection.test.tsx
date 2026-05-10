/* eslint-disable @typescript-eslint/consistent-type-imports */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewsSection } from './ReviewsSection';

const {
	useCompanyReviewsMock,
	useVoteReviewMutationMock,
	openReviewMock,
	closeReviewMock,
	reportOpenMock,
	reportCloseMock,
	reportSubmitMock,
	reportSetReasonTypeMock,
	reportSetReasonTextMock,
	useParamsMock,
} = vi.hoisted(() => ({
	useCompanyReviewsMock: vi.fn(),
	useVoteReviewMutationMock: vi.fn(),
	openReviewMock: vi.fn(),
	closeReviewMock: vi.fn(),
	reportOpenMock: vi.fn(),
	reportCloseMock: vi.fn(),
	reportSubmitMock: vi.fn(),
	reportSetReasonTypeMock: vi.fn(),
	reportSetReasonTextMock: vi.fn(),
	useParamsMock: vi.fn(),
}));

vi.mock('features/companyPage', () => ({
	useCompanyReviews: useCompanyReviewsMock,
}));

vi.mock('features/userReviews', () => ({
	useVoteReviewMutation: useVoteReviewMutationMock,
}));

vi.mock('features/reviewView', () => ({
	useReviewViewModal: () => ({
		isOpen: false,
		selectedReview: null,
		openReview: openReviewMock,
		close: closeReviewMock,
	}),
	ReviewViewModal: () => null,
}));

vi.mock('features/reportModal', () => ({
	useReportModal: () => ({
		isOpen: false,
		reviewId: undefined,
		close: reportCloseMock,
		reasonType: 'Spam',
		setReasonType: reportSetReasonTypeMock,
		reasonText: '',
		setReasonText: reportSetReasonTextMock,
		isFormValid: true,
		isSubmitting: false,
		submit: reportSubmitMock,
		open: reportOpenMock,
	}),
	ReportModal: () => null,
}));

vi.mock('shared/lib', async () => {
	const actual = await vi.importActual<typeof import('shared/lib')>('shared/lib');
	return {
		...actual,
		getCurrentUserId: () => 'author-1',
	};
});

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useParams: () => useParamsMock(),
	};
});

const baseReview = {
	reviewId: 'review-1',
	authorId: 'author-1',
	iconId: null,
	text: 'Отзыв о компании',
	score: 2,
	createdAt: new Date(Date.now() - 60_000).toISOString(),
	flags: [{ id: 'flag-1', name: 'Supportive team' }],
	weight: 1,
};

describe('ReviewsSection', () => {
	beforeEach(() => {
		useCompanyReviewsMock.mockReset();
		useVoteReviewMutationMock.mockReset();
		openReviewMock.mockReset();
		closeReviewMock.mockReset();
		reportOpenMock.mockReset();
		reportCloseMock.mockReset();
		reportSubmitMock.mockReset();
		reportSetReasonTypeMock.mockReset();
		reportSetReasonTextMock.mockReset();
		useParamsMock.mockReset();

		useParamsMock.mockReturnValue({ id: 'company-1' });
		useVoteReviewMutationMock.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
	});

	it('renders loading state', () => {
		// Arrange
		useCompanyReviewsMock.mockReturnValue({
			reviews: [],
			total: 0,
			loading: true,
			loadingMore: false,
			error: null,
			sort: 'Newest',
			setSort: vi.fn(),
			hasMore: false,
			loadMore: vi.fn(),
		});

		// Act
		render(<ReviewsSection companyName="Acme" />);

		// Assert
		expect(screen.getByText('Загрузка отзывов...')).toBeInTheDocument();
	});

	it('renders error state', () => {
		// Arrange
		useCompanyReviewsMock.mockReturnValue({
			reviews: [],
			total: 0,
			loading: false,
			loadingMore: false,
			error: 'boom',
			sort: 'Newest',
			setSort: vi.fn(),
			hasMore: false,
			loadMore: vi.fn(),
		});

		// Act
		render(<ReviewsSection companyName="Acme" />);

		// Assert
		expect(screen.getByText('Ошибка загрузки отзывов')).toBeInTheDocument();
	});

	it('changes sort and opens review/report actions', () => {
		// Arrange
		const setSort = vi.fn();
		useCompanyReviewsMock.mockReturnValue({
			reviews: [baseReview],
			total: 1,
			loading: false,
			loadingMore: false,
			error: null,
			sort: 'Newest',
			setSort,
			hasMore: false,
			loadMore: vi.fn(),
		});

		render(<ReviewsSection companyName="Acme" />);

		// Act
		fireEvent.change(screen.getByRole('combobox'), {
			target: { value: 'Oldest' },
		});
		fireEvent.click(screen.getByRole('button', { name: /отзыв о компании/i }));
		fireEvent.click(screen.getByRole('button', { name: '⚠️ Пожаловаться' }));

		// Assert
		expect(setSort).toHaveBeenCalledWith('Oldest');
		expect(openReviewMock).toHaveBeenCalledWith(baseReview);
		expect(reportOpenMock).toHaveBeenCalledWith('review-1');
	});

	it('loads more reviews when button is available', () => {
		// Arrange
		const loadMore = vi.fn();
		useCompanyReviewsMock.mockReturnValue({
			reviews: [baseReview],
			total: 2,
			loading: false,
			loadingMore: false,
			error: null,
			sort: 'Newest',
			setSort: vi.fn(),
			hasMore: true,
			loadMore,
		});

		// Act
		render(<ReviewsSection companyName="Acme" />);
		fireEvent.click(screen.getByRole('button', { name: 'Загрузить ещё' }));

		// Assert
		expect(loadMore).toHaveBeenCalledTimes(1);
	});

	it('rolls back optimistic vote when mutation fails', () => {
		// Arrange
		let onErrorHandler: (() => void) | undefined;
		const mutate = vi.fn((_payload, options) => {
			onErrorHandler = options?.onError;
		});
		useVoteReviewMutationMock.mockReturnValue({
			mutate,
			isPending: false,
		});
		useCompanyReviewsMock.mockReturnValue({
			reviews: [baseReview],
			total: 1,
			loading: false,
			loadingMore: false,
			error: null,
			sort: 'Newest',
			setSort: vi.fn(),
			hasMore: false,
			loadMore: vi.fn(),
		});

		render(<ReviewsSection companyName="Acme" />);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Проголосовать вверх' }));
		expect(screen.getByText('3')).toBeInTheDocument();
		act(() => {
			onErrorHandler?.();
		});

		// Assert
		expect(mutate).toHaveBeenCalledWith(
			{ reviewId: 'review-1', mode: 'Like' },
			expect.objectContaining({ onError: expect.any(Function) }),
		);
		expect(screen.getAllByText('2').length).toBeGreaterThan(0);
	});
});
