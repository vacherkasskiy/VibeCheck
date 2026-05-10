import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { UserFlags } from './UserFlags';

describe('UserFlags', () => {
	it('renders sorted flags and edit button', () => {
		// Arrange
		const onEditFlags = vi.fn();
		render(
			<UserFlags
				onEditFlags={onEditFlags}
				flags={{
					green: [
						{ id: 'g2', name: 'Second green', priority: 2 },
						{ id: 'g1', name: 'First green', priority: 1 },
					],
					red: [{ id: 'r1', name: 'First red', priority: 3 }],
				}}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Редактировать флаги' }));

		// Assert
		const green = screen.getAllByText(/First green|Second green/).map((node) => node.textContent);
		expect(green[0]).toBe('First green');
		expect(onEditFlags).toHaveBeenCalledTimes(1);
		expect(screen.getByText('First red')).toBeInTheDocument();
	});

	it('shows empty states when there are no flags', () => {
		// Arrange
		render(<UserFlags flags={{ green: [], red: [] }} />);

		// Act
		const greenEmpty = screen.getByText('Нет зеленых флагов');
		const redEmpty = screen.getByText('Нет красных флагов');

		// Assert
		expect(greenEmpty).toBeInTheDocument();
		expect(redEmpty).toBeInTheDocument();
	});
});
