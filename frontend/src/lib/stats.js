import { format, subDays } from "date-fns";

export function summarize(questions, attempts) {
  let answered = 0, correct = 0, wrong = 0, att = 0, attCorrect = 0, lastAt = null;
  questions.forEach((q) => {
    const a = attempts[q.id];
    if (!a) return;
    answered++;
    a.lastCorrect ? correct++ : wrong++;
    att += a.attempts;
    attCorrect += a.correct;
    if (!lastAt || a.lastAt > lastAt) lastAt = a.lastAt;
  });
  return {
    total: questions.length, answered, correct, wrong, attempts: att,
    accuracy: att ? Math.round((attCorrect / att) * 100) : null,
    completion: questions.length ? Math.round((answered / questions.length) * 100) : 0,
    lastAt,
  };
}

export const subjectQuestions = (s) => s.chapters.flatMap((c) => c.questions);

export function buildStats(semesters, progress) {
  const subjects = semesters.flatMap((s) => s.subjects);
  const bySubject = Object.fromEntries(subjects.map((s) => [s.id, summarize(subjectQuestions(s), progress.attempts)]));
  const overall = summarize(subjects.flatMap(subjectQuestions), progress.attempts);
  const sessions = progress.sessions;
  const exams = sessions.filter((s) => s.mode === "exam" && s.total);
  const studyTimeSec = sessions.reduce((n, s) => n + (s.durationSec || 0), 0);
  const avgExamScore = exams.length
    ? Math.round(exams.reduce((n, s) => n + s.correct / s.total, 0) / exams.length * 100)
    : null;
  const activity = Array.from({ length: 14 }, (_, i) => {
    const day = format(subDays(new Date(), 13 - i), "yyyy-MM-dd");
    const daySessions = sessions.filter((s) => (s.endedAt || "").slice(0, 10) === day);
    return {
      day: format(subDays(new Date(), 13 - i), "MMM d"),
      answered: daySessions.reduce((n, s) => n + (s.answered || 0), 0),
      correct: daySessions.reduce((n, s) => n + (s.correct || 0), 0),
    };
  });
  return {
    subjects, bySubject, overall, studyTimeSec, avgExamScore, activity,
    studyCount: sessions.filter((s) => s.mode === "study").length, examCount: exams.length,
  };
}

export function formatDuration(sec) {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${r}s`;
  return `${r}s`;
}

export const clock = (sec) => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
};
