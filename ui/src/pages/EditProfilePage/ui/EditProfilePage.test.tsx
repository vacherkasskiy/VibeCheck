/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EditProfilePage } from './EditProfilePage';

const {
	useProfileMock,
	getMyInfoMock,
	getAvatarsMock,
	createUserInfoDtoMock,
	updateMyInfoMock,
	navigateMock,
} = vi.hoisted(() => ({
	useProfileMock: vi.fn(),
	getMyInfoMock: vi.fn(),
	getAvatarsMock: vi.fn(),
	createUserInfoDtoMock: vi.fn(),
	updateMyInfoMock: vi.fn(),
	navigateMock: vi.fn(),
}));

vi.mock('features/profile', () => ({
	useProfile: useProfileMock,
}));

vi.mock('features/auth', () => ({
	getMyInfo: getMyInfoMock,
	getAvatars: getAvatarsMock,
	createUserInfoDto: createUserInfoDtoMock,
	updateMyInfo: updateMyInfoMock,
}));

vi.mock('shared/ui', () => ({
	HeaderGlow: () => <div data-testid="header-glow" />,
	CenterGlow: () => <div data-testid="center-glow" />,
}));

vi.mock('shared/ui/UserNavButton', () => ({
	UserNavButton: () => <div data-testid="user-nav-button" />,
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

describe('EditProfilePage', () => {
	beforeEach(() => {
		useProfileMock.mockReset();
		getMyInfoMock.mockReset();
		getAvatarsMock.mockReset();
		createUserInfoDtoMock.mockReset();
		updateMyInfoMock.mockReset();
		navigateMock.mockReset();

		createUserInfoDtoMock.mockImplementation((value) => value);
		updateMyInfoMock.mockResolvedValue(undefined);
		getAvatarsMock.mockResolvedValue([]);
	});

	it('shows loading state while profile is loading', () => {
		// Arrange
		useProfileMock.mockReturnValue({
			profile: null,
			loading: true,
			error: null,
		});

		// Act
		render(<EditProfilePage />);

		// Assert
		expect(screen.getByAltText('VibeCheck')).toBeInTheDocument();
		expect(screen.queryByText('Сохранить изменения')).not.toBeInTheDocument();
	});

	it('loads profile data and saves edited values', async () => {
		// Arrange
		useProfileMock.mockReturnValue({
			profile: {
				user: {
					avatarUrl: '/avatar.png',
					nickname: 'tester',
				},
			},
			loading: false,
			error: null,
		});

		getMyInfoMock.mockResolvedValue({
			name: 'tester',
			iconId: '1',
			sex: 'SEX_FEMALE',
			birthday: '1995-01-01T00:00:00Z',
			education: 'EDUCATION_LEVEL_BACHELOR',
			specialization: 'SPECIALTY_IT',
			workExperience: [],
		});

		render(<EditProfilePage />);

		// Act
		await screen.findAllByDisplayValue('tester');
		fireEvent.change(screen.getByDisplayValue('01.01.1995'), {
			target: { value: '02021995' },
		});

		const selects = screen.getAllByRole('combobox');
		fireEvent.change(selects[0], { target: { value: 'SEX_MALE' } });
		fireEvent.change(selects[1], { target: { value: 'MASTER' } });
		fireEvent.change(selects[2], { target: { value: 'MEDIA' } });

		fireEvent.click(screen.getByRole('button', { name: 'Сохранить изменения' }));

		// Assert
		await waitFor(() => {
			expect(createUserInfoDtoMock).toHaveBeenCalledWith({
				avatarId: '1',
				nickname: 'tester',
				sex: 'SEX_MALE',
				birthDate: '1995-02-02T00:00:00Z',
				education: 'MASTER',
				industry: 'MEDIA',
				experiences: [],
			});
		});
		expect(updateMyInfoMock).toHaveBeenCalledWith({
			avatarId: '1',
			nickname: 'tester',
			sex: 'SEX_MALE',
			birthDate: '1995-02-02T00:00:00Z',
			education: 'MASTER',
			industry: 'MEDIA',
			experiences: [],
		});
		expect(navigateMock).toHaveBeenCalledWith('/profile');
	});
});
