import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CompanyCard } from './CompanyCard';

const { useUserFlagsMock } = vi.hoisted(() => ({
	useUserFlagsMock: vi.fn(),
}));

vi.mock('entities/user', () => ({
	useUserFlags: useUserFlagsMock,
}));

describe('CompanyCard', () => {
	beforeEach(() => {
		useUserFlagsMock.mockReset();
		useUserFlagsMock.mockReturnValue({
			flags: {
				green: [{ id: 'flag-1', name: 'Supportive team', priority: 1 }],
				red: [{ id: 'flag-2', name: 'Micromanagement', priority: 2 }],
			},
		});
	});

	it('renders company data, preview flags and handles click', () => {
		// Arrange
		const onClick = vi.fn();
		render(
			<CompanyCard
				onClick={onClick}
				company={{
					companyId: 'company-1',
					name: 'Acme',
					description: 'Great company',
					iconUrl: '',
					topFlags: [
						{ id: 'flag-1', name: 'Supportive team' },
						{ id: 'flag-2', name: 'Micromanagement' },
						{ id: 'flag-3', name: 'Remote' },
					],
				} as any}
			/>,
		);

		// Act
		fireEvent.click(screen.getByRole('button'));

		// Assert
		expect(screen.getByText('Acme')).toBeInTheDocument();
		expect(screen.getByText('Great company')).toBeInTheDocument();
		expect(screen.getByText('Supportive team')).toBeInTheDocument();
		expect(screen.getByText('Micromanagement')).toBeInTheDocument();
		expect(screen.getByText('Remote')).toBeInTheDocument();
		expect(onClick).toHaveBeenCalledWith('company-1');
	});

	it('shows fallback description and empty flags state', () => {
		// Arrange
		render(
			<CompanyCard
				company={{
					companyId: 'company-1',
					name: 'Acme',
					iconUrl: '',
					description: '',
					topFlags: [],
				} as any}
			/>,
		);

		// Act
		const fallbackDescription = screen.getByText(
			'Откройте карточку компании, чтобы посмотреть отзывы, описание и топ флагов команды.',
		);

		// Assert
		expect(fallbackDescription).toBeInTheDocument();
		expect(screen.getByText('Флаги пока не добавлены')).toBeInTheDocument();
		expect(screen.getByText('A')).toBeInTheDocument();
	});
});
