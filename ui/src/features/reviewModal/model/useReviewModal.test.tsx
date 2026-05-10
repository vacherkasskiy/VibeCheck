import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useReviewModal } from './useReviewModal';

const { createCompanyReviewMock, updateCompanyReviewMock, deleteCompanyReviewMock, invalidateMock } =
	vi.hoisted(() => ({
		createCompanyReviewMock: vi.fn(),
		updateCompanyReviewMock: vi.fn(),
		deleteCompanyReviewMock: vi.fn(),
		invalidateMock: vi.fn(),
	}));

vi.mock('entities/company', () => ({
	reviewApi: {
		createCompanyReview: createCompanyReviewMock,
		updateCompanyReview: updateCompanyReviewMock,
		deleteCompanyReview: deleteCompanyReviewMock,
	},
	invalidateCompanyReviewCaches: invalidateMock,
}));

describe('useReviewModal', () => {
	beforeEach(() => {
		createCompanyReviewMock.mockReset();
		updateCompanyReviewMock.mockReset();
		deleteCompanyReviewMock.mockReset();
		invalidateMock.mockReset();
		vi.useRealTimers();
	});

	it('requires between two and eight flags in create mode', () => {
		// Arrange
		const { result } = renderHook(() => useReviewModal('company-1'));

		// Act
		act(() => {
			result.current.setGreenFlags(['g1']);
		});
		const canSubmitWithOneFlag = result.current.canSubmit;

		act(() => {
			result.current.setRedFlags(['r1']);
		});
		const canSubmitWithTwoFlags = result.current.canSubmit;

		act(() => {
			result.current.setGreenFlags(['g1', 'g2', 'g3', 'g4', 'g5']);
			result.current.setRedFlags(['r1', 'r2', 'r3', 'r4']);
		});
		const canSubmitWithNineFlags = result.current.canSubmit;

		// Assert
		expect(canSubmitWithOneFlag).toBe(false);
		expect(canSubmitWithTwoFlags).toBe(true);
		expect(canSubmitWithNineFlags).toBe(false);
	});

	it('allows submit in edit mode even without minimum flags', () => {
		// Arrange
		const { result } = renderHook(() => useReviewModal('company-1'));

		// Act
		act(() => {
			result.current.openModal({
				id: 'review-1',
				text: 'Existing review',
				greenFlags: [],
				redFlags: [],
				createdAt: '2026-05-10T00:00:00Z',
			});
		});

		// Assert
		expect(result.current.isEditMode).toBe(true);
		expect(result.current.canSubmit).toBe(true);
	});

	it('allows delete only within five minutes after review creation', () => {
		// Arrange
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-05-10T00:04:00Z'));

		const { result, rerender } = renderHook(() => useReviewModal('company-1'));

		act(() => {
			result.current.openModal({
				id: 'review-1',
				text: 'Existing review',
				greenFlags: [],
				redFlags: [],
				createdAt: '2026-05-10T00:00:00Z',
			});
		});

		const canDeleteWithinLimit = result.current.canDelete;

		// Act
		vi.setSystemTime(new Date('2026-05-10T00:06:00Z'));
		rerender();

		// Assert
		expect(canDeleteWithinLimit).toBe(true);
		expect(result.current.canDelete).toBe(false);
	});

	it('creates review, invalidates cache and resets state on success', async () => {
		// Arrange
		createCompanyReviewMock.mockResolvedValue(undefined);
		invalidateMock.mockResolvedValue(undefined);
		const onReviewChanged = vi.fn();

		const { result } = renderHook(() => useReviewModal('company-1', onReviewChanged));

		act(() => {
			result.current.openModal();
			result.current.setGreenFlags(['g1']);
			result.current.setRedFlags(['r1']);
			result.current.setText('  Новый отзыв  ');
		});

		// Act
		let submitResult = false;
		await act(async () => {
			submitResult = await result.current.submitReview();
		});

		// Assert
		expect(submitResult).toBe(true);
		expect(createCompanyReviewMock).toHaveBeenCalledWith('company-1', {
			companyId: 'company-1',
			flags: ['g1', 'r1'],
			text: 'Новый отзыв',
		});
		expect(invalidateMock).toHaveBeenCalledWith('company-1');
		expect(onReviewChanged).toHaveBeenCalledTimes(1);
		expect(result.current.isOpen).toBe(false);
		expect(result.current.isEditMode).toBe(false);
		expect(result.current.formData).toEqual({
			greenFlags: [],
			redFlags: [],
			text: '',
		});
	});

	it('deletes review in edit mode and clears modal state', async () => {
		// Arrange
		deleteCompanyReviewMock.mockResolvedValue(undefined);
		invalidateMock.mockResolvedValue(undefined);

		const { result } = renderHook(() => useReviewModal('company-1'));

		act(() => {
			result.current.openModal({
				id: 'review-1',
				text: 'Existing review',
				greenFlags: ['g1'],
				redFlags: ['r1'],
				createdAt: '2026-05-10T00:00:00Z',
			});
		});

		// Act
		let deleteResult = false;
		await act(async () => {
			deleteResult = await result.current.deleteReview();
		});

		// Assert
		expect(deleteResult).toBe(true);
		expect(deleteCompanyReviewMock).toHaveBeenCalledWith('review-1');
		expect(invalidateMock).toHaveBeenCalledWith('company-1');
		expect(result.current.isOpen).toBe(false);
		expect(result.current.reviewId).toBeUndefined();
	});
});
