const BASE = `${process.env.PUBLIC_URL || ""}/qbank`;

const getJson = async (path) => {
  const res = await fetch(`${BASE}/${path}`, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
};

export const assetUrl = (src) => (src && src.startsWith("/") ? `${process.env.PUBLIC_URL || ""}${src}` : src);

const loadChapter = async (sid, ch) => {
  try {
    const data = await getJson(`${sid}/${ch.file}`);
    return (data.questions || []).map((q) => ({ ...q, subjectId: sid, chapterId: ch.id }));
  } catch {
    return [];
  }
};

const loadSubject = async (sid) => {
  const subj = await getJson(`${sid}/subject.json`);
  const chapters = await Promise.all(
    subj.chapters.map(async (c) => ({ ...c, questions: await loadChapter(sid, c) })),
  );
  return { ...subj, chapters, questionCount: chapters.reduce((n, c) => n + c.questions.length, 0) };
};

export async function loadCatalog() {
  const idx = await getJson("index.json");
  return Promise.all(
    idx.semesters.map(async (s) => ({ ...s, subjects: await Promise.all(s.subjects.map(loadSubject)) })),
  );
}
