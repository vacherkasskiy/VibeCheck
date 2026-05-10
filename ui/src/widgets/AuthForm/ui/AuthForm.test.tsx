/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, beforeEach, expect, it, vi } from 'vitest';
import { AuthForm } from './AuthForm';

const { loginMock, dispatchMock, navigateMock } = vi.hoisted(() => ({
	loginMock: vi.fn(),
	dispatchMock: vi.fn(),
	navigateMock: vi.fn(),
}));

vi.mock('../../../features/auth', () => ({
	login: loginMock,
	useAuth: () => ({ dispatch: dispatchMock }),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

	return {
		...actual,
		useNavigate: () => navigateMock,
		Link: ({ children, to, ...props }: any) => (
			<a href={typeof to === 'string' ? to : '#'} {...props}>
				{children}
			</a>
		),
	};
});

describe('AuthForm', () => {
	beforeEach(() => {
		loginMock.mockReset();
		dispatchMock.mockReset();
		navigateMock.mockReset();
		localStorage.clear();
	});

	it('shows validation error for invalid email', async () => {
		// Arrange
		render(<AuthForm />);

		// Act
		fireEvent.change(screen.getByPlaceholderText('example@mail.ru'), {
			target: { value: 'wrong-email' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

		// Assert
		expect(await screen.findByText('Неверный формат email')).toBeInTheDocument();
		expect(loginMock).not.toHaveBeenCalled();
	});

	it('shows validation error for empty password', async () => {
		// Arrange
		render(<AuthForm />);

		// Act
		fireEvent.change(screen.getByPlaceholderText('example@mail.ru'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

		// Assert
		expect(await screen.findByText('Обязательное поле')).toBeInTheDocument();
		expect(loginMock).not.toHaveBeenCalled();
	});

	it('stores tokens and navigates after successful login', async () => {
		// Arrange
		loginMock.mockResolvedValue({
			accessToken: 'access-token',
			refreshToken: 'refresh-token',
		});

		const { container } = render(<AuthForm />);
		const inputs = container.querySelectorAll('input');

		// Act
		fireEvent.change(screen.getByPlaceholderText('example@mail.ru'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.change(inputs[1], { target: { value: 'StrongPass1!' } });
		fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

		// Assert
		await waitFor(() => {
			expect(loginMock).toHaveBeenCalledWith({
				login: 'user@example.com',
				password: 'StrongPass1!',
			});
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
		expect(navigateMock).toHaveBeenCalledWith('/recommendations');
	});

	it('shows blocked account message when backend returns ACCOUNT_BLOCKED', async () => {
		// Arrange
		loginMock.mockRejectedValue({
			response: {
				data: {
					code: 'ACCOUNT_BLOCKED',
				},
			},
		});

		const { container } = render(<AuthForm />);
		const inputs = container.querySelectorAll('input');

		// Act
		fireEvent.change(screen.getByPlaceholderText('example@mail.ru'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.change(inputs[1], { target: { value: 'StrongPass1!' } });
		fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

		// Assert
		await waitFor(() => {
			expect(navigateMock).toHaveBeenCalledWith('/blocked');
		});
		expect(navigateMock).not.toHaveBeenCalledWith('/recommendations');
	});
});
