import { loginWithGithub, loginWithGoogle, checkAuth, updateAuthUI, logout, isAuthenticated } from './auth.js';
import { loadTodos, addTodo } from './todos.js';

// Expose functions to window for HTML onclick handlers
window.loginWithGithub = loginWithGithub;
window.loginWithGoogle = loginWithGoogle;
window.logout = logout;

// Initialize form handler
const todoForm = document.getElementById('todoForm');
if (todoForm) {
    todoForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!isAuthenticated()) {
            alert('Please login first');
            return;
        }

        const title = document.getElementById('todoTitle').value;
        const desc = document.getElementById('todoDesc').value;
        const durationHours = parseInt(document.getElementById('todoDuration').value);

        await addTodo(title, desc, durationHours);
        todoForm.reset();
    });
}

// Initialize app
const init = () => {
    const authChanged = checkAuth();
    updateAuthUI();
    
    if (isAuthenticated()) {
        loadTodos();
    } else {
        const todosContainer = document.getElementById('todos');
        if (todosContainer) {
            todosContainer.innerHTML = '<p>Please login to view your todos</p>';
        }
    }
    
    // If auth just changed, reload todos
    if (authChanged) {
        loadTodos();
    }
};

// Run on page load
document.addEventListener('DOMContentLoaded', init);

console.log('App initialized. Auth status:', isAuthenticated());
