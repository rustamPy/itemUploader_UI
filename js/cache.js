import { TODOS_CACHE_KEY, CACHE_TIMESTAMP_KEY, CACHE_DURATION } from './config.js';

export const cacheManager = {
    set(data) {
        try {
            localStorage.setItem(TODOS_CACHE_KEY, JSON.stringify(data));
            localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
            console.log('Cache updated');
        } catch (error) {
            console.error('Failed to cache data:', error);
        }
    },

    get() {
        try {
            const cachedData = localStorage.getItem(TODOS_CACHE_KEY);
            const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

            if (!cachedData || !timestamp) {
                return null;
            }

            const age = Date.now() - parseInt(timestamp);
            if (age > CACHE_DURATION) {
                console.log('Cache expired');
                this.clear();
                return null;
            }

            console.log('Using cached data');
            return JSON.parse(cachedData);
        } catch (error) {
            console.error('Failed to read cache:', error);
            return null;
        }
    },

    clear() {
        localStorage.removeItem(TODOS_CACHE_KEY);
        localStorage.removeItem(CACHE_TIMESTAMP_KEY);
        console.log('Cache cleared');
    },

    isValid() {
        const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
        if (!timestamp) {
            return false;
        }
        const age = Date.now() - parseInt(timestamp);
        return age <= CACHE_DURATION;
    }
};
