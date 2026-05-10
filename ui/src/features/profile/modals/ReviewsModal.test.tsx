import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReviewsModal } from './ReviewsModal';

const reviews = [
	{
		id: 'review-1',
		authorId: 'author-1',
		authorName: 'Alice',
		authorAvatarUrl: null,
		companyId: 'company-1',
		companyName: 'Acme',
		text: 'First review text',
		score: 3,
		createdAt: '2026-05-10T00:00:00Z',
		flags: ['Flag 1'],
		greenFlags: [],
		redFlags: [],
		reactions: { likes: 1, dislikes: 0, complaints: 0 },
	},
];

describe('ReviewsModal', () => {
	it('renders review list and opens selected review callback', () => {
		// Arrange
		const onOpenReview = vi.fn();
		render(
			<ReviewsModal
				isOpen={true}
				onClose={vi.fn()}
				reviews={reviews as any}
				onOpenReview={onOpenReview}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
				canEdit={() => true}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: /acme/i }));

		// Assert
		expect(onOpenReview).toHaveBeenCalledWith(reviews[0]);
	});

	it('calls edit and delete from list view', () => {
		// Arrange
		const onEdit = vi.fn();
		const onDelete = vi.fn();
		render(
			<ReviewsModal
				isOpen={true}
				onClose={vi.fn()}
				reviews={reviews as any}
				onOpenReview={vi.fn()}
				onEdit={onEdit}
				onDelete={onDelete}
				canEdit={() => true}
			/>,
		);

		// Act
		fireEvent.click(screen.getByText('Редактировать'));
		fireEvent.click(screen.getByText('Удалить'));

		// Assert
		expect(onEdit).toHaveBeenCalledWith('review-1');
		expect(onDelete).toHaveBeenCalledWith('review-1');
	});

	it('closes modal from footer button', () => {
		// Arrange
		const onClose = vi.fn();
		render(
			<ReviewsModal
				isOpen={true}
				onClose={onClose}
				reviews={reviews as any}
				onOpenReview={vi.fn()}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
				canEdit={() => true}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }));

		// Assert
		expect(onClose).toHaveBeenCalledTimes(1);
	});
});
