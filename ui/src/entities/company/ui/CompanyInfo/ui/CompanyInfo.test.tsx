import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CompanyInfo } from './CompanyInfo';

describe('CompanyInfo', () => {
	it('renders company name, links and description', () => {
		// Arrange
		render(
			<CompanyInfo
				company={{
					companyId: 'company-1',
					name: 'Acme',
					description: 'Acme description',
					iconUrl: '',
					links: {
						site: 'https://acme.example',
						linkedin: 'https://linkedin.example/acme',
						hh: '',
					},
				} as any}
			/>,
		);

		// Act
		const links = screen.getAllByRole('link');

		// Assert
		expect(screen.getByText('Acme')).toBeInTheDocument();
		expect(screen.getByText('Acme description')).toBeInTheDocument();
		expect(links).toHaveLength(2);
	});

	it('renders fallback logo when icon is absent', () => {
		// Arrange
		render(
			<CompanyInfo
				company={{
					companyId: 'company-1',
					name: 'Acme',
					description: '',
					iconUrl: '',
				} as any}
			/>,
		);

		// Act
		const fallback = screen.getByText('A');

		// Assert
		expect(fallback).toBeInTheDocument();
	});
});
