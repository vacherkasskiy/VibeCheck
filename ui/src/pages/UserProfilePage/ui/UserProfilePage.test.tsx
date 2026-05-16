/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserProfilePage } from './UserProfilePage';

const {
	useProfileMock,
	fetchUserPublicProfileByIdMock,
	fetchUserReviewsByIdMock,
	useSubscriptionStatusMock,
	useSubscribeMutationMock,
	useUnsubscribeMutationMock,
	useVoteReviewMutationMock,
	navigateMock,
	useParamsMock,
	subscribeMutateMock,
	unsubscribeMutateMock,
} = vi.hoisted(() => ({
	useProfileMock: vi.fn(),
	fetchUserPublicProfileByIdMock: vi.fn(),
	fetchUserReviewsByIdMock: vi.fn(),
	useSubscriptionStatusMock: vi.fn(),
	useSubscribeMutationMock: vi.fn(),
	useUnsubscribeMutationMock: vi.fn(),
	useVoteReviewMutationMock: vi.fn(),
	navigateMock: vi.fn(),
	useParamsMock: vi.fn(),
	subscribeMutateMock: vi.fn(),
	unsubscribeMutateMock: vi.fn(),
}));

vi.mock('entities/user', () => ({
	userApi: {
		fetchUserPublicProfileById: fetchUserPublicProfileByIdMock,
		fetchUserReviewsById: fetchUserReviewsByIdMock,
	},
}));

vi.mock('features/profile', () => ({
	useProfile: useProfileMock,
}));

vi.mock('features/subscribe', () => ({
	useSubscriptionStatus: useSubscriptionStatusMock,
	useSubscribeMutation: () => useSubscribeMutationMock(),
	useUnsubscribeMutation: () => useUnsubscribeMutationMock(),
	UnsubscribeConfirmModal: ({
		isOpen,
		onConfirm,
	}: {
		isOpen: boolean;
		onConfirm: () => void;
	}) =>
		isOpen ? (
			<button type="button" onClick={onConfirm}>
				confirm unsubscribe
			</button>
		) : null,
}));

vi.mock('shared/lib', () => ({
	translateEducation: (value: string) => `education:${value}`,
	translateExperience: (value: string) => `experience:${value}`,
	translateSpecialization: (value: string) => `specialization:${value}`,
}));

vi.mock('shared/ui/UserNavButton', () => ({
	UserNavButton: () => <div data-testid="user-nav-button" />,
}));

vi.mock('widgets/UserReviews', () => ({
	UserReviews: ({
		reviews,
	}: {
		reviews: Array<{ companyName: string; text: string }>;
	}) => (
		<div>
			<div>Отзывы пользователя</div>
			{reviews.map((review) => (
				<div key={`${review.companyName}-${review.text}`}>{review.companyName}</div>
			))}
		</div>
	),
}));

vi.mock('features/profile/modals', () => ({
	ReviewsModal: () => null,
}));

vi.mock('features/reportModal', () => ({
	useReportModal: () => ({
		isOpen: false,
		reviewId: undefined,
		close: vi.fn(),
		reasonType: 'Spam',
		setReasonType: vi.fn(),
		reasonText: '',
		setReasonText: vi.fn(),
		isFormValid: true,
		isSubmitting: false,
		submit: vi.fn(),
		open: vi.fn(),
	}),
	ReportModal: () => null,
}));

vi.mock('features/reviewView', () => ({
	ReviewViewModal: () => null,
}));

vi.mock('features/userReviews', () => ({
	useVoteReviewMutation: () => useVoteReviewMutationMock(),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

	return {
		...actual,
		useNavigate: () => navigateMock,
		useParams: () => useParamsMock(),
	};
});

const publicProfile = {
	id: 'target-user',
	nickname: 'alexjohnson',
	avatarUrl: null,
	level: 12,
	levelLabel: 'Эксперт',
	createdAt: '2026-01-01T00:00:00.000Z',
	education: 'EDUCATION_LEVEL_BACHELOR',
	experience: 'NO_EXPERIENCE',
	expertise: 'SPECIALTY_IT',
};

describe('UserProfilePage', () => {
	beforeEach(() => {
		useProfileMock.mockReset();
		fetchUserPublicProfileByIdMock.mockReset();
		fetchUserReviewsByIdMock.mockReset();
		useSubscriptionStatusMock.mockReset();
		useSubscribeMutationMock.mockReset();
		useUnsubscribeMutationMock.mockReset();
		useVoteReviewMutationMock.mockReset();
		navigateMock.mockReset();
		useParamsMock.mockReset();
		subscribeMutateMock.mockReset();
		unsubscribeMutateMock.mockReset();

		useParamsMock.mockReturnValue({ userId: 'target-user' });
		useProfileMock.mockReturnValue({
			profile: {
				user: {
					id: 'viewer',
					nickname: 'viewer',
					avatarUrl: '/viewer.png',
				},
			},
			loading: false,
			error: null,
		});
		useSubscriptionStatusMock.mockReturnValue({
			data: false,
			isLoading: false,
			error: null,
		});
		useSubscribeMutationMock.mockReturnValue({
			mutate: subscribeMutateMock,
			isPending: false,
		});
		useUnsubscribeMutationMock.mockReturnValue({
			mutate: unsubscribeMutateMock,
			isPending: false,
		});
		useVoteReviewMutationMock.mockReturnValue({
			mutate: vi.fn(),
			isPending: false,
		});
		fetchUserPublicProfileByIdMock.mockResolvedValue(publicProfile);
		fetchUserReviewsByIdMock.mockResolvedValue([
			{
				id: 'review-1',
				authorId: 'target-user',
				authorName: 'alexjohnson',
				authorAvatarUrl: null,
				companyId: 'company-1',
				companyName: 'Acme',
				text: 'Great team',
				score: 5,
				createdAt: '2026-05-01T00:00:00.000Z',
				flags: ['Команда'],
				greenFlags: ['Команда'],
				redFlags: [],
				reactions: { likes: 0, dislikes: 0, complaints: 0 },
			},
		]);
	});

	it('redirects to own profile when user opens themselves', async () => {
		// Arrange
		useParamsMock.mockReturnValue({ userId: 'viewer' });

		// Act
		render(<UserProfilePage />);

		// Assert
		await waitFor(() => {
			expect(navigateMock).toHaveBeenCalledWith('/profile', { replace: true });
		});
	});

	it('loads public profile and subscribes to user', async () => {
		// Arrange
		useSubscriptionStatusMock.mockReturnValue({
			data: false,
			isLoading: false,
			error: null,
		});

		// Act
		render(<UserProfilePage />);
		await screen.findByText('alexjohnson');
		fireEvent.click(screen.getByRole('button', { name: 'Подписаться' }));

		// Assert
		expect(screen.getByText('education:EDUCATION_LEVEL_BACHELOR')).toBeInTheDocument();
		expect(screen.getByText('experience:NO_EXPERIENCE')).toBeInTheDocument();
		expect(screen.getByText('specialization:SPECIALTY_IT')).toBeInTheDocument();
		expect(screen.getByText('Отзывы пользователя')).toBeInTheDocument();
		expect(screen.getByText('Acme')).toBeInTheDocument();
		expect(subscribeMutateMock).toHaveBeenCalledWith('target-user');
	});

	it('opens unsubscribe confirmation and unsubscribes from user', async () => {
		// Arrange
		useSubscriptionStatusMock.mockReturnValue({
			data: true,
			isLoading: false,
			error: null,
		});

		// Act
		render(<UserProfilePage />);
		await screen.findByText('alexjohnson');
		fireEvent.click(screen.getByRole('button', { name: 'Отписаться' }));
		fireEvent.click(screen.getByRole('button', { name: 'confirm unsubscribe' }));

		// Assert
		expect(unsubscribeMutateMock).toHaveBeenCalledWith('target-user');
	});

	it('renders public profile even when reviews request fails', async () => {
		// Arrange
		fetchUserReviewsByIdMock.mockRejectedValue(new Error('Reviews failed'));

		// Act
		render(<UserProfilePage />);

		// Assert
		await screen.findByText('alexjohnson');
		expect(screen.getByText('education:EDUCATION_LEVEL_BACHELOR')).toBeInTheDocument();
		expect(screen.getByText('Не удалось загрузить отзывы пользователя')).toBeInTheDocument();
	});
});
