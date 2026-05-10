import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Modal } from './Modal';

describe('Modal', () => {
	it('renders children only when modal is open', () => {
		// Arrange
		const onClose = vi.fn();

		// Act
		render(
			<Modal isOpen={true} onClose={onClose}>
				<div>Modal content</div>
			</Modal>,
		);

		// Assert
		expect(screen.getByText('Modal content')).toBeInTheDocument();
	});

	it('does not render content when modal is closed', () => {
		// Arrange
		const onClose = vi.fn();

		// Act
		render(
			<Modal isOpen={false} onClose={onClose}>
				<div>Hidden content</div>
			</Modal>,
		);

		// Assert
		expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
	});

	it('calls onClose when escape is pressed', () => {
		// Arrange
		const onClose = vi.fn();

		render(
			<Modal isOpen={true} onClose={onClose}>
				<div>Modal content</div>
			</Modal>,
		);

		// Act
		fireEvent.keyDown(document, { key: 'Escape' });

		// Assert
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('calls onClose when backdrop is clicked', () => {
		// Arrange
		const onClose = vi.fn();
		const { container } = render(
			<Modal isOpen={true} onClose={onClose}>
				<div>Modal content</div>
			</Modal>,
		);

		const overlay = container.firstChild as HTMLElement;

		// Act
		fireEvent.click(overlay);

		// Assert
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it('locks body scroll while modal is open and restores it after unmount', () => {
		// Arrange
		const onClose = vi.fn();
		const { unmount } = render(
			<Modal isOpen={true} onClose={onClose}>
				<div>Modal content</div>
			</Modal>,
		);

		// Act
		const overflowWhileOpen = document.body.style.overflow;
		unmount();

		// Assert
		expect(overflowWhileOpen).toBe('hidden');
		expect(document.body.style.overflow).toBe('');
	});
});
