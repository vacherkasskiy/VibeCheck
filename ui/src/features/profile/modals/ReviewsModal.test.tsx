import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewsModal } from './ReviewsModal';

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
	beforeEach(() => {
		navigateMock.mockReset();
	});

	it('renders review list and opens selected review details', () => {
		// Arrange
		render(
			<ReviewsModal
				isOpen={true}
				onClose={vi.fn()}
				reviews={reviews as any}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
				canEdit={() => true}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: /acme/i }));

		// Assert
		expect(screen.getByText('Полный отзыв')).toBeInTheDocument();
		expect(screen.getByText('First review text')).toBeInTheDocument();
		expect(screen.getByText('review-1')).toBeInTheDocument();
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

	it('navigates to author profile from details view', () => {
		// Arrange
		const onClose = vi.fn();
		render(
			<ReviewsModal
				isOpen={true}
				onClose={onClose}
				reviews={reviews as any}
				onEdit={vi.fn()}
				onDelete={vi.fn()}
				canEdit={() => true}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: /acme/i }));

		// Act
		fireEvent.click(screen.getByRole('button', { name: /профиль/i }));

		// Assert
		expect(onClose).toHaveBeenCalledTimes(1);
		expect(navigateMock).toHaveBeenCalledWith('/user/author-1');
	});
});
