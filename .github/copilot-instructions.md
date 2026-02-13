# itemUploader_UI - Copilot Instructions

## Project Overview

A vanilla JavaScript to-do list application with OAuth authentication (GitHub/Google) and task deadline tracking. The frontend is a single-page application that communicates with a FastAPI backend hosted at `itemuploader.onrender.com`.

## Architecture

### Authentication Flow
- OAuth redirect flow: User clicks login → redirects to backend `/auth/{provider}` → backend redirects back with `?token=...&user_id=...&username=...&avatar_url=...`
- Frontend stores auth data in localStorage (keys: `auth_token`, `user_id`, `username`, `avatar_url`)
- All API requests include `Authorization: Bearer {token}` header
- 401 responses trigger automatic logout and page reload

### API Integration
- **Environment detection**: Automatically switches between local (`http://127.0.0.1:8000/v1`) and production (`https://itemuploader.onrender.com/v1`) based on hostname
- **Endpoints**:
  - `POST /todo/add` - Create todo with `title`, `desc`, `duration_hours`, `created_at`
  - `GET /todo/all` - Fetch all user todos
  - `PATCH /todo/update/{id}` - Update todo (toggle completion or extend deadline)
  - `DELETE /todo/delete/{id}` - Delete todo

### Task Deadline Logic
- Each todo has `duration_hours` and `created_at` timestamp
- Deadline = `created_at + duration_hours`
- Tasks are categorized:
  - **Ongoing**: Not completed, deadline not exceeded
  - **Deadline Failed**: Not completed, deadline exceeded (red border, extend deadline option)
  - **Done**: Marked as completed
- Deadline-failed tasks can be "extended" by updating both `duration_hours` and `created_at` (resets the timer)
- Countdown modal shows real-time remaining time in HH:MM:SS format

### UI Organization
- Collapsible sections for Ongoing, Deadline Failed, and Done tasks
- Progress bar shows completion ratio
- Todo items use random colors and slight rotation for visual variety (except completed/deadline-failed)
- Mobile-responsive with breakpoints at 768px and 480px

## Key Conventions

### State Management
- No framework used - DOM manipulation with vanilla JS
- Authentication state stored in localStorage, checked on page load
- UI updates triggered by calling `getTodos()` after mutations

### API Request Pattern
```javascript
// Always check auth status first
if (!isAuthenticated()) {
    alert("Please login first");
    return;
}

// Include auth headers
const response = await fetch(`${API_BASE}/endpoint`, {
    method: "METHOD",
    headers: getAuthHeaders(),
    body: JSON.stringify(data)
});

// Handle 401 explicitly
if (response.status === 401) {
    alert("Session expired. Please login again.");
    logout();
    return;
}
```

### Deadline Calculation
- Always use `new Date(todo.created_at)` to parse backend timestamps
- Compare with `new Date()` for current time
- End time = `created_at + duration_hours * 60 * 60 * 1000`

### Style Patterns
- No separate CSS file - all styles inline in `<style>` tag in index.html
- Border style: `border-radius: 2px` and solid black borders (except deadline-failed)
- Color scheme: Pastel backgrounds with black borders for clean look
- Mobile: Progressive scaling down (768px → 480px breakpoints)
