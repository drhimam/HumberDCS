import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCcw, Eye, Calculator as CalcIcon } from "lucide-react";
import { Calculator } from "@/components/Calculator";
import { useSubject } from "@/hooks/useQbank";
import { addSession, getProgress, recordAnswers } from "@/lib/progress";
import { subjectQuestions } from "@/lib/stats";
import { PageState } from "@/components/AppShell";
import { QuestionCard } from "@/components/QuestionCard";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { QuestionNavigator } from "@/components/QuestionNavigator";
import { Button } from "@/components/ui/button";

const useSessionLogger = (subject, label, answers) => {
  const ref = useRef({ startedAt: Date.now(), answers: {} });
  ref.current.answers = answers;
  ref.current.subject = subject;
  ref.current.label = label;
  useEffect(() => () => {
    const { answers: a, subject: s, label: l, startedAt, questions } = ref.current;
    const items = Object.values(a);
    if (!s || items.length === 0) return;
    addSession({
      mode: "study", subjectId: s.id, subjectCode: s.code, subjectTitle: s.title, label: l,
      total: questions, answered: items.length, correct: items.filter((x) => x.correct).length,
      durationSec: Math.round((Date.now() - startedAt) / 1000),
      startedAt: new Date(startedAt).toISOString(), endedAt: new Date().toISOString(),
    });
    ref.current = { startedAt: Date.now(), answers: {} };
  }, []);
  return ref;
};

export default function StudySession() {
  const { sid, cid } = useParams();
  const { subject, isLoading, error } = useSubject(sid);
  const [questions, setQuestions] = useState(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [calcOpen, setCalcOpen] = useState(false);
  const chapter = subject?.chapters.find((c) => c.id === cid);
  const label = cid === "wrong" ? "Wrong-answer review" : chapter?.title || "";
  const logger = useSessionLogger(subject, label, answers);

  useEffect(() => {
    if (!subject || questions) return;
    const { attempts } = getProgress();
    const qs = cid === "wrong" ? subjectQuestions(subject).filter((q) => attempts[q.id]?.lastCorrect === false) : chapter?.questions || [];
    setQuestions(qs);
    logger.current.questions = qs.length;
  }, [subject, questions, cid, chapter, logger]);

  const q = questions?.[idx];
  const sel = q ? answers[q.id]?.selected : undefined;

  const choose = useCallback((i) => {
    if (!q || answers[q.id]) return;
    setAnswers((a) => ({ ...a, [q.id]: { selected: i, correct: i === q.answer } }));
    recordAnswers([{ question: q, selected: i }], "study");
  }, [q, answers]);

  useEffect(() => {
    const onKey = (e) => {
      if (!questions || calcOpen || e.target.tagName === "INPUT") return;
      if (e.key === "ArrowRight") setIdx((i) => Math.min(questions.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      const n = Number(e.key);
      if (n >= 1 && n <= (q?.options.length || 0)) choose(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [questions, q, choose, calcOpen]);

  const statusOf = (x) => (answers[x.id] ? (answers[x.id].correct ? "correct" : "wrong") : "idle");
  const done = Object.keys(answers).length;
  const correct = Object.values(answers).filter((a) => a.correct).length;
  const prev = q ? getProgress().attempts[q.id] : null;

  return (
    <PageState loading={isLoading || (subject && !questions)} error={error}>
      {subject && questions && (
        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6" data-testid="study-session-page">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Link to={`/subject/${sid}/study`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900" data-testid="back-to-chapters">
                <ArrowLeft className="h-4 w-4" /> Chapters
              </Link>
              <h1 className="font-heading text-2xl font-bold text-slate-900"><span className="font-mono text-sm text-sky-700">{subject.code}</span> {label}</h1>
            </div>
            <div className="flex items-center gap-4 text-sm" data-testid="study-score">
              <span className="text-slate-500">Answered <b className="text-slate-900">{done}/{questions.length}</b></span>
              <span className="text-slate-500">Correct <b className="text-teal-700">{correct}</b></span>
              <Button variant="outline" size="sm" className={`rounded-full ${calcOpen ? "border-sky-400 text-sky-700" : ""}`} onClick={() => setCalcOpen((v) => !v)} data-testid="toggle-calculator-btn">
                <CalcIcon className="h-4 w-4" /> Calculator
              </Button>
              <Button variant="outline" size="sm" className="rounded-full" onClick={() => { setAnswers({}); setIdx(0); }} data-testid="restart-study-btn">
                <RotateCcw className="h-4 w-4" /> Restart
              </Button>
            </div>
          </div>
          {questions.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500" data-testid="study-empty">No questions here yet.</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_400px]">
              <aside className="rounded-2xl border border-slate-200 bg-white p-4 lg:sticky lg:top-24 lg:self-start">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Questions</p>
                <QuestionNavigator questions={questions} current={idx} onJump={setIdx} statusOf={statusOf} />
              </aside>
              <section className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
                {prev && !answers[q.id] && (
                  <div className="mb-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600" data-testid="previous-attempt-badge">
                    Previously {prev.lastCorrect ? "answered correctly" : "answered wrong"} · {prev.attempts} attempt{prev.attempts > 1 ? "s" : ""}
                  </div>
                )}
                <QuestionCard key={q.id} question={q} number={idx + 1} total={questions.length} selected={sel} reveal={sel !== undefined} locked={sel !== undefined} onSelect={choose} />
                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5">
                  <Button variant="outline" className="rounded-full" disabled={idx === 0} onClick={() => setIdx(idx - 1)} data-testid="prev-question-btn">
                    <ChevronLeft className="h-4 w-4" /> Previous
                  </Button>
                  <span className="hidden text-xs text-slate-400 sm:block">Keys: 1–{q.options.length} to answer, ← → to move</span>
                  <Button className="rounded-full bg-slate-900 hover:bg-slate-700" disabled={idx === questions.length - 1} onClick={() => setIdx(idx + 1)} data-testid="next-question-btn">
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </section>
              <aside className="rounded-2xl border border-teal-200 bg-teal-50/60 p-6 lg:sticky lg:top-24 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto" data-testid="explanation-side-panel">
                {sel !== undefined ? (
                  <ExplanationPanel question={q} selected={sel} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-teal-800/70" data-testid="explanation-placeholder">
                    <Eye className="mb-3 h-8 w-8" />
                    <p className="text-sm">Pick an answer to see the correct answer and explanation.</p>
                  </div>
                )}
              </aside>
            </div>
          )}
          <Calculator open={calcOpen} onClose={() => setCalcOpen(false)} />
        </main>
      )}
    </PageState>
  );
}
