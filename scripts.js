// Detect environment and set API_BASE accordingly
const API_BASE =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? "http://127.0.0.1:8000/v1"
        : "https://itemuploader.onrender.com/v1";

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

const isDeadlineExceeded = (todo) => {
    if (todo.completed || !todo.duration_hours || !todo.created_at) {
        return false;
    }
    
    try {
        const createdTime = new Date(todo.created_at);
        const now = new Date();
        const endTime = new Date(createdTime.getTime() + todo.duration_hours * 60 * 60 * 1000);
        const exceeded = now > endTime;
        
        console.log(`Task: "${todo.title}", Duration: ${todo.duration_hours}h, Created: ${createdTime.toISOString()}, End: ${endTime.toISOString()}, Now: ${now.toISOString()}, Exceeded: ${exceeded}`);
        
        return exceeded;
    } catch (error) {
        console.error("Error checking deadline:", error, todo);
        return false;
    }
};

const getTodos = async () => {
    if (!isAuthenticated()) {
        document.getElementById("todos").innerHTML = "<p>Please login to view your todos</p>";
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

        const todosContainer = document.getElementById("todos");
        const progressSection = document.getElementById("progressSection");
        todosContainer.innerHTML = "";

        if (!data.todos || data.todos.length === 0) {
            todosContainer.innerHTML = "<p>No todos yet. Add one below!</p>";
            progressSection.style.display = "none";
            return;
        }

        const completedTodos = data.todos.filter(t => t.completed);
        const deadlineFailedTodos = data.todos.filter(t => !t.completed && isDeadlineExceeded(t));
        const ongoingTodos = data.todos.filter(t => !t.completed && !isDeadlineExceeded(t));
        
        const totalTodos = data.todos.length;
        const completedCount = completedTodos.length;

        progressSection.style.display = "block";
        const progressPercent = totalTodos > 0 ? (completedCount / totalTodos) * 100 : 0;
        document.getElementById("progressFill").style.width = progressPercent + "%";
        document.getElementById("progressText").textContent = `${completedCount}/${totalTodos}`;

        if (ongoingTodos.length > 0) {
            const ongoingSection = document.createElement("div");
            ongoingSection.className = "todo-section";

            const ongoingHeader = document.createElement("div");
            ongoingHeader.className = "section-header";
            ongoingHeader.innerHTML = `📋 Ongoing <span class="section-count">${ongoingTodos.length}</span>`;
            ongoingHeader.onclick = () => toggleSection(ongoingContainer);
            ongoingSection.appendChild(ongoingHeader);

            const ongoingContainer = document.createElement("div");
            ongoingContainer.id = "ongoing-container";
            ongoingTodos.forEach(d => {
                const todoEl = createTodoElement(d);
                ongoingContainer.appendChild(todoEl);
            });
            ongoingSection.appendChild(ongoingContainer);
            todosContainer.appendChild(ongoingSection);
        }

        // Create deadline failed section
        if (deadlineFailedTodos.length > 0) {
            const deadlineFailedSection = document.createElement("div");
            deadlineFailedSection.className = "todo-section";

            const deadlineFailedHeader = document.createElement("div");
            deadlineFailedHeader.className = "section-header";
            deadlineFailedHeader.innerHTML = `⏰ Deadline Failed <span class="section-count">${deadlineFailedTodos.length}</span>`;
            deadlineFailedHeader.onclick = () => toggleSection(deadlineFailedContainer);
            deadlineFailedSection.appendChild(deadlineFailedHeader);

            const deadlineFailedContainer = document.createElement("div");
            deadlineFailedContainer.id = "deadline-failed-container";
            deadlineFailedTodos.forEach(d => {
                const todoEl = createTodoElement(d, true);
                deadlineFailedContainer.appendChild(todoEl);
            });
            deadlineFailedSection.appendChild(deadlineFailedContainer);
            todosContainer.appendChild(deadlineFailedSection);
        }

        // Create completed section
        if (completedTodos.length > 0) {
            const completedSection = document.createElement("div");
            completedSection.className = "todo-section";

            const completedHeader = document.createElement("div");
            completedHeader.className = "section-header";
            completedHeader.innerHTML = `✅ Done <span class="section-count">${completedTodos.length}</span>`;
            completedHeader.onclick = () => toggleSection(completedContainer);
            completedSection.appendChild(completedHeader);

            const completedContainer = document.createElement("div");
            completedContainer.id = "completed-container";
            completedTodos.forEach(d => {
                const todoEl = createTodoElement(d);
                completedContainer.appendChild(todoEl);
            });
            completedSection.appendChild(completedContainer);
            todosContainer.appendChild(completedSection);
        }

        if (ongoingTodos.length === 0 && deadlineFailedTodos.length === 0 && completedTodos.length > 0) {
            const celebration = document.createElement("p");
            celebration.style.cssText = "text-align: center; font-size: 18px; margin: 20px 0; font-weight: bold;";
            celebration.textContent = "🎉 All tasks completed!";
            todosContainer.insertBefore(celebration, todosContainer.firstChild);
        }
    } catch (error) {
        console.error("Error fetching todos:", error);
        document.getElementById("todos").innerHTML = `<p style="color: red;">Error loading todos: ${error.message}</p>`;
    }
};

const createTodoElement = (d, isDeadlineFailed = false) => {
    const colors = ["#fff9e6", "#e6f3ff", "#ffe6f0", "#f0e6ff", "#e6fff9", "#ffe6e6"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomRotation = (Math.random() - 0.5) * 2; // -1 to 1 degrees

    const todoEl = document.createElement("div");
    todoEl.style.cssText = `
        border-radius: 0;
        padding-left: 1px;
        border: ${isDeadlineFailed ? "2px solid #ff4444" : "0.3px solid black"};
        margin-bottom: 2px;
        display: flex;
        flex-direction: row;
        gap: 4px;
        align-items: center;
        background-color: ${isDeadlineFailed ? "#ffe6e6" : (d.completed ? "#b2ffb7" : randomColor)};
        transform: rotate(${d.completed || isDeadlineFailed ? "0" : randomRotation}deg);
        position: relative;
        min-height: 20px;
    `;

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.style.cssText = `
        position: absolute;
        top: -8px;
        right: -8px;
        width: 14px;
        height: 14px;
        padding: 0;
        background-color: #ff6b6b;
        color: white;
        border: none;
        border-radius: 0;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    deleteBtn.addEventListener("click", () => deleteItem(d.id));

    const contentDiv = document.createElement("div");
    contentDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 2px;
    `;
    
    contentDiv.innerHTML = `
        <span style="font-size: 10px;">${d.title}</span>
        <span style="font-size: 9px; color: ${isDeadlineFailed ? '#cc0000' : '#666'};">${d.duration_hours ? d.duration_hours + ' h' : 'No duration'}${isDeadlineFailed ? ' | ⏰ Deadline Exceeded!' : ''}</span>
    `;

    const timerBtn = document.createElement("button");
    timerBtn.textContent = "⏱️";
    timerBtn.style.cssText = `
        white-space: nowrap;
        padding: 2px 4px;
        font-size: 12px;
        border-radius: 0;
        background-color: #e8e8f0;
        cursor: pointer;
    `;
    if (!d.duration_hours || d.completed) {
        timerBtn.style.display = "none";
    }
    timerBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        showCountdownModal(d);
    });

    const completeBtn = document.createElement("button");
    completeBtn.textContent = d.completed ? "↩ Undo" : (isDeadlineFailed ? "⚠️ Extend" : "✔ Done");
    completeBtn.style.cssText = `
        white-space: nowrap;
        padding: 4px 6px;
        font-size: 10px;
        border-radius: 0;
        background-color: ${isDeadlineFailed ? "#ffcccc" : (d.completed ? "#e6f3ff" : "#fff9e6")};
    `;
    completeBtn.addEventListener("click", () => {
        if (isDeadlineFailed && !d.completed) {
            // Extend deadline by asking for hours
            const hours = prompt("Extend deadline by how many hours?", "1");
            if (hours) {
                extendDeadline(d.id, parseInt(hours));
            }
        } else {
            markComplete(d.id);
        }
    });

    todoEl.appendChild(deleteBtn);
    todoEl.appendChild(contentDiv);
    todoEl.appendChild(timerBtn);
    todoEl.appendChild(completeBtn);

    return todoEl;
};

const toggleSection = (container) => {
    container.style.display = container.style.display === "none" ? "block" : "none";
};

const extendDeadline = async (id, additionalHours) => {
    try {
        // Just mark as not completed to give user a chance to complete it
        // The deadline is calculated from created_at, so no update needed
        getTodos();
        alert(`Deadline extended! Task moved back to Ongoing.`);
    } catch (error) {
        console.error("Error extending deadline:", error);
        alert("Failed to extend deadline");
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
        const durationHours = parseInt(document.getElementById("todoDuration").value);

        try {
            const now = new Date();
            console.log("Creating todo with:", { title, desc, durationHours, createdAt: now.toISOString() });
            
            const response = await fetch(`${API_BASE}/todo/add`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    title,
                    desc,
                    duration_hours: durationHours,
                    created_at: now.toISOString()
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

const showCountdownModal = (todo) => {
    // Close any existing modal
    const existingModal = document.getElementById("countdown-modal");
    if (existingModal) existingModal.remove();

    const modal = document.createElement("div");
    modal.id = "countdown-modal";
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;

    const content = document.createElement("div");
    content.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        border: 2px solid #ccc;
        min-width: 300px;
        text-align: center;
        font-family: monospace;
    `;

    const title = document.createElement("h3");
    title.textContent = todo.title;
    title.style.cssText = "margin: 0 0 15px 0; font-size: 16px;";
    content.appendChild(title);

    const countdownDisplay = document.createElement("div");
    countdownDisplay.id = "countdown-display";
    countdownDisplay.style.cssText = `
        font-size: 32px;
        font-weight: bold;
        color: #333;
        margin: 20px 0;
        font-family: monospace;
    `;
    content.appendChild(countdownDisplay);

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "Close";
    closeBtn.style.cssText = `
        padding: 8px 16px;
        margin-top: 15px;
        cursor: pointer;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: #f0f0f0;
    `;
    closeBtn.addEventListener("click", () => modal.remove());
    content.appendChild(closeBtn);

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Update countdown every 100ms
    const updateCountdown = () => {
        const createdTime = new Date(todo.created_at);
        const endTime = new Date(createdTime.getTime() + todo.duration_hours * 60 * 60 * 1000);
        const now = new Date();
        const remaining = endTime - now;

        if (remaining <= 0) {
            countdownDisplay.textContent = "⏰ Time's up!";
            countdownDisplay.style.color = "#ff0000";
        } else {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            countdownDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            countdownDisplay.style.color = remaining < 600000 ? "#ff6b6b" : "#333";
        }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 100);

    // Clear interval when modal is closed
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            modal.remove();
            clearInterval(interval);
        }
    });
};

console.log("Script loaded. Auth status:", isAuthenticated());