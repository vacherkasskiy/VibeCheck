/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserNavButton } from './UserNavButton';

const { logoutMock, navigateMock, authStateMock } = vi.hoisted(() => ({
	logoutMock: vi.fn(),
	navigateMock: vi.fn(),
	authStateMock: { isAuthenticated: false },
}));

vi.mock('features/auth', () => ({
	useAuth: () => ({
		state: authStateMock,
		logout: logoutMock,
	}),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

describe('UserNavButton', () => {
	beforeEach(() => {
		logoutMock.mockReset();
		navigateMock.mockReset();
		authStateMock.isAuthenticated = false;
	});

	it('renders nothing without avatar and nickname', () => {
		// Arrange
		const { container } = render(<UserNavButton />);

		// Act
		const wrapper = container.firstChild;

		// Assert
		expect(wrapper).toBeNull();
	});

	it('renders fallback profile button for authenticated user without profile data', () => {
		authStateMock.isAuthenticated = true;

		render(<UserNavButton />);

		expect(screen.getByRole('button', { name: /профиль/i })).toBeInTheDocument();
	});

	it('opens menu and navigates to profile edit page', () => {
		// Arrange
		render(<UserNavButton avatarUrl="/avatar.png" nickname="tester" />);

		// Act
		fireEvent.click(screen.getByRole('button', { name: /tester/i }));
		fireEvent.click(screen.getByRole('menuitem', { name: /редактировать профиль/i }));

		// Assert
		expect(navigateMock).toHaveBeenCalledWith('/profile/edit');
	});

	it('logs out and redirects to login', async () => {
		// Arrange
		logoutMock.mockResolvedValue(undefined);
		render(<UserNavButton avatarUrl="/avatar.png" nickname="tester" />);

		// Act
		fireEvent.click(screen.getByRole('button', { name: /tester/i }));
		fireEvent.click(screen.getByRole('menuitem', { name: /выйти/i }));

		// Assert
		await waitFor(() => {
			expect(logoutMock).toHaveBeenCalledTimes(1);
		});
		expect(navigateMock).toHaveBeenCalledWith('/login');
	});

	it('uses external onClick instead of opening menu', () => {
		// Arrange
		const onClick = vi.fn();
		render(<UserNavButton avatarUrl="/avatar.png" nickname="tester" onClick={onClick} />);

		// Act
		fireEvent.click(screen.getByRole('button', { name: /tester/i }));

		// Assert
		expect(onClick).toHaveBeenCalledTimes(1);
		expect(screen.queryByRole('menu')).not.toBeInTheDocument();
	});
});
