# DCSQbank / DCS QBank Project Memory

Updated: 2026-10-12

## Executive summary

DCSQbank is a React-based question bank for Humber's Diagnostic Cardiac Sonography program. It is designed to work without an account: question content is static JSON shipped from `frontend/public/qbank`, while learner progress is stored in the browser. The current application is functional as a study and single-subject exam tool. The Python backend exists as a FastAPI/MongoDB starter template, but the frontend does not call it yet.

The current product has two primary areas:

- **Dashboard**: progress metrics, accuracy charts, activity, wrong-answer summary, recent sessions, subject breakdown, and progress import/export/reset.
- **Subjects**: semester-organized subject cards leading to study mode or exam mode.

The top navigation now displays **Subjects** while retaining the `/courses` route for compatibility.

## Repository map

- `frontend/`: Create React App + CRACO application.
  - `src/App.js`: route table and shell boundaries.
  - `src/components/Navbar.jsx`: global navigation.
  - `src/components/AppShell.jsx`: global shell and loading/error state.
  - `src/pages/`: dashboard, subject, study, exam, results, and wrong-answer screens.
  - `src/lib/`: catalog loading, exam selection/session storage, progress storage, and statistics.
  - `public/qbank/`: static catalog, subject metadata, chapter JSON, and images.
  - `README.md`: standard Create React App commands.
- `backend/server.py`: FastAPI starter with MongoDB status-check endpoints under `/api`.
- `backend/requirements.txt`: Python dependencies, including FastAPI, Motor, Pydantic, and test tooling.
- `scripts/`: question-bank skeleton/import utilities and raw source text for imported MCQs.
- `memory/PRD.md`: original product requirements and historical implementation record.
- `test_reports/`: prior iteration/E2E reports. `test_result.md` is an empty testing-state ledger apart from its protected protocol.

## Frontend route map

Routes are defined in `frontend/src/App.js`:

| Route | Screen | Purpose |
|---|---|---|
| `/` | redirect | Redirects to `/dashboard`. |
| `/dashboard` | `Dashboard` | Progress overview and data tools. |
| `/courses` | `Courses` | Semester/subject catalog; nav label is “Subjects”. |
| `/wrong-answers` | `WrongAnswers` | Review currently wrong questions, filterable by subject. |
| `/subject/:sid/study` | `StudyChapters` | Chapter list and study/exam mode switch. |
| `/subject/:sid/study/:cid` | `StudySession` | One-question-at-a-time study session with explanations. `cid=wrong` is wrong-answer practice. |
| `/subject/:sid/exam` | `ExamSetup` | Configure chapter, section, count, timing, and shuffle options. |
| `/exam/run` | `ExamRunner` | Timed/untimed exam runner, navigator, flags, autosave, calculator. |
| `/exam/results` | `ExamResults` | Score and filtered answer review. |

Unknown routes redirect to the dashboard. The exam runner is intentionally outside `AppShell`, so it has a focused exam header instead of the normal navigation.

## Content/data model

The catalog starts at `frontend/public/qbank/index.json`:

```text
index.json
  semesters[]
    id, title, subjects[]  // subject folder IDs
```

Each subject folder contains `subject.json`, chapter files, and optional images:

```text
subject.json
  id, code, title, semester, description, chapters[]
    id, title, file

chapter JSON
  chapterId, title, questions[]
    id, stem, image, options[], answer, explanation,
    explanationImage, tags[], reference
```

Important content invariants:

- Question IDs must remain unique and stable forever because progress is keyed by question ID.
- `answer` is a zero-based option index.
- Image paths are rooted at `/qbank/<subject>/images/...`.
- Empty chapter files are valid and render as “Questions coming soon”.
- Tags are used by `SectionFilter`; the first tag is treated as the section name.

Current catalog organization is 7 subjects in Semester 1 and 7 in Semester 2. The PRD records 29 initial sample questions plus a substantial DCS5004 import (800 questions across five chapters); other subjects/chapter files may be empty.

## Loading and state flow

1. `useCatalog()` uses TanStack Query to call `loadCatalog()`.
2. `loadCatalog()` fetches `index.json`, then every subject's `subject.json`, then every listed chapter JSON.
3. Loaded questions are enriched in memory with `subjectId` and `chapterId`.
4. `buildStats()` flattens the loaded catalog with progress attempts for dashboard/chapter metrics.
5. Static content is not persisted or sent to the backend.

`frontend/src/lib/qbank.js` uses `fetch(..., { cache: "no-cache" })`. Chapter loading currently catches any error and returns an empty question list. This keeps the UI alive for missing/empty chapters, but can hide malformed JSON or missing files; this should be made observable before production.

## Progress and exam persistence

### `localStorage`

Key: `dcs_qbank_progress_v1`

Shape:

- `version`
- `attempts`: keyed by question ID; stores a question snapshot, last selection/correctness, attempt totals, timestamps, and last mode
- `sessions`: capped at 500 session summaries
- `createdAt`, `updatedAt`

Study answers are recorded immediately. Exam answers are recorded when the exam finishes. The dashboard can export JSON, import by merge or replace, and reset all progress.

### `sessionStorage`

- `dcs_exam_active`: resumable active exam, including questions, answers, flags, current index, settings, and start time.
- `dcs_exam_result`: latest result used by the results route.

This makes an exam resilient to reloads in the same browser tab/session, but not across devices or browser profiles.

## Main user flows

### Study

Subject → chapter → question navigator → select answer → immediate correct/incorrect state and explanation. Answers lock after selection. Keyboard shortcuts support number keys for options and left/right navigation. The scientific calculator is available in study mode.

### Exam

Subject → exam setup → select chapters and optional sections → choose count and time/question → optionally exclude previously correct questions, include wrong questions, and shuffle → exam runner → finish/timeout → results review. Option shuffling preserves the original answer by carrying an `optionOrder` mapping.

### Wrong-answer review

The global wrong-answer bank is derived from attempts whose `lastCorrect` is false. A wrong answer leaves the list after a later correct answer. Review can be filtered by subject, and subject-specific practice launches the study route with `cid=wrong`.

## Backend status

`backend/server.py` is a generated/template FastAPI service:

- Requires `MONGO_URL` and `DB_NAME` at import/startup.
- Creates an async Motor MongoDB client.
- Exposes `GET /api/`, `POST /api/status`, and `GET /api/status`.
- Enables permissive/default CORS based on `CORS_ORIGINS`.
- Has no authentication, user model, progress model, catalog API, or frontend integration.

Do not treat the backend as part of the current runtime until environment configuration, database availability, and an explicit API contract are added.

## Tooling and run notes

Frontend commands are in `frontend/package.json`:

- `npm start` → CRACO development server, normally `http://localhost:3000`.
- `npm run build` → production build.
- `npm test` → CRA test runner.

On the current machine, dependencies were initially absent. `npm install` hit the existing `date-fns`/`react-day-picker` peer conflict, so `npm install --legacy-peer-deps` was required. The start command also required compatible local `ajv`/`ajv-keywords` packages under Node 24. The app then compiled successfully and was verified at `http://localhost:3000`.

The backend should only be started after creating `backend/.env` with valid MongoDB settings and installing `backend/requirements.txt`.

## Known risks and gaps

1. **No automated application tests in source**: prior E2E reports exist, but there are no project-owned frontend test files; backend test directory is effectively empty.
2. **Silent content failures**: chapter fetch/parse errors become empty chapters.
3. **No schema validation**: malformed question JSON can reach rendering and exam-selection code.
4. **Browser-only progress**: clearing storage loses data unless the learner exported it; no account sync exists.
5. **Backend disconnected**: authentication and cloud persistence are planned but not implemented.
6. **Question IDs are a migration boundary**: changing IDs invalidates historical attempts.
7. **Package/toolchain friction**: CRA/CRACO and the dependency tree require legacy peer resolution and currently run on a newer Node version with compatibility warnings.
8. **Content completeness is uneven**: many catalog entries are scaffolds while DCS5004 has the largest imported bank.
9. **Accessibility and UX need systematic verification**: keyboard behavior, focus management, mobile exam layout, and chart sizing have had warnings in the running app.
10. **No deployment contract**: there is no documented production hosting, API hosting, database, environment, backup, or migration strategy.

## Product decisions already made

- Static JSON content first.
- Works without login.
- Clean clinical/light visual direction.
- Local progress with import/export.
- Separate dashboard and subject catalog navigation.
- Study explanations and exam review are core experiences.
- Account/authentication and synchronization are future work, not current dependencies.
