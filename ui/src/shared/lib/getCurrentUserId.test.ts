import { beforeEach, describe, expect, it } from 'vitest';
import { getCurrentUserId } from './getCurrentUserId';

const buildToken = (payload: Record<string, unknown>) => {
	const encodedPayload = btoa(JSON.stringify(payload))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=+$/g, '');

	return `header.${encodedPayload}.signature`;
};

describe('getCurrentUserId', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('returns fallback id when there is no token', () => {
		// Arrange
		localStorage.clear();

		// Act
		const result = getCurrentUserId();

		// Assert
		expect(result).toBe('current-user-id');
	});

	it('returns user id from access token payload', () => {
		// Arrange
		localStorage.setItem('accessToken', buildToken({ sub: 'user-123' }));

		// Act
		const result = getCurrentUserId();

		// Assert
		expect(result).toBe('user-123');
	});

	it('returns fallback id for malformed token', () => {
		// Arrange
		localStorage.setItem('accessToken', 'broken.token');

		// Act
		const result = getCurrentUserId();

		// Assert
		expect(result).toBe('current-user-id');
	});

	it('returns fallback id when payload does not contain string sub', () => {
		// Arrange
		localStorage.setItem('accessToken', buildToken({ sub: 42 }));

		// Act
		const result = getCurrentUserId();

		// Assert
		expect(result).toBe('current-user-id');
	});
});
