import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('Input', () => {
	it('toggles password visibility when password toggle is enabled', () => {
		// Arrange
		const { container } = render(
			<Input
				label="Пароль"
				type="password"
				value="Secret123!"
				onChange={() => undefined}
				showPasswordToggle
			/>,
		);

		const input = container.querySelector('input') as HTMLInputElement;

		// Act
		expect(input.type).toBe('password');
		fireEvent.click(screen.getByRole('button', { name: 'Показать пароль' }));
		const typeAfterShow = input.type;
		fireEvent.click(screen.getByRole('button', { name: 'Скрыть пароль' }));
		const typeAfterHide = input.type;

		// Assert
		expect(typeAfterShow).toBe('text');
		expect(typeAfterHide).toBe('password');
	});
});
