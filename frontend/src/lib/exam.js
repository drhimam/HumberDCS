const ACTIVE_KEY = "dcs_exam_active";
const RESULT_KEY = "dcs_exam_result";

export const shuffle = (arr) => {
  const b = [...arr];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

export function buildPool(subject, chapterIds, attempts, excludeCorrect, excludedSections = []) {
  const qs = subject.chapters.filter((c) => chapterIds.includes(c.id))
    .flatMap((c) => c.questions.filter((q) => !excludedSections.includes(`${c.id}::${q.tags?.[0] || "General"}`)));
  return excludeCorrect ? qs.filter((q) => attempts[q.id]?.lastCorrect !== true) : qs;
}

export function pickQuestions(pool, count, attempts, { includeWrong, shuffleQuestions, shuffleOptions }) {
  const wrong = includeWrong ? pool.filter((q) => attempts[q.id]?.lastCorrect === false) : [];
  const rest = shuffle(pool.filter((q) => !wrong.includes(q)));
  let picked = [...wrong, ...rest.slice(0, Math.max(0, count - wrong.length))];
  picked = shuffleQuestions ? shuffle(picked) : pool.filter((q) => picked.includes(q));
  return picked.map((q) => {
    const order = shuffleOptions ? shuffle(q.options.map((_, i) => i)) : q.options.map((_, i) => i);
    return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer), optionOrder: order, orig: q };
  });
}

const readJson = (key) => {
  try {
    return JSON.parse(sessionStorage.getItem(key));
  } catch {
    return null;
  }
};

export const loadActiveExam = () => readJson(ACTIVE_KEY);
export const saveActiveExam = (exam) => sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(exam));
export const clearActiveExam = () => sessionStorage.removeItem(ACTIVE_KEY);
export const loadExamResult = () => readJson(RESULT_KEY);
export const saveExamResult = (r) => sessionStorage.setItem(RESULT_KEY, JSON.stringify(r));
