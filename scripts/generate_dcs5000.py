"""Generate DCS5000 (Introduction to Echocardiography) QBank chapters.

Parses all 9 markdown review modules into valid JSON files for:
  frontend/public/qbank/DCS5000/ch01.json ... ch09.json
  frontend/public/qbank/DCS5000/subject.json
"""
import json
import os
import re

FILE_MAP = {
    'ch01': ('media_1794504673865_3211f53a.md', 'Basic Echo Principles', ['Basic Echo Principles', 'Echocardiography Fundamentals']),
    'ch02': ('media_1794504673876_2fec81af.md', 'Optimization & Parasternal Window', ['Image Optimization', 'Parasternal Window', 'Echocardiography Views']),
    'ch03': ('media_1794504673882_a61765ef.md', 'Wall Segments & Apical Window', ['Wall Segments', 'Apical Window', 'Left Ventricular Anatomy']),
    'ch04': ('media_1794504673885_05a6a298.md', 'Subcostal & Suprasternal Windows', ['Subcostal Window', 'Suprasternal Window', 'Echocardiography Windows']),
    'ch05': ('media_1794504673898_a6635d8b.md', 'M-Mode', ['M-Mode', 'Echocardiography Modalities', 'Measurements']),
    'ch06': ('media_1794504673900_5630ffee.md', 'Measurements', ['Measurements', 'Cardiac Dimensions', 'Echocardiography Quantification']),
    'ch07': ('media_1794504673903_b6489669.md', 'Indications & Quality Assurance', ['Indications', 'Quality Assurance', 'Echocardiography Protocol']),
    'ch08': ('media_1794504673917_1fea9c9b.md', 'Doppler Types, Instrumentation & Optimization', ['Doppler Types', 'Instrumentation', 'Doppler Optimization']),
    'ch09': ('media_1794504673936_1c81539d.md', 'Normal Doppler Patterns', ['Normal Doppler Patterns', 'Hemodynamics', 'Spectral Doppler']),
}

USER_UP = r'C:/Users/drhim/.gemini/antigravity/brain/c784a732-0fb4-42c3-acbd-e0cf3c5cafd0/.user_uploaded'
OUT_DIR = r'frontend/public/qbank/DCS5000'

ANS_PATTERN = re.compile(r'^\*\*(\d+)\.\s+([A-D])\s*[—–-]\s*(.*?)\.\*\*\s*(.*?)(?=^\*\*\d+\.|\Z)', re.M | re.S)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    chapters_meta = []
    total_q = 0

    for ch_id, (fname, title, tags) in FILE_MAP.items():
        src_path = os.path.join(USER_UP, fname)
        with open(src_path, 'r', encoding='utf-8') as f:
            content = f.read()

        if ch_id == 'ch09':
            content = content.replace('(value missing in source)', '2.0 m/s')

        parts = re.split(r'##\s+Answer Key and Explanations', content, flags=re.I)
        if len(parts) < 2:
            raise ValueError(f"Could not split questions and answers in {fname}")

        answers = {}
        for m in ANS_PATTERN.finditer(parts[1]):
            qnum = int(m.group(1))
            letter = m.group(2).upper()
            opt_text = m.group(3).strip()
            exp = m.group(4).strip()
            answers[qnum] = (letter, opt_text, exp)

        q_blocks = re.split(r'^###\s+Question\s+(\d+)', parts[0], flags=re.M)
        ch_questions = []

        for i in range(1, len(q_blocks), 2):
            qnum = int(q_blocks[i])
            body = q_blocks[i + 1]
            lines = body.split('\n')
            stem_lines = []
            raw_opts = {}
            for line in lines:
                opt_m = re.match(r'^\s*[-*]\s+\*\*([A-D])\.\*\*\s*(.*)', line)
                if opt_m:
                    raw_opts[opt_m.group(1).upper()] = opt_m.group(2).strip()
                elif not raw_opts:
                    stem_lines.append(line)
            stem = '\n'.join(stem_lines).strip()

            valid_opts = []
            letter_to_valid_idx = {}
            for l in ['A', 'B', 'C', 'D']:
                val = raw_opts.get(l, '').strip()
                if val:
                    letter_to_valid_idx[l] = len(valid_opts)
                    valid_opts.append(val)

            ans_letter, opt_text, exp = answers[qnum]
            if ans_letter not in letter_to_valid_idx:
                raise ValueError(f"{ch_id} Q{qnum}: answer letter {ans_letter} not found in valid options!")

            ans_idx = letter_to_valid_idx[ans_letter]
            qid = f"DCS5000-{ch_id}-q{qnum:03d}"

            q_obj = {
                "id": qid,
                "stem": stem,
                "image": None,
                "options": valid_opts,
                "answer": ans_idx,
                "explanation": exp,
                "explanationImage": None,
                "tags": tags,
                "reference": ""
            }
            ch_questions.append(q_obj)

        if len(ch_questions) != 200:
            raise ValueError(f"{ch_id}: expected 200 questions, got {len(ch_questions)}")

        out_ch_path = os.path.join(OUT_DIR, f"{ch_id}.json")
        ch_data = {
            "subjectId": "DCS5000",
            "chapterId": ch_id,
            "title": title,
            "questions": ch_questions
        }
        with open(out_ch_path, 'w', encoding='utf-8') as f:
            json.dump(ch_data, f, indent=2, ensure_ascii=False)
            f.write('\n')

        chapters_meta.append({
            "id": ch_id,
            "title": title,
            "file": f"{ch_id}.json"
        })
        total_q += len(ch_questions)
        print(f"Generated {out_ch_path} with {len(ch_questions)} questions.")

    subject_data = {
        "id": "DCS5000",
        "code": "DCS 5000",
        "title": "Introduction to Echocardiography",
        "semester": "sem1",
        "chapters": chapters_meta
    }
    subj_path = os.path.join(OUT_DIR, "subject.json")
    with open(subj_path, 'w', encoding='utf-8') as f:
        json.dump(subject_data, f, indent=2, ensure_ascii=False)
        f.write('\n')

    print(f"Generated {subj_path} with {len(chapters_meta)} chapters.")
    print(f"Total DCS5000 questions: {total_q}")


if __name__ == '__main__':
    main()
