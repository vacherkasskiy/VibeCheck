import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AchievementsModal } from './AchievementsModal';

describe('AchievementsModal', () => {
	it('renders sorted achievements and completed meta first', () => {
		// Arrange
		render(
			<AchievementsModal
				isOpen={true}
				onClose={vi.fn()}
				achievements={[
					{
						id: 'a2',
						name: 'In progress',
						description: 'Progress desc',
						iconUrl: '',
						type: 'activity',
						earnedAt: '',
						unlockedAt: '',
						color: '#000',
						status: 'InProgress',
						progressCurrent: 2,
						progressTarget: 5,
					},
					{
						id: 'a1',
						name: 'Completed one',
						description: 'Completed desc',
						iconUrl: '',
						type: 'special',
						earnedAt: '2026-05-10T00:00:00Z',
						unlockedAt: '2026-05-10T00:00:00Z',
						color: '#000',
						status: 'Completed',
					},
				]}
			/>,
		);

		// Act
		const names = screen.getAllByRole('heading', { level: 3 }).map((item) => item.textContent);

		// Assert
		expect(screen.getByText('Все достижения')).toBeInTheDocument();
		expect(names[0]).toBe('Completed one');
		expect(screen.getByText(/Получено:/)).toBeInTheDocument();
		expect(screen.getByText('Прогресс: 2/5')).toBeInTheDocument();
	});

	it('shows empty state and closes by buttons', () => {
		// Arrange
		const onClose = vi.fn();
		render(<AchievementsModal isOpen={true} onClose={onClose} achievements={[]} />);

		// Act
		fireEvent.click(screen.getByRole('button', { name: '✕' }));
		fireEvent.click(screen.getByRole('button', { name: 'Закрыть' }));

		// Assert
		expect(screen.getByText('Достижения пока не найдены')).toBeInTheDocument();
		expect(onClose).toHaveBeenCalledTimes(2);
	});
});
