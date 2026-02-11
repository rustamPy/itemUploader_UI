// "http://localhost:8000/v1"
// "https://itemuploader.onrender.com/v1";

const API_BASE = "https://itemuploader.onrender.com/v1";
const TOKEN_KEY = "auth_token";
const USER_ID_KEY = "user_id";

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
        console.log("Authentication successful!");
    }
};

const getAuthHeaders = () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
        return {};
    }
    return {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    };
};

const isAuthenticated = () => {
    return !!localStorage.getItem(TOKEN_KEY);
};

const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_ID_KEY);
    window.location.reload();
};


const todosContainer = document.getElementById("todos");

const getTodos = async () => {
    try {
        const suffix = "/todos";
        const response = await fetch(API_BASE + suffix);
        const data = await response.json();

        todosContainer.innerHTML = "";
        data.forEach(d => {
            const todoEl = document.createElement("div");
            todoEl.style.cssText = `
        padding: 5px;
        border-radius: 5px;
        border: 1px solid black;
        width: 300px;
        margin-bottom: 5px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        ${d.completed ? "background-color: #b2ffb7;" : ""}
    `;

            todoEl.innerHTML = `
        <div style="display: flex; flex-direction: column;">
            <span style="font-size: 11px;">${d.title}</span>
            <span style="font-size: 9px;">${d.desc}</span>
        </div>
        <button>
            ${d.completed ? "Completed ✅" : "Mark Complete"}
        </button>
    `;

            todoEl.querySelector("button").addEventListener("click", () => markComplete(d.id));
            todosContainer.appendChild(todoEl);
        });
    } catch (error) {
        console.error("Error fetching todos:", error);
    }
};

const markComplete = async (id) => {
    try {
        const response = await fetch(`${API_BASE}/todo/${id}/complete`, {
            method: "PATCH",
        });
        const data = await response.json();
        console.log(data);
        getTodos(); // refresh list
    } catch (error) {
        console.error("Error marking todo complete:", error);
    }
};

const formsContainer = document.getElementById("forms");

const getForm = async () => {
    const suffix = "/form/add";

}

todoForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("todoName").value;
    const desc = document.getElementById("todoDesc").value;

    try {
        const response = await fetch(`${API_BASE}/todo/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                desc,
                created_at: new Date().toISOString()
            })
        });
        const data = await response.json();
        console.log("Added:", data);

        todoForm.reset();
        getTodos();
    } catch (error) {
        console.error("Error adding todo:", error);
    }
});

getTodos();
checkAuth();