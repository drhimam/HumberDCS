import { buildPool, pickQuestions } from "./exam";

const questions = [
  { id: "q1", answer: 0, options: ["A", "B"], tags: ["basics"] },
  { id: "q2", answer: 1, options: ["C", "D"], tags: ["advanced"] },
  { id: "q3", answer: 0, options: ["E", "F"], tags: [] },
];

const subject = {
  chapters: [
    { id: "ch01", questions: questions.slice(0, 2) },
    { id: "ch02", questions: [questions[2]] },
  ],
};

test("buildPool filters chapters, excluded sections, and previously correct questions", () => {
  const attempts = { q1: { lastCorrect: true }, q2: { lastCorrect: false } };
  expect(buildPool(subject, ["ch01"], attempts, true, ["ch01::advanced"]).map((q) => q.id)).toEqual([]);
  expect(buildPool(subject, ["ch01", "ch02"], attempts, true, ["ch01::basics"]).map((q) => q.id)).toEqual(["q2", "q3"]);
});

test("pickQuestions includes wrong answers and remaps shuffled option indexes", () => {
  const attempts = { q1: { lastCorrect: false } };
  const random = jest.spyOn(Math, "random")
    .mockReturnValueOnce(0.99)
    .mockReturnValueOnce(0);

  const picked = pickQuestions(questions, 1, attempts, {
    includeWrong: true,
    shuffleQuestions: false,
    shuffleOptions: true,
  });

  expect(picked).toHaveLength(1);
  expect(picked[0].orig.id).toBe("q1");
  expect(picked[0].optionOrder).toEqual([1, 0]);
  expect(picked[0].answer).toBe(1);
  random.mockRestore();
});

test("pickQuestions never returns more questions than requested", () => {
  const picked = pickQuestions(questions, 2, {}, {
    includeWrong: false,
    shuffleQuestions: false,
    shuffleOptions: false,
  });
  expect(picked).toHaveLength(2);
  expect(picked.map((q) => q.id).every((id) => ["q1", "q2", "q3"].includes(id))).toBe(true);
  expect(new Set(picked.map((q) => q.id)).size).toBe(2);
});
