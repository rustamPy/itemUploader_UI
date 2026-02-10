const API_BASE = "https://itemuploader.onrender.com/v1";

const ENDPOINTS = [
    {
        name: "Health Check!",
        method: "GET",
        path: "/healthz"
    },
    {
        name: "Add",
        method: "POST",
        path: "/add",
        body: { job_id: 123 }
    }
];

const buttonsContainer = document.getElementById("buttons");
const resultEl = document.getElementById("result");

ENDPOINTS.forEach((ep) => {
    const btn = document.createElement("button");
    btn.textContent = ep.name;

    btn.addEventListener("click", () => callApi(ep, btn));

    buttonsContainer.appendChild(btn);
});

async function callApi(endpoint, button) {
    button.disabled = true;
    resultEl.textContent = "Loading...";

    try {
        const options = {
            method: endpoint.method,
            headers: { "Content-Type": "application/json" },
        };

        if (endpoint.body && endpoint.method !== "GET") {
            options.body = JSON.stringify(endpoint.body);
        }


        const response = await fetch(API_BASE + endpoint.path, options);
        const json = await response.json();
        const text = await response.text();


        resultEl.textContent = response.ok
            ? pretty(text)
            : `❌ ${response.status}\n${text}`;
    } catch (err) {

    } finally {
        button.disabled = false;
    }
}

function pretty(text) {
    try {
        return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
        return text;
    }
}
