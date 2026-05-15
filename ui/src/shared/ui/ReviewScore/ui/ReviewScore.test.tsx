import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ReviewScore } from './ReviewScore';
import styles from './styles.module.css';

describe('ReviewScore', () => {
	it('does not highlight arrows from score value without user reaction', () => {
		render(<ReviewScore score={7} onUpClick={vi.fn()} onDownClick={vi.fn()} />);

		expect(screen.getByRole('button', { name: 'Проголосовать вверх' }))
			.not.toHaveClass(styles.arrowActive);
		expect(screen.getByRole('button', { name: 'Проголосовать вниз' }))
			.not.toHaveClass(styles.arrowActive);
		expect(screen.getByText('7')).toHaveClass(styles.scoreNeutral);
	});

	it('colors score as negative when dislike is active', () => {
		render(
			<ReviewScore
				score={7}
				onUpClick={vi.fn()}
				onDownClick={vi.fn()}
				isDownActive
			/>,
		);

		expect(screen.getByText('7')).toHaveClass(styles.scoreNegative);
		expect(screen.getByRole('button', { name: 'Проголосовать вниз' }))
			.toHaveClass(styles.arrowActive);
	});
});
