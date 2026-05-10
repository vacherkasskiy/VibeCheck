import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { VerificationForm } from './VerificationForm';

const {
	registerConfirmMock,
	registerResendMock,
	passwordConfirmMock,
	passwordResetResendMock,
	dispatchMock,
} = vi.hoisted(() => ({
	registerConfirmMock: vi.fn(),
	registerResendMock: vi.fn(),
	passwordConfirmMock: vi.fn(),
	passwordResetResendMock: vi.fn(),
	dispatchMock: vi.fn(),
}));

vi.mock('features/auth', () => ({
	registerConfirm: registerConfirmMock,
	registerResend: registerResendMock,
	passwordConfirm: passwordConfirmMock,
	passwordResetResend: passwordResetResendMock,
	useAuth: () => ({ dispatch: dispatchMock }),
}));

describe('VerificationForm', () => {
	beforeEach(() => {
		registerConfirmMock.mockReset();
		registerResendMock.mockReset();
		passwordConfirmMock.mockReset();
		passwordResetResendMock.mockReset();
		dispatchMock.mockReset();
		localStorage.clear();
		vi.useRealTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('keeps only numeric six-digit code in input', () => {
		// Arrange
		render(
			<VerificationForm
				email="user@example.com"
				password="StrongPass1!"
				onSuccess={vi.fn()}
				onBack={vi.fn()}
			/>,
		);

		const input = screen.getByPlaceholderText('000000') as HTMLInputElement;

		// Act
		fireEvent.change(input, { target: { value: '12ab34cd567' } });

		// Assert
		expect(input.value).toBe('123456');
	});

	it('shows validation error for incomplete code', async () => {
		// Arrange
		render(
			<VerificationForm
				email="user@example.com"
				password="StrongPass1!"
				onSuccess={vi.fn()}
				onBack={vi.fn()}
			/>,
		);

		// Act
		fireEvent.change(screen.getByPlaceholderText('000000'), {
			target: { value: '123' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Отправить код' }));

		// Assert
		expect(await screen.findByText('Код должен содержать ровно 6 цифр')).toBeInTheDocument();
		expect(registerConfirmMock).not.toHaveBeenCalled();
	});

	it('stores tokens and calls success callback in reset mode', async () => {
		// Arrange
		const onSuccess = vi.fn();
		passwordConfirmMock.mockResolvedValue({
			accessToken: 'access-token',
			refreshToken: 'refresh-token',
		});

		render(
			<VerificationForm
				email="user@example.com"
				password="StrongPass1!"
				mode="reset"
				onSuccess={onSuccess}
				onBack={vi.fn()}
			/>,
		);

		// Act
		fireEvent.change(screen.getByPlaceholderText('000000'), {
			target: { value: '123456' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Отправить код' }));

		// Assert
		await waitFor(() => {
			expect(passwordConfirmMock).toHaveBeenCalledWith('123456');
		});
		expect(localStorage.getItem('accessToken')).toBe('access-token');
		expect(localStorage.getItem('refreshToken')).toBe('refresh-token');
		expect(dispatchMock).toHaveBeenCalledWith({
			type: 'SET_TOKENS',
			payload: {
				accessToken: 'access-token',
				refreshToken: 'refresh-token',
			},
		});
		expect(onSuccess).toHaveBeenCalledTimes(1);
	});

	it('shows resend button after timer and resends register code', async () => {
		// Arrange
		registerResendMock.mockResolvedValue(undefined);
		vi.useFakeTimers();

		render(
			<VerificationForm
				email="user@example.com"
				password="StrongPass1!"
				onSuccess={vi.fn()}
				onBack={vi.fn()}
			/>,
		);

		// Act
		act(() => {
			vi.advanceTimersByTime(61000);
		});
		act(() => {
			fireEvent.click(
				screen.getByRole('button', { name: 'Не пришел код? Отправить код повторно' }),
			);
		});

		// Assert
		expect(registerResendMock).toHaveBeenCalledWith({
			login: 'user@example.com',
			password: 'StrongPass1!',
		});
	});
});
