import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReviewCard } from './ReviewCard';

const review = {
	reviewId: 'review-1',
	authorId: 'author-1',
	iconId: null,
	authorName: 'Denis',
	authorAvatarUrl: '/assets/avatars/avatar2.png',
	text: 'Полный текст отзыва',
	score: 3,
	createdAt: '2026-05-10T00:00:00Z',
	flags: [
		{ id: 'flag-1', name: 'Supportive team' },
		{ id: 'flag-2', name: 'Fast growth' },
	],
};

describe('ReviewCard', () => {
	it('renders review content, flags and formatted date', () => {
		// Arrange
		render(<ReviewCard review={review as any} />);

		// Act
		const text = screen.getByText('Полный текст отзыва');

		// Assert
		expect(text).toBeInTheDocument();
		expect(screen.getByText('Supportive team')).toBeInTheDocument();
		expect(screen.getByText('Fast growth')).toBeInTheDocument();
		expect(screen.getByText('Denis')).toBeInTheDocument();
		expect(screen.getByRole('img', { name: 'Denis' })).toBeInTheDocument();
		expect(screen.getByText('10 мая 2026 г.')).toBeInTheDocument();
	});

	it('calls onClick on card click and Enter key press', () => {
		// Arrange
		const onClick = vi.fn();
		const { container } = render(<ReviewCard review={review as any} onClick={onClick} />);

		const card = container.querySelector('[role="button"]') as HTMLElement;

		// Act
		fireEvent.click(card);
		fireEvent.keyDown(card, { key: 'Enter' });

		// Assert
		expect(onClick).toHaveBeenCalledTimes(2);
	});

	it('toggles vote mode via onVote', () => {
		// Arrange
		const onVote = vi.fn();
		render(<ReviewCard review={review as any} onVote={onVote} myVote="Like" />);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Проголосовать вверх' }));
		fireEvent.click(screen.getByRole('button', { name: 'Проголосовать вниз' }));

		// Assert
		expect(onVote).toHaveBeenNthCalledWith(1, 'Clear');
		expect(onVote).toHaveBeenNthCalledWith(2, 'Dislike');
	});

	it('calls edit and report handlers without bubbling to card click', () => {
		// Arrange
		const onClick = vi.fn();
		const onEdit = vi.fn();
		const onReport = vi.fn();

		render(
			<ReviewCard
				review={review as any}
				onClick={onClick}
				canManage={true}
				onEdit={onEdit}
				onReport={onReport}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Редактировать' }));
		fireEvent.click(screen.getByRole('button', { name: '⚠️ Пожаловаться' }));

		// Assert
		expect(onEdit).toHaveBeenCalledWith(review);
		expect(onReport).toHaveBeenCalledWith('review-1');
		expect(onClick).not.toHaveBeenCalled();
	});
});
