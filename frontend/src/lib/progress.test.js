import {
  addSession,
  getProgress,
  importProgress,
  recordAnswers,
  resetProgress,
  validateProgressImport,
  wrongAttempts,
} from "./progress";

const question = {
  id: "DCS5000-ch01-q001",
  subjectId: "DCS5000",
  chapterId: "ch01",
  stem: "Which option is correct?",
  options: ["A", "B", "C", "D"],
  answer: 1,
};

beforeEach(() => {
  localStorage.clear();
  resetProgress();
});

describe("progress storage", () => {
  test("records attempts and aggregates correct and wrong answers", () => {
    recordAnswers([{ question, selected: 1 }], "study");
    recordAnswers([{ question, selected: 0 }], "study");

    const attempt = getProgress().attempts[question.id];
    expect(attempt).toMatchObject({
      qid: question.id,
      lastSelected: 0,
      lastCorrect: false,
      attempts: 2,
      correct: 1,
      wrong: 1,
      lastMode: "study",
    });
  });

  test("returns only questions whose latest answer is wrong", () => {
    recordAnswers([{ question, selected: 0 }], "study");
    expect(wrongAttempts(getProgress())).toHaveLength(1);

    recordAnswers([{ question, selected: 1 }], "study");
    expect(wrongAttempts(getProgress())).toHaveLength(0);
  });

  test("merges newer attempts and de-duplicates imported sessions", () => {
    const session = { id: "session-1", endedAt: "2026-01-02T00:00:00.000Z", mode: "study" };
    addSession(session);
    importProgress({
      app: "dcs-qbank",
      exportVersion: 1,
      attempts: {
        [question.id]: { ...question, lastAt: "2026-01-03T00:00:00.000Z", lastCorrect: true },
      },
      sessions: [session, { id: "session-2", endedAt: "2026-01-03T00:00:00.000Z", mode: "exam" }],
    }, "merge");

    expect(getProgress().attempts[question.id].lastCorrect).toBe(true);
    expect(getProgress().sessions.map((item) => item.id)).toEqual(["session-2", "session-1"]);
  });

  test("rejects malformed imports", () => {
    expect(() => importProgress({ attempts: [] }, "merge")).toThrow(
      "This file is not a valid DCS QBank progress export.",
    );
  });

  test("rejects unsupported versions and malformed records", () => {
    expect(() => validateProgressImport({ app: "dcs-qbank", exportVersion: 2, attempts: {}, sessions: [] }))
      .toThrow("unsupported version");
    expect(() => validateProgressImport({ app: "dcs-qbank", attempts: { bad: { qid: "other" } }, sessions: [] }))
      .toThrow("invalid question record");
  });
});
