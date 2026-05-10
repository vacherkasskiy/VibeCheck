import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Achievements } from './Achievements';

describe('Achievements', () => {
	it('sorts achievements and opens full list', () => {
		// Arrange
		const onViewAll = vi.fn();
		render(
			<Achievements
				onViewAll={onViewAll}
				achievements={[
					{
						id: 'a2',
						name: 'Later',
						description: '',
						iconUrl: '',
						type: 'activity',
						earnedAt: '',
						unlockedAt: '',
						color: '#000',
						status: 'NotStarted',
					},
					{
						id: 'a1',
						name: 'First',
						description: '',
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
		fireEvent.click(screen.getByRole('button', { name: 'Открыть все' }));

		// Assert
		const names = screen.getAllByText(/First|Later/).map((node) => node.textContent);
		expect(names[0]).toBe('First');
		expect(onViewAll).toHaveBeenCalledTimes(1);
	});

	it('shows empty state without achievements', () => {
		// Arrange
		render(<Achievements achievements={[]} onViewAll={vi.fn()} />);

		// Act
		const empty = screen.getByText('Достижения пока не найдены');

		// Assert
		expect(empty).toBeInTheDocument();
	});
});
