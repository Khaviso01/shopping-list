# ShopBuddy - Shopping list app

ShopBuddy is a shopping-list web application built with React, TypeScript, and Redux Toolkit. It lets users register an account, sign in, manage a personal shopping list, search and sort their items, pick real product photos from Unsplash, and share their list with others — all backed by a [json-server](https://github.com/typicode/json-server) REST API.

# Preview

<img src="src/assets/shopbuddy.png" alt="Alt text" width="500">

## Features

- Register an account with a name, surname, email address, cell number, and password.
- Sign in and remain signed in after refreshing the page — the session is resumed by re-checking with the server, and routing waits for that check to finish before deciding whether to redirect, so a page refresh never bounces a signed-in user back to login.
- Add shopping items with:
  - Item name
  - Category
  - Quantity
  - Notes
  - A photo, searched and picked from Unsplash
- Edit or delete existing items.
- Mark an item as completed in the current session with checkbox feedback.
- Search items by name — the search term is reflected in the URL.
- Sort items by name, category, or date added — the sort key is reflected in the URL.
- View and update profile details, including changing your password.
- Share your current list view (native share sheet on mobile, copy-link fallback on desktop).
- Sign out and clear the saved session.
- Receive toast notifications for saves, deletes, sorting, and other actions.

## Tech Stack

- [React](https://react.dev/) 19
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [React Router](https://reactrouter.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/) and React Redux (async thunks for all server calls)
- [json-server](https://github.com/typicode/json-server) as the REST API / data store
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) for one-way password hashing
- [Unsplash API](https://unsplash.com/developers) for item photo search
- [react-hot-toast](https://react-hot-toast.com/) for notifications
- [Hugeicons](https://hugeicons.com/) for interface icons
- `oxlint` for linting
- Deployed on [Vercel](https://vercel.com) (frontend) and [Render](https://render.com) (json-server backend)

## Requirements

- Node.js 18 or newer
- npm 9 or newer
- A free [Unsplash developer account](https://unsplash.com/oauth/applications) (only needed if you want the image search to return real results)

Check your installed versions with:

```bash
node --version
npm --version
```

## Getting Started

### 1. Install dependencies

From the project root, run:

```bash
npm install
```

### 2. Configure environment variables

Create a `.env` file at the project root (same folder as `package.json`) — copy `.env.example` if you have one, or create it manually:

```
VITE_API_URL=http://localhost:3001
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

- `VITE_API_URL` — where the json-server backend is running. The default matches `npm run server` below.
- `VITE_UNSPLASH_ACCESS_KEY` — create a free app at https://unsplash.com/oauth/applications and paste its **Access Key** (not the Secret Key) here. Without this, item creation still works, but the photo search box will show a "not configured" message instead of results (you can still leave items without a photo).

> After creating or editing `.env`, you must restart the dev server — Vite only reads `.env` at startup, not while it's running.

### 3. Start the app

Two processes are required: the json-server API and the Vite dev server. The easiest way is to run both together:

```bash
npm run dev:all
```

Or run them in two separate terminals if you'd rather see their output separately:

```bash
npm run server   # json-server on http://localhost:3001, backed by db.json
npm run dev      # Vite dev server, normally http://localhost:5173
```

### 4. Create an account

Open the Vite dev URL, select **Create an account**, and complete the registration form. After registration, the app redirects to `/home`.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite development server with hot reload. |
| `npm run server` | Starts the json-server API, backed by `db.json`, via `scripts/start-server.mjs` (see below). |
| `npm run dev:all` | Runs the Vite dev server and json-server together. |
| `npm run build` | Runs the TypeScript build and creates a production bundle in `dist/`. |
| `npm run lint` | Runs Oxlint against the project. |
| `npm run preview` | Serves the production build locally for verification. |

Typical verification commands are:

```bash
npm run lint
npm run build
npm run preview
```

### Why `npm run server` calls a script instead of `json-server` directly

`scripts/start-server.mjs` reads the port from `process.env.PORT` in plain Node, falling back to `3001` if it isn't set. This is what makes the exact same script work in three different environments without editing anything:

- **Locally** — no `PORT` variable is set, so it falls back to `3001`, matching `VITE_API_URL=http://localhost:3001`.
- **On Windows** — this avoids `--port $PORT` entirely. `$PORT` is bash-only shell syntax; PowerShell doesn't expand it the same way, which previously caused `ERR_SOCKET_BAD_PORT` crashes on Windows.
- **On Render** (or any host that assigns a dynamic port) — Render sets a real `PORT` environment variable before running the start command, and the script picks it up automatically.

## Application Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Redirect | Sends authenticated users to `/home` and other users to `/login`. |
| `/login` | Public | Signs in an existing registered user. |
| `/register` | Public | Creates a new user account. |
| `/home` | Authenticated | Displays and manages the shopping list. |
| `/profile` | Authenticated | Updates profile information, changes password, or signs out. |

Unauthenticated users are redirected to `/login`. Authenticated users are redirected to `/home` when they try to open `/login` or `/register`.

On page load/refresh, the app first re-verifies any saved session against the server (`resumeSession` in `src/redux/authSlice.ts`) and shows a brief loading screen while that check is in flight, rather than evaluating routes against a not-yet-known authentication state. This is what allows a refresh on `/home` or `/profile` to land back on the same page instead of redirecting to `/login`.

## Data Management

### Persistence: json-server

All user accounts and shopping items are stored server-side in `db.json`, served by json-server (configurable host/port via `VITE_API_URL` on the frontend). The frontend never talks to `db.json` directly — every read/write goes through `src/services/api.ts`, a small fetch wrapper around the REST endpoints json-server exposes:

- `GET/POST /users`, `GET/PATCH /users/:id` — account records (`id`, `name`, `surname`, `email`, `cellNumber`, `passwordHash`)
- `GET/POST/PUT/DELETE /items` — shopping items, each tagged with a `userId` so every account only ever sees its own list

Only a single value is kept in `localStorage`: the signed-in user's `id`, used purely to resume a session on page refresh (the app re-fetches the full profile from the server on load — no credentials are cached in the browser).

> `db.json` must not contain a top-level `"$schema"` key or any other non-array top-level value — json-server treats every top-level key as a collection and expects an array. If your editor auto-adds a `$schema` field, remove it before running the server.

### Password security: hashing only, no decryption

Passwords are hashed with [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (`bcrypt.hashSync`) before they are ever sent to the server — the plain-text password is discarded immediately after hashing and only the hash is stored in `db.json`. Login **never decrypts** a stored password: it re-hashes the entered password internally and compares digests with `bcrypt.compareSync`, which is a one-way operation. There is no decrypt function anywhere in the codebase — bcrypt hashes cannot be reversed, by design.

Changing your password on the Profile page works the same way: a new hash is computed and the old one is discarded.

> Note: this is a training project. `db.json` is plain-text on disk and there's no server-side input validation or rate limiting — none of that is production-grade auth. For production, put a real API in front of json-server (or replace it with a proper backend) and add server-side validation.

### Item photos: Unsplash

Instead of pasting an image URL, the Add/Edit Item modal lets you search Unsplash by keyword and pick a real photo from a grid of results (`src/services/unsplash.ts`). Selecting a photo stores its URL on the item. Per Unsplash's API guidelines, selecting a photo also fires a "download tracking" ping, separate from the search request, which Unsplash asks integrations to send whenever a photo is actually used.

If the search fails, the error toast now reports the specific cause instead of a generic message:
- **Not configured** — `VITE_UNSPLASH_ACCESS_KEY` is missing from `.env` (or the dev server hasn't been restarted since it was added).
- **401** — the key is invalid, most often because the Secret Key was pasted in instead of the Access Key.
- **403** — the demo Unsplash app's rate limit (50 requests/hour) has been hit; wait an hour or apply for production access on the Unsplash app dashboard.

### Sharing

The **share** button on the Home page shares the current URL (including any active search/sort query parameters) via the native Web Share API on supported devices, or copies the link to the clipboard as a fallback — so a search/sort view can be shared with someone else in the same browser context (e.g. `/home?search=milk&sort=category`).

Shopping items have this shape:

```ts
interface ShoppingItem {
	id: string;
	userId: string;
	name: string;
	category?: string;
	quantity?: string;
	notes?: string;
	imageUrl?: string;
	dateAdded: string;
}
```

## Project Structure

```text
.
├── db.json                  # json-server data store (users, items)
├── .env.example              # Template for VITE_API_URL / VITE_UNSPLASH_ACCESS_KEY
├── vercel.json                # SPA rewrite rule so client-side routes survive a refresh
├── scripts/
│   └── start-server.mjs        # Cross-platform json-server launcher (reads PORT from Node)
├── public/                  # Static public assets
├── src/
│   ├── assets/               # Imported application assets
│   ├── components/           # Header, search, modal, and route components
│   ├── pages/                # Login, registration, home, and profile screens
│   ├── redux/                # Redux store and state slices (async thunks)
│   ├── services/              # api.ts (json-server) and unsplash.ts (image search)
│   ├── types/                 # Shared type definitions
│   ├── App.tsx                # Router, session resume, and global toast provider
│   ├── App.css                # App-level styles
│   ├── index.css              # Global and page styles
│   └── main.tsx                # React entry point and Redux provider
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Development Notes

- The app uses `React.StrictMode` and Redux's `<Provider>` from `src/main.tsx`.
- Route access is controlled from `App.tsx` using the Redux authentication state, gated on `sessionStatus` so routing waits for the initial session check to resolve.
- New items are inserted at the beginning of the list and receive an ISO timestamp.
- Empty-state content changes when a search returns no matching items.
- The current completion checkbox only displays success feedback; completion state is not persisted on the item model.
- All CRUD operations dispatch Redux thunks (`fetchItems`, `addItem`, `editItem`, `deleteItem`, `registerUser`, `loginUser`, `updateProfile`, `resumeSession`) that call `src/services/api.ts`.

## Deployment

This project deploys as two separate pieces: the Vite frontend (Vercel) and the json-server backend (Render). Both need to be live, and the frontend needs to know the backend's URL.

### 1. Deploy the backend on Render

1. Push the project to a GitHub repository (make sure `db.json` is committed, not gitignored).
2. On [render.com](https://render.com) → **New +** → **Web Service** → connect the repo.
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm run server`
4. Create the service and wait for the logs to show `JSON Server started on PORT :xxxx`.
5. Copy the service URL Render gives you, e.g. `https://your-app.onrender.com`.

> Render's free tier spins the service down after inactivity — the first request after idle can take 30–60 seconds to wake it up. This is expected, not a bug. Also note the free tier's disk isn't guaranteed to persist across redeploys, so treat any data added after deployment as temporary unless you upgrade to a paid plan with persistent disk or move to a real database.

### 2. Deploy the frontend on Vercel

1. Import the same repository into [vercel.com](https://vercel.com).
2. Under **Settings → Environment Variables**, add:
   - `VITE_API_URL` = your Render URL from step 1 (no trailing slash)
   - `VITE_UNSPLASH_ACCESS_KEY` = your Unsplash Access Key
   - Both can be set as plain/config values — Vite bakes `VITE_`-prefixed variables into the public client bundle at build time, so nothing prefixed `VITE_` is actually kept secret regardless of how it's stored in Vercel.
3. Redeploy after adding/changing environment variables — Vercel doesn't rebuild automatically just because a variable changed.

### 3. `vercel.json` — required for client-side routing

Because this is a single-page app, refreshing on a route like `/home` or `/profile` would otherwise 404: Vercel looks for a static file at that path instead of letting React Router handle it. `vercel.json` fixes this by rewriting every request to `index.html`:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

## Production Build

Create an optimized build with:

```bash
npm run build
```

The generated files are placed in `dist/`. They can be served by any static hosting provider that supports SPA fallback routing (see `vercel.json` above for the Vercel-specific config). You'll also need to host the json-server API (or a real backend) somewhere reachable and point `VITE_API_URL` at it at build time — see the Deployment section above.

To inspect the production build locally:

```bash
npm run preview
```

## Contributing

1. Create a feature branch.
2. Make a focused change that follows the existing TypeScript and React patterns.
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Include a short description of user-facing behavior and any storage or routing changes.
