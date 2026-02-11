// Configuration
const API_BASE = "https://itemuploader.onrender.com/v1";
const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "user_id";

// Authentication functions
const loginWithGithub = () => {
    window.location.href = `${API_BASE}/auth/github`;
};

const checkAuth = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("user_id");
    const error = params.get("error");

    if (error) {
        console.error("Auth error:", error);
        alert("Authentication failed: " + error);
        return;
    }

    if (token && userId) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_ID_KEY, userId);
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
        console.log("Authentication successful! Token saved.");
        // Update UI
        updateAuthUI();
    }
};

const getAuthHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        console.warn("No auth token found");
        return {
            "Content-Type": "application/json"
        };
    }
    console.log("Using token:", token.substring(0, 20) + "...");
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
};

const isAuthenticated = () => {
    const hasToken = !!localStorage.getItem(TOKEN_KEY);
    console.log("Is authenticated:", hasToken);
    return hasToken;
};

const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    window.location.reload();
};

const updateAuthUI = () => {
    const loginBtn = document.getElementById("loginBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const userInfo = document.getElementById("userInfo");

    if (isAuthenticated()) {
        if (loginBtn) loginBtn.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        const userId = localStorage.getItem(USER_ID_KEY);
        if (userInfo) userInfo.textContent = `Logged in (User ID: ${userId})`;
    } else {
        if (loginBtn) loginBtn.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (userInfo) userInfo.textContent = "";
    }
};

// Initialize auth on page load
checkAuth();

// Todo functions
const todosContainer = document.getElementById("todos");

const getTodos = async () => {
    if (!isAuthenticated()) {
        todosContainer.innerHTML = "<p>Please login with GitHub to view your todos</p>";
        return;
    }

    try {
        console.log("Fetching todos...");
        const headers = getAuthHeaders();
        console.log("Request headers:", headers);

        const response = await fetch(`${API_BASE}/todos`, {
            method: "GET",
            headers: headers
        });

        console.log("Response status:", response.status);

        if (response.status === 401) {
            alert("Session expired. Please login again.");
            logout();
            return;
        }

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Todos data:", data);

        todosContainer.innerHTML = "";

        if (!data.todos || data.todos.length === 0) {
            todosContainer.innerHTML = "<p>No todos yet. Add one below!</p>";
            return;
        }

        data.todos.forEach(d => {
            const todoEl = document.createElement("div");
            todoEl.style.cssText = `
                padding: 10px;
                border-radius: 5px;
                border: 1px solid #ccc;
                width: 300px;
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                ${d.completed ? "background-color: #b2ffb7;" : "background-color: #fff;"}
            `;
            todoEl.innerHTML = `
                <div style="display: flex; flex-direction: column;">
                    <span style="font-size: 14px; font-weight: bold;">${d.name}</span>
                    <span style="font-size: 12px; color: #666;">${d.desc}</span>
                </div>
                <button style="padding: 5px 10px; cursor: pointer;">
                    ${d.completed ? "✅ Done" : "Mark Complete"}
                </button>
            `;
            todoEl.querySelector("button").addEventListener("click", () => markComplete(d.id));
            todosContainer.appendChild(todoEl);
        });
    } catch (error) {
        console.error("Error fetching todos:", error);
        todosContainer.innerHTML = `<p style="color: red;">Error loading todos: ${error.message}</p>`;
    }
};

const markComplete = async (id) => {
    if (!isAuthenticated()) {
        alert("Please login first");
        return;
    }

    try {
        console.log(`Marking todo ${id} as complete...`);
        const response = await fetch(`${API_BASE}/todo/${id}/complete`, {
            method: "PATCH",
            headers: getAuthHeaders()
        });

        if (response.status === 401) {
            alert("Session expired. Please login again.");
            logout();
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Toggle result:", data);
        getTodos(); // Refresh list
    } catch (error) {
        console.error("Error marking todo complete:", error);
        alert("Failed to update todo");
    }
};

// Form handling
const todoForm = document.getElementById("todoForm");

if (todoForm) {
    todoForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!isAuthenticated()) {
            alert("Please login with GitHub first");
            return;
        }

        const name = document.getElementById("todoName").value;
        const desc = document.getElementById("todoDesc").value;

        try {
            console.log("Adding todo:", { name, desc });
            const response = await fetch(`${API_BASE}/todo/add`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    name,
                    desc,
                    completed: false,
                    created_at: new Date().toISOString()
                })
            });

            if (response.status === 401) {
                alert("Session expired. Please login again.");
                logout();
                return;
            }

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Error response:", errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Added:", data);
            todoForm.reset();
            getTodos();
        } catch (error) {
            console.error("Error adding todo:", error);
            alert("Failed to add todo: " + error.message);
        }
    });
}

// Initial load
updateAuthUI();
if (isAuthenticated()) {
    getTodos();
} else {
    if (todosContainer) {
        todosContainer.innerHTML = "<p>Please login with GitHub to view your todos</p>";
    }
}

console.log("Script loaded. Auth status:", isAuthenticated());