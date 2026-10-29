import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "frontend" / "public" / "qbank" / "DCS5006"

MODULES = [
    {
        "file": "DCS5006_Module1.md",
        "chapter_id": "ch01",
        "title": "Module 1: The Profession and Sonographer's Role",
    },
    {
        "file": "DCS5006_Module2.md",
        "chapter_id": "ch02",
        "title": "Module 2: Professional Accountability, Regulation & Standards",
    },
    {
        "file": "DCS5006_Module3.md",
        "chapter_id": "ch03",
        "title": "Module 3: Legal Responsibilities – Privacy, Documentation & Consent",
    },
    {
        "file": "DCS5006_Module4.md",
        "chapter_id": "ch04",
        "title": "Module 4: Boundaries, Adverse Events & Ethical Decision-Making",
    },
    {
        "file": "DCS5006_Module5.md",
        "chapter_id": "ch05",
        "title": "Module 5: Healthcare Team, Escalation & Conflict Resolution",
    },
]

def clean_section(title):
    title = re.sub(r"^##\s+Section\s+[A-Z]\s*[\-–—:]\s*", "", title)
    title = re.sub(r"\s*\([Qq]uestions?.*?\)\s*$", "", title)
    return title.strip()

def parse_module(raw_path, chapter_id):
    text = Path(raw_path).read_text(encoding="utf-8")
    lines = text.splitlines()

    # Pre-map sections by line or scan
    # Let's map question numbers to their section
    q_to_section = {}
    current_sec = "General"
    for line in lines:
        if re.match(r"^##\s+Section\s+[A-Z]", line):
            current_sec = clean_section(line)
        qm = re.match(r"^###\s+Question\s+(\d+)", line)
        if qm:
            q_to_section[int(qm.group(1))] = current_sec

    # Split into question blocks
    parts = re.split(r"###\s+Question\s+(\d+)", text)
    questions = []

    for i in range(1, len(parts), 2):
        q_num = int(parts[i])
        body = parts[i + 1]

        # Extract answer letter
        ans_m = re.search(r"\*\*Answer:\s*([A-H])\*\*", body)
        if not ans_m:
            raise ValueError(f"Missing answer for Q{q_num} in {raw_path}")
        ans_letter = ans_m.group(1).upper()
        ans_idx = ord(ans_letter) - ord("A")

        # Extract explanation
        expl_m = re.search(r"\*\*Explanation:\*\*\s*(.*?)(?=\n---\s*|\Z)", body, re.S)
        if not expl_m:
            raise ValueError(f"Missing explanation for Q{q_num} in {raw_path}")
        explanation = expl_m.group(1).strip()

        # Find option start
        opt_start = re.search(r"^[-\*]?\s*[A-H][\)\.]\s+", body, re.M)
        if not opt_start:
            raise ValueError(f"Missing options start for Q{q_num} in {raw_path}")

        # Stem is before options
        stem = body[:opt_start.start()].strip()

        # Options
        # Options are between opt_start and **Answer:
        ans_start = body.find("**Answer:")
        options_text = body[opt_start.start():ans_start]
        options = []
        for opt_m in re.finditer(r"^[-\*]?\s*[A-H][\)\.]\s+(.*)$", options_text, re.M):
            opt_str = opt_m.group(1).strip()
            options.append(opt_str)

        if not (2 <= len(options) <= 6):
            raise ValueError(f"Invalid option count ({len(options)}) for Q{q_num} in {raw_path}")

        if ans_idx < 0 or ans_idx >= len(options):
            raise ValueError(f"Answer index {ans_idx} out of range for Q{q_num} in {raw_path}")

        sec_tag = q_to_section.get(q_num, "General")

        q_obj = {
            "id": f"DCS5006-{chapter_id}-q{q_num:03d}",
            "stem": stem,
            "image": None,
            "options": options,
            "answer": ans_idx,
            "explanation": explanation,
            "explanationImage": None,
            "tags": [sec_tag],
            "reference": "",
        }
        questions.append(q_obj)

    return questions

def main():
    ROOT.mkdir(parents=True, exist_ok=True)
    images_dir = ROOT / "images"
    images_dir.mkdir(parents=True, exist_ok=True)
    gitkeep = images_dir / ".gitkeep"
    if not gitkeep.exists():
        gitkeep.touch()

    chapters_summary = []
    total_questions = 0

    for mod in MODULES:
        raw_file = Path(__file__).resolve().parent / "raw" / mod["file"]
        ch_id = mod["chapter_id"]
        title = mod["title"]
        file_name = f"{ch_id}.json"

        questions = parse_module(raw_file, ch_id)
        total_questions += len(questions)
        print(f"Parsed {len(questions)} questions for {ch_id} ({title})")

        ch_data = {
            "chapterId": ch_id,
            "title": title,
            "questions": questions,
        }
        ch_file_path = ROOT / file_name
        ch_file_path.write_text(json.dumps(ch_data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

        chapters_summary.append({
            "id": ch_id,
            "title": title,
            "file": file_name,
        })

    subject_data = {
        "id": "DCS5006",
        "code": "DCS 5006",
        "title": "Professional Practice",
        "semester": "sem1",
        "chapters": chapters_summary,
    }
    subj_file_path = ROOT / "subject.json"
    subj_file_path.write_text(json.dumps(subject_data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote subject.json with {len(chapters_summary)} chapters and total {total_questions} questions!")

if __name__ == "__main__":
    main()

