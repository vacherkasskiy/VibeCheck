import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DeleteReviewModal } from './DeleteReviewModal';

describe('DeleteReviewModal', () => {
	it('renders company name and triggers close/confirm actions', () => {
		// Arrange
		const onClose = vi.fn();
		const onConfirm = vi.fn();
		render(
			<DeleteReviewModal
				isOpen={true}
				onClose={onClose}
				onConfirm={onConfirm}
				reviewCompanyName="Acme"
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));
		fireEvent.click(screen.getByRole('button', { name: 'Удалить' }));

		// Assert
		expect(screen.getByText(/Acme/)).toBeInTheDocument();
		expect(onClose).toHaveBeenCalledTimes(1);
		expect(onConfirm).toHaveBeenCalledTimes(1);
	});
});
