# EchoBank QBank Content Maintenance Guide

## Purpose

This guide is the operating procedure for manually adding, editing, reviewing, and publishing EchoBank question-bank content. It is intended for ongoing maintenance as the bank grows across semesters, subjects, chapters, questions, explanations, references, and images.

The current content model is static, version-controlled JSON deployed with the frontend:

```text
frontend/public/qbank/
  index.json
  <SUBJECT_CODE>/
    subject.json
    ch01.json
    ch02.json
    images/
```

Do not edit files directly in the deployed Cloudflare Pages site. Make changes in the project, validate them, review them, and deploy through the normal Git/CI process.

## Non-negotiable rules

1. **Never change a published question ID.** Progress, wrong-answer history, and analytics depend on it.
2. **Never renumber existing questions casually.** Adding a question must not shift IDs of existing questions.
3. **Answers are zero-based indexes.** `0` means option A, `1` means option B, and so on.
4. **Every question must have a defensible answer and explanation.** Do not publish guessed answers.
5. **Do not place secrets, private source documents, student data, or credentials in the QBank.**
6. **Use repository-relative asset paths.** Published image paths must resolve under `/qbank/<SUBJECT_CODE>/images/`.
7. **Keep content changes small and reviewable.** Prefer one subject/chapter change per commit or pull request.
8. **Validate before publishing.** A successful browser load is not a substitute for schema and content validation.
9. **Preserve source traceability.** Keep source material outside published JSON when it contains copyrighted or private material, and record a concise reference in the question.
10. **Treat learner data as separate from content.** Do not manually edit localStorage exports to “fix” a question ID without a migration plan.

## Question JSON contract

Each chapter file has this shape:

```json
{
  "chapterId": "ch01",
  "title": "History and Echo Modalities",
  "questions": [
    {
      "id": "DCS5000-ch01-q001",
      "stem": "Which statement is correct?",
      "image": null,
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": 1,
      "explanation": "Option B is correct because ...",
      "explanationImage": null,
      "tags": ["intro"],
      "reference": "Course notes, Module 1"
    }
  ]
}
```

### Field rules

| Field | Required | Rule |
|---|---:|---|
| `id` | Yes | Globally unique, stable, lowercase `qNNN` suffix recommended. |
| `stem` | Yes | Clear question; use Markdown supported by the existing renderer only. |
| `image` | No | `null` or a path beginning `/qbank/<SUBJECT>/images/`. |
| `options` | Yes | Array of 2–6 non-empty strings; avoid duplicate options. |
| `answer` | Yes | Integer from `0` through `options.length - 1`. |
| `explanation` | Yes | Explain why the answer is correct; address likely confusion where useful. |
| `explanationImage` | No | `null` or a valid QBank image path. |
| `tags` | Recommended | Array of strings. The first tag is used as the section filter label. |
| `reference` | Recommended | Short source, module, textbook, or institutional reference. |

Keep `image` and `explanationImage` as `null` when no image is used. Do not use local computer paths such as `C:\...`, URLs that require authentication, or base64 data in question JSON.

## Subject and chapter setup

### Adding a subject folder

1. Add the subject code to the correct semester in `frontend/public/qbank/index.json`.
2. Create `frontend/public/qbank/<SUBJECT_CODE>/subject.json`.
3. Create one `images` folder.
4. Add chapter files and list them in `subject.json`.
5. Confirm the subject code and folder name match exactly, including capitalization.

Example `subject.json`:

```json
{
  "id": "DCS5000",
  "code": "DCS5000",
  "title": "Foundations of Diagnostic Cardiac Sonography",
  "semester": "sem1",
  "description": "Foundational concepts and terminology.",
  "chapters": [
    {
      "id": "ch01",
      "title": "History and Echo Modalities",
      "file": "ch01.json"
    }
  ]
}
```

### Adding a chapter

1. Choose the next unused chapter ID, such as `ch05`.
2. Create `ch05.json` in the subject folder.
3. Add the chapter entry to `subject.json` in display order.
4. Set `chapterId` and the chapter `title` consistently in both files.
5. Start question IDs with the subject and chapter, for example `DCS5000-ch05-q001`.

Empty chapter files may be used for planned content, but they should contain a clear title and an empty `questions` array. Do not create fake questions to fill a chapter.

## Adding a question manually

### Before writing

Collect:

- subject code and chapter ID
- stable question ID
- learning objective or section tag
- authoritative answer
- explanation
- reference
- image and image-license/source information, if applicable

### Procedure

1. Open the target chapter JSON.
2. Find the highest existing question number.
3. Assign the next unused ID. If questions were deleted, do not reuse their IDs.
4. Add the question object to the end of the `questions` array.
5. Count options and convert the correct letter to a zero-based index.
6. Add tags and a concise reference.
7. Format the JSON with two-space indentation and a trailing newline.
8. Run validation and inspect the question in Study mode.

Example: if the correct answer is option C, write `"answer": 2`.

### Writing standards

- Ask one unambiguous question.
- Avoid “all of the above” unless it is pedagogically necessary.
- Keep options parallel in grammar and similar in style.
- Avoid clues such as one option being much longer or more specific.
- Use consistent units, capitalization, abbreviations, and terminology.
- Explain the reasoning, not only the answer letter.
- Use clinically safe wording and flag exceptions or context-dependent answers.
- Do not copy a question or explanation without confirming its permitted use and accuracy.

## Editing an existing question

### Safe edits

Usually safe without changing the ID:

- correcting a typo
- improving wording without changing the tested concept
- improving an explanation
- adding a valid reference
- replacing or correcting an image while preserving its meaning
- adding a section tag

### Edits requiring extra review

Create a content review note or pull-request explanation when changing:

- the correct answer
- the number or order of options
- the tested learning objective
- clinical/scientific meaning
- an image that changes the question interpretation

If the question is materially different, create a new question ID instead of silently repurposing the old one. Existing attempts must continue to describe the historical question they answered.

### Changing options and answers

When reordering options, update `answer` to the new zero-based position. For example:

```text
Before: A = X, B = Y, C = Z; answer = 1
After:  A = Z, B = X, C = Y; answer = 2
```

Review every historical learner attempt implication before changing a published option order. The application stores a snapshot in progress records, but new content should still preserve conceptual continuity.

## Adding and updating images

### Supported workflow

1. Save the image under `frontend/public/qbank/<SUBJECT_CODE>/images/`.
2. Use a descriptive, stable filename, for example:
   - `parasternal-long-axis.svg`
   - `doppler-angle-illustration.png`
   - `ch03-q014-explanation.png`
3. Prefer SVG for diagrams and PNG/JPEG/WebP for photographic or raster material.
4. Keep file sizes appropriate for web delivery; resize or optimize large images.
5. Avoid spaces, shell-sensitive characters, and ambiguous names.
6. Confirm the image is permitted for use and record attribution/source where required.
7. Reference it in JSON as:

```json
"image": "/qbank/DCS5000/images/parasternal-long-axis.svg"
```

8. If the image is explanatory rather than necessary to answer, use `explanationImage`.
9. Verify the image at the question’s normal and mobile layouts.

### Image quality and accessibility

- The image must be readable at the displayed size.
- Do not put essential answer text only inside an image.
- Provide a useful question stem/explanation so screen-reader users are not blocked.
- Use diagrams with clear labels and adequate contrast.
- Remove metadata that exposes private information.
- Do not hotlink external images.

### Replacing or removing an image

Keep the JSON path valid throughout the change. Add the replacement first, update JSON second, validate/build, and remove the old file only after no question references it. Search the entire QBank before deleting an image.

## Importing question sets

For large pasted MCQ sets, use `scripts/import_mcq_text.py` rather than hand-editing hundreds of objects.

1. Put raw source text in `scripts/raw/`.
2. Preserve the original source file; do not overwrite it with generated JSON.
3. Confirm the input includes questions, options, and an answer-key section in the importer’s supported format.
4. Run the importer with the correct subject, chapter, and title.
5. Inspect generated IDs, answers, explanations, and tags.
6. Run duplicate-ID, answer-range, JSON, and image validation.
7. Manually review a sample from the beginning, middle, and end of every imported set.
8. Review every parser warning or missing answer; never patch around an import error silently.

The importer writes to the historical `/app/frontend/...` path in its current form. On this Windows checkout, verify the script’s root path before using it; update the script or run it in the intended project environment rather than assuming the path is valid.

## Validation checklist

Before opening a pull request or deploying:

Run the automated validator from the `frontend` directory:

```powershell
npm run validate:qbank
```

You can also run it from the repository root:

```powershell
python scripts/validate_qbank.py
```

The command exits with a non-zero status when it finds invalid JSON, missing files, duplicate IDs, invalid answer indexes, malformed question fields, or broken local image references.

### Structural checks

- [ ] `index.json` is valid JSON.
- [ ] Every index subject has a matching subject folder and `subject.json`.
- [ ] Every subject chapter entry points to an existing chapter file.
- [ ] Every chapter `chapterId` and title are present.
- [ ] Every question has a unique ID across the entire catalog.
- [ ] Every question has 2–6 non-empty options.
- [ ] Every answer is an integer within the option range.
- [ ] Every image path points to an existing file.
- [ ] No question references a deleted image.

### Content checks

- [ ] Correct answers were independently checked.
- [ ] Explanations match the current options and answer.
- [ ] References are included where appropriate.
- [ ] Tags are intentional and use consistent section names.
- [ ] Images are legible, accessible, and permitted for use.
- [ ] Existing question IDs were not changed.

### Application checks

- [ ] `npm run build` succeeds.
- [ ] Subject catalog opens.
- [ ] The edited chapter opens in Study mode.
- [ ] The correct answer and explanation display correctly.
- [ ] The edited question appears in an exam.
- [ ] Images load on desktop and mobile widths.
- [ ] Wrong-answer recording still works.
- [ ] Existing progress behavior was not unintentionally changed.

## Release and rollback procedure

1. Create a focused branch or pull request.
2. Describe the subject, chapter, question range, source/review status, and image changes.
3. Run all validation and build checks.
4. Review the rendered questions in the local app.
5. Merge only after content and code review.
6. Let Cloudflare Pages deploy the preview.
7. Smoke-test the preview before production.
8. Record the release date and content range in the pull request or release notes.
9. If a defect is found, revert the focused commit or deploy the last known-good Pages build.
10. For a wrong answer already seen by learners, prefer a surgical correction that preserves the ID when the concept is unchanged; create a new ID when the concept materially changes.

## Future admin-panel content workflow

If content editing moves from Git files into the admin panel, preserve these invariants:

- draft → review → published states
- stable immutable question IDs
- revision history and author identity
- validation before publish
- image upload scanning and size limits
- alt text and attribution fields
- preview before release
- rollback to a prior published revision
- export back to the canonical JSON format
- audit log for every create, edit, publish, unpublish, and delete action

The admin panel must not bypass the same validation and review rules used for manual repository changes.

## Recommended content inventory

Maintain a generated inventory containing:

- subject code and title
- semester
- chapter ID and title
- question count
- tagged-section counts
- image count
- questions missing references
- questions missing explanations
- duplicate IDs
- invalid answer indexes

Regenerate it after significant content imports so gaps are visible before release.

## Troubleshooting

### A chapter shows zero questions unexpectedly

Check the browser network request for the chapter JSON, confirm the `file` value in `subject.json`, validate JSON syntax, and verify the file is under the exact subject folder. The loader historically treats chapter-load errors as empty chapters, so do not assume zero means intentionally empty.

### An answer is marked incorrectly

Check that `answer` is zero-based and that options were not reordered without updating it. Test the question in Study mode and in an exam with option shuffling enabled.

### An image does not load

Check capitalization, extension, and the `/qbank/<SUBJECT>/images/` prefix. Confirm the file is inside `frontend/public`; do not use a Windows filesystem path.

### Existing progress disappeared

Check whether a question ID changed. Progress is keyed by ID, so renaming an ID creates a new question from the learner’s perspective. Restore the original ID unless the content is intentionally a new question and a migration is planned.

## Ownership and change log

Every ongoing content process should identify:

- content owner/reviewer
- source/reference
- date added or changed
- reason for change
- validation/build result
- deployment or release identifier

This information can live in pull requests initially and can later be represented in the admin panel’s revision and audit tables.
