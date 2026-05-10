import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { PasswordInput } from './PasswordInput';

describe('PasswordInput', () => {
	it('shows validation error for short password and reports invalid state', () => {
		// Arrange
		const onChange = vi.fn();
		const onValidationChange = vi.fn();

		const { container } = render(
			<PasswordInput
				label="Пароль"
				value=""
				onChange={onChange}
				showValidation
				required
				onValidationChange={onValidationChange}
			/>,
		);

		// Act
		fireEvent.change(container.querySelector('input') as HTMLInputElement, {
			target: { value: 'Short1!' },
		});

		// Assert
		expect(onChange).toHaveBeenCalledWith('Short1!');
		expect(onValidationChange).toHaveBeenCalledWith(false);
		expect(screen.getByText('Минимум 8 символов')).toBeInTheDocument();
	});

	it('reports valid state for a strong password', () => {
		// Arrange
		const onValidationChange = vi.fn();

		const { container } = render(
			<PasswordInput
				label="Пароль"
				value=""
				onChange={() => undefined}
				showValidation
				onValidationChange={onValidationChange}
			/>,
		);

		// Act
		fireEvent.change(container.querySelector('input') as HTMLInputElement, {
			target: { value: 'StrongPass1!' },
		});

		// Assert
		expect(onValidationChange).toHaveBeenCalledWith(true);
	});
});
