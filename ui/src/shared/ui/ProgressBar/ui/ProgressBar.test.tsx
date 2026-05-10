import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProgressBar } from './ProgressBar';

describe('ProgressBar', () => {
	it('renders active and completed steps with correct progress width', () => {
		// Arrange
		const steps = ['Email', 'Код', 'Профиль'];
		const { container } = render(
			<ProgressBar currentStep={2} totalSteps={3} steps={steps} />,
		);

		// Act
		const progressLine = container.querySelector('[style*="width"]') as HTMLElement;

		// Assert
		expect(screen.getByText('Email')).toBeInTheDocument();
		expect(screen.getByText('Код')).toBeInTheDocument();
		expect(screen.getByText('Профиль')).toBeInTheDocument();
		expect(progressLine).toHaveStyle({ width: '50%' });
		expect(container.querySelectorAll('svg')).toHaveLength(1);
	});
});
