import { describe, test, expect } from '@jest/globals';
import { API_BASE, CACHE_DURATION } from '../js/config.js';

describe('Config', () => {
    test('should have API_BASE defined', () => {
        expect(API_BASE).toBeDefined();
        expect(typeof API_BASE).toBe('string');
        expect(API_BASE).toContain('/v1');
    });

    test('should have CACHE_DURATION as 5 minutes', () => {
        expect(CACHE_DURATION).toBe(5 * 60 * 1000);
    });

    test('should export all required keys', async () => {
        const config = await import('../js/config.js');
        expect(config.TOKEN_KEY).toBe('auth_token');
        expect(config.USER_ID_KEY).toBe('user_id');
        expect(config.USER_NAME_KEY).toBe('username');
        expect(config.USER_AVATAR_URL).toBe('avatar_url');
        expect(config.TODOS_CACHE_KEY).toBe('todos_cache');
        expect(config.CACHE_TIMESTAMP_KEY).toBe('todos_cache_timestamp');
    });
});
