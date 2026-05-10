import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { AvatarSelector } from './AvatarSelector';

describe('AvatarSelector', () => {
	it('calls onSelect with clicked avatar id', () => {
		// Arrange
		const onSelect = vi.fn();

		render(
			<AvatarSelector
				avatars={[
					{ id: '1', url: '/avatar-1.png' },
					{ id: '2', url: '/avatar-2.png' },
				]}
				selectedId={null}
				onSelect={onSelect}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Аватар 2' }));

		// Assert
		expect(onSelect).toHaveBeenCalledWith('2');
	});

	it('shows validation error when provided', () => {
		// Arrange
		render(
			<AvatarSelector
				avatars={[{ id: '1', url: '/avatar-1.png' }]}
				selectedId={null}
				onSelect={() => undefined}
				error="Обязательное поле"
			/>,
		);

		// Act
		const errorText = screen.getByText('Обязательное поле');

		// Assert
		expect(errorText).toBeInTheDocument();
	});
});
