import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useReportModal } from './useReportModal';

const { reportReviewMock } = vi.hoisted(() => ({
	reportReviewMock: vi.fn(),
}));

vi.mock('entities/company', () => ({
	reviewApi: {
		reportReview: reportReviewMock,
	},
}));

describe('useReportModal', () => {
	const createWrapper = () => {
		const client = new QueryClient({
			defaultOptions: {
				queries: { retry: false },
				mutations: { retry: false },
			},
		});

		return ({ children }: { children: React.ReactNode }) => (
			<QueryClientProvider client={client}>{children}</QueryClientProvider>
		);
	};

	beforeEach(() => {
		reportReviewMock.mockReset();
	});

	it('opens modal and resets state to defaults', () => {
		// Arrange
		const { result } = renderHook(() => useReportModal(), {
			wrapper: createWrapper(),
		});

		act(() => {
			result.current.setReasonType('Other');
			result.current.setReasonText('Причина');
		});

		// Act
		act(() => {
			result.current.open('review-1');
		});

		// Assert
		expect(result.current.isOpen).toBe(true);
		expect(result.current.reviewId).toBe('review-1');
		expect(result.current.reasonType).toBe('Spam');
		expect(result.current.reasonText).toBe('');
	});

	it('requires reason text when selected type is Other', () => {
		// Arrange
		const { result } = renderHook(() => useReportModal(), {
			wrapper: createWrapper(),
		});

		act(() => {
			result.current.open('review-1');
		});

		// Act
		act(() => {
			result.current.setReasonType('Other');
			result.current.setReasonText('   ');
		});

		// Assert
		expect(result.current.isOther).toBe(true);
		expect(result.current.isFormValid).toBe(false);
	});

	it('does not submit when form is invalid', () => {
		// Arrange
		const { result } = renderHook(() => useReportModal(), {
			wrapper: createWrapper(),
		});

		// Act
		act(() => {
			result.current.submit();
		});

		// Assert
		expect(reportReviewMock).not.toHaveBeenCalled();
	});

	it('submits report and closes modal on success', async () => {
		// Arrange
		reportReviewMock.mockResolvedValue(undefined);

		const { result } = renderHook(() => useReportModal(), {
			wrapper: createWrapper(),
		});

		act(() => {
			result.current.open('review-1');
			result.current.setReasonType('Other');
			result.current.setReasonText('  Неприемлемый контент  ');
		});

		// Act
		act(() => {
			result.current.submit();
		});

		// Assert
		await waitFor(() => {
			expect(reportReviewMock).toHaveBeenCalledWith('review-1', {
				reasonType: 'Other',
				reasonText: 'Неприемлемый контент',
			});
		});
		await waitFor(() => {
			expect(result.current.isOpen).toBe(false);
		});
		expect(result.current.reviewId).toBeUndefined();
		expect(result.current.reasonText).toBe('');
	});
});
