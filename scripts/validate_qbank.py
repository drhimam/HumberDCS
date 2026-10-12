"""Validate the static QBank catalog and all referenced assets.

Usage:
    python scripts/validate_qbank.py
    python scripts/validate_qbank.py --root frontend/public/qbank
"""
import argparse
import json
import sys
from pathlib import Path


REQUIRED_QUESTION_FIELDS = ("id", "stem", "options", "answer", "explanation")


class Validator:
    def __init__(self, root):
        self.root = root
        self.errors = []
        self.warnings = []
        self.question_ids = {}
        self.subject_ids = set()

    def error(self, path, message):
        self.errors.append(f"{path}: {message}")

    def warning(self, path, message):
        self.warnings.append(f"{path}: {message}")

    def load_json(self, path):
        try:
            with path.open(encoding="utf-8") as handle:
                return json.load(handle)
        except FileNotFoundError:
            self.error(path, "file does not exist")
        except json.JSONDecodeError as exc:
            self.error(path, f"invalid JSON ({exc.msg} at line {exc.lineno}, column {exc.colno})")
        except OSError as exc:
            self.error(path, f"could not read file ({exc})")
        return None

    def require_string(self, value, path, field):
        if not isinstance(value, str) or not value.strip():
            self.error(path, f"{field} must be a non-empty string")

    def validate_image(self, value, path, field, subject_dir):
        if value is None:
            return
        if not isinstance(value, str) or not value.strip():
            self.error(path, f"{field} must be null or a non-empty string")
            return
        prefix = f"/qbank/{subject_dir.name}/images/"
        if not value.startswith(prefix):
            self.error(path, f"{field} must start with {prefix!r}")
            return
        relative = value[len("/qbank/") :]
        asset = self.root / relative
        if not asset.is_file():
            self.error(path, f"{field} references missing file {value!r}")

    def validate_question(self, question, path, subject_dir, chapter_id):
        if not isinstance(question, dict):
            self.error(path, "question must be an object")
            return

        for field in REQUIRED_QUESTION_FIELDS:
            if field not in question:
                self.error(path, f"missing required field {field!r}")

        question_id = question.get("id")
        if not isinstance(question_id, str) or not question_id.strip():
            self.error(path, "id must be a non-empty string")
        elif question_id in self.question_ids:
            self.error(path, f"duplicate question id {question_id!r}; first seen at {self.question_ids[question_id]}")
        else:
            self.question_ids[question_id] = path

        self.require_string(question.get("stem"), path, "stem")
        self.require_string(question.get("explanation"), path, "explanation")

        options = question.get("options")
        if not isinstance(options, list):
            self.error(path, "options must be an array")
        else:
            if not 2 <= len(options) <= 6:
                self.error(path, "options must contain between 2 and 6 items")
            for index, option in enumerate(options):
                if not isinstance(option, str) or not option.strip():
                    self.error(path, f"options[{index}] must be a non-empty string")
            normalized = [option.strip().casefold() for option in options if isinstance(option, str)]
            if len(normalized) != len(set(normalized)):
                self.error(path, "options must not contain duplicate values")

        answer = question.get("answer")
        if isinstance(answer, bool) or not isinstance(answer, int):
            self.error(path, "answer must be an integer option index")
        elif isinstance(options, list) and not 0 <= answer < len(options):
            self.error(path, f"answer {answer} is outside the option range")

        for field in ("image", "explanationImage"):
            self.validate_image(question.get(field), path, field, subject_dir)

        tags = question.get("tags", [])
        if not isinstance(tags, list) or any(not isinstance(tag, str) or not tag.strip() for tag in tags):
            self.error(path, "tags must be an array of non-empty strings")

        if question_id and isinstance(question_id, str):
            expected_prefix = f"{subject_dir.name}-{chapter_id}-"
            if not question_id.startswith(expected_prefix):
                self.warning(path, f"id does not start with expected prefix {expected_prefix!r}")

    def validate_chapter(self, subject_dir, chapter_entry):
        entry_path = subject_dir / "subject.json"
        if not isinstance(chapter_entry, dict):
            self.error(entry_path, "chapter entry must be an object")
            return
        chapter_id = chapter_entry.get("id")
        chapter_file = chapter_entry.get("file")
        self.require_string(chapter_id, entry_path, "chapter id")
        self.require_string(chapter_entry.get("title"), entry_path, "chapter title")
        self.require_string(chapter_file, entry_path, "chapter file")
        if not isinstance(chapter_id, str) or not isinstance(chapter_file, str):
            return

        chapter_path = subject_dir / chapter_file
        chapter = self.load_json(chapter_path)
        if chapter is None:
            return
        if not isinstance(chapter, dict):
            self.error(chapter_path, "chapter must be an object")
            return
        if chapter.get("chapterId") != chapter_id:
            self.error(chapter_path, f"chapterId must be {chapter_id!r}")
        if chapter.get("title") != chapter_entry.get("title"):
            self.error(chapter_path, "title must match the subject chapter entry")

        questions = chapter.get("questions")
        if not isinstance(questions, list):
            self.error(chapter_path, "questions must be an array")
            return
        for index, question in enumerate(questions):
            self.validate_question(question, f"{chapter_path}#questions[{index}]", subject_dir, chapter_id)

    def validate_subject(self, subject_id):
        subject_dir = self.root / subject_id
        subject_path = subject_dir / "subject.json"
        if not subject_dir.is_dir():
            self.error(subject_dir, "subject directory does not exist")
            return
        subject = self.load_json(subject_path)
        if not isinstance(subject, dict):
            return
        for field in ("id", "code", "title", "semester", "chapters"):
            if field not in subject:
                self.error(subject_path, f"missing required field {field!r}")
        if subject.get("id") != subject_id:
            self.error(subject_path, f"id must match catalog subject id {subject_id!r}")
        chapters = subject.get("chapters")
        if not isinstance(chapters, list):
            self.error(subject_path, "chapters must be an array")
            return
        seen_chapters = set()
        for chapter in chapters:
            chapter_id = chapter.get("id") if isinstance(chapter, dict) else None
            if chapter_id in seen_chapters:
                self.error(subject_path, f"duplicate chapter id {chapter_id!r}")
            seen_chapters.add(chapter_id)
            self.validate_chapter(subject_dir, chapter)

    def run(self):
        index_path = self.root / "index.json"
        index = self.load_json(index_path)
        if not isinstance(index, dict):
            return
        semesters = index.get("semesters")
        if not isinstance(semesters, list):
            self.error(index_path, "semesters must be an array")
            return

        for semester in semesters:
            if not isinstance(semester, dict):
                self.error(index_path, "each semester must be an object")
                continue
            subject_ids = semester.get("subjects")
            if not isinstance(subject_ids, list):
                self.error(index_path, "semester subjects must be an array")
                continue
            for subject_id in subject_ids:
                if not isinstance(subject_id, str) or not subject_id.strip():
                    self.error(index_path, "subject ids must be non-empty strings")
                    continue
                if subject_id in self.subject_ids:
                    self.error(index_path, f"duplicate subject id {subject_id!r}")
                self.subject_ids.add(subject_id)
                self.validate_subject(subject_id)

        known_dirs = {
            path.name
            for path in self.root.iterdir()
            if path.is_dir() and path.name != "images"
        }
        for subject_id in sorted(known_dirs - self.subject_ids):
            self.warning(self.root, f"subject directory {subject_id!r} is not listed in index.json")


def main():
    parser = argparse.ArgumentParser(description="Validate the DCSQbank static QBank.")
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parents[1] / "frontend" / "public" / "qbank",
        help="QBank root directory (default: frontend/public/qbank)",
    )
    args = parser.parse_args()
    validator = Validator(args.root.resolve())
    if not validator.root.is_dir():
        print(f"ERROR: QBank root does not exist: {validator.root}", file=sys.stderr)
        return 2

    validator.run()
    for warning in validator.warnings:
        print(f"WARNING: {warning}")
    for error in validator.errors:
        print(f"ERROR: {error}")

    question_count = len(validator.question_ids)
    subject_count = len(validator.subject_ids)
    print(f"Checked {subject_count} subjects and {question_count} questions.")
    if validator.errors:
        print(f"Validation failed with {len(validator.errors)} error(s).", file=sys.stderr)
        return 1
    print("Validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
