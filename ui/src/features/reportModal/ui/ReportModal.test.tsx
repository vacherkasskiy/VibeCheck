import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReportModal } from './ReportModal';

describe('ReportModal', () => {
	it('does not render when closed', () => {
		// Arrange
		render(
			<ReportModal
				isOpen={false}
				reviewId="review-1"
				onClose={vi.fn()}
				reasonType="Spam"
				setReasonType={vi.fn()}
				reasonText=""
				setReasonText={vi.fn()}
				isFormValid={true}
				isSubmitting={false}
				onSubmit={vi.fn()}
			/>,
		);

		// Act
		const title = screen.queryByText('Пожаловаться на отзыв');

		// Assert
		expect(title).not.toBeInTheDocument();
	});

	it('submits form when it is valid', () => {
		// Arrange
		const onSubmit = vi.fn();

		render(
			<ReportModal
				isOpen={true}
				reviewId="review-1"
				onClose={vi.fn()}
				reasonType="Spam"
				setReasonType={vi.fn()}
				reasonText=""
				setReasonText={vi.fn()}
				isFormValid={true}
				isSubmitting={false}
				onSubmit={onSubmit}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Отправить жалобу' }));

		// Assert
		expect(onSubmit).toHaveBeenCalledTimes(1);
	});

	it('does not submit when form is invalid', () => {
		// Arrange
		const onSubmit = vi.fn();

		render(
			<ReportModal
				isOpen={true}
				reviewId="review-1"
				onClose={vi.fn()}
				reasonType="Other"
				setReasonType={vi.fn()}
				reasonText=""
				setReasonText={vi.fn()}
				isFormValid={false}
				isSubmitting={false}
				onSubmit={onSubmit}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Отправить жалобу' }));

		// Assert
		expect(onSubmit).not.toHaveBeenCalled();
		expect(screen.getByText('Описание обязательно для "Другое"')).toBeInTheDocument();
	});

	it('closes on overlay and cancel click', () => {
		// Arrange
		const onClose = vi.fn();
		const { container } = render(
			<ReportModal
				isOpen={true}
				reviewId="review-1"
				onClose={onClose}
				reasonType="Spam"
				setReasonType={vi.fn()}
				reasonText=""
				setReasonText={vi.fn()}
				isFormValid={true}
				isSubmitting={false}
				onSubmit={vi.fn()}
			/>,
		);

		const overlay = container.firstChild as HTMLElement;

		// Act
		fireEvent.click(overlay);
		fireEvent.click(screen.getByRole('button', { name: 'Отмена' }));

		// Assert
		expect(onClose).toHaveBeenCalledTimes(2);
	});
});
