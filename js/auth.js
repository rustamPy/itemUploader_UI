import { API_BASE, TOKEN_KEY, USER_ID_KEY, USER_NAME_KEY, USER_AVATAR_URL } from './config.js';
import { cacheManager } from './cache.js';

export const loginWithGithub = () => {
    window.location.href = `${API_BASE}/auth/github`;
};

export const loginWithGoogle = () => {
    window.location.href = `${API_BASE}/auth/google`;
};

export const checkAuth = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userId = params.get('user_id');
    const userName = params.get('username');
    const userAvatar = params.get('avatar_url');

    const error = params.get('error');

    if (error) {
        console.error('Auth error:', error);
        alert('Authentication failed: ' + error);
        return;
    }

    if (token && userId) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_ID_KEY, userId);
        localStorage.setItem(USER_NAME_KEY, userName);
        localStorage.setItem(USER_AVATAR_URL, userAvatar);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log('Authentication successful! Token saved.');
        // Clear cache on new login
        cacheManager.clear();
        return true;
    }
    return false;
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        console.warn('No auth token found');
        return {
            'Content-Type': 'application/json'
        };
    }
    console.log('Using token:', token.substring(0, 20) + '...');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

export const isAuthenticated = () => {
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    console.log('Is authenticated:', hasToken);
    return hasToken;
};

export const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_AVATAR_URL);
    cacheManager.clear();
    window.location.reload();
};

export const updateAuthUI = () => {
    const loginBtnGithub = document.getElementById('loginBtnGi');
    const loginBtnGoogle = document.getElementById('loginBtnGo');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');
    const userAvatar = document.getElementById('userAvatar');

    if (isAuthenticated()) {
        if (loginBtnGithub) {
            loginBtnGithub.style.display = 'none';
        }
        if (loginBtnGoogle) {
            loginBtnGoogle.style.display = 'none';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'inline-block';
        }
        const userId = localStorage.getItem(USER_ID_KEY);
        const userName = localStorage.getItem(USER_NAME_KEY);
        const userAvatarURL = localStorage.getItem(USER_AVATAR_URL);

        if (userInfo) {
            userInfo.textContent = `Logged in (User ID: ${userId.slice(0, 8)}****; Username: ${userName})`;
            userInfo.style.cursor = 'pointer';
            userInfo.addEventListener('mouseover', () => {
                userInfo.textContent = `Logged in (User ID: ${userId}; Username: ${userName})`;
            });
            userInfo.addEventListener('mouseout', () => {
                userInfo.textContent = `Logged in (User ID: ${userId.slice(0, 8)}****; Username: ${userName})`;
            });
        }

        if (userAvatarURL) {
            userAvatar.src = userAvatarURL;
        }
    } else {
        if (loginBtnGithub) {
            loginBtnGithub.style.display = 'inline-block';
        }
        if (loginBtnGoogle) {
            loginBtnGoogle.style.display = 'inline-block';
        }
        if (logoutBtn) {
            logoutBtn.style.display = 'none';
        }
        if (userInfo) {
            userInfo.textContent = '';
        }
    }
};
