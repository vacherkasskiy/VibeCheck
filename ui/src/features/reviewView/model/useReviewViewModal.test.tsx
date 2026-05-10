import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useReviewViewModal } from './useReviewViewModal';
import type { CompanyReview } from 'entities/company';

const review: CompanyReview = {
	weight: 1,
	reviewId: 'review-1',
	authorId: 'author-1',
	iconId: null,
	text: 'Тестовый отзыв',
	score: 10,
	createdAt: '2026-05-10T00:00:00Z',
	flags: [{ id: 'flag-1', name: 'Флаг 1' }],
};

describe('useReviewViewModal', () => {
	it('opens modal and stores selected review', () => {
		// Arrange
		const { result } = renderHook(() => useReviewViewModal());

		// Act
		act(() => {
			result.current.openReview(review);
		});

		// Assert
		expect(result.current.isOpen).toBe(true);
		expect(result.current.selectedReview).toEqual(review);
	});

	it('closes modal and clears selected review', () => {
		// Arrange
		const { result } = renderHook(() => useReviewViewModal());

		act(() => {
			result.current.openReview(review);
		});

		// Act
		act(() => {
			result.current.close();
		});

		// Assert
		expect(result.current.isOpen).toBe(false);
		expect(result.current.selectedReview).toBeNull();
	});
});
