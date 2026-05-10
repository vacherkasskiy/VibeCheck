import { act, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserReviews } from './UserReviews';

const { useUpdateCompanyReviewMock, mutateMock } = vi.hoisted(() => ({
	useUpdateCompanyReviewMock: vi.fn(),
	mutateMock: vi.fn(),
}));

vi.mock('entities/company', () => ({
	useUpdateCompanyReview: useUpdateCompanyReviewMock,
}));

describe('UserReviews', () => {
	beforeEach(() => {
		useUpdateCompanyReviewMock.mockReset();
		mutateMock.mockReset();
		useUpdateCompanyReviewMock.mockReturnValue({
			mutate: mutateMock,
			isPending: false,
		});
		vi.useFakeTimers();
	});

	it('opens all reviews callback and shows empty state', () => {
		// Arrange
		const onViewAll = vi.fn();
		const { rerender } = render(
			<UserReviews reviews={[]} onViewAll={onViewAll} onEdit={vi.fn()} onDelete={vi.fn()} />,
		);

		// Act
		expect(screen.getByText('Пока нет отзывов')).toBeInTheDocument();
		rerender(
			<UserReviews
				reviews={[
					{
						id: 'review-1',
						companyId: 'company-1',
						companyName: 'Acme',
						text: 'Review text',
						score: 2,
						createdAt: new Date().toISOString(),
						flags: [],
						greenFlags: [],
						redFlags: [],
						reactions: { likes: 0, dislikes: 0, complaints: 0 },
					},
				] as any}
				onViewAll={onViewAll}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'Открыть все' }));

		// Assert
		expect(onViewAll).toHaveBeenCalledTimes(1);
	});

	it('opens full review callback when clicking a review card', () => {
		const onOpenReview = vi.fn();
		const review = {
			id: 'review-1',
			companyId: 'company-1',
			companyName: 'Acme',
			text: 'Review text',
			score: 2,
			createdAt: new Date().toISOString(),
			flags: [],
			greenFlags: [],
			redFlags: [],
			reactions: { likes: 0, dislikes: 0, complaints: 0 },
		};

		render(
			<UserReviews
				reviews={[review] as any}
				onViewAll={vi.fn()}
				onOpenReview={onOpenReview}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
			/>,
		);

		fireEvent.click(screen.getByRole('button', { name: /acme/i }));

		expect(onOpenReview).toHaveBeenCalledWith(review);
	});

	it('calls delete callback and saves inline edit', async () => {
		// Arrange
		const onDelete = vi.fn();
		render(
			<UserReviews
				reviews={[
					{
						id: 'review-1',
						companyId: 'company-1',
						companyName: 'Acme',
						text: 'Review text',
						score: 2,
						createdAt: new Date().toISOString(),
						flags: ['Flag 1'],
						greenFlags: [],
						redFlags: [],
						reactions: { likes: 0, dislikes: 0, complaints: 0 },
					},
				] as any}
				onViewAll={vi.fn()}
				onEdit={vi.fn()}
				onDelete={onDelete}
			/>,
		);

		// Act
		fireEvent.click(screen.getByTitle('Удалить'));
		fireEvent.click(screen.getByTitle('Редактировать'));
		await act(async () => {
			vi.runAllTimers();
		});
		fireEvent.change(screen.getByPlaceholderText('Редактируйте отзыв...'), {
			target: { value: 'Updated text' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

		// Assert
		expect(onDelete).toHaveBeenCalledWith('review-1');
		expect(mutateMock).toHaveBeenCalledWith(
			{ reviewId: 'review-1', data: { text: 'Updated text' } },
			expect.objectContaining({ onSuccess: expect.any(Function), onError: expect.any(Function) }),
		);
	});
});
