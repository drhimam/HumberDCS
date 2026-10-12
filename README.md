# DCSQbank / HumberDCS

DCSQbank is a browser-first question bank for Humber's Diagnostic Cardiac Sonography program. The React frontend loads reviewed question content from static JSON and stores anonymous learner progress in the browser.

## Current architecture

- `frontend/`: React + CRACO application
- `frontend/public/qbank/`: static subjects, chapters, questions, and images
- `backend/`: FastAPI/MongoDB starter template; not currently used by the frontend
- `scripts/`: QBank generation, import, and validation utilities
- `memory/`: project memory, roadmap, and content-maintenance documentation

The production target is Cloudflare Pages for the frontend with a future Cloudflare Workers/D1 backend. Authentication, email, PayPal, and administration are not yet connected.

Cloudflare Pages deployment settings and environment boundaries are documented in [memory/CLOUDFLARE_DEPLOYMENT.md](memory/CLOUDFLARE_DEPLOYMENT.md). The repository also runs frontend validation through GitHub Actions on pull requests and pushes to `main`.

The frontend is also packaged as a standards-based Progressive Web App (PWA). On supported mobile browsers, use “Add to Home Screen”; on supported desktop browsers, use the install icon in the address bar or the browser menu. This provides an installable app experience on mobile and desktop without maintaining separate native codebases. Native iOS/Android/Windows/macOS packages are not currently generated.

## Prerequisites

- Node.js 20 LTS (the repository pins the major version in `.nvmrc`)
- npm 10 or newer
- Python 3.11+ only for the QBank Python utilities and backend

Node 24 may run the app, but the current CRA/CRACO toolchain emits compatibility warnings. Use Node 20 LTS for development and CI.

## Frontend setup

From `frontend`:

```powershell
npm ci
npm run validate:qbank
npm test -- --watchAll=false --runInBand
npm run build
```

The frontend includes `frontend/.npmrc` with `legacy-peer-deps=true` because the current dependency set contains a known `date-fns`/`react-day-picker` peer range mismatch. Do not remove that setting until the dependency versions are deliberately upgraded and tested.

Start development mode:

```powershell
npm start
```

Open [http://localhost:3000](http://localhost:3000).

Available scripts:

| Command | Purpose |
|---|---|
| `npm start` | Start the local development server |
| `npm test -- --watchAll=false --runInBand` | Run the Jest suite once |
| `npm run build` | Create the production frontend build |
| `npm run validate:qbank` | Validate all static QBank content and image references |
| `npm run inventory:qbank` | Generate a subject/chapter/question coverage inventory |

## Cloudflare Pages deployment

Use `frontend` as the Pages root directory, `npm run build` as the build command,
and `build` as the output directory. Configure Node 20. Do not add auth,
ZeptoMail, PayPal, or D1 credentials to frontend environment variables; those
belong to the future Worker environment.

## QBank maintenance

Read [memory/QBANK_CONTENT_MAINTENANCE_GUIDE.md](memory/QBANK_CONTENT_MAINTENANCE_GUIDE.md) before adding or editing content. Question IDs are permanent because learner progress is keyed by ID.

Run the validator from the repository root:

```powershell
python scripts\validate_qbank.py
```

## Backend status

The current backend is a template and requires `backend/.env` values such as `MONGO_URL` and `DB_NAME`. It is not required to run the current frontend. Do not commit `.env` files or provider credentials.

## Documentation

- [Project memory](memory/PROJECT_MEMORY.md)
- [Next steps](memory/NEXT_STEPS.md)
- [QBank content maintenance guide](memory/QBANK_CONTENT_MAINTENANCE_GUIDE.md)
