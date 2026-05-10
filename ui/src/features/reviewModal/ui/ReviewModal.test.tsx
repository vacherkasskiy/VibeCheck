/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReviewModal } from './ReviewModal';

const { useGetAllFlagsMock, showToastMock } = vi.hoisted(() => ({
	useGetAllFlagsMock: vi.fn(),
	showToastMock: vi.fn(),
}));

vi.mock('entities/tag', async () => {
	const actual = await vi.importActual<typeof import('entities/tag')>('entities/tag');

	return {
		...actual,
		useGetAllFlags: useGetAllFlagsMock,
	};
});

vi.mock('shared/ui/Toast', () => ({
	useToast: () => ({
		showToast: showToastMock,
	}),
}));

const baseProps = {
	isOpen: true,
	onClose: vi.fn(),
	companyName: 'Acme',
	isEditMode: false,
	formData: {
		greenFlags: ['flag-1'],
		redFlags: [],
		text: 'Initial text',
	},
	setGreenFlags: vi.fn(),
	setRedFlags: vi.fn(),
	setText: vi.fn(),
	canSubmit: true,
	canDelete: false,
	loading: false,
	error: null,
	resetForm: vi.fn(),
	submitReview: vi.fn(),
	deleteReview: vi.fn(),
};

describe('ReviewModal', () => {
	beforeEach(() => {
		useGetAllFlagsMock.mockReset();
		showToastMock.mockReset();
		useGetAllFlagsMock.mockReturnValue({
			flags: [
				{
					id: 'flag-1',
					name: 'Supportive team',
					description: 'Helpful colleagues',
					category: 'Culture',
				},
				{
					id: 'flag-2',
					name: 'Remote work',
					description: 'Remote-friendly',
					category: 'Benefits',
				},
			],
			isLoading: false,
			error: null,
		});
	});

	it('closes modal through back button and resets form', () => {
		// Arrange
		const onClose = vi.fn();
		const resetForm = vi.fn();

		// Act
		render(<ReviewModal {...baseProps} onClose={onClose} resetForm={resetForm} />);
		fireEvent.click(screen.getByRole('button', { name: /вернуться к странице компании/i }));

		// Assert
		expect(resetForm).toHaveBeenCalledTimes(1);
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('updates text only while value stays within limit', () => {
		// Arrange
		const setText = vi.fn();

		// Act
		render(<ReviewModal {...baseProps} setText={setText} />);
		fireEvent.change(screen.getByPlaceholderText(/поделись своим опытом/i), {
			target: { value: 'Updated text' },
		});
		fireEvent.change(screen.getByPlaceholderText(/поделись своим опытом/i), {
			target: { value: 'a'.repeat(501) },
		});

		// Assert
		expect(setText).toHaveBeenCalledTimes(1);
		expect(setText).toHaveBeenCalledWith('Updated text');
	});

	it('opens flags picker and saves selected flags', async () => {
		// Arrange
		const setGreenFlags = vi.fn();
		const setRedFlags = vi.fn();

		// Act
		render(
			<ReviewModal
				{...baseProps}
				formData={{ greenFlags: [], redFlags: [], text: 'Initial text' }}
				setGreenFlags={setGreenFlags}
				setRedFlags={setRedFlags}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'Выбрать флаги' }));
		fireEvent.click(screen.getAllByTitle('Добавить к зеленым')[1]);
		fireEvent.click(screen.getByRole('button', { name: 'Сохранить флаги' }));

		// Assert
		await waitFor(() => {
			expect(setGreenFlags).toHaveBeenCalledWith(['flag-2']);
		});
		expect(setRedFlags).toHaveBeenCalledWith([]);
	});

	it('confirms submit and shows success toast', async () => {
		// Arrange
		const submitReview = vi.fn().mockResolvedValue(true);

		// Act
		render(<ReviewModal {...baseProps} submitReview={submitReview} />);
		fireEvent.click(screen.getByRole('button', { name: 'Опубликовать отзыв' }));
		fireEvent.click(screen.getByRole('button', { name: 'Подтвердить' }));

		// Assert
		await waitFor(() => {
			expect(submitReview).toHaveBeenCalledTimes(1);
		});
		expect(showToastMock).toHaveBeenCalledWith('Отзыв сохранен', 'success');
	});

	it('deletes review in edit mode and shows success toast', async () => {
		// Arrange
		const deleteReview = vi.fn().mockResolvedValue(true);

		// Act
		render(
			<ReviewModal
				{...baseProps}
				isEditMode
				canDelete
				deleteReview={deleteReview}
			/>,
		);
		fireEvent.click(screen.getByRole('button', { name: 'Удалить отзыв' }));
		fireEvent.click(screen.getByRole('button', { name: 'Удалить' }));

		// Assert
		await waitFor(() => {
			expect(deleteReview).toHaveBeenCalledTimes(1);
		});
		expect(showToastMock).toHaveBeenCalledWith('Отзыв удален', 'success');
	});
});
