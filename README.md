# ShopBuddy - Shopping list app

ShopBuddy is a shopping-list web application built with React, TypeScript, and Redux Toolkit. It lets users register an account, sign in, manage a personal shopping list, search and sort their items, pick real product photos from Unsplash, and share their list with others — all backed by a [json-server](https://github.com/typicode/json-server) REST API.

# Preview

<img src="src/assets/shopbuddy.png" alt="Alt text" width="500">

## Features

- Register an account with a name, surname, email address, cell number, and password.
- Sign in and remain signed in after refreshing the page (session is resumed from the server, not from stored credentials).
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

Copy the example env file and fill in your Unsplash access key:

```bash
cp .env.example .env
```

```
VITE_API_URL=http://localhost:3001
VITE_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
```

- `VITE_API_URL` — where the json-server backend is running. The default matches `npm run server` below.
- `VITE_UNSPLASH_ACCESS_KEY` — create a free app at https://unsplash.com/oauth/applications and paste its **Access Key** here. Without this, item creation still works, but the photo search box will show a configuration error instead of results (you can still leave items without a photo).

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
| `npm run server` | Starts the json-server API on port 3001, backed by `db.json`. |
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

## Application Routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Redirect | Sends authenticated users to `/home` and other users to `/login`. |
| `/login` | Public | Signs in an existing registered user. |
| `/register` | Public | Creates a new user account. |
| `/home` | Authenticated | Displays and manages the shopping list. |
| `/profile` | Authenticated | Updates profile information, changes password, or signs out. |

Unauthenticated users are redirected to `/login`. Authenticated users are redirected to `/home` when they try to open `/login` or `/register`.

## Data Management

### Persistence: json-server

All user accounts and shopping items are stored server-side in `db.json`, served by json-server on `http://localhost:3001` (configurable via `VITE_API_URL`). The frontend never talks to `db.json` directly — every read/write goes through `src/services/api.ts`, a small fetch wrapper around the REST endpoints json-server exposes:

- `GET/POST /users`, `GET/PATCH /users/:id` — account records (`id`, `name`, `surname`, `email`, `cellNumber`, `passwordHash`)
- `GET/POST/PUT/DELETE /items` — shopping items, each tagged with a `userId` so every account only ever sees its own list

Only a single value is kept in `localStorage`: the signed-in user's `id`, used purely to resume a session on page refresh (the app re-fetches the full profile from the server on load — no credentials are cached in the browser).

### Password security: hashing only, no decryption

Passwords are hashed with [bcryptjs](https://github.com/dcodeIO/bcrypt.js) (`bcrypt.hashSync`) before they are ever sent to the server — the plain-text password is discarded immediately after hashing and only the hash is stored in `db.json`. Login **never decrypts** a stored password: it re-hashes the entered password internally and compares digests with `bcrypt.compareSync`, which is a one-way operation. There is no decrypt function anywhere in the codebase — bcrypt hashes cannot be reversed, by design.

Changing your password on the Profile page works the same way: a new hash is computed and the old one is discarded.

> Note: this is a training project. `db.json` is plain-text on disk and there's no server-side input validation, rate limiting, or transport encryption (no HTTPS) — none of that is production-grade auth. For production, put a real API in front of json-server (or replace it with a proper backend), serve everything over HTTPS, and add server-side validation.

### Item photos: Unsplash

Instead of pasting an image URL, the Add/Edit Item modal lets you search Unsplash by keyword and pick a real photo from a grid of results (`src/services/unsplash.ts`). Selecting a photo stores its URL on the item. Per Unsplash's API guidelines, selecting a photo also fires a "download tracking" ping, separate from the search request, which Unsplash asks integrations to send whenever a photo is actually used.

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
- Route access is controlled from `App.tsx` using the Redux authentication state.
- New items are inserted at the beginning of the list and receive an ISO timestamp.
- Empty-state content changes when a search returns no matching items.
- The current completion checkbox only displays success feedback; completion state is not persisted on the item model.
- All CRUD operations dispatch Redux thunks (`fetchItems`, `addItem`, `editItem`, `deleteItem`, `registerUser`, `loginUser`, `updateProfile`, `resumeSession`) that call `src/services/api.ts`.

## Production Build

Create an optimized build with:

```bash
npm run build
```

The generated files are placed in `dist/`. They can be served by any static hosting provider that supports SPA fallback routing. Configure the host to serve `index.html` for client-side routes such as `/home` and `/profile`. You'll also need to host the json-server API (or a real backend) somewhere reachable and point `VITE_API_URL` at it at build time.

To inspect the production build locally:

```bash
npm run preview
```

## Contributing

1. Create a feature branch.
2. Make a focused change that follows the existing TypeScript and React patterns.
3. Run `npm run lint` and `npm run build` before opening a pull request.
4. Include a short description of user-facing behavior and any storage or routing changes.
