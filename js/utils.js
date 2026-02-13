export const isDeadlineExceeded = (todo) => {
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
        console.error('Error checking deadline:', error, todo);
        return false;
    }
};

export const toggleSection = (container) => {
    container.style.display = container.style.display === 'none' ? 'block' : 'none';
};
