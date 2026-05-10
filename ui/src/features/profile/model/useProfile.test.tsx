import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	useAchievements,
	useActivity,
	useProfile,
	useSubscriptions,
	useUser,
	useUserFlags,
	useUserReviews,
} from './useProfile';

const {
	fetchProfileMock,
	updateProfileMock,
	fetchUserMock,
	fetchUserFlagsMock,
	fetchAchievementsMock,
	fetchUserReviewsMock,
	deleteReviewMock,
	fetchActivityMock,
	fetchSubscriptionsMock,
	unsubscribeMock,
} = vi.hoisted(() => ({
	fetchProfileMock: vi.fn(),
	updateProfileMock: vi.fn(),
	fetchUserMock: vi.fn(),
	fetchUserFlagsMock: vi.fn(),
	fetchAchievementsMock: vi.fn(),
	fetchUserReviewsMock: vi.fn(),
	deleteReviewMock: vi.fn(),
	fetchActivityMock: vi.fn(),
	fetchSubscriptionsMock: vi.fn(),
	unsubscribeMock: vi.fn(),
}));

vi.mock('entities/user', () => ({
	userApi: {
		fetchProfile: fetchProfileMock,
		updateProfile: updateProfileMock,
		fetchUser: fetchUserMock,
		fetchUserFlags: fetchUserFlagsMock,
		fetchAchievements: fetchAchievementsMock,
		fetchUserReviews: fetchUserReviewsMock,
		deleteReview: deleteReviewMock,
		fetchActivity: fetchActivityMock,
		fetchSubscriptions: fetchSubscriptionsMock,
		unsubscribe: unsubscribeMock,
	},
}));

describe('useProfile hooks', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		fetchProfileMock.mockReset();
		updateProfileMock.mockReset();
		fetchUserMock.mockReset();
		fetchUserFlagsMock.mockReset();
		fetchAchievementsMock.mockReset();
		fetchUserReviewsMock.mockReset();
		deleteReviewMock.mockReset();
		fetchActivityMock.mockReset();
		fetchSubscriptionsMock.mockReset();
		unsubscribeMock.mockReset();
		vi.useRealTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('loads profile on mount', async () => {
		// Arrange
		fetchProfileMock.mockResolvedValue({
			user: { id: 'user-1', nickname: 'tester' },
			flags: { green: [], red: [] },
			achievements: [],
			reviews: [],
			activity: [],
			subscriptions: [],
		});

		// Act
		const { result } = renderHook(() => useProfile());

		// Assert
		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
		expect(fetchProfileMock).toHaveBeenCalledTimes(1);
		expect(result.current.profile?.user.nickname).toBe('tester');
		expect(result.current.error).toBeNull();
	});

	it('sets error when profile request fails', async () => {
		// Arrange
		fetchProfileMock.mockRejectedValue(new Error('Profile failed'));

		// Act
		const { result } = renderHook(() => useProfile());

		// Assert
		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
		expect(result.current.profile).toBeNull();
		expect(result.current.error).toBe('Profile failed');
	});

	it('updates profile locally after successful update', async () => {
		// Arrange
		fetchProfileMock.mockResolvedValue({
			user: { id: 'user-1', nickname: 'tester', avatarUrl: '/old.png' },
			flags: { green: [], red: [] },
			achievements: [],
			reviews: [],
			activity: [],
			subscriptions: [],
		});
		updateProfileMock.mockResolvedValue(undefined);

		const { result } = renderHook(() => useProfile());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
		vi.useFakeTimers();

		// Act
		await act(async () => {
			const promise = result.current.updateProfile({
				nickname: 'updated-user',
				avatarUrl: '/new.png',
			});
			await vi.advanceTimersByTimeAsync(500);
			await promise;
		});
		vi.useRealTimers();

		// Assert
		expect(updateProfileMock).toHaveBeenCalledWith({
			nickname: 'updated-user',
			avatarUrl: '/new.png',
		});
		expect(result.current.profile?.user.nickname).toBe('updated-user');
		expect(result.current.profile?.user.avatarUrl).toBe('/new.png');
	});

	it('refetches profile when refetch is called', async () => {
		// Arrange
		fetchProfileMock.mockResolvedValue({
			user: { id: 'user-1', nickname: 'first' },
			flags: { green: [], red: [] },
			achievements: [],
			reviews: [],
			activity: [],
			subscriptions: [],
		});

		const { result } = renderHook(() => useProfile());

		await waitFor(() => {
			expect(result.current.profile?.user.nickname).toBe('first');
		});

		fetchProfileMock.mockResolvedValueOnce({
			user: { id: 'user-1', nickname: 'second' },
			flags: { green: [], red: [] },
			achievements: [],
			reviews: [],
			activity: [],
			subscriptions: [],
		});

		// Act
		await act(async () => {
			await result.current.refetch();
		});

		// Assert
		expect(fetchProfileMock).toHaveBeenCalledTimes(2);
		expect(result.current.profile?.user.nickname).toBe('second');
	});

	it('loads current user data', async () => {
		// Arrange
		fetchUserMock.mockResolvedValue({
			id: 'user-1',
			nickname: 'tester',
			email: 'user@example.com',
			level: 1,
			levelLabel: '1/10 XP',
			levelProgress: 10,
			education: 'Бакалавриат',
			experience: 'Без опыта',
			expertise: 'IT',
		});

		// Act
		const { result } = renderHook(() => useUser());

		// Assert
		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
		expect(result.current.user?.nickname).toBe('tester');
		expect(result.current.error).toBeNull();
	});

	it('loads user flags', async () => {
		// Arrange
		fetchUserFlagsMock.mockResolvedValue({
			green: [{ id: 'g1', name: 'Supportive', priority: 1 }],
			red: [{ id: 'r1', name: 'Toxic', priority: 2 }],
		});

		// Act
		const { result } = renderHook(() => useUserFlags());

		// Assert
		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
		expect(result.current.flags?.green).toHaveLength(1);
		expect(result.current.flags?.red).toHaveLength(1);
	});

	it('loads achievements list', async () => {
		// Arrange
		fetchAchievementsMock.mockResolvedValue([
			{
				id: 'achievement-1',
				name: 'First review',
				description: 'Posted first review',
				iconUrl: '/icon.png',
				type: 'activity',
				earnedAt: '2026-05-10T00:00:00Z',
				unlockedAt: '2026-05-10T00:00:00Z',
				color: '#37b26c',
			},
		]);

		// Act
		const { result } = renderHook(() => useAchievements());

		// Assert
		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
		expect(result.current.achievements).toHaveLength(1);
		expect(result.current.achievements[0].name).toBe('First review');
	});

	it('loads user reviews and removes review after successful delete', async () => {
		// Arrange
		fetchUserReviewsMock.mockResolvedValue([
			{
				id: 'review-1',
				companyId: 'company-1',
				companyName: 'Company One',
				text: 'Review 1',
				score: 1,
				createdAt: '2026-05-10T00:00:00Z',
				flags: [],
				greenFlags: [],
				redFlags: [],
				reactions: { likes: 1, dislikes: 0, complaints: 0 },
			},
			{
				id: 'review-2',
				companyId: 'company-2',
				companyName: 'Company Two',
				text: 'Review 2',
				score: 2,
				createdAt: '2026-05-10T00:00:00Z',
				flags: [],
				greenFlags: [],
				redFlags: [],
				reactions: { likes: 2, dislikes: 0, complaints: 0 },
			},
		]);
		deleteReviewMock.mockResolvedValue(undefined);

		const { result } = renderHook(() => useUserReviews());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Act
		await act(async () => {
			await result.current.deleteReview('review-1');
		});

		// Assert
		expect(deleteReviewMock).toHaveBeenCalledWith('review-1');
		expect(result.current.reviews).toHaveLength(1);
		expect(result.current.reviews[0].id).toBe('review-2');
	});

	it('sets delete error when review deletion fails', async () => {
		// Arrange
		fetchUserReviewsMock.mockResolvedValue([]);
		deleteReviewMock.mockRejectedValue(new Error('Delete failed'));

		const { result } = renderHook(() => useUserReviews());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Act
		await act(async () => {
			await result.current.deleteReview('review-1');
		});

		// Assert
		expect(result.current.error).toBe('Delete failed');
	});

	it('loads activity feed with default limit', async () => {
		// Arrange
		fetchActivityMock.mockResolvedValue({
			activities: [
				{
					id: 'activity-1',
					type: 'review_posted',
					userId: 'user-1',
					userNickname: 'tester',
					description: 'Posted a review',
					timestamp: '2026-05-10T00:00:00Z',
				},
			],
		});

		// Act
		const { result } = renderHook(() => useActivity());

		// Assert
		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});
		expect(fetchActivityMock).toHaveBeenCalledWith({ limit: 10 });
		expect(result.current.activity).toHaveLength(1);
	});

	it('loads subscriptions and removes one after unsubscribe', async () => {
		// Arrange
		fetchSubscriptionsMock.mockResolvedValue([
			{ id: 'subscription-1', userId: 'user-1', nickname: 'one' },
			{ id: 'subscription-2', userId: 'user-2', nickname: 'two' },
		]);
		unsubscribeMock.mockResolvedValue(undefined);

		const { result } = renderHook(() => useSubscriptions());

		await waitFor(() => {
			expect(result.current.loading).toBe(false);
		});

		// Act
		await act(async () => {
			await result.current.unsubscribe('subscription-1');
		});

		// Assert
		expect(unsubscribeMock).toHaveBeenCalledWith('subscription-1');
		expect(result.current.subscriptions).toHaveLength(1);
		expect(result.current.subscriptions[0].id).toBe('subscription-2');
	});
});
