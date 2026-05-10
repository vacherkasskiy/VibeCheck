/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivityPanel } from './ActivityPanel';

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

describe('ActivityPanel', () => {
	beforeEach(() => {
		navigateMock.mockReset();
	});

	it('renders activity feed in default tab and navigates to target', () => {
		// Arrange
		render(
			<ActivityPanel
				subscriptions={[]}
				activities={[
					{
						activityId: 'activity-1',
						actor: { userId: 'user-1', name: 'alexjohnson' },
						createdAt: '2026-05-10T00:00:00Z',
						payload: {
							type: 'REVIEW_WRITTEN',
							companyId: 'company-1',
							companyName: 'Acme',
						},
					},
				]}
				reviewsCount={0}
				flagsCount={0}
				likesReceived={0}
				onUnsubscribe={vi.fn()}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: /alexjohnson posted a new review/i }));

		// Assert
		expect(screen.getByText('Все')).toBeInTheDocument();
		expect(screen.getByText('alexjohnson posted a new review')).toBeInTheDocument();
		expect(navigateMock).toHaveBeenCalledWith('/company/company-1');
	});

	it('shows subscriptions only in following tab and allows unsubscribe', () => {
		// Arrange
		const onUnsubscribe = vi.fn();
		render(
			<ActivityPanel
				subscriptions={[
					{
						id: 'subscription-1',
						userId: 'user-1',
						nickname: 'tester',
						avatarUrl: '/avatar.png',
						subscribedAt: '2026-05-10T00:00:00Z',
					},
				]}
				activities={[]}
				reviewsCount={0}
				flagsCount={0}
				likesReceived={0}
				onUnsubscribe={onUnsubscribe}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Подписки' }));
		fireEvent.click(screen.getByRole('button', { name: 'Отписаться' }));

		// Assert
		expect(screen.getByText('tester')).toBeInTheDocument();
		expect(onUnsubscribe).toHaveBeenCalledWith('user-1');
	});

	it('does not show subscriptions in all tab', () => {
		// Arrange
		render(
			<ActivityPanel
				subscriptions={[
					{
						id: 'subscription-1',
						userId: 'user-1',
						nickname: 'tester',
						avatarUrl: '/avatar.png',
						subscribedAt: '2026-05-10T00:00:00Z',
					},
				]}
				activities={[
					{
						activityId: 'activity-1',
						actor: { userId: 'user-1', name: 'alexjohnson' },
						createdAt: '2026-05-10T00:00:00Z',
						payload: {
							type: 'LEVEL_UP',
							newLevel: 12,
						},
					},
				]}
				reviewsCount={0}
				flagsCount={0}
				likesReceived={0}
				onUnsubscribe={vi.fn()}
			/>,
		);

		// Act
		const allTabContent = screen.getByText('alexjohnson reached level 12');

		// Assert
		expect(allTabContent).toBeInTheDocument();
		expect(screen.queryByText('tester')).not.toBeInTheDocument();
	});
});
