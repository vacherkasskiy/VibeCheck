import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RegistrationForm } from './RegistrationForm';

const { registerMock, navigateMock } = vi.hoisted(() => ({
	registerMock: vi.fn(),
	navigateMock: vi.fn(),
}));

vi.mock('../../../features/auth', () => ({
	register: registerMock,
}));

vi.mock('../../VerificationForm', () => ({
	VerificationForm: ({
		email,
		onSuccess,
	}: {
		email: string;
		onSuccess: () => void;
	}) => (
		<div>
			<div>verification step for {email}</div>
			<button type="button" onClick={onSuccess}>
				go to profile step
			</button>
		</div>
	),
}));

vi.mock('widgets/ProfileForm', () => ({
	ProfileForm: () => <div>profile step</div>,
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

describe('RegistrationForm', () => {
	beforeEach(() => {
		registerMock.mockReset();
		navigateMock.mockReset();
	});

	it('shows validation error for invalid email', async () => {
		// Arrange
		render(<RegistrationForm />);

		// Act
		fireEvent.change(screen.getByPlaceholderText('example@mail.ru'), {
			target: { value: 'wrong-email' },
		});
		fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

		// Assert
		expect(await screen.findByText('Неверный формат email')).toBeInTheDocument();
		expect(registerMock).not.toHaveBeenCalled();
	});

	it('switches to verification step after successful registration request', async () => {
		// Arrange
		registerMock.mockResolvedValue(undefined);
		const { container } = render(<RegistrationForm />);
		const inputs = container.querySelectorAll('input');

		// Act
		fireEvent.change(screen.getByPlaceholderText('example@mail.ru'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.change(inputs[1], { target: { value: 'StrongPass1!' } });
		fireEvent.change(inputs[2], { target: { value: 'StrongPass1!' } });
		fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

		// Assert
		await waitFor(() => {
			expect(registerMock).toHaveBeenCalledWith({
				login: 'user@example.com',
				password: 'StrongPass1!',
			});
		});
		expect(
			await screen.findByText('verification step for user@example.com'),
		).toBeInTheDocument();
	});

	it('shows friendly duplicate email error from backend', async () => {
		// Arrange
		registerMock.mockRejectedValue({
			response: {
				data: {
					message: 'User already exists',
				},
			},
		});
		const { container } = render(<RegistrationForm />);
		const inputs = container.querySelectorAll('input');

		// Act
		fireEvent.change(screen.getByPlaceholderText('example@mail.ru'), {
			target: { value: 'user@example.com' },
		});
		fireEvent.change(inputs[1], { target: { value: 'StrongPass1!' } });
		fireEvent.change(inputs[2], { target: { value: 'StrongPass1!' } });
		fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

		// Assert
		expect(await screen.findByText('Ошибка регистрации')).toBeInTheDocument();
		expect(
			await screen.findByText(
				'Пользователь с таким email уже зарегистрирован. Попробуйте войти или восстановить пароль.',
			),
		).toBeInTheDocument();
	});
});
