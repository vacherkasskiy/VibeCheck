/* eslint-disable @typescript-eslint/consistent-type-imports */
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FlagsPage } from './FlagsPage';

const { useFlagsMock, navigateMock, useLocationMock } = vi.hoisted(() => ({
	useFlagsMock: vi.fn(),
	navigateMock: vi.fn(),
	useLocationMock: vi.fn(),
}));

vi.mock('features/flags', () => ({
	useFlags: useFlagsMock,
	TagModal: ({ isOpen }: { isOpen: boolean }) => (isOpen ? <div>tag modal</div> : null),
	ConflictDialog: ({ isOpen }: { isOpen: boolean }) =>
		isOpen ? <div>conflict dialog</div> : null,
}));

vi.mock('shared/ui/CenterGlow', () => ({
	CenterGlow: () => <div data-testid="center-glow" />,
}));

vi.mock('shared/ui/HeaderGlow', () => ({
	HeaderGlow: () => <div data-testid="header-glow" />,
}));

vi.mock('widgets/FlagsHeader', () => ({
	FlagsHeader: ({
		onBack,
		onContinue,
		isForReview,
		companyName,
	}: {
		onBack: () => void;
		onContinue: () => void;
		isForReview?: boolean;
		companyName?: string;
	}) => (
		<div>
			<div>header-mode:{isForReview ? `review:${companyName}` : 'default'}</div>
			<button type="button" onClick={onBack}>
				back
			</button>
			<button type="button" onClick={onContinue}>
				continue
			</button>
		</div>
	),
}));

vi.mock('widgets/FlagsLibrary', () => ({
	FlagsLibrary: ({
		onAddToGreen,
		onAddToRed,
	}: {
		onAddToGreen: (tag: { id: string; name: string }) => void;
		onAddToRed: (tag: { id: string; name: string }) => void;
	}) => (
		<div>
			<div>library</div>
			<button type="button" onClick={() => onAddToGreen({ id: 'flag-1', name: 'Flag 1' })}>
				add green
			</button>
			<button type="button" onClick={() => onAddToRed({ id: 'flag-2', name: 'Flag 2' })}>
				add red
			</button>
		</div>
	),
}));

vi.mock('widgets/FlagsColumns', () => ({
	FlagsColumns: ({
		onDropToGreen,
		onDropToRed,
	}: {
		onDropToGreen: () => void;
		onDropToRed: () => void;
	}) => (
		<div>
			<button type="button" onClick={onDropToGreen}>
				drop green
			</button>
			<button type="button" onClick={onDropToRed}>
				drop red
			</button>
		</div>
	),
}));

vi.mock('widgets/SingleFlagColumn', () => ({
	SingleFlagColumn: ({ side, onDrop }: { side: string; onDrop: () => void }) => (
		<div>
			<div>single:{side}</div>
			<button type="button" onClick={onDrop}>
				single drop
			</button>
		</div>
	),
}));

vi.mock('react-router-dom', async () => {
	const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

	return {
		...actual,
		useNavigate: () => navigateMock,
		useLocation: () => useLocationMock(),
	};
});

describe('FlagsPage', () => {
	beforeEach(() => {
		useFlagsMock.mockReset();
		navigateMock.mockReset();
		useLocationMock.mockReset();

		useLocationMock.mockReturnValue({
			state: {
				isForReview: true,
				companyName: 'Acme',
			},
		});

		useFlagsMock.mockReturnValue({
			green: { 'flag-10': { tag: { id: 'flag-10', name: 'Green' }, priority: 3 } },
			red: { 'flag-20': { tag: { id: 'flag-20', name: 'Red' }, priority: 3 } },
			draggingId: 'flag-30',
			modalTag: null,
			showConflict: null,
			groupedByCategory: [
				['Culture', [{ id: 'flag-30', name: 'Flag 30' }]],
			],
			startDrag: vi.fn(),
			endDrag: vi.fn(),
			addToSide: vi.fn(),
			moveAcross: vi.fn(),
			updatePriority: vi.fn(),
			removeTag: vi.fn(),
			onSave: vi.fn(),
			closeModal: vi.fn(),
			closeConflict: vi.fn(),
		});
	});

	it('renders review mode and handles header actions', () => {
		// Arrange
		const onSave = vi.fn();
		useFlagsMock.mockReturnValue({
			green: { 'flag-10': { tag: { id: 'flag-10', name: 'Green' }, priority: 3 } },
			red: { 'flag-20': { tag: { id: 'flag-20', name: 'Red' }, priority: 3 } },
			draggingId: 'flag-30',
			modalTag: null,
			showConflict: null,
			groupedByCategory: [
				['Culture', [{ id: 'flag-30', name: 'Flag 30' }]],
			],
			startDrag: vi.fn(),
			endDrag: vi.fn(),
			addToSide: vi.fn(),
			moveAcross: vi.fn(),
			updatePriority: vi.fn(),
			removeTag: vi.fn(),
			onSave,
			closeModal: vi.fn(),
			closeConflict: vi.fn(),
		});

		// Act
		render(<FlagsPage />);
		fireEvent.click(screen.getByRole('button', { name: 'back' }));
		fireEvent.click(screen.getByRole('button', { name: 'continue' }));

		// Assert
		expect(screen.getByText('header-mode:review:Acme')).toBeInTheDocument();
		expect(navigateMock).toHaveBeenCalledWith(-1);
		expect(onSave).toHaveBeenCalledTimes(1);
	});

	it('switches mobile tabs and routes add/drop actions', () => {
		// Arrange
		const addToSide = vi.fn();
		const endDrag = vi.fn();
		useFlagsMock.mockReturnValue({
			green: { 'flag-10': { tag: { id: 'flag-10', name: 'Green' }, priority: 3 } },
			red: { 'flag-20': { tag: { id: 'flag-20', name: 'Red' }, priority: 3 } },
			draggingId: 'flag-30',
			modalTag: null,
			showConflict: null,
			groupedByCategory: [
				['Culture', [{ id: 'flag-30', name: 'Flag 30' }]],
			],
			startDrag: vi.fn(),
			endDrag,
			addToSide,
			moveAcross: vi.fn(),
			updatePriority: vi.fn(),
			removeTag: vi.fn(),
			onSave: vi.fn(),
			closeModal: vi.fn(),
			closeConflict: vi.fn(),
		});

		// Act
		render(<FlagsPage />);
		fireEvent.click(screen.getAllByRole('button', { name: 'add green' })[0]);
		fireEvent.click(screen.getAllByRole('button', { name: 'add red' })[0]);
		fireEvent.click(screen.getByRole('button', { name: 'drop green' }));
		fireEvent.click(screen.getByText('Green').closest('button') as HTMLButtonElement);
		fireEvent.click(screen.getByText('single drop').closest('button') as HTMLButtonElement);
		fireEvent.click(screen.getByText('Red').closest('button') as HTMLButtonElement);

		// Assert
		expect(addToSide).toHaveBeenCalledWith({ id: 'flag-1', name: 'Flag 1' }, 'green');
		expect(addToSide).toHaveBeenCalledWith({ id: 'flag-2', name: 'Flag 2' }, 'red');
		expect(addToSide).toHaveBeenCalledWith({ id: 'flag-30', name: 'Flag 30' }, 'green');
		expect(endDrag).toHaveBeenCalledTimes(2);
		expect(screen.getByText('single:red')).toBeInTheDocument();
	});
});
