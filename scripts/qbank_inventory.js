const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "frontend", "public", "qbank");
const index = JSON.parse(fs.readFileSync(path.join(root, "index.json"), "utf8"));
const seenIds = new Map();
const rows = [];
let totalQuestions = 0;
let totalImages = 0;
let missingReferences = 0;
let missingExplanations = 0;
let emptyChapters = 0;

const formatSections = (counts) => {
  const entries = Object.entries(counts);
  return entries.length ? entries.map(([name, count]) => `${name} (${count})`).join(", ") : "—";
};

for (const semester of index.semesters) {
  for (const subjectId of semester.subjects) {
    const subjectDir = path.join(root, subjectId);
    const subject = JSON.parse(fs.readFileSync(path.join(subjectDir, "subject.json"), "utf8"));
    for (const chapter of subject.chapters) {
      const chapterPath = path.join(subjectDir, chapter.file);
      const data = JSON.parse(fs.readFileSync(chapterPath, "utf8"));
      const questions = data.questions || [];
      const sections = {};
      let images = 0;
      let chapterMissingReferences = 0;
      let chapterMissingExplanations = 0;

      if (questions.length === 0) emptyChapters++;
      for (const question of questions) {
        totalQuestions++;
        if (question.image || question.explanationImage) {
          images++;
          totalImages++;
        }
        if (!question.reference || !String(question.reference).trim()) {
          chapterMissingReferences++;
          missingReferences++;
        }
        if (!question.explanation || !String(question.explanation).trim()) {
          chapterMissingExplanations++;
          missingExplanations++;
        }
        const section = question.tags && question.tags[0] ? question.tags[0] : "General";
        sections[section] = (sections[section] || 0) + 1;
        if (seenIds.has(question.id)) {
          throw new Error(`Duplicate question ID "${question.id}" in ${chapterPath}; first seen in ${seenIds.get(question.id)}`);
        }
        seenIds.set(question.id, `${subjectId}/${chapter.id}`);
      }

      rows.push({
        semester: semester.title,
        subject: subject.code || subjectId,
        chapter: chapter.id,
        title: chapter.title,
        questions: questions.length,
        sections: formatSections(sections),
        images,
        missingReferences: chapterMissingReferences,
        missingExplanations: chapterMissingExplanations,
      });
    }
  }
}

const headers = ["Semester", "Subject", "Chapter", "Questions", "Images", "Missing refs", "Missing explanations", "Sections"];
const table = [
  `| ${headers.join(" | ")} |`,
  `| ${headers.map(() => "---").join(" | ")} |`,
  ...rows.map((row) => `| ${[
    row.semester,
    row.subject,
    row.chapter,
    row.questions,
    row.images,
    row.missingReferences,
    row.missingExplanations,
    row.sections,
  ].join(" | ")} |`),
];

console.log("# QBank Content Inventory");
console.log("");
console.log(`Generated: ${new Date().toISOString()}`);
console.log("");
console.log(`- Subjects: ${new Set(rows.map((row) => row.subject)).size}`);
console.log(`- Chapters: ${rows.length}`);
console.log(`- Questions: ${totalQuestions}`);
console.log(`- Questions with images: ${totalImages}`);
console.log(`- Empty chapters: ${emptyChapters}`);
console.log(`- Questions missing references: ${missingReferences}`);
console.log(`- Questions missing explanations: ${missingExplanations}`);
console.log(`- Unique question IDs: ${seenIds.size}`);
console.log("");
console.log(table.join("\n"));
