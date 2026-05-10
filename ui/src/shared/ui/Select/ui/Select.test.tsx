import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Select } from './Select';

describe('Select', () => {
	it('renders options and calls onChange with selected value', () => {
		// Arrange
		const onChange = vi.fn();

		render(
			<Select
				label="Пол"
				value=""
				onChange={onChange}
				placeholder="Выберите пол"
				options={[
					{ value: 'SEX_MALE', label: 'Мужской' },
					{ value: 'SEX_FEMALE', label: 'Женский' },
				]}
			/>,
		);

		// Act
		fireEvent.change(screen.getByRole('combobox'), {
			target: { value: 'SEX_FEMALE' },
		});

		// Assert
		expect(screen.getByRole('option', { name: 'Мужской' })).toBeInTheDocument();
		expect(screen.getByRole('option', { name: 'Женский' })).toBeInTheDocument();
		expect(onChange).toHaveBeenCalledWith('SEX_FEMALE');
	});

	it('shows error text when error prop is provided', () => {
		// Arrange
		render(
			<Select
				label="Пол"
				value=""
				options={[]}
				error="Обязательное поле"
				placeholder="Выберите пол"
			/>,
		);

		// Act
		const errorText = screen.getByText('Обязательное поле');

		// Assert
		expect(errorText).toBeInTheDocument();
	});
});
