import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProfileForm } from './ProfileForm';

const {
	getAvatarsMock,
	createUserInfoDtoMock,
	createMyInfoMock,
	completeCurrentOnboardingStepMock,
} = vi.hoisted(() => ({
	getAvatarsMock: vi.fn(),
	createUserInfoDtoMock: vi.fn(),
	createMyInfoMock: vi.fn(),
	completeCurrentOnboardingStepMock: vi.fn(),
}));

vi.mock('features/auth', () => ({
	getAvatars: getAvatarsMock,
	createUserInfoDto: createUserInfoDtoMock,
	createMyInfo: createMyInfoMock,
	completeCurrentOnboardingStep: completeCurrentOnboardingStepMock,
}));

describe('ProfileForm', () => {
	beforeEach(() => {
		getAvatarsMock.mockReset();
		createUserInfoDtoMock.mockReset();
		createMyInfoMock.mockReset();
		completeCurrentOnboardingStepMock.mockReset();

		getAvatarsMock.mockResolvedValue([]);
		createUserInfoDtoMock.mockImplementation((value) => value);
		createMyInfoMock.mockResolvedValue(undefined);
		completeCurrentOnboardingStepMock.mockResolvedValue(undefined);
	});

	it('shows required errors when submitting an empty form', async () => {
		// Arrange
		render(<ProfileForm email="user@example.com" onSubmit={vi.fn()} onBack={vi.fn()} />);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }));

		// Assert
		expect(await screen.findAllByText('Обязательное поле')).toHaveLength(6);
		expect(createMyInfoMock).not.toHaveBeenCalled();
	});

	it('shows experience validation when end date is earlier than start date', async () => {
		// Arrange
		const { container } = render(
			<ProfileForm email="user@example.com" onSubmit={vi.fn()} onBack={vi.fn()} />,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Добавить опыт' }));

		const selects = screen.getAllByRole('combobox');
		fireEvent.change(selects[0], { target: { value: 'SEX_FEMALE' } });
		fireEvent.change(selects[1], { target: { value: 'BACHELOR' } });
		fireEvent.change(selects[2], { target: { value: 'IT' } });
		fireEvent.change(selects[3], { target: { value: 'MEDIA' } });

		const avatarButton = screen.getByRole('button', { name: 'Аватар 1' });
		fireEvent.click(avatarButton);

		const inputs = container.querySelectorAll('input');
		fireEvent.change(inputs[0], { target: { value: 'Test.User' } });
		fireEvent.change(inputs[1], { target: { value: '01011995' } });
		fireEvent.change(inputs[2], { target: { value: '02022024' } });
		fireEvent.change(inputs[3], { target: { value: '01012024' } });
		fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }));

		// Assert
		expect(
			await screen.findByText('Дата окончания опыта не может быть раньше даты начала'),
		).toBeInTheDocument();
		expect(createMyInfoMock).not.toHaveBeenCalled();
	});

	it('creates profile info and completes onboarding on valid submit', async () => {
		// Arrange
		const onSubmit = vi.fn();
		const { container } = render(
			<ProfileForm email="user@example.com" onSubmit={onSubmit} onBack={vi.fn()} />,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: 'Добавить опыт' }));

		const selects = screen.getAllByRole('combobox');
		fireEvent.change(selects[0], { target: { value: 'SEX_FEMALE' } });
		fireEvent.change(selects[1], { target: { value: 'BACHELOR' } });
		fireEvent.change(selects[2], { target: { value: 'IT' } });
		fireEvent.change(selects[3], { target: { value: 'MEDIA' } });

		fireEvent.click(screen.getByRole('button', { name: 'Аватар 1' }));

		const inputs = container.querySelectorAll('input');
		fireEvent.change(inputs[0], { target: { value: 'Test.User' } });
		fireEvent.change(inputs[1], { target: { value: '01011995' } });
		fireEvent.change(inputs[2], { target: { value: '01012020' } });
		fireEvent.change(inputs[3], { target: { value: '01012024' } });
		fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }));

		// Assert
		await waitFor(() => {
			expect(createUserInfoDtoMock).toHaveBeenCalledWith({
				avatarId: '1',
				nickname: 'test.user',
				sex: 'SEX_FEMALE',
				birthDate: '1995-01-01T00:00:00Z',
				education: 'BACHELOR',
				industry: 'IT',
				experiences: [
					{
						industry: 'MEDIA',
						startDate: '2020-01-01T00:00:00Z',
						endDate: '2024-01-01T00:00:00Z',
					},
				],
			});
		});
		expect(createMyInfoMock).toHaveBeenCalledWith({
			avatarId: '1',
			nickname: 'test.user',
			sex: 'SEX_FEMALE',
			birthDate: '1995-01-01T00:00:00Z',
			education: 'BACHELOR',
			industry: 'IT',
			experiences: [
				{
					industry: 'MEDIA',
					startDate: '2020-01-01T00:00:00Z',
					endDate: '2024-01-01T00:00:00Z',
				},
			],
		});
		expect(completeCurrentOnboardingStepMock).toHaveBeenCalledTimes(1);
		expect(onSubmit).toHaveBeenCalledTimes(1);
	});
});
