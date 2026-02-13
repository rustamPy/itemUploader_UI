# itemUploader_UI

A vanilla JavaScript to-do list application with OAuth authentication and deadline tracking.

## Project Structure

```
.
├── index.html              # Main HTML file (clean, references external assets)
├── css/
│   ├── styles.css         # Main styles
│   └── responsive.css     # Mobile-responsive styles
├── js/
│   ├── config.js          # API configuration and constants
│   ├── cache.js           # Client-side caching logic
│   ├── auth.js            # Authentication functions
│   ├── api.js             # API calls with caching
│   ├── utils.js           # Utility functions
│   ├── todos.js           # Todo management logic
│   ├── ui.js              # UI rendering
│   └── main.js            # Application initialization
├── index-original.html     # Original single-file version (backup)
└── scripts-old.js          # Original JavaScript (backup)
```

## Features

- **OAuth Authentication**: Login with GitHub or Google
- **Client-side Caching**: Todos are cached in localStorage for 5 minutes
- **Deadline Tracking**: Set task durations with countdown timers
- **Task Categories**: Ongoing, Deadline Failed, and Done sections
- **Progress Tracking**: Visual progress bar
- **Mobile Responsive**: Optimized for all screen sizes

## Client-Side Caching

The application implements intelligent caching to reduce API calls:
- **Cache Location**: localStorage (`todos_cache` key)
- **Cache Duration**: 5 minutes (configurable in `js/config.js`)
- **Automatic Invalidation**: Cache clears after add/update/delete operations
- **Benefits**: Faster load times, reduced server load, works offline with cached data

**Configuration**: Edit `CACHE_DURATION` in `js/config.js` to adjust cache lifetime (in milliseconds)

## Development

The project uses ES6 modules. To run locally:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run linter
npm run lint

# Serve the app
npm run serve
# Or with Python:
python3 -m http.server 8080
```

**Environment Detection**: 
- Local: `http://127.0.0.1:8000/v1`
- Production: `https://itemuploader.onrender.com/v1`

## Testing

```bash
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage report
```

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## CI/CD

GitHub Actions workflows:
- **CI**: Lint, test, and build checks on all PRs
- **Deploy**: Auto-deploy to GitHub Pages on push to main

See workflows in `.github/workflows/`

## API Documentation

[View API Docs](https://itemuploader.onrender.com/v1/docs)
