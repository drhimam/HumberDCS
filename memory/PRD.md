# DCSQbank – DCS QBank PRD

## Original problem
QBank for a Diagnostic Cardiac Sonography program (14 courses, Sem 1 & 2). Minimal backend later (sign up/in only). Questions stored in the frontend as JSON: one folder per subject, one file per chapter, with images. Dashboard with detailed progress stored locally (import/export, includes wrong answers). Subject card → Study mode (chapters, answer + explanation side panel) or Exam mode (settings: time/question, count, chapters, exclude correct, include wrong; results at end). Landing + auth pages: LATER.

## User choices
JSON format · sample questions for 2 subjects · images in /qbank/<FOLDER>/images · clean clinical light theme · works without login.

## Architecture
- Static content: `frontend/public/qbank/index.json`, `<FOLDER>/subject.json`, `<FOLDER>/chNN.json`, `<FOLDER>/images/`, README.md (authoring guide). Scripts: `/app/scripts/build_qbank_skeleton.py` (never overwrites), `sample_questions.py`.
- Progress: localStorage `dcs_qbank_progress_v1` (attempts keyed by question id with snapshot, sessions). Active exam/results: sessionStorage.
- Backend: untouched template (auth later).

## Implemented (Jun 2026)
- Dashboard: 8 stat tiles, accuracy-by-course chart, 14-day activity, wrong-answer card, recent sessions, course breakdown table, export/import(merge/replace)/reset, resume-exam banner
- Mode dialog, Study chapters list, Study session (navigator, keyboard shortcuts, side explanation, image zoom), wrong-answer review mode
- Exam setup, timed runner (flag, navigator, auto-submit, resume on reload), results with filtered review
- Wrong answers page with course filter + practice
- 29 sample questions (DCS5000, DCS5002); other courses have empty chapter files
- Tested: frontend 100% (iteration_1)
- Added DCS5004 ch01 "Module 1: Introduction to Sonography and Physics" (100 Qs, section names as tags) via `/app/scripts/import_mcq_text.py` (paste format: questions + "Answer Key" with `N. X: explanation`; raw saved in /app/scripts/raw/)
- Added DCS5004 ch02 "Module 2: Mathematical Concepts for Sonographers" (200 Qs: set 1 q001–q100 with section tags, set 2 q101–q200 tagged "Lecture 2 Review"); importer now accepts comma-separated raw files and "Part B – Answer Key" / "A)" / "N. X – expl" formats
- Added DCS5004 ch03 "Module 3: Sound Waves and Acoustic Parameters" (100 Qs, no section tags)
- Added DCS5004 ch04 "Module 4: Pulsed Ultrasound Parameters and Timing" (200 Qs: set 1 with 8 section tags, set 2 tagged "Lecture 4 Review"); DCS5004 total 700 Qs
- Added DCS5004 ch05 "Module 5: Transducer Design, Construction and Types" (100 Qs, 6 section tags); DCS5004 total 800 Qs
- Nav split: new /courses tab (between Dashboard and Wrong answers) holds semester course cards + mode dialog; Dashboard keeps only stats/charts/breakdown/data tools; chapter pages link back to Courses
- In-exam scientific calculator popup (components/Calculator.jsx): degrees trig, log/ln, √, x², xʸ, ×10ⁿ, π, Ans, keyboard input; tested iteration_2 (E-notation precedence bug fixed)
- Calculator also in Study mode (study shortcuts 1–4/arrows paused while it's open)
- Exam section filter (components/SectionFilter.jsx): per selected chapter, chips for each section (first tag) with counts, All/None; excluded sections drop from pool; tested iteration_3 100%

## Backlog
- P0: Landing page, sign up / sign in (JWT) – minimal backend
- P1: Sync progress to account; mixed exams across multiple courses
- P2: Bookmarks/notes per question, spaced-repetition review, print/PDF results
