import { API_BASE } from './config.js';
import { getAuthHeaders, logout } from './auth.js';
import { cacheManager } from './cache.js';

export const api = {
    async getTodos(useCache = true) {
        // Try cache first if enabled
        if (useCache) {
            const cached = cacheManager.get();
            if (cached) {
                return cached;
            }
        }

        console.log('Fetching todos from API...');
        const headers = getAuthHeaders();
        console.log('Request headers:', headers);

        const response = await fetch(`${API_BASE}/todo/all`, {
            method: 'GET',
            headers: headers
        });

        console.log('Response status:', response.status);

        if (response.status === 401) {
            alert('Session expired. Please login again.');
            logout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Todos data:', data);

        // Cache the response
        cacheManager.set(data);

        return data;
    },

    async addTodo(title, desc, durationHours) {
        const now = new Date();
        console.log('Creating todo with:', { title, desc, durationHours, createdAt: now.toISOString() });

        const response = await fetch(`${API_BASE}/todo/add`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                title,
                desc,
                duration_hours: durationHours,
                created_at: now.toISOString()
            })
        });

        if (response.status === 401) {
            alert('Session expired. Please login again.');
            logout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Added:', data);

        // Invalidate cache
        cacheManager.clear();

        return data;
    },

    async updateTodo(id, updates) {
        const response = await fetch(`${API_BASE}/todo/update/${id}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: JSON.stringify(updates)
        });

        if (response.status === 401) {
            alert('Session expired. Please login again.');
            logout();
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Invalidate cache
        cacheManager.clear();

        return data;
    },

    async deleteTodo(id) {
        const response = await fetch(`${API_BASE}/todo/delete/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Deletion error!');
        }

        // Invalidate cache
        cacheManager.clear();

        return true;
    }
};
