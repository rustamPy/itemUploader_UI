import { isDeadlineExceeded, toggleSection } from './utils.js';
import { deleteTodo, markComplete, extendDeadline } from './todos.js';

export const renderTodos = (data) => {
    const todosContainer = document.getElementById('todos');
    const progressSection = document.getElementById('progressSection');
    todosContainer.innerHTML = '';

    if (!data.todos || data.todos.length === 0) {
        todosContainer.innerHTML = '<p>No todos yet. Add one below!</p>';
        progressSection.style.display = 'none';
        return;
    }

    const completedTodos = data.todos.filter(t => t.completed);
    const deadlineFailedTodos = data.todos.filter(t => !t.completed && isDeadlineExceeded(t));
    const ongoingTodos = data.todos.filter(t => !t.completed && !isDeadlineExceeded(t));

    const totalTodos = data.todos.length;
    const completedCount = completedTodos.length;

    progressSection.style.display = 'block';
    const progressPercent = totalTodos > 0 ? (completedCount / totalTodos) * 100 : 0;
    document.getElementById('progressFill').style.width = progressPercent + '%';
    document.getElementById('progressText').textContent = `${completedCount}/${totalTodos}`;

    if (ongoingTodos.length > 0) {
        const ongoingSection = createSection('📋 Ongoing', ongoingTodos, false);
        todosContainer.appendChild(ongoingSection);
    }

    if (deadlineFailedTodos.length > 0) {
        const deadlineFailedSection = createSection('⏰ Deadline Failed', deadlineFailedTodos, true);
        todosContainer.appendChild(deadlineFailedSection);
    }

    if (completedTodos.length > 0) {
        const completedSection = createSection('✅ Done', completedTodos, false);
        todosContainer.appendChild(completedSection);
    }

    if (ongoingTodos.length === 0 && deadlineFailedTodos.length === 0 && completedTodos.length > 0) {
        const celebration = document.createElement('p');
        celebration.style.cssText = 'text-align: center; font-size: 18px; margin: 20px 0; font-weight: bold;';
        celebration.textContent = '🎉 All tasks completed!';
        todosContainer.insertBefore(celebration, todosContainer.firstChild);
    }
};

const createSection = (title, todos, isDeadlineFailed) => {
    const section = document.createElement('div');
    section.className = 'todo-section';

    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `${title} <span class="section-count">${todos.length}</span>`;

    const container = document.createElement('div');
    container.id = title.toLowerCase().replace(/\s+/g, '-') + '-container';

    header.onclick = () => toggleSection(container);

    todos.forEach(todo => {
        const todoEl = createTodoElement(todo, isDeadlineFailed);
        container.appendChild(todoEl);
    });

    section.appendChild(header);
    section.appendChild(container);

    return section;
};

const createTodoElement = (d, isDeadlineFailed = false) => {
    const colors = ['#fff9e6', '#e6f3ff', '#ffe6f0', '#f0e6ff', '#e6fff9', '#ffe6e6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const randomRotation = (Math.random() - 0.3); // -0.3 to 0.3 degrees

    const todoEl = document.createElement('div');
    todoEl.style.cssText = `
        border-radius: 1px;
        padding-left: 1px;
        border: ${isDeadlineFailed ? '2px solid #ff4444' : '0.3px solid black'};
        margin-bottom: 2px;
        display: flex;
        flex-direction: row;
        gap: 4px;
        align-items: center;
        background-color: ${isDeadlineFailed ? '#ffe6e6' : (d.completed ? '#b2ffb7' : randomColor)};
        transform: rotate(${d.completed || isDeadlineFailed ? '0' : randomRotation}deg);
        position: relative;
        min-height: 20px;
    `;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '×';
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
    deleteBtn.addEventListener('click', () => deleteTodo(d.id));

    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = `
        display: flex;
        flex-direction: column;
        flex: 1;
        gap: 2px;
    `;

    contentDiv.innerHTML = `
        <span style="font-size: 10px;">${d.title}</span>
        <span style="font-size: 9px; color: ${isDeadlineFailed ? '#cc0000' : '#666'};">${d.duration_hours ? d.duration_hours + ' h' : 'Unlimited'}${isDeadlineFailed ? ' | ⏰ Deadline Exceeded!' : ''}</span>
    `;

    const timerBtn = document.createElement('button');
    timerBtn.textContent = '⏱️';
    timerBtn.style.cssText = `
        white-space: nowrap;
        padding: 2px 4px;
        font-size: 12px;
        border-radius: 0;
        background-color: #e8e8f0;
        cursor: pointer;
    `;
    if (!d.duration_hours || d.completed) {
        timerBtn.style.display = 'none';
    }
    timerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showCountdownModal(d);
    });

    const completeBtn = document.createElement('button');
    completeBtn.textContent = d.completed ? '↩ Undo' : (isDeadlineFailed ? '⚠️ Extend' : '✔ Done');
    completeBtn.style.cssText = `
        white-space: nowrap;
        padding: 4px 6px;
        font-size: 10px;
        border-radius: 0;
        background-color: ${isDeadlineFailed ? '#ffcccc' : (d.completed ? '#e6f3ff' : '#fff9e6')};
    `;
    completeBtn.addEventListener('click', () => {
        if (isDeadlineFailed && !d.completed) {
            const hours = prompt('Extend deadline by how many hours?', '1');
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

const showCountdownModal = (todo) => {
    const existingModal = document.getElementById('countdown-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'countdown-modal';
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

    const content = document.createElement('div');
    content.style.cssText = `
        background-color: white;
        padding: 20px;
        border-radius: 5px;
        border: 2px solid #ccc;
        min-width: 300px;
        text-align: center;
        font-family: monospace;
    `;

    const title = document.createElement('h3');
    title.textContent = todo.title;
    title.style.cssText = 'margin: 0 0 15px 0; font-size: 16px;';
    content.appendChild(title);

    const countdownDisplay = document.createElement('div');
    countdownDisplay.id = 'countdown-display';
    countdownDisplay.style.cssText = `
        font-size: 32px;
        font-weight: bold;
        color: #333;
        margin: 20px 0;
        font-family: monospace;
    `;
    content.appendChild(countdownDisplay);

    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Close';
    closeBtn.style.cssText = `
        padding: 8px 16px;
        margin-top: 15px;
        cursor: pointer;
        border: 1px solid #ccc;
        border-radius: 4px;
        background-color: #f0f0f0;
    `;
    closeBtn.addEventListener('click', () => modal.remove());
    content.appendChild(closeBtn);

    modal.appendChild(content);
    document.body.appendChild(modal);

    const updateCountdown = () => {
        const createdTime = new Date(todo.created_at);
        const endTime = new Date(createdTime.getTime() + todo.duration_hours * 60 * 60 * 1000);
        const now = new Date();
        const remaining = endTime - now;

        if (remaining <= 0) {
            countdownDisplay.textContent = "⏰ Time's up!";
            countdownDisplay.style.color = '#ff0000';
        } else {
            const hours = Math.floor(remaining / (1000 * 60 * 60));
            const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
            countdownDisplay.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            countdownDisplay.style.color = remaining < 600000 ? '#ff6b6b' : '#333';
        }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 100);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
            clearInterval(interval);
        }
    });
};
