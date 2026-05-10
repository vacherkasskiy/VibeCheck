import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Top20FlagsSection } from './Top20FlagsSection';

const { useGetAllFlagsMock, useUserFlagsMock } = vi.hoisted(() => ({
	useGetAllFlagsMock: vi.fn(),
	useUserFlagsMock: vi.fn(),
}));

vi.mock('entities/tag', () => ({
	useGetAllFlags: useGetAllFlagsMock,
}));

vi.mock('entities/user', () => ({
	useUserFlags: useUserFlagsMock,
}));

vi.mock('features/flags', () => ({
	TagInfoModal: ({
		tag,
		isOpen,
	}: {
		tag: { name: string; description: string } | null;
		isOpen: boolean;
	}) => (isOpen && tag ? <div>{`${tag.name}: ${tag.description}`}</div> : null),
}));

describe('Top20FlagsSection', () => {
	beforeEach(() => {
		useGetAllFlagsMock.mockReset();
		useUserFlagsMock.mockReset();

		useGetAllFlagsMock.mockReturnValue({
			flags: [
				{
					id: 'flag-1',
					name: 'Supportive team',
					description: 'Detailed description',
					category: 'Culture',
				},
			],
		});
		useUserFlagsMock.mockReturnValue({
			flags: {
				green: [{ id: 'flag-1', name: 'Supportive team', priority: 1 }],
				red: [{ id: 'flag-2', name: 'Micromanagement', priority: 2 }],
			},
		});
	});

	it('filters flags by search query', () => {
		// Arrange
		render(
			<Top20FlagsSection
				flags={[
					{ id: 'flag-1', name: 'Supportive team', count: 8 },
					{ id: 'flag-2', name: 'Micromanagement', count: 2 },
				] as any}
			/>,
		);

		// Act
		fireEvent.change(screen.getByPlaceholderText('Поиск флагов...'), {
			target: { value: 'support' },
		});

		// Assert
		expect(screen.getByText('Supportive team')).toBeInTheDocument();
		expect(screen.queryByText('Micromanagement')).not.toBeInTheDocument();
	});

	it('opens tag info modal with detailed flag description', () => {
		// Arrange
		render(
			<Top20FlagsSection flags={[{ id: 'flag-1', name: 'Supportive team', count: 8 }] as any} />,
		);

		// Act
		fireEvent.click(screen.getByRole('button', { name: /supportive team/i }));

		// Assert
		expect(
			screen.getByText('Supportive team: Detailed description'),
		).toBeInTheDocument();
	});

	it('shows empty state when no flags match search', () => {
		// Arrange
		render(
			<Top20FlagsSection flags={[{ id: 'flag-1', name: 'Supportive team', count: 8 }] as any} />,
		);

		// Act
		fireEvent.change(screen.getByPlaceholderText('Поиск флагов...'), {
			target: { value: 'unknown' },
		});

		// Assert
		expect(screen.getByText('Флаги не найдены')).toBeInTheDocument();
	});
});
