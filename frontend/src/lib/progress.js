import { useSyncExternalStore } from "react";

const KEY = "dcs_qbank_progress_v1";
const EXPORT_KEY = "dcs_qbank_last_export_v1";
const emptyState = () => ({ version: 1, attempts: {}, sessions: [], createdAt: new Date().toISOString(), updatedAt: null });

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyState(), ...JSON.parse(raw) } : emptyState();
  } catch {
    return emptyState();
  }
};

let state = read();
const listeners = new Set();
const commit = (next) => {
  state = { ...next, updatedAt: new Date().toISOString() };
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
};
const subscribe = (l) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useProgress = () => useSyncExternalStore(subscribe, () => state);
export const getProgress = () => state;
export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function recordAnswers(items, mode) {
  const at = new Date().toISOString();
  const attempts = { ...state.attempts };
  items.forEach(({ question: q, selected }) => {
    const prev = attempts[q.id];
    const ok = selected === q.answer;
    attempts[q.id] = {
      qid: q.id, subjectId: q.subjectId, chapterId: q.chapterId, stem: q.stem, options: q.options, answer: q.answer,
      lastSelected: selected, lastCorrect: ok, attempts: (prev?.attempts || 0) + 1,
      correct: (prev?.correct || 0) + (ok ? 1 : 0), wrong: (prev?.wrong || 0) + (ok ? 0 : 1),
      firstAt: prev?.firstAt || at, lastAt: at, lastMode: mode,
    };
  });
  commit({ ...state, attempts });
}

export function addSession(session) {
  commit({ ...state, sessions: [{ id: newId(), ...session }, ...state.sessions].slice(0, 500) });
}

export const wrongAttempts = (p) =>
  Object.values(p.attempts).filter((a) => !a.lastCorrect).sort((a, b) => (b.lastAt > a.lastAt ? 1 : -1));

export function exportProgress() {
  const wrongQuestions = wrongAttempts(state);
  const exportedAt = new Date().toISOString();
  const payload = {
    app: "dcs-qbank", exportVersion: 1, exportedAt, ...state,
    summary: { answered: Object.keys(state.attempts).length, wrong: wrongQuestions.length, sessions: state.sessions.length },
    wrongQuestions,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `dcs-qbank-progress-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  localStorage.setItem(EXPORT_KEY, exportedAt);
  return exportedAt;
}

export const getLastExportAt = () => localStorage.getItem(EXPORT_KEY);

const isPlainObject = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

export function validateProgressImport(data) {
  if (!isPlainObject(data) || data.app !== "dcs-qbank" || !isPlainObject(data.attempts) || !Array.isArray(data.sessions)) {
    throw new Error("This file is not a valid DCS QBank progress export.");
  }
  if (data.exportVersion !== undefined && data.exportVersion !== 1) {
    throw new Error("This progress export uses an unsupported version.");
  }
  if (Object.keys(data.attempts).length > 10000 || data.sessions.length > 500) {
    throw new Error("This progress export exceeds the supported size limit.");
  }
  const attempts = {};
  Object.entries(data.attempts).forEach(([id, attempt]) => {
    if (!isPlainObject(attempt) || (attempt.qid || attempt.id || id) !== id || typeof (attempt.qid || attempt.id || id) !== "string") {
      throw new Error("This progress export contains an invalid question record.");
    }
    if (attempt.lastSelected !== undefined && (!Number.isInteger(attempt.lastSelected) || attempt.lastSelected < 0)) {
      throw new Error("This progress export contains an invalid answer selection.");
    }
    attempts[id] = { ...attempt, qid: attempt.qid || attempt.id || id };
  });
  const sessionIds = new Set();
  const sessions = data.sessions.map((session) => {
    if (!isPlainObject(session) || typeof session.id !== "string" || sessionIds.has(session.id)) {
      throw new Error("This progress export contains an invalid session record.");
    }
    sessionIds.add(session.id);
    return session;
  });
  return { ...data, attempts, sessions };
}

export function importProgress(data, strategy) {
  const validated = validateProgressImport(data);
  if (strategy === "replace") {
    commit({ ...emptyState(), attempts: validated.attempts, sessions: validated.sessions, createdAt: validated.createdAt || new Date().toISOString() });
    return;
  }
  const attempts = { ...state.attempts };
  Object.entries(validated.attempts).forEach(([id, a]) => {
    if (!attempts[id] || (a.lastAt || "") > (attempts[id].lastAt || "")) attempts[id] = a;
  });
  const known = new Set(state.sessions.map((s) => s.id));
  const sessions = [...state.sessions, ...validated.sessions.filter((s) => !known.has(s.id))]
    .sort((a, b) => ((b.endedAt || "") > (a.endedAt || "") ? 1 : -1));
  commit({ ...state, attempts, sessions });
}

export const resetProgress = () => commit(emptyState());
