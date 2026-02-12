const API_BASE = "http://127.0.0.1:8000/v1";
const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "user_id";
const USER_NAME_KEY = "username";
const USER_AVATAR_URL = "avatar_url";


console.error(API_BASE)

const loginWithGithub = () => {
    window.location.href = `${API_BASE}/auth/github`;
};

const loginWithGoogle = () => {
    window.location.href = `${API_BASE}/auth/google`;
};

const checkAuth = () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const userId = params.get("user_id");
    const userName = params.get("username");
    const userAvatar = params.get("avatar_url");
    console.log('\n\n\n\n\n\n\n')
    console.log(params)


    const error = params.get("error");

    if (error) {
        console.error("Auth error:", error);
        alert("Authentication failed: " + error);
        return;
    }

    if (token && userId) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_ID_KEY, userId);
        localStorage.setItem(USER_NAME_KEY, userName);
        localStorage.setItem(USER_AVATAR_URL, userAvatar);
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
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_AVATAR_URL);
    window.location.reload();
};

const updateAuthUI = () => {
    const loginBtnGithub = document.getElementById("loginBtnGi");
    const loginBtnGoogle = document.getElementById("loginBtnGo");
    const logoutBtn = document.getElementById("logoutBtn");
    const userInfo = document.getElementById("userInfo");
    const userAvatar = document.getElementById("userAvatar");

    if (isAuthenticated()) {
        if (loginBtnGithub) loginBtnGithub.style.display = "none";
        if (loginBtnGoogle) loginBtnGoogle.style.display = "none";
        if (logoutBtn) logoutBtn.style.display = "inline-block";
        const userId = localStorage.getItem(USER_ID_KEY);
        const userName = localStorage.getItem(USER_NAME_KEY);
        const userAvatarURL = localStorage.getItem(USER_AVATAR_URL);

        if (userInfo) {
            userInfo.textContent = `Logged in (User ID: ${userId.slice(0, 8)}****; Username: ${userName})`;
            userInfo.style.cursor = "pointer";
            userInfo.addEventListener("mouseover", () => {
                userInfo.textContent = `Logged in (User ID: ${userId}; Username: ${userName})`;
            });
            userInfo.addEventListener("mouseout", () => {
                userInfo.textContent = `Logged in (User ID: ${userId.slice(0, 8)}****; Username: ${userName})`;
            });
        }

        if (userAvatarURL) userAvatar.src = userAvatarURL;
    } else {
        if (loginBtnGithub) loginBtnGithub.style.display = "inline-block";
        if (loginBtnGoogle) loginBtnGoogle.style.display = "inline-block";
        if (logoutBtn) logoutBtn.style.display = "none";
        if (userInfo) userInfo.textContent = "";
    }
};

checkAuth();

const todosContainer = document.getElementById("todos");

const getTodos = async () => {
    if (!isAuthenticated()) {
        todosContainer.innerHTML = "<p>Please login to view your todos</p>";
        return;
    }

    try {
        console.log("Fetching todos...");
        const headers = getAuthHeaders();
        console.log("Request headers:", headers);

        const response = await fetch(`${API_BASE}/todo/all`, {
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
                padding: 5px;
                border-radius: 5px;
                border: 1px solid #ccc;
                width: 300px;
                margin-bottom: 10px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                ${d.completed ? "background-color: #b2ffb7;" : "background-color: #fff;"}
            `;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.style.cssText = `
                align-self: flex-end;
                padding: 5px 10px;
                background-color: #ff6b6b;
                color: white;
                border: none;
                border-radius: 3px;
                cursor: pointer;
            `;
            deleteBtn.addEventListener("click", () => deleteItem(d.id));

            const contentDiv = document.createElement("div");
            contentDiv.style.cssText = `
                display: flex;
                flex-direction: column;
            `;
            contentDiv.innerHTML = `
                <span style="font-size: 14px; font-weight: bold;">${d.title}</span>
                <span style="font-size: 12px; color: #666;">${d.desc}</span>
            `;

            const completeBtn = document.createElement("button");
            completeBtn.textContent = d.completed ? "✅ Done" : "Mark Complete";
            completeBtn.addEventListener("click", () => markComplete(d.id));

            todoEl.appendChild(deleteBtn);
            todoEl.appendChild(contentDiv);
            todoEl.appendChild(completeBtn);

            todosContainer.appendChild(todoEl);
        });
    } catch (error) {
        console.error("Error fetching todos:", error);
        todosContainer.innerHTML = `<p style="color: red;">Error loading todos: ${error.message}</p>`;
    }
};

const markComplete = async (id) => {
    try {
        const currentTodos = await fetch(`${API_BASE}/todo/all`, {
            method: "GET",
            headers: getAuthHeaders()
        });

        if (!currentTodos.ok) {
            throw new Error('Failed to fetch current todo status');
        }

        const todosData = await currentTodos.json();
        const currentTodo = todosData.todos.find(t => t.id === id);

        if (!currentTodo) {
            throw new Error('Todo not found');
        }

        const response = await fetch(`${API_BASE}/todo/update/${id}`, {
            method: "PATCH",
            headers: getAuthHeaders(),
            body: JSON.stringify({
                completed: !currentTodo.completed
            })
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
        getTodos();
    } catch (error) {
        console.error("Error marking todo complete:", error);
        alert("Failed to update todo");
    }
};

const deleteItem = async (id) => {
    try {
        const response = await fetch(`${API_BASE}/todo/delete/${id}`, {
            method: "DELETE",
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error(`Deletion error!`)
        }
        getTodos();
    } catch (error) {
        console.error("Error marking todo complete:", error);
        alert("Failed to update todo");
    }
};

const todoForm = document.getElementById("todoForm");

if (todoForm) {
    todoForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (!isAuthenticated()) {
            alert("Please login first");
            return;
        }

        const title = document.getElementById("todoTitle").value;
        const desc = document.getElementById("todoDesc").value;

        try {
            console.log("Adding todo:", { title, desc });
            const response = await fetch(`${API_BASE}/todo/add`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title,
                    desc,
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

updateAuthUI();
if (isAuthenticated()) {
    getTodos();
} else {
    if (todosContainer) {
        todosContainer.innerHTML = "<p>Please login to view your todos</p>";
    }
}

console.log("Script loaded. Auth status:", isAuthenticated());