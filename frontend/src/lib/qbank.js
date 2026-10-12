const BASE = `${process.env.PUBLIC_URL || ""}/qbank`;

const getJson = async (path) => {
  const res = await fetch(`${BASE}/${path}`, { cache: "no-cache" });
  if (!res.ok) throw new Error(`Failed to load QBank file "${path}" (HTTP ${res.status})`);
  try {
    return await res.json();
  } catch (error) {
    throw new Error(`QBank file "${path}" contains invalid JSON`, { cause: error });
  }
};

export const assetUrl = (src) => (src && src.startsWith("/") ? `${process.env.PUBLIC_URL || ""}${src}` : src);

const loadChapter = async (sid, ch) => {
  const path = `${sid}/${ch.file}`;
  const data = await getJson(path);
  if (!data || typeof data !== "object" || !Array.isArray(data.questions)) {
    throw new Error(`QBank chapter "${path}" must contain a questions array`);
  }
  if (data.chapterId !== ch.id) {
    throw new Error(`QBank chapter "${path}" has chapterId "${data.chapterId || "missing"}"; expected "${ch.id}"`);
  }
  return data.questions.map((q) => ({ ...q, subjectId: sid, chapterId: ch.id }));
};

const loadSubject = async (sid) => {
  const path = `${sid}/subject.json`;
  const subj = await getJson(path);
  if (!subj || typeof subj !== "object" || !Array.isArray(subj.chapters)) {
    throw new Error(`QBank subject "${path}" must contain a chapters array`);
  }
  const chapters = await Promise.all(
    subj.chapters.map(async (c) => ({ ...c, questions: await loadChapter(sid, c) })),
  );
  return { ...subj, chapters, questionCount: chapters.reduce((n, c) => n + c.questions.length, 0) };
};

export async function loadCatalog() {
  const idx = await getJson("index.json");
  if (!idx || typeof idx !== "object" || !Array.isArray(idx.semesters)) {
    throw new Error('QBank catalog "index.json" must contain a semesters array');
  }
  return Promise.all(
    idx.semesters.map(async (s) => {
      if (!s || typeof s !== "object" || !Array.isArray(s.subjects)) {
        throw new Error('QBank catalog "index.json" contains a semester without a subjects array');
      }
      return { ...s, subjects: await Promise.all(s.subjects.map(loadSubject)) };
    }),
  );
}
