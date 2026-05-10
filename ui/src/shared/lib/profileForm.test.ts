import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
	dateToISO,
	formatDateInput,
	isoToDisplayDate,
	mapEducationLevelToFormValue,
	mapSpecializationToIndustryValue,
	validateBirthDate,
} from './profileForm';

describe('profileForm helpers', () => {
	beforeEach(() => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-05-10T12:00:00Z'));
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('formats raw digits into DD.MM.YYYY input mask', () => {
		// Arrange
		const rawValue = '01022000';
		const mixedValue = '01-02-2000abc';

		// Act
		const formattedRaw = formatDateInput(rawValue);
		const formattedMixed = formatDateInput(mixedValue);

		// Assert
		expect(formattedRaw).toBe('01.02.2000');
		expect(formattedMixed).toBe('01.02.2000');
	});

	it('converts display date to ISO date', () => {
		// Arrange
		const value = '09.05.2026';

		// Act
		const result = dateToISO(value);

		// Assert
		expect(result).toBe('2026-05-09T00:00:00Z');
	});

	it('converts ISO date to display format', () => {
		// Arrange
		const value = '2026-05-09T00:00:00Z';

		// Act
		const result = isoToDisplayDate(value);

		// Assert
		expect(result).toBe('09.05.2026');
	});

	it('validates adult birth date', () => {
		// Arrange
		const value = '10.05.2000';

		// Act
		const result = validateBirthDate(value);

		// Assert
		expect(result).toBe('');
	});

	it('rejects underage birth date', () => {
		// Arrange
		const value = '11.05.2010';

		// Act
		const result = validateBirthDate(value);

		// Assert
		expect(result).toBe('Возраст от 18 лет');
	});

	it('maps backend education enum to form value', () => {
		// Arrange
		const value = 'EDUCATION_LEVEL_MASTER';

		// Act
		const result = mapEducationLevelToFormValue(value);

		// Assert
		expect(result).toBe('MASTER');
	});

	it('maps backend specialization enum to form industry', () => {
		// Arrange
		const value = 'SPECIALTY_MEDICINE';

		// Act
		const result = mapSpecializationToIndustryValue(value);

		// Assert
		expect(result).toBe('HEALTHCARE');
	});
});
