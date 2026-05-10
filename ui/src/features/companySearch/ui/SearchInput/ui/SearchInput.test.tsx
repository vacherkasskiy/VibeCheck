import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SearchInput } from './SearchInput';

describe('SearchInput', () => {
	it('renders with default placeholder and current value', () => {
		// Arrange

		// Act
		render(<SearchInput value="Acme" onChange={vi.fn()} />);

		// Assert
		expect(screen.getByPlaceholderText('Поиск компании')).toHaveValue('Acme');
	});

	it('passes typed value to onChange', () => {
		// Arrange
		const onChange = vi.fn();

		// Act
		render(<SearchInput value="" onChange={onChange} placeholder="Найти компанию" />);
		fireEvent.change(screen.getByPlaceholderText('Найти компанию'), {
			target: { value: 'VibeCheck' },
		});

		// Assert
		expect(onChange).toHaveBeenCalledWith('VibeCheck');
	});
});
