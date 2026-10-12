# DCS QBank – content guide

```
qbank/
├── index.json              # semesters → list of subject folders (order shown on dashboard)
├── DCS5000/
│   ├── subject.json        # subject info + chapter list (order shown in Study/Exam)
│   ├── ch01.json           # one file per chapter / lesson
│   ├── ch02.json
│   └── images/             # images for this subject's questions & explanations
└── ...
```

## Add a new chapter
1. Create `DCS5000/ch05.json` (copy an existing file).
2. Add it to `DCS5000/subject.json` → `chapters`:
   `{ "id": "ch05", "title": "My new lesson", "file": "ch05.json" }`

## Add / update a question
Each chapter file looks like this:

```json
{
  "chapterId": "ch01",
  "title": "History & Echo Modalities",
  "questions": [
    {
      "id": "DCS5000-ch01-q005",
      "stem": "Question text. Blank lines create new paragraphs. **bold** is supported.",
      "image": "/qbank/DCS5000/images/my-image.png",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 1,
      "explanation": "Why B is correct...",
      "explanationImage": null,
      "tags": ["doppler"],
      "reference": "Textbook, page 123"
    }
  ]
}
```

Rules:
- `id` must be unique and must NEVER change once published. User progress is keyed by this id.
- `answer` is the **0-based index** of the correct option (0 = first option).
- `image` and `explanationImage` are optional (`null` or omit). Put files in the subject's `images/` folder and reference them as `/qbank/<FOLDER>/images/<file>`.
- Any number of options (2–6) is supported.
- To update a question, edit it in place and keep the same `id`.
