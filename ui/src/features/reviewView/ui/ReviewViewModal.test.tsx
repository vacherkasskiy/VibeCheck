/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewViewModal } from './ReviewViewModal';

const { navigateMock } = vi.hoisted(() => ({
	navigateMock: vi.fn(),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

const review = {
	reviewId: 'review-1',
	authorId: 'author-12345678',
	iconId: null,
	authorName: 'Denis',
	authorAvatarUrl: '/assets/avatars/avatar2.png',
	text: 'Полный текст отзыва',
	score: 4,
	createdAt: '2026-05-10T10:30:00Z',
	flags: [{ id: 'flag-1', name: 'Supportive team' }],
};

describe('ReviewViewModal', () => {
	beforeEach(() => {
		navigateMock.mockReset();
	});

	it('renders review details when open', () => {
		// Arrange
		render(
			<ReviewViewModal
				isOpen={true}
				review={review as any}
				companyName="Acme"
				onClose={vi.fn()}
			/>,
		);

		// Act
		const title = screen.getByText('Полный отзыв');

		// Assert
		expect(title).toBeInTheDocument();
		expect(screen.getByText('Acme')).toBeInTheDocument();
		expect(screen.getByText('Полный текст отзыва')).toBeInTheDocument();
		expect(screen.getByText('Supportive team')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Denis' })).toBeInTheDocument();
		expect(screen.getByText('review-1')).toBeInTheDocument();
	});

	it('closes on overlay click and close button click', () => {
		// Arrange
		const onClose = vi.fn();
		const { container } = render(
			<ReviewViewModal
				isOpen={true}
				review={review as any}
				companyName="Acme"
				onClose={onClose}
			/>,
		);

		// Act
		fireEvent.click(container.firstChild as HTMLElement);
		fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }));

		// Assert
		expect(onClose).toHaveBeenCalledTimes(2);
	});

	it('navigates to author profile and closes modal', () => {
		// Arrange
		const onClose = vi.fn();
		render(
			<ReviewViewModal
				isOpen={true}
				review={review as any}
				companyName="Acme"
				onClose={onClose}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Denis' }));

		// Assert
		expect(onClose).toHaveBeenCalledTimes(1);
		expect(navigateMock).toHaveBeenCalledWith('/user/author-12345678');
	});

	it('toggles vote and reports review', () => {
		// Arrange
		const onVote = vi.fn();
		const onReport = vi.fn();

		render(
			<ReviewViewModal
				isOpen={true}
				review={review as any}
				companyName="Acme"
				onClose={vi.fn()}
				myVote="Like"
				onVote={onVote}
				onReport={onReport}
			/>,
		);

		// Act
		fireEvent.click(screen.getAllByRole('button', { name: 'Проголосовать вверх' })[0]);
		fireEvent.click(screen.getByRole('button', { name: '⚠️ Пожаловаться' }));

		// Assert
		expect(onVote).toHaveBeenCalledWith('Clear');
		expect(onReport).toHaveBeenCalledWith('review-1');
	});
});
