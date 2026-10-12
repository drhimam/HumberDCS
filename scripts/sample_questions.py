"""Writes sample questions for DCS5000 and DCS5002."""
import json
from pathlib import Path

ROOT = Path("/app/frontend/public/qbank")


def q(qid, stem, options, answer, explanation, image=None, explanation_image=None, tags=None):
    return {"id": qid, "stem": stem, "image": image, "options": options, "answer": answer,
            "explanation": explanation, "explanationImage": explanation_image, "tags": tags or [], "reference": ""}


DATA = {
    "DCS5000": {
        "ch01": [
            q("DCS5000-ch01-q001", "Which echocardiographic modality displays motion of structures along a single scan line over time?",
              ["2D (B-mode) imaging", "M-mode", "Color Doppler", "Pulsed-wave Doppler"], 1,
              "M-mode (motion mode) samples a single ultrasound line and plots depth against time. Its very high temporal resolution makes it ideal for timing rapid valve and wall motion.\n\n2D imaging shows anatomy in a plane, and the Doppler modalities show blood flow velocity, not structure motion along one line.", tags=["modalities"]),
            q("DCS5000-ch01-q002", "A transesophageal echocardiogram (TEE) is preferred over transthoracic echo (TTE) mainly when evaluating:",
              ["Pericardial effusion", "Left atrial appendage thrombus", "Left ventricular wall thickness", "Inferior vena cava size"], 1,
              "The left atrial appendage is posterior and close to the esophagus, so TEE shows it clearly. TTE often cannot rule out an appendage thrombus. The other choices are routinely assessed with TTE.", tags=["TEE"]),
            q("DCS5000-ch01-q003", "Which Doppler modality can measure very high velocities without aliasing but cannot locate where along the beam the velocity occurs?",
              ["Pulsed-wave Doppler", "Color flow Doppler", "Continuous-wave Doppler", "Tissue Doppler imaging"], 2,
              "Continuous-wave (CW) Doppler transmits and receives continuously using separate crystals, so it has no Nyquist limit. The trade-off is range ambiguity: it cannot tell the depth where the peak velocity came from.", tags=["doppler"]),
            q("DCS5000-ch01-q004", "Stress echocardiography is primarily used to detect:",
              ["Congenital shunts", "Inducible myocardial ischemia", "Valve vegetations", "Aortic dissection"], 1,
              "Stress echo compares wall motion at rest and under stress (exercise or dobutamine). A new or worsening regional wall motion abnormality under stress suggests inducible ischemia.", tags=["stress echo"]),
        ],
        "ch02": [
            q("DCS5000-ch02-q001", "The schematic shows a standard transthoracic view. Which view is it?",
              ["Parasternal long axis", "Apical four-chamber", "Subcostal short axis", "Suprasternal notch"], 1,
              "The apical four-chamber view shows all four chambers at once: the ventricles at the top (near the apex) and the atria at the bottom. The interventricular and interatrial septa run vertically down the middle of the image.",
              image="/qbank/DCS5000/images/a4c-schematic.svg", tags=["views"]),
            q("DCS5000-ch02-q002", "In the parasternal long-axis view, which cardiac structure lies closest to the transducer (top of the image)?",
              ["Left atrium", "Descending aorta", "Right ventricular outflow tract / RV free wall", "Left ventricular posterior wall"], 2,
              "The right ventricle is anterior, so it sits nearest the transducer at the top of the image. Moving deeper you see the septum, the LV cavity, and then the posterior wall. The LA and descending aorta are posterior.", tags=["PLAX"]),
            q("DCS5000-ch02-q003", "The suprasternal notch window is best used to evaluate:",
              ["Mitral valve leaflets", "Aortic arch and its branches", "Tricuspid regurgitation", "Interatrial septum"], 1,
              "From the suprasternal notch, the beam is aimed down at the aortic arch. This shows the ascending aorta, arch, descending aorta, and the origins of the great vessels. It is key for assessing coarctation.", tags=["SSN"]),
            q("DCS5000-ch02-q004", "Which window is often the best choice for a patient with COPD and hyperinflated lungs?",
              ["Parasternal", "Apical", "Subcostal", "Right parasternal"], 2,
              "In hyperinflated lungs, the heart sits lower and the lungs cover the parasternal and apical windows. The subcostal window uses the liver as an acoustic window, so it often gives the best images in COPD patients.", tags=["windows"]),
        ],
        "ch03": [
            q("DCS5000-ch03-q001", "Adult transthoracic echocardiography is most commonly performed with a transducer of which type?",
              ["Linear array", "Phased array", "Curvilinear array", "Annular array"], 1,
              "A phased-array transducer has a small footprint that fits between the ribs. It electronically steers a sector-shaped beam, which makes it the standard probe for cardiac imaging.", tags=["transducers"]),
            q("DCS5000-ch03-q002", "Compared with a 2.5 MHz transducer, a 5 MHz transducer provides:",
              ["Better penetration and worse resolution", "Better resolution and less penetration", "Better resolution and better penetration", "No change in resolution"], 1,
              "Higher frequency means a shorter wavelength, which improves axial resolution. However, attenuation also rises with frequency, so penetration decreases. This is why pediatric echo uses higher frequencies than adult echo.", tags=["frequency"]),
            q("DCS5000-ch03-q003", "Which practice best reduces a sonographer's risk of work-related musculoskeletal disorders?",
              ["Abducting the scanning arm beyond 90 degrees", "Applying sustained heavy probe pressure", "Adjusting bed and chair height so the arm stays close to the body", "Twisting the neck to view the monitor"], 2,
              "Neutral posture is key. Keep the arm abducted less than about 30 degrees, adjust the equipment height, and place the monitor directly in front of you. These steps reduce shoulder, neck, and wrist strain.", tags=["ergonomics"]),
        ],
        "ch04": [
            q("DCS5000-ch04-q001", "Increasing the overall gain affects the image by:",
              ["Increasing transmitted acoustic power", "Amplifying all received echoes equally", "Improving axial resolution", "Changing the frame rate"], 1,
              "Gain is a receiver function. It amplifies all returning signals equally, making the whole image brighter. It does not change output power, so patient exposure stays the same.", tags=["knobology"]),
            q("DCS5000-ch04-q002", "Time gain compensation (TGC) is used to correct for:",
              ["Refraction artifacts", "Attenuation with depth", "Doppler aliasing", "Low frame rate"], 1,
              "Echoes from deeper structures are weaker because of attenuation. TGC applies more amplification at greater depths, so similar tissues look equally bright from top to bottom.", tags=["TGC"]),
            q("DCS5000-ch04-q003", "Which adjustment will increase the 2D frame rate?",
              ["Increasing the imaging depth", "Widening the sector", "Narrowing the sector width", "Adding more focal zones"], 2,
              "Frame rate depends on how many scan lines are needed and how long each takes. A narrower sector, shallower depth, and fewer focal zones all increase the frame rate.", tags=["temporal resolution"]),
            q("DCS5000-ch04-q004", "Where should the transmit focal zone be placed for best lateral resolution of a structure?",
              ["Well above the structure", "At or slightly below the level of the structure", "At the maximum depth", "Focus position has no effect"], 1,
              "The beam is narrowest at the focus, and that is where lateral resolution is best. Place the focal zone at the level of the structure of interest, or just below it.", tags=["focus"]),
        ],
    },
    "DCS5002": {
        "ch01": [
            q("DCS5002-ch01-q001", "Which cardiac chamber forms most of the anterior (sternocostal) surface of the heart?",
              ["Left ventricle", "Right ventricle", "Left atrium", "Right atrium"], 1,
              "The right ventricle lies directly behind the sternum and forms most of the anterior surface. The left atrium is the most posterior chamber.", tags=["anatomy"]),
            q("DCS5002-ch01-q002", "The moderator band is an anatomic landmark of which chamber?",
              ["Left ventricle", "Right atrium", "Right ventricle", "Left atrium"], 2,
              "The moderator band (septomarginal trabecula) runs from the interventricular septum to the base of the anterior papillary muscle in the RV. It carries the right bundle branch and helps identify the morphologic right ventricle.", tags=["RV"]),
            q("DCS5002-ch01-q003", "Normal left ventricular wall thickness at end-diastole in an adult is approximately:",
              ["2-4 mm", "6-10 mm", "13-16 mm", "18-22 mm"], 1,
              "Normal septal and posterior wall thickness is about 6-10 mm (slightly less in women). A thickness of 11 mm or more suggests hypertrophy, and 15 mm or more raises concern for hypertrophic cardiomyopathy.", tags=["measurements"]),
            q("DCS5002-ch01-q004", "The fossa ovalis is located on which structure?",
              ["Interventricular septum", "Interatrial septum", "Mitral annulus", "Left atrial appendage"], 1,
              "The fossa ovalis is a thin depression in the interatrial septum. It is the remnant of the fetal foramen ovale, and it is where secundum ASDs and patent foramen ovale occur.", tags=["septum"]),
        ],
        "ch02": [
            q("DCS5002-ch02-q001", "The left anterior descending (LAD) artery primarily supplies:",
              ["Inferior wall", "Anterior wall and anterior two-thirds of the septum", "Lateral wall only", "Right ventricular free wall"], 1,
              "The LAD supplies the anterior wall, the anterior septum, and the apex. The RCA usually supplies the inferior wall, and the circumflex supplies the lateral wall.", tags=["coronaries"]),
            q("DCS5002-ch02-q002", "Coronary artery dominance is determined by which artery gives rise to the:",
              ["Left main coronary artery", "Posterior descending artery", "First diagonal branch", "Obtuse marginal branch"], 1,
              "Dominance is defined by which artery gives rise to the posterior descending artery (PDA). About 70-80% of people are right dominant, meaning the PDA comes from the RCA.", tags=["coronaries"]),
            q("DCS5002-ch02-q003", "Most coronary blood flow to the left ventricle occurs during:",
              ["Isovolumic contraction", "Systole", "Diastole", "Atrial systole only"], 2,
              "During systole, the contracting LV myocardium compresses the intramural coronary vessels. Most LV perfusion therefore happens in diastole. This is why tachycardia, which shortens diastole, can cause ischemia.", tags=["physiology"]),
        ],
        "ch03": [
            q("DCS5002-ch03-q001", "The mitral valve opens at which point of the cardiac cycle?",
              ["When LV pressure exceeds aortic pressure", "When LV pressure falls below LA pressure", "At the peak of the T wave", "At the onset of the QRS complex"], 1,
              "At the end of isovolumic relaxation, LV pressure falls below LA pressure, and the mitral valve opens. This starts rapid ventricular filling, which is the E wave on Doppler.", tags=["cardiac cycle"]),
            q("DCS5002-ch03-q002", "During isovolumic contraction:",
              ["All four valves are closed", "The aortic valve is open", "The mitral valve is open", "Ventricular volume decreases rapidly"], 0,
              "Isovolumic contraction occurs between mitral valve closure and aortic valve opening. All valves are closed, so pressure rises quickly while volume stays the same.", tags=["cardiac cycle"]),
            q("DCS5002-ch03-q003", "Which Doppler wave represents left atrial contraction across the mitral valve?",
              ["E wave", "A wave", "S wave", "e' wave"], 1,
              "The mitral inflow A wave occurs in late diastole, when the atrium contracts. It follows the P wave on the ECG. The E wave represents early passive filling.", tags=["doppler"]),
            q("DCS5002-ch03-q004", "Normal right ventricular systolic pressure in an adult is approximately:",
              ["5-10 mmHg", "15-30 mmHg", "60-80 mmHg", "100-120 mmHg"], 1,
              "Normal RV systolic pressure (which equals PA systolic pressure without pulmonic stenosis) is about 15-30 mmHg. On echo it is estimated as 4(TR Vmax)² + RA pressure.", tags=["pressures"]),
        ],
        "ch04": [
            q("DCS5002-ch04-q001", "Cardiac output is calculated as:",
              ["Stroke volume × heart rate", "Stroke volume ÷ heart rate", "End-diastolic volume − end-systolic volume", "Mean arterial pressure × heart rate"], 0,
              "CO = SV × HR. Stroke volume is EDV − ESV. On echo it can also be found with LVOT area × LVOT VTI.", tags=["hemodynamics"]),
            q("DCS5002-ch04-q002", "An LVOT diameter of 2.0 cm and an LVOT VTI of 20 cm give a stroke volume of approximately:",
              ["31 mL", "63 mL", "80 mL", "126 mL"], 1,
              "LVOT area = 0.785 × D² = 0.785 × 4 = 3.14 cm². SV = 3.14 cm² × 20 cm ≈ 63 mL.", tags=["calculations"]),
            q("DCS5002-ch04-q003", "According to the Frank-Starling mechanism, increasing preload (within physiologic limits) will:",
              ["Decrease stroke volume", "Increase stroke volume", "Not change stroke volume", "Decrease contractility"], 1,
              "More stretch of the myocardial fibers at end-diastole (preload) produces a stronger contraction, so stroke volume increases. This holds until the fibers are overstretched.", tags=["physiology"]),
        ],
    },
}

TITLES = {}

for folder, chapters in DATA.items():
    subj = json.loads((ROOT / folder / "subject.json").read_text())
    titles = {c["id"]: c["title"] for c in subj["chapters"]}
    for ch, questions in chapters.items():
        out = {"chapterId": ch, "title": titles[ch], "questions": questions}
        (ROOT / folder / f"{ch}.json").write_text(json.dumps(out, indent=2, ensure_ascii=False) + "\n")
print("ok")
