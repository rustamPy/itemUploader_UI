// "http://localhost:8000/v1"
// "https://itemuploader.onrender.com/v1";
const API_BASE = "https://itemuploader.onrender.com/v1";


const todosContainer = document.getElementById("todos");

const getTodos = async () => {
    try {
        const suffix = "/todos";
        const response = await fetch(API_BASE + suffix);
        const data = await response.json();

        todosContainer.innerHTML = "";
        data.forEach(d => {
            const todoEl = document.createElement("div");
            todoEl.style = "padding: 5px; border-radius: 5px; border: 1px solid black; width: 200px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center;";

            const nameEl = document.createElement("span");
            nameEl.textContent = d.name;

            const btn = document.createElement("button");
            if (d.completed) {
                btn.textContent = "Completed ✅";
                todoEl.style.backgroundColor = "#b2ffb7"
            } else {
                btn.textContent = "Mark Complete";
            }

            btn.onclick = () => markComplete(d.id);

            todoEl.appendChild(nameEl);
            todoEl.appendChild(btn);

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