import { describe, expect, it } from 'vitest';
import {
	createUserInfoDto,
	mapEducation,
	mapIndustryToSpecialization,
	mapMockExperience,
} from './userApi';

describe('userApi mapping helpers', () => {
	it('maps mock education values into backend education enums', () => {
		// Arrange
		const value = 'BACHELOR';

		// Act
		const result = mapEducation(value);

		// Assert
		expect(result).toBe('EDUCATION_LEVEL_BACHELOR');
	});

	it('falls back to NONE for unknown education values', () => {
		// Arrange
		const value = 'UNKNOWN';

		// Act
		const result = mapEducation(value);

		// Assert
		expect(result).toBe('EDUCATION_LEVEL_NONE');
	});

	it('maps mock industry values into backend specialization enums', () => {
		// Arrange
		const value = 'TRANSPORT';

		// Act
		const result = mapIndustryToSpecialization(value);

		// Assert
		expect(result).toBe('SPECIALTY_LOGISTICS');
	});

	it('maps a single mock experience into backend DTO shape', () => {
		// Arrange
		const experience = {
			industry: 'IT',
			startDate: '2024-01-01T00:00:00Z',
			endDate: null,
		};

		// Act
		const result = mapMockExperience(experience);

		// Assert
		expect(result).toEqual({
			specialization: 'SPECIALTY_IT',
			startedAt: '2024-01-01T00:00:00Z',
			finishedAt: null,
		});
	});

	it('creates full user info DTO for backend update/create requests', () => {
		// Arrange
		const formData = {
			avatarId: 'avatar-1',
			nickname: 'tester',
			sex: 'SEX_FEMALE' as const,
			birthDate: '2000-02-01T00:00:00Z',
			education: 'MASTER',
			industry: 'MEDIA',
			experiences: [
				{
					industry: 'MEDIA',
					startDate: '2023-01-01T00:00:00Z',
					endDate: '2024-01-01T00:00:00Z',
				},
			],
		};

		// Act
		const result = createUserInfoDto(formData);

		// Assert
		expect(result).toEqual({
			name: 'tester',
			iconId: 'avatar-1',
			sex: 'SEX_FEMALE',
			birthday: '2000-02-01T00:00:00Z',
			education: 'EDUCATION_LEVEL_MASTER',
			specialization: 'SPECIALTY_MEDIA',
			workExperience: [
				{
					specialization: 'SPECIALTY_MEDIA',
					startedAt: '2023-01-01T00:00:00Z',
					finishedAt: '2024-01-01T00:00:00Z',
				},
			],
		});
	});
});
