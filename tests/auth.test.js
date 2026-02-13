import { describe, test, expect, beforeEach } from '@jest/globals';

// Mock localStorage
const localStorageMock = (() => {
    let store = {};
    return {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = value.toString(); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { store = {}; }
    };
})();

global.localStorage = localStorageMock;

// Import config first to get keys
const { TOKEN_KEY, USER_ID_KEY, USER_NAME_KEY, USER_AVATAR_URL } = await import('../js/config.js');
const { getAuthHeaders, isAuthenticated } = await import('../js/auth.js');

describe('Auth', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('isAuthenticated', () => {
        test('should return false when no token', () => {
            expect(isAuthenticated()).toBe(false);
        });

        test('should return true when token exists', () => {
            localStorage.setItem(TOKEN_KEY, 'test-token');
            expect(isAuthenticated()).toBe(true);
        });
    });

    describe('getAuthHeaders', () => {
        test('should return headers without auth when no token', () => {
            const headers = getAuthHeaders();
            expect(headers).toEqual({
                "Content-Type": "application/json"
            });
        });

        test('should return headers with auth when token exists', () => {
            localStorage.setItem(TOKEN_KEY, 'test-token-123');
            const headers = getAuthHeaders();
            expect(headers).toEqual({
                "Authorization": "Bearer test-token-123",
                "Content-Type": "application/json"
            });
        });
    });
});
