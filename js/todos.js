import { api } from './api.js';
import { isAuthenticated } from './auth.js';
import { renderTodos } from './ui.js';

export const loadTodos = async () => {
    if (!isAuthenticated()) {
        document.getElementById('todos').innerHTML = '<p>Please login to view your todos</p>';
        return;
    }

    try {
        const data = await api.getTodos();
        renderTodos(data);
    } catch (error) {
        console.error('Error fetching todos:', error);
        document.getElementById('todos').innerHTML = `<p style="color: red;">Error loading todos: ${error.message}</p>`;
    }
};

export const addTodo = async (title, desc, durationHours) => {
    try {
        await api.addTodo(title, desc, durationHours);
        await loadTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
        alert('Failed to add todo: ' + error.message);
    }
};

export const extendDeadline = async (id, durationHours) => {
    try {
        await api.updateTodo(id, {
            duration_hours: durationHours,
            created_at: new Date().toISOString()
        });
        await loadTodos();
    } catch (error) {
        console.error('Error extending deadline:', error);
        alert('Failed to extend deadline');
    }
};

export const markComplete = async (id) => {
    try {
        // Fetch current state
        const data = await api.getTodos(false);
        const currentTodo = data.todos.find(t => t.id === id);

        if (!currentTodo) {
            throw new Error('Todo not found');
        }

        await api.updateTodo(id, {
            completed: !currentTodo.completed
        });
        await loadTodos();
    } catch (error) {
        console.error('Error marking todo complete:', error);
        alert('Failed to update todo');
    }
};

export const deleteTodo = async (id) => {
    try {
        await api.deleteTodo(id);
        await loadTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
        alert('Failed to delete todo');
    }
};
