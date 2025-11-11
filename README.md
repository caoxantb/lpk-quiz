# lpk-quiz

Interactive quiz practice suite with a React/Vite front end (`app/`) and a lightweight Express API (`server/`) that serves curated CFA-style questions from JSON datasets.

## Repository layout

```
.
├── app/            # React 19 + Vite client (Tailwind, Jotai, Recharts)
├── server/         # Express 5 API that exposes question/test endpoints
└── README.md
```

## Frontend (`app/`)

| Feature | Notes |
| --- | --- |
| Home screen | Lists every test module, handles locked/unlocked state, and provides a quick jump into the Stats view. |
| Stats view | Visualizes answer distribution per topic via a stacked bar chart (Recharts) that toggles between raw counts and percentages. |
| Test runner | `Test.jsx` orchestrates sidebar navigation, question panels, solutions, and results depending on the session’s lifecycle. |
| State | Jotai atoms keep track of fetched questions, current session state, and persisted progress (localStorage-backed). |

Tech stack: React 19, Vite 7, Tailwind CSS 4, Jotai, Axios, Recharts, Sonner (toasts).

## Backend (`server/`)

Small Express 5 service that exposes the quiz content from JSON files under `server/data`:

| Method | Path | Description |
| --- | --- | --- |
| `GET /api/tests/:test` | Returns the entire test payload stored in `data/final/{test}.json`. |
| `GET /api/questions/:id?isReview=true` | Looks up a single question by ID, optionally merges review explanations, and attaches supporting tables. |

The server enables CORS for local development, parses JSON bodies, and surfaces errors via a shared middleware. Data lookups are synchronous file reads using native `fs/promises`.

## Prerequisites

- Node.js ≥ 20
- [pnpm](https://pnpm.io/) ≥ 9 (recommended; adapt commands for npm/yarn if needed)

## Getting started

1. **Install dependencies**
   ```bash
   cd server && pnpm install
   cd ../app && pnpm install
   ```
2. **Run the API**
   ```bash
   cd server
   pnpm dev        # nodemon on http://localhost:8080
   ```
3. **Run the client**
   ```bash
   cd app
   pnpm dev        # Vite on http://localhost:5173
   ```

The client currently fetches questions from `http://localhost:8080`, so keep the API running while developing.

## Useful scripts

| Location | Script | Purpose |
| --- | --- | --- |
| `app/` | `pnpm dev` | Launch Vite development server. |
|  | `pnpm build` | Create a production build (`dist/`). |
|  | `pnpm preview` | Preview the production build locally. |
|  | `pnpm lint` | Run ESLint across the client codebase. |
| `server/` | `pnpm dev` | Start the Express API with nodemon reloads. |
|  | `pnpm start` | Run the API with Node (production mode). |

## Configuration tips

- **API base URL**: the client fetch logic (see `app/src/stores/questions.js`) points to `http://localhost:8080`. Update this constant if you deploy the API elsewhere.
- **Port**: the server reads `PORT` from the environment (defaults to `8080`). Set `PORT=xxxx pnpm dev` to change it.
- **Persisted data**: question payloads cache in `localStorage` under the `questions` key to avoid redundant fetches. Clear storage or tweak the atom if you need fresh data.

## Data sources

All question, solution, and table content lives in `server/data/*`. The structure is:

```
server/data/
├── cleaned/
│   ├── questions/{category}.json
│   ├── solutions/{category}.json
│   └── tables/{category}.json
├── final/{test}.json
└── ...
```

Updating these files automatically changes what the API serves—no database is required.

## Contributing & next steps

- Add additional UI routes or cards by extending the atoms and router definitions in `app/src`.
- If you need authentication or user-specific storage, introduce middleware on the server or add a real database layer.
- Consider extracting the API base URL into a Vite environment variable (`VITE_API_BASE_URL`) if you plan to deploy across environments.

Pull requests and issue reports are welcome. Have fun building! 🚀
