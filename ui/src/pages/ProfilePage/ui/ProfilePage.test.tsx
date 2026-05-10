/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfilePage } from './ProfilePage';

const {
	useProfileMock,
	useUserActivityMock,
	deleteReviewMock,
	unsubscribeFromUserMock,
	showToastMock,
	navigateMock,
	refetchMock,
} = vi.hoisted(() => ({
	useProfileMock: vi.fn(),
	useUserActivityMock: vi.fn(),
	deleteReviewMock: vi.fn(),
	unsubscribeFromUserMock: vi.fn(),
	showToastMock: vi.fn(),
	navigateMock: vi.fn(),
	refetchMock: vi.fn(),
}));

vi.mock('features/profile', () => ({
	useProfile: useProfileMock,
}));

vi.mock('entities/activity', () => ({
	useUserActivity: useUserActivityMock,
}));

vi.mock('entities/user', () => ({
	userApi: {
		deleteReview: deleteReviewMock,
		unsubscribeFromUser: unsubscribeFromUserMock,
	},
}));

vi.mock('shared/ui/Toast', () => ({
	useToast: () => ({
		showToast: showToastMock,
	}),
}));

vi.mock('shared/ui/UserNavButton', () => ({
	UserNavButton: () => <div data-testid="user-nav-button" />,
}));

vi.mock('widgets/ProfileHeader', () => ({
	ProfileHeader: ({ onEditProfile }: { onEditProfile: () => void }) => (
		<button type="button" onClick={onEditProfile}>
			edit profile
		</button>
	),
}));

vi.mock('widgets/Achievements', () => ({
	Achievements: ({ onViewAll }: { onViewAll: () => void }) => (
		<button type="button" onClick={onViewAll}>
			open achievements
		</button>
	),
}));

vi.mock('widgets/UserFlags', () => ({
	UserFlags: ({ onEditFlags }: { onEditFlags: () => void }) => (
		<button type="button" onClick={onEditFlags}>
			edit flags
		</button>
	),
}));

vi.mock('widgets/UserReviews', () => ({
	UserReviews: ({
		onViewAll,
		onDelete,
	}: {
		onViewAll: () => void;
		onDelete: (reviewId: string) => void;
	}) => (
		<div>
			<button type="button" onClick={onViewAll}>
				open reviews
			</button>
			<button type="button" onClick={() => onDelete('review-1')}>
				delete review
			</button>
		</div>
	),
}));

vi.mock('widgets/ActivityPanel', () => ({
	ActivityPanel: ({ onUnsubscribe }: { onUnsubscribe: (authorId: string) => void }) => (
		<button type="button" onClick={() => onUnsubscribe('author-2')}>
			unsubscribe
		</button>
	),
}));

vi.mock('features/profile/modals', () => ({
	AchievementsModal: ({ isOpen }: { isOpen: boolean }) =>
		isOpen ? <div>achievements modal</div> : null,
	ReviewsModal: ({ isOpen }: { isOpen: boolean }) =>
		isOpen ? <div>reviews modal</div> : null,
	DeleteReviewModal: ({
		isOpen,
		onConfirm,
	}: {
		isOpen: boolean;
		onConfirm: () => void;
	}) =>
		isOpen ? (
			<div>
				<div>delete modal</div>
				<button type="button" onClick={onConfirm}>
					confirm delete
				</button>
			</div>
		) : null,
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

const baseProfile = {
	user: {
		id: 'user-1',
		nickname: 'tester',
		avatarUrl: '/avatar.png',
	},
	flags: {
		green: [{ id: 'g1', name: 'Green' }],
		red: [],
	},
	achievements: [{ id: 'a1', title: 'Ach 1' }],
	reviews: [
		{
			id: 'review-1',
			companyId: 'company-1',
			companyName: 'Acme',
			text: 'Review text',
			score: 5,
			createdAt: new Date().toISOString(),
			flags: [],
			greenFlags: [],
			redFlags: [],
			reactions: { likes: 2, dislikes: 0, complaints: 0 },
		},
	],
	subscriptions: [{ userId: 'author-2', nickname: 'author-2' }],
};

describe('ProfilePage', () => {
	beforeEach(() => {
		useProfileMock.mockReset();
		useUserActivityMock.mockReset();
		deleteReviewMock.mockReset();
		unsubscribeFromUserMock.mockReset();
		showToastMock.mockReset();
		navigateMock.mockReset();
		refetchMock.mockReset();

		useUserActivityMock.mockReturnValue({ data: [] });
		deleteReviewMock.mockResolvedValue(undefined);
		unsubscribeFromUserMock.mockResolvedValue(undefined);
		refetchMock.mockResolvedValue(undefined);
	});

	it('redirects to flags when recommendations are locked', () => {
		// Arrange
		useProfileMock.mockReturnValue({
			profile: {
				...baseProfile,
				flags: { green: [], red: [] },
			},
			loading: false,
			error: null,
			refetch: refetchMock,
		});

		// Act
		render(<ProfilePage />);
		fireEvent.click(screen.getByAltText('VibeCheck'));

		// Assert
		expect(showToastMock).toHaveBeenCalledWith(
			'Выберите хотя бы один green или red флаг на странице флагов, чтобы разблокировать рекомендации',
			'error',
		);
		expect(navigateMock).toHaveBeenCalledWith('/flags');
	});

	it('opens profile modals, deletes reviews and unsubscribes', async () => {
		// Arrange
		useProfileMock.mockReturnValue({
			profile: baseProfile,
			loading: false,
			error: null,
			refetch: refetchMock,
		});

		// Act
		render(<ProfilePage />);
		fireEvent.click(screen.getByRole('button', { name: 'edit profile' }));
		fireEvent.click(screen.getByRole('button', { name: 'open achievements' }));
		fireEvent.click(screen.getByRole('button', { name: 'open reviews' }));
		fireEvent.click(screen.getByRole('button', { name: 'delete review' }));
		fireEvent.click(screen.getByRole('button', { name: 'confirm delete' }));
		fireEvent.click(screen.getByRole('button', { name: 'unsubscribe' }));

		// Assert
		expect(navigateMock).toHaveBeenCalledWith('/profile/edit');
		expect(screen.getByText('achievements modal')).toBeInTheDocument();
		expect(screen.getByText('reviews modal')).toBeInTheDocument();
		await waitFor(() => {
			expect(deleteReviewMock).toHaveBeenCalledWith('review-1');
		});
		expect(refetchMock).toHaveBeenCalledTimes(1);
		expect(showToastMock).toHaveBeenCalledWith('Отзыв удален', 'success');
		await waitFor(() => {
			expect(unsubscribeFromUserMock).toHaveBeenCalledWith('author-2');
		});
	});
});
