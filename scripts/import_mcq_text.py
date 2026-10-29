"""Convert pasted MCQ text (questions + 'Answer Key' section) into a chapter JSON.

Usage: python3 import_mcq_text.py <raw1.txt[,raw2.txt,...]> <FOLDER> <chapterId> "<Chapter title>"
Multiple raw files are appended in order with continuous question numbering.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path("/app/frontend/public/qbank")
if not ROOT.exists():
    ROOT = Path(__file__).resolve().parent.parent / "frontend" / "public" / "qbank"


def parse(text):
    body, key = re.split(r"^.*Answer Key.*$", text, maxsplit=1, flags=re.M)
    answers = {}
    for m in re.finditer(r"^(\d+)\.\s*([A-H])\s*[:.\-–]\s*(.*)$", key, re.M):
        answers[int(m.group(1))] = (ord(m.group(2)) - 65, m.group(3).strip())
    questions, section, cur = [], None, None
    for line in body.splitlines():
        line = line.strip()
        if not line:
            continue
        if sm := re.match(r"^Section\s+\d+\s*:\s*(.+?)(\s*\(Q.*\))?$", line):
            section = sm.group(1).strip()
        elif qm := re.match(r"^(\d+)\.\s+(.*)$", line):
            cur = {"n": int(qm.group(1)), "stem": qm.group(2), "options": [], "section": section}
            questions.append(cur)
        elif (om := re.match(r"^([A-H])[.)]\s+(.*)$", line)) and cur:
            cur["options"].append(om.group(2))
        elif cur and not cur["options"]:
            cur["stem"] += "\n" + line
    return questions, answers


def main(raws, folder, ch, title):
    out = []
    for raw in raws.split(","):
        out.extend(build(raw, folder, ch, len(out)))
    write(out, folder, ch, title)


def build(raw, folder, ch, offset):
    questions, answers = parse(Path(raw).read_text())
    out = []
    for q in questions:
        if q["n"] not in answers:
            sys.exit(f"{raw}: missing answer for Q{q['n']}")
        ans, expl = answers[q["n"]]
        if ans >= len(q["options"]):
            sys.exit(f"{raw}: answer out of range for Q{q['n']}")
        out.append({
            "id": f"{folder}-{ch}-q{offset + q['n']:03d}", "stem": q["stem"], "image": None, "options": q["options"],
            "answer": ans, "explanation": expl, "explanationImage": None,
            "tags": [q["section"]] if q["section"] else [], "reference": "",
        })
    return out


def write(out, folder, ch, title):
    path = ROOT / folder / f"{ch}.json"
    path.write_text(json.dumps({"chapterId": ch, "title": title, "questions": out}, indent=2, ensure_ascii=False) + "\n")
    subj_path = ROOT / folder / "subject.json"
    subj = json.loads(subj_path.read_text())
    entry = next((c for c in subj["chapters"] if c["id"] == ch), None)
    if entry:
        entry["title"] = title
    else:
        subj["chapters"].append({"id": ch, "title": title, "file": f"{ch}.json"})
    subj_path.write_text(json.dumps(subj, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {len(out)} questions to {path}")


if __name__ == "__main__":
    main(*sys.argv[1:5])
