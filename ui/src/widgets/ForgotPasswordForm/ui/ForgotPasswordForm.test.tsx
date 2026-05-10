/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ForgotPasswordForm } from './ForgotPasswordForm';

const { passwordResetMock, navigateMock } = vi.hoisted(() => ({
	passwordResetMock: vi.fn(),
	navigateMock: vi.fn(),
}));

vi.mock('features/auth/model/api', () => ({
	passwordReset: passwordResetMock,
}));

vi.mock('widgets/VerificationForm', () => ({
	VerificationForm: ({ email, mode }: { email: string; mode?: string }) => (
		<div>
			verification step for {email} ({mode})
		</div>
	),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

describe('ForgotPasswordForm', () => {
	beforeEach(() => {
		passwordResetMock.mockReset();
		navigateMock.mockReset();
	});

	it('shows password mismatch validation', async () => {
		// Arrange
		const { container } = render(<ForgotPasswordForm />);
		const inputs = container.querySelectorAll('input');

		// Act
		fireEvent.change(screen.getByPlaceholderText('example@mail.ru'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.change(inputs[1], { target: { value: 'StrongPass1!' } });
		fireEvent.change(inputs[2], { target: { value: 'DifferentPass1!' } });
		fireEvent.click(screen.getByRole('button', { name: 'Отправить код' }));

		// Assert
		expect(await screen.findByText('Пароли не совпадают')).toBeInTheDocument();
		expect(passwordResetMock).not.toHaveBeenCalled();
	});

	it('switches to verification step after successful submit', async () => {
		// Arrange
		passwordResetMock.mockResolvedValue(undefined);
		const { container } = render(<ForgotPasswordForm />);
		const inputs = container.querySelectorAll('input');

		// Act
		fireEvent.change(screen.getByPlaceholderText('example@mail.ru'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.change(inputs[1], { target: { value: 'StrongPass1!' } });
		fireEvent.change(inputs[2], { target: { value: 'StrongPass1!' } });
		fireEvent.click(screen.getByRole('button', { name: 'Отправить код' }));

		// Assert
		await waitFor(() => {
			expect(passwordResetMock).toHaveBeenCalledWith({
				email: 'user@example.com',
				newPassword: 'StrongPass1!',
			});
		});
		expect(
			await screen.findByText('verification step for user@example.com (reset)'),
		).toBeInTheDocument();
	});

	it('shows error modal when reset request fails', async () => {
		// Arrange
		passwordResetMock.mockRejectedValue({
			response: {
				data: {
					message: 'Не удалось отправить код',
				},
			},
		});

		const { container } = render(<ForgotPasswordForm />);
		const inputs = container.querySelectorAll('input');

		// Act
		fireEvent.change(screen.getByPlaceholderText('example@mail.ru'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.change(inputs[1], { target: { value: 'StrongPass1!' } });
		fireEvent.change(inputs[2], { target: { value: 'StrongPass1!' } });
		fireEvent.click(screen.getByRole('button', { name: 'Отправить код' }));

		// Assert
		expect(await screen.findByText('Ошибка')).toBeInTheDocument();
		expect(await screen.findAllByText('Не удалось отправить код')).toHaveLength(2);
	});
});
