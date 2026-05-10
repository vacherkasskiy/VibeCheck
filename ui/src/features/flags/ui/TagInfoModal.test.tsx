import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TagInfoModal } from './TagInfoModal';
import type { Tag } from 'entities/tag';

const tag: Tag = {
	id: 'flag-1',
	name: 'Supportive team',
	description: 'Helpful colleagues',
	category: 'Культура',
};

describe('TagInfoModal', () => {
	it('renders nothing when modal is closed', () => {
		// Arrange

		// Act
		render(<TagInfoModal tag={tag} isOpen={false} onClose={vi.fn()} />);

		// Assert
		expect(screen.queryByText('Supportive team')).not.toBeInTheDocument();
	});

	it('shows fallback description and closes on overlay click', () => {
		// Arrange
		const onClose = vi.fn();

		// Act
		const { container } = render(
			<TagInfoModal
				tag={{ ...tag, description: '' }}
				isOpen
				onClose={onClose}
			/>,
		);
		fireEvent.click(container.firstChild as HTMLElement);

		// Assert
		expect(screen.getByText('Описание для этого флага пока недоступно.')).toBeInTheDocument();
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('adds tag to selected sides and closes modal', () => {
		// Arrange
		const onClose = vi.fn();
		const onAddToGreen = vi.fn();
		const onAddToRed = vi.fn();

		// Act
		const { rerender } = render(
			<TagInfoModal
				tag={tag}
				isOpen
				onClose={onClose}
				onAddToGreen={onAddToGreen}
				onAddToRed={onAddToRed}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: '+ Добавить в зелёные' }));

		// Assert
		expect(onAddToGreen).toHaveBeenCalledWith(tag);
		expect(onClose).toHaveBeenCalledTimes(1);

		// Arrange
		rerender(
			<TagInfoModal
				tag={tag}
				isOpen
				onClose={onClose}
				onAddToGreen={onAddToGreen}
				onAddToRed={onAddToRed}
				isInRed
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: '✓ Добавлено в красные' }));

		// Assert
		expect(onAddToRed).not.toHaveBeenCalled();
	});
});
