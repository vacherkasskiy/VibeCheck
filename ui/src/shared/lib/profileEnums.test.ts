import { describe, expect, it } from 'vitest';
import {
	translateEducation,
	translateExperience,
	translateSpecialization,
} from './profileEnums';

describe('profileEnums', () => {
	it('translates education enum values into Russian labels', () => {
		// Arrange
		const value = 'EDUCATION_LEVEL_BACHELOR';

		// Act
		const result = translateEducation(value);

		// Assert
		expect(result).toBe('Бакалавриат');
	});

	it('returns fallback text for empty education', () => {
		// Arrange
		const value = '';

		// Act
		const result = translateEducation(value);

		// Assert
		expect(result).toBe('Не указано');
	});

	it('translates specialization enum values into Russian labels', () => {
		// Arrange
		const value = 'SPECIALTY_PROJECT_MANAGEMENT';

		// Act
		const result = translateSpecialization(value);

		// Assert
		expect(result).toBe('Проектный менеджмент');
	});

	it('translates encoded experience string into readable text', () => {
		// Arrange
		const value = 'SPECIALTY_IT с 2024';

		// Act
		const result = translateExperience(value);

		// Assert
		expect(result).toBe('IT с 2024');
	});

	it('keeps plain experience text intact', () => {
		// Arrange
		const value = 'Без опыта';

		// Act
		const result = translateExperience(value);

		// Assert
		expect(result).toBe('Без опыта');
	});
});
