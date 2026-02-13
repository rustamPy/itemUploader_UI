import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

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

// Import after setting up mocks
const { cacheManager } = await import('../js/cache.js');

describe('Cache Manager', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    test('should set and get cached data', () => {
        const testData = { todos: [{ id: 1, title: 'Test' }] };
        cacheManager.set(testData);

        const cached = cacheManager.get();
        expect(cached).toEqual(testData);
    });

    test('should return null for empty cache', () => {
        const cached = cacheManager.get();
        expect(cached).toBeNull();
    });

    test('should expire cache after duration', () => {
        const testData = { todos: [{ id: 1, title: 'Test' }] };
        cacheManager.set(testData);

        // Manually set timestamp to expired time
        const expiredTime = Date.now() - (6 * 60 * 1000); // 6 minutes ago
        localStorage.setItem('todos_cache_timestamp', expiredTime.toString());

        const cached = cacheManager.get();
        expect(cached).toBeNull();
    });

    test('should clear cache', () => {
        const testData = { todos: [{ id: 1, title: 'Test' }] };
        cacheManager.set(testData);

        cacheManager.clear();
        const cached = cacheManager.get();
        expect(cached).toBeNull();
    });

    test('should validate cache correctly', () => {
        const testData = { todos: [{ id: 1, title: 'Test' }] };
        cacheManager.set(testData);

        expect(cacheManager.isValid()).toBe(true);

        // Expire cache
        const expiredTime = Date.now() - (6 * 60 * 1000);
        localStorage.setItem('todos_cache_timestamp', expiredTime.toString());

        expect(cacheManager.isValid()).toBe(false);
    });
});
