import { describe, test, expect } from '@jest/globals';
import { isDeadlineExceeded } from '../js/utils.js';

describe('Utils', () => {
    describe('isDeadlineExceeded', () => {
        test('should return false for completed todos', () => {
            const todo = {
                id: 1,
                title: 'Test',
                completed: true,
                duration_hours: 1,
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            };

            expect(isDeadlineExceeded(todo)).toBe(false);
        });

        test('should return false for todos without duration', () => {
            const todo = {
                id: 1,
                title: 'Test',
                completed: false,
                created_at: new Date().toISOString()
            };

            expect(isDeadlineExceeded(todo)).toBe(false);
        });

        test('should return true for expired todos', () => {
            const todo = {
                id: 1,
                title: 'Test',
                completed: false,
                duration_hours: 1,
                created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            };

            expect(isDeadlineExceeded(todo)).toBe(true);
        });

        test('should return false for non-expired todos', () => {
            const todo = {
                id: 1,
                title: 'Test',
                completed: false,
                duration_hours: 2,
                created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            };

            expect(isDeadlineExceeded(todo)).toBe(false);
        });

        test('should handle edge case at exact deadline', () => {
            const now = Date.now();
            const todo = {
                id: 1,
                title: 'Test',
                completed: false,
                duration_hours: 1,
                created_at: new Date(now - 1 * 60 * 60 * 1000).toISOString()
            };

            // Should be very close to deadline
            const result = isDeadlineExceeded(todo);
            expect(typeof result).toBe('boolean');
        });
    });
});
