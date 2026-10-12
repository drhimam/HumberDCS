import { buildStats, clock, formatDuration, summarize } from "./stats";

test("summarize calculates answer counts, accuracy, and completion", () => {
  const questions = [{ id: "q1" }, { id: "q2" }, { id: "q3" }];
  const attempts = {
    q1: { lastCorrect: true, attempts: 2, correct: 2, lastAt: "2026-01-02" },
    q2: { lastCorrect: false, attempts: 1, correct: 0, lastAt: "2026-01-03" },
  };

  expect(summarize(questions, attempts)).toEqual({
    total: 3,
    answered: 2,
    correct: 1,
    wrong: 1,
    attempts: 3,
    accuracy: 67,
    completion: 67,
    lastAt: "2026-01-03",
  });
});

test("buildStats aggregates subjects and sessions", () => {
  const subject = { id: "DCS5000", chapters: [{ questions: [{ id: "q1" }] }] };
  const progress = {
    attempts: { q1: { lastCorrect: true, attempts: 1, correct: 1, lastAt: "2026-01-01" } },
    sessions: [
      { mode: "study", durationSec: 65 },
      { mode: "exam", total: 2, correct: 1, durationSec: 120 },
    ],
  };
  const stats = buildStats([{ subjects: [subject] }], progress);

  expect(stats.subjects).toEqual([subject]);
  expect(stats.bySubject.DCS5000.answered).toBe(1);
  expect(stats.overall.accuracy).toBe(100);
  expect(stats.studyTimeSec).toBe(185);
  expect(stats.avgExamScore).toBe(50);
  expect(stats.studyCount).toBe(1);
  expect(stats.examCount).toBe(1);
  expect(stats.activity).toHaveLength(14);
});

test("formats durations and clocks consistently", () => {
  expect(formatDuration(3661)).toBe("1h 1m");
  expect(formatDuration(65)).toBe("1m 5s");
  expect(clock(3661)).toBe("1:01:01");
  expect(clock(65)).toBe("01:05");
});
