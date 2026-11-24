"""Generate DCS5004 Modules 9 & 10 QBank chapters.

Parses:
  Lecture 9 (140 MCQs) -> frontend/public/qbank/DCS5004/ch09.json
  Lecture 10 (140 MCQs) -> frontend/public/qbank/DCS5004/ch10.json
Updates:
  frontend/public/qbank/DCS5004/subject.json
"""
import json
import os
import re

USER_UP = r'C:/Users/drhim/.gemini/antigravity/brain/c784a732-0fb4-42c3-acbd-e0cf3c5cafd0/.user_uploaded'
OUT_DIR = r'frontend/public/qbank/DCS5004'


def parse_lecture9():
    path = os.path.join(USER_UP, 'media_1795502700070_5e4ee25c.md')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    body = re.split(r'##\s+Quick answer key', content, flags=re.I)[0]
    q_blocks = re.split(r'^###\s+Question\s+(\d+)', body, flags=re.M)

    questions = []
    for i in range(1, len(q_blocks), 2):
        qnum = int(q_blocks[i])
        qtext = q_blocks[i + 1].strip()

        ans_m = re.search(r'\*\*Correct answer:\s*([A-D])(?:\.\s*(.*?))?\*\*', qtext)
        if not ans_m:
            raise ValueError(f"Lec9 Q{qnum}: correct answer not found")

        ans_letter = ans_m.group(1).upper()
        top_part = qtext[:ans_m.start()].strip()
        bottom_part = qtext[ans_m.end():].strip()

        # Parse options
        lines = top_part.split('\n')
        stem_lines = []
        options = {}
        for line in lines:
            opt_m = re.match(r'^\s*[-*]\s*([A-D])\.\s*(.*)', line)
            if opt_m:
                options[opt_m.group(1).upper()] = opt_m.group(2).strip()
            elif not options:
                stem_lines.append(line)
        stem = '\n'.join(stem_lines).strip()

        if len(options) != 4:
            raise ValueError(f"Lec9 Q{qnum}: expected 4 options, got {len(options)}")

        # Parse explanation from bottom_part
        exp_bullets = re.findall(
            r'[-*]\s+\*\*([A-D])\s*[—–-]\s*(Correct|Incorrect):\*\*\s*(.*?)(?=\n\s*[-*]|\Z)',
            bottom_part,
            re.S
        )

        correct_exp = ''
        other_exps = []
        for letter, status, text in exp_bullets:
            text = text.strip()
            if status.lower() == 'correct' or letter == ans_letter:
                correct_exp = text
            else:
                other_exps.append(f"- **{letter}:** {text}")

        if correct_exp and other_exps:
            full_exp = f"{correct_exp}\n\n**Distractor rationales:**\n" + '\n'.join(other_exps)
        elif correct_exp:
            full_exp = correct_exp
        else:
            full_exp = bottom_part.strip()

        qid = f"DCS5004-ch09-q{qnum:03d}"
        opt_list = [options['A'], options['B'], options['C'], options['D']]
        ans_idx = ord(ans_letter) - ord('A')

        questions.append({
            "id": qid,
            "stem": stem,
            "image": None,
            "options": opt_list,
            "answer": ans_idx,
            "explanation": full_exp,
            "explanationImage": None,
            "tags": [
                "Sound-Beam Formation",
                "Focusing and Control",
                "Beam Geometry"
            ],
            "reference": ""
        })

    if len(questions) != 140:
        raise ValueError(f"Lec9: expected 140 questions, got {len(questions)}")

    return {
        "subjectId": "DCS5004",
        "chapterId": "ch09",
        "title": "Module 9: Sound-Beam Formation, Focusing, and Control",
        "questions": questions
    }


def parse_lecture10():
    path = os.path.join(USER_UP, 'media_1795502713385_6a91c353.md')
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    q_blocks = re.split(r'^###\s+Q(\d+)\b', content, flags=re.M)

    questions = []
    for i in range(1, len(q_blocks), 2):
        qnum = int(q_blocks[i])
        qtext = q_blocks[i + 1].strip()

        # Truncate section headers or answer key table at the end of block
        trunc_match = re.search(r'\n##\s+|\n###\s+Answer Key', qtext, flags=re.I)
        if trunc_match:
            qtext = qtext[:trunc_match.start()].strip()

        ans_m = re.search(r'\*\*Answer:\s*([A-D])\b\**', qtext)
        if not ans_m:
            raise ValueError(f"Lec10 Q{qnum}: answer not found")

        ans_letter = ans_m.group(1).upper()
        top_part = qtext[:ans_m.start()].strip()
        bottom_part = qtext[ans_m.end():].strip()

        # Parse options
        lines = top_part.split('\n')
        stem_lines = []
        options = {}
        for line in lines:
            opt_m = re.match(r'^\s*[-*]\s*([A-D])\.\s*(.*)', line)
            if opt_m:
                options[opt_m.group(1).upper()] = opt_m.group(2).strip()
            elif not options:
                stem_lines.append(line)
        stem = '\n'.join(stem_lines).strip()

        if len(options) != 4:
            raise ValueError(f"Lec10 Q{qnum}: expected 4 options, got {len(options)}")

        # Format explanation
        exp = bottom_part.strip()
        exp = re.sub(r'---\s*$', '', exp).strip()

        qid = f"DCS5004-ch10-q{qnum:03d}"
        opt_list = [options['A'], options['B'], options['C'], options['D']]
        ans_idx = ord(ans_letter) - ord('A')

        questions.append({
            "id": qid,
            "stem": stem,
            "image": None,
            "options": opt_list,
            "answer": ans_idx,
            "explanation": exp,
            "explanationImage": None,
            "tags": [
                "Ultrasound Resolution",
                "Instrumentation",
                "Image Optimization"
            ],
            "reference": ""
        })

    if len(questions) != 140:
        raise ValueError(f"Lec10: expected 140 questions, got {len(questions)}")

    return {
        "subjectId": "DCS5004",
        "chapterId": "ch10",
        "title": "Module 10: Ultrasound Resolution, Instrumentation, and Image Optimization",
        "questions": questions
    }


def main():
    ch9_data = parse_lecture9()
    ch10_data = parse_lecture10()

    ch9_path = os.path.join(OUT_DIR, 'ch09.json')
    with open(ch9_path, 'w', encoding='utf-8') as f:
        json.dump(ch9_data, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f"Written {ch9_path} with {len(ch9_data['questions'])} questions.")

    ch10_path = os.path.join(OUT_DIR, 'ch10.json')
    with open(ch10_path, 'w', encoding='utf-8') as f:
        json.dump(ch10_data, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f"Written {ch10_path} with {len(ch10_data['questions'])} questions.")

    # Update subject.json
    subj_path = os.path.join(OUT_DIR, 'subject.json')
    with open(subj_path, 'r', encoding='utf-8') as f:
        subj = json.load(f)

    existing_ids = {c['id'] for c in subj['chapters']}
    if 'ch09' not in existing_ids:
        subj['chapters'].append({
            "id": "ch09",
            "title": "Module 9: Sound-Beam Formation, Focusing, and Control",
            "file": "ch09.json"
        })
    if 'ch10' not in existing_ids:
        subj['chapters'].append({
            "id": "ch10",
            "title": "Module 10: Ultrasound Resolution, Instrumentation, and Image Optimization",
            "file": "ch10.json"
        })

    with open(subj_path, 'w', encoding='utf-8') as f:
        json.dump(subj, f, indent=2, ensure_ascii=False)
        f.write('\n')
    print(f"Updated {subj_path} (now {len(subj['chapters'])} chapters).")


if __name__ == '__main__':
    main()
