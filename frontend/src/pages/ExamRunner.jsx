import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Clock, Flag, ChevronLeft, ChevronRight, LogOut, CheckSquare, Calculator as CalcIcon } from "lucide-react";
import { Calculator } from "@/components/Calculator";
import { addSession, recordAnswers } from "@/lib/progress";
import { clearActiveExam, loadActiveExam, saveActiveExam, saveExamResult } from "@/lib/exam";
import { clock } from "@/lib/stats";
import { QuestionCard } from "@/components/QuestionCard";
import { QuestionNavigator } from "@/components/QuestionNavigator";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const useCountdown = (exam, onExpire) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const elapsed = (now - (exam?.startedAt || now)) / 1000;
  const remaining = exam?.timeLimitSec ? exam.timeLimitSec - elapsed : null;
  useEffect(() => {
    if (remaining !== null && remaining <= 0) onExpire();
  }, [remaining, onExpire]);
  return { elapsed, remaining };
};

export default function ExamRunner() {
  const navigate = useNavigate();
  const [exam, setExam] = useState(loadActiveExam);
  const [confirm, setConfirm] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const finished = useRef(false);

  useEffect(() => { if (exam) saveActiveExam(exam); }, [exam]);

  const finish = useCallback((reason) => {
    if (!exam || finished.current) return;
    finished.current = true;
    const endedAt = Date.now();
    const answered = exam.questions.filter((q) => exam.answers[q.id] !== undefined);
    recordAnswers(answered.map((q) => ({ question: q.orig, selected: q.optionOrder[exam.answers[q.id]] })), "exam");
    const correct = answered.filter((q) => exam.answers[q.id] === q.answer).length;
    const durationSec = Math.round((endedAt - exam.startedAt) / 1000);
    addSession({
      mode: "exam", subjectId: exam.subjectId, subjectCode: exam.subjectCode, subjectTitle: exam.subjectTitle, label: exam.label,
      total: exam.questions.length, answered: answered.length, correct, durationSec,
      startedAt: new Date(exam.startedAt).toISOString(), endedAt: new Date(endedAt).toISOString(),
    });
    saveExamResult({ ...exam, endedAt, durationSec, reason, correct });
    clearActiveExam();
    navigate("/exam/results", { replace: true });
  }, [exam, navigate]);

  const expire = useCallback(() => finish("timeout"), [finish]);
  const { remaining } = useCountdown(exam, expire);

  if (!exam) return <Navigate to="/dashboard" replace />;
  const q = exam.questions[exam.current];
  const update = (patch) => setExam((e) => ({ ...e, ...patch }));
  const go = (i) => update({ current: Math.max(0, Math.min(exam.questions.length - 1, i)) });
  const answeredCount = Object.keys(exam.answers).length;
  const isLast = exam.current === exam.questions.length - 1;
  const statusOf = (x) => (exam.flagged[x.id] ? "flagged" : exam.answers[x.id] !== undefined ? "answered" : "idle");
  const low = remaining !== null && remaining < 60;

  return (
    <div className="min-h-screen bg-slate-50" data-testid="exam-runner-page">
      <header className="sticky top-0 z-40 bg-slate-900 text-white shadow-md">
        <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="font-mono text-xs text-sky-400">{exam.subjectCode} · EXAM</div>
            <div className="truncate font-heading font-semibold">{exam.subjectTitle}</div>
          </div>
          <div className={`flex items-center gap-2 rounded-full border px-4 py-1.5 font-mono text-sm font-semibold ${low ? "border-rose-500 bg-rose-500/10 text-rose-300 animate-pulse" : "border-slate-700 bg-slate-800 text-sky-400"}`} data-testid="exam-timer">
            <Clock className="h-4 w-4" /> {remaining === null ? "Untimed" : clock(remaining)}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className={`rounded-full border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white ${calcOpen ? "border-sky-400 text-sky-300" : ""}`} onClick={() => setCalcOpen((v) => !v)} data-testid="toggle-calculator-btn">
              <CalcIcon className="h-4 w-4" /> <span className="hidden sm:inline">Calculator</span>
            </Button>
            <Button variant="outline" className="rounded-full border-slate-600 bg-transparent text-white hover:bg-slate-800 hover:text-white" onClick={() => setConfirm(true)} data-testid="end-exam-btn">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">End test</span>
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="order-1 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 lg:order-1">
          <QuestionCard key={q.id} question={q} number={exam.current + 1} total={exam.questions.length} selected={exam.answers[q.id]} reveal={false}
            onSelect={(i) => update({ answers: { ...exam.answers, [q.id]: i } })} />
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
            <Button variant="outline" className="rounded-full" disabled={exam.current === 0} onClick={() => go(exam.current - 1)} data-testid="exam-prev-btn">
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <Button variant="outline" className={`rounded-full ${exam.flagged[q.id] ? "border-amber-400 bg-amber-50 text-amber-700" : ""}`}
              onClick={() => update({ flagged: { ...exam.flagged, [q.id]: !exam.flagged[q.id] } })} data-testid="flag-question-btn">
              <Flag className="h-4 w-4" /> {exam.flagged[q.id] ? "Flagged" : "Flag"}
            </Button>
            {isLast ? (
              <Button className="rounded-full bg-sky-500 hover:bg-sky-600" onClick={() => setConfirm(true)} data-testid="finish-exam-btn">
                <CheckSquare className="h-4 w-4" /> Finish exam
              </Button>
            ) : (
              <Button className="rounded-full bg-slate-900 hover:bg-slate-700" onClick={() => go(exam.current + 1)} data-testid="exam-next-btn">
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </section>
        <aside className="order-3 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Answered</span>
            <span className="font-semibold" data-testid="exam-answered-count">{answeredCount}/{exam.questions.length}</span>
          </div>
          <QuestionNavigator questions={exam.questions} current={exam.current} onJump={go} statusOf={statusOf} testPrefix="exam-nav-q" />
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-sky-100 border border-sky-200" /> Answered</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-50 border-2 border-amber-400" /> Flagged</span>
          </div>
        </aside>
      </main>
      <Calculator open={calcOpen} onClose={() => setCalcOpen(false)} />
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent data-testid="end-exam-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>End the test and see results?</AlertDialogTitle>
            <AlertDialogDescription>
              You answered {answeredCount} of {exam.questions.length} questions. Unanswered questions will be marked as not answered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="end-exam-cancel-btn">Keep going</AlertDialogCancel>
            <AlertDialogAction onClick={() => finish(isLast ? "finished" : "ended")} data-testid="end-exam-confirm-btn">Show results</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
