"""Creates the qbank folder skeleton. Never overwrites existing chapter files."""
import json
from pathlib import Path

ROOT = Path("/app/frontend/public/qbank")

SEMESTERS = [
    ("sem1", "Semester 1", [
        ("DCS5000", "DCS 5000", "Introduction to Echocardiography", ["History & Echo Modalities", "Standard Windows & Views", "Transducer Selection & Ergonomics", "Basic Image Optimization"]),
        ("DCS5002", "DCS 5002", "Cardiovascular Anatomy and Physiology", ["Cardiac Chambers & Walls", "Coronary Circulation", "Cardiac Cycle & Pressures", "Hemodynamics & Cardiac Output"]),
        ("DCS5003", "DCS 5003", "Congenital Heart Disease", ["Atrial Septal Defects", "Ventricular Septal Defects", "Patent Ductus Arteriosus", "Coarctation of the Aorta"]),
        ("DCS5004", "DCS 5004", "Physics and Instrumentation 1", ["Sound Waves & Attenuation", "Transducers", "Doppler Principles", "Color Doppler & Artifacts"]),
        ("DCS5005", "DCS 5005", "Cardiac Scanning 1", ["Parasternal Views", "Apical Views", "Subcostal & Suprasternal Views", "M-Mode Measurements"]),
        ("DCS5006", "DCS 5006", "Professional Practice", ["Ethics & Consent", "Scope of Practice", "Quality Assurance", "Ergonomics & Injury Prevention"]),
        ("IPE101", "IPE 101", "Interprofessional Education: Exploring Professional Roles and Responsibilities", ["Professional Roles", "Communication & Collaboration", "Patient Safety"]),
    ]),
    ("sem2", "Semester 2", [
        ("DCS5500", "DCS 5500", "ECG Interpretation", ["Normal ECG", "Arrhythmias", "Ischemia & Infarction", "Conduction Blocks"]),
        ("DCS5501", "DCS 5501", "Valvular Disease", ["Aortic Valve", "Mitral Valve", "Right-Sided Valves", "Prosthetic Valves"]),
        ("DCS5502", "DCS 5502", "Heart Function and Pathology", ["Systolic Function", "Diastolic Function", "Cardiomyopathies", "Pericardial Disease"]),
        ("DCS5503", "DCS 5503", "Congenital Heart Defects", ["Tetralogy of Fallot", "Transposition of Great Arteries", "Ebstein Anomaly", "Complex Defects"]),
        ("DCS5504", "DCS 5504", "Physics and Instrumentation 2", ["Tissue Doppler", "Strain Imaging", "3D Echo", "Bioeffects & Safety"]),
        ("DCS5505", "DCS 5505", "Cardiac Scanning 2", ["Doppler Quantification", "Contrast & Bubble Studies", "Stress Echo", "TEE"]),
        ("DCS5506", "DCS 5506", "Patient Care and Management", ["Patient Assessment", "Infection Control", "Emergency Response", "Patient Transfer"]),
    ]),
]


def main():
    index = {"version": 1, "semesters": []}
    for sem_id, sem_title, subjects in SEMESTERS:
        index["semesters"].append({"id": sem_id, "title": sem_title, "subjects": [s[0] for s in subjects]})
        for folder, code, title, chapters in subjects:
            d = ROOT / folder
            (d / "images").mkdir(parents=True, exist_ok=True)
            (d / "images" / ".gitkeep").touch()
            subj_file = d / "subject.json"
            if not subj_file.exists():
                subj = {
                    "id": folder, "code": code, "title": title, "semester": sem_id,
                    "chapters": [{"id": f"ch{i:02d}", "title": t, "file": f"ch{i:02d}.json"} for i, t in enumerate(chapters, 1)],
                }
                subj_file.write_text(json.dumps(subj, indent=2) + "\n")
            for i, t in enumerate(chapters, 1):
                f = d / f"ch{i:02d}.json"
                if not f.exists():
                    f.write_text(json.dumps({"chapterId": f"ch{i:02d}", "title": t, "questions": []}, indent=2) + "\n")
    (ROOT / "index.json").write_text(json.dumps(index, indent=2) + "\n")


if __name__ == "__main__":
    main()
