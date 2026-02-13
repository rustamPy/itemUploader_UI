// API Configuration
export const API_BASE =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:8000/v1'
        : 'https://itemuploader.onrender.com/v1';

// LocalStorage Keys
export const TOKEN_KEY = 'auth_token';
export const USER_ID_KEY = 'user_id';
export const USER_NAME_KEY = 'username';
export const USER_AVATAR_URL = 'avatar_url';
export const TODOS_CACHE_KEY = 'todos_cache';
export const CACHE_TIMESTAMP_KEY = 'todos_cache_timestamp';

// Cache duration in milliseconds (5 minutes)
export const CACHE_DURATION = 5 * 60 * 1000;
