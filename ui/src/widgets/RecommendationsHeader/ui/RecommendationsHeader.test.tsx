/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RecommendationsHeader } from './RecommendationsHeader';

const { useProfileMock, navigateMock } = vi.hoisted(() => ({
	useProfileMock: vi.fn(),
	navigateMock: vi.fn(),
}));

vi.mock('features/profile', () => ({
	useProfile: useProfileMock,
}));

vi.mock('shared/ui/UserNavButton', () => ({
	UserNavButton: ({ nickname }: { nickname?: string }) => <div>{nickname}</div>,
}));

vi.mock('features/companySearch', () => ({
	SearchInput: ({
		value,
		onChange,
		placeholder,
	}: {
		value: string;
		onChange: (value: string) => void;
		placeholder: string;
	}) => (
		<input
			value={value}
			onChange={(event) => onChange(event.target.value)}
			placeholder={placeholder}
		/>
	),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
	return {
		...actual,
		useNavigate: () => navigateMock,
	};
});

describe('RecommendationsHeader', () => {
	beforeEach(() => {
		useProfileMock.mockReset();
		navigateMock.mockReset();
		useProfileMock.mockReturnValue({
			profile: {
				user: {
					nickname: 'tester',
					avatarUrl: '/avatar.png',
				},
			},
		});
	});

	it('renders search input and passes changes through', () => {
		// Arrange
		const onSearchChange = vi.fn();
		render(
			<RecommendationsHeader
				searchValue="Ac"
				onSearchChange={onSearchChange}
			/>,
		);

		// Act
		fireEvent.change(screen.getByPlaceholderText('Поиск компании'), {
			target: { value: 'Acme' },
		});

		// Assert
		expect(screen.getByText('tester')).toBeInTheDocument();
		expect(screen.getByAltText('VibeCheck')).toBeInTheDocument();
		expect(onSearchChange).toHaveBeenCalledWith('Acme');
	});
});
