import { describe, expect, it } from 'vitest';
import { formatTextLength } from './formatTextLength';

describe('formatTextLength', () => {
	it('returns original text when it is shorter than max length', () => {
		// Arrange
		const input = { text: 'hello', maxLength: 10 };

		// Act
		const result = formatTextLength(input);

		// Assert
		expect(result).toBe('hello');
	});

	it('returns truncated text with ellipsis when length reaches the limit', () => {
		// Arrange
		const input = { text: 'abcdefghij', maxLength: 5 };

		// Act
		const result = formatTextLength(input);

		// Assert
		expect(result).toBe('abcde...');
	});
});
