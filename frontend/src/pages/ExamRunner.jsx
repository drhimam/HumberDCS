import { useCallback, useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Clock, Flag, ChevronLeft, ChevronRight, LogOut, CheckSquare, Calculator as CalcIcon, Expand, List, Minimize2, Type } from "lucide-react";
import { Calculator } from "@/components/Calculator";
import { cn } from "@/lib/utils";
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
  const [focusMode, setFocusMode] = useState(false);
  const [fontSize, setFontSize] = useState("normal");
  const [navigatorOpen, setNavigatorOpen] = useState(false);
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
    <div className={`${focusMode ? "fixed inset-0 z-50 overflow-y-auto" : ""} min-h-screen bg-slate-50`} data-testid="exam-runner-page">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-900/95 text-white shadow-md backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-3 py-2 sm:px-6">
          <div className="flex flex-col gap-2 sm:min-h-16 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* Subject Code & Title */}
            <div className="min-w-0">
              <div className="font-mono text-[10px] sm:text-xs font-bold text-sky-400 uppercase tracking-wider">{exam.subjectCode} · EXAM SIMULATION</div>
              <div className="truncate font-heading text-sm sm:text-base font-bold text-white">{exam.subjectTitle}</div>
            </div>

            {/* Controls: Timer & Modern Action Toolbar */}
            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
              {/* Timer */}
              <div className={cn(
                "flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 py-1 sm:px-3.5 sm:py-1.5 font-mono text-xs sm:text-sm font-bold shadow-xs",
                low ? "border-rose-500 bg-rose-500/10 text-rose-300 animate-pulse" : "border-slate-700 bg-slate-800 text-sky-400"
              )} data-testid="exam-timer">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
                <span>{remaining === null ? "Untimed" : clock(remaining)}</span>
              </div>

              {/* Modern Unified Action Toolbar */}
              <div className="inline-flex items-center rounded-full border border-slate-700/80 bg-slate-800/90 p-1 shadow-inner gap-0.5 sm:gap-1">
                {/* 1. Calculator */}
                <Button
                  variant="ghost"
                  size="sm"
                  title="Calculator"
                  aria-label="Calculator"
                  className={cn(
                    "h-8 w-8 p-0 sm:h-8 sm:w-auto sm:px-2.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-700/70 transition-all gap-1.5",
                    calcOpen && "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold"
                  )}
                  onClick={() => setCalcOpen((v) => !v)}
                  data-testid="toggle-calculator-btn"
                >
                  <CalcIcon className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline text-xs font-semibold">Calculator</span>
                </Button>

                {/* 2. Focus */}
                <Button
                  variant="ghost"
                  size="sm"
                  title={focusMode ? "Exit focus mode" : "Enter focus mode"}
                  aria-label={focusMode ? "Exit focus mode" : "Enter focus mode"}
                  className={cn(
                    "h-8 w-8 p-0 sm:h-8 sm:w-auto sm:px-2.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-700/70 transition-all gap-1.5",
                    focusMode && "bg-sky-500/20 text-sky-300 border border-sky-500/40 font-bold"
                  )}
                  onClick={() => setFocusMode((v) => !v)}
                  data-testid="toggle-focus-mode-btn"
                >
                  {focusMode ? <Minimize2 className="h-4 w-4 shrink-0" /> : <Expand className="h-4 w-4 shrink-0" />}
                  <span className="hidden sm:inline text-xs font-semibold">{focusMode ? "Exit focus" : "Focus"}</span>
                </Button>

                {/* 3. Text Size */}
                <div
                  className="relative inline-flex items-center justify-center rounded-full text-slate-300 hover:text-white hover:bg-slate-700/70 transition-all h-8 w-8 sm:h-8 sm:w-auto sm:px-2.5 text-xs font-semibold cursor-pointer gap-1.5"
                  title={`Text size: ${fontSize}`}
                >
                  <Type className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline capitalize">Text: {fontSize}</span>
                  <select
                    value={fontSize}
                    onChange={(e) => setFontSize(e.target.value)}
                    className="absolute inset-0 h-full w-full opacity-0 cursor-pointer bg-slate-800 text-white text-xs"
                    aria-label="Question font size"
                    data-testid="exam-font-size"
                  >
                    <option value="normal" className="bg-slate-900 text-white">Text: normal</option>
                    <option value="large" className="bg-slate-900 text-white">Text: large</option>
                    <option value="larger" className="bg-slate-900 text-white">Text: larger</option>
                  </select>
                </div>

                {/* 4. End Test */}
                <Button
                  variant="ghost"
                  size="sm"
                  title="End test"
                  aria-label="End test"
                  className="h-8 w-8 p-0 sm:h-8 sm:w-auto sm:px-2.5 rounded-full text-rose-300 hover:text-white hover:bg-rose-500/20 transition-all gap-1.5"
                  onClick={() => setConfirm(true)}
                  data-testid="end-exam-btn"
                >
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline text-xs font-semibold">End test</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="order-1 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 lg:order-1">
          <QuestionCard key={q.id} question={q} number={exam.current + 1} total={exam.questions.length} selected={exam.answers[q.id]} reveal={false} fontSize={fontSize}
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
        {navigatorOpen && <aside className="order-3 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Answered</span>
            <span className="font-semibold" data-testid="exam-answered-count">{answeredCount}/{exam.questions.length}</span>
          </div>
          <QuestionNavigator questions={exam.questions} current={exam.current} onJump={go} statusOf={statusOf} testPrefix="exam-nav-q" />
          <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-sky-100 border border-sky-200" /> Answered</span>
            <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-amber-50 border-2 border-amber-400" /> Flagged</span>
          </div>
        </aside>}
      </main>
      <button type="button" onClick={() => setNavigatorOpen((v) => !v)} className="fixed bottom-4 left-4 z-40 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg" data-testid="toggle-question-navigator">
        <List className="h-4 w-4" /> {navigatorOpen ? "Hide questions" : `Questions (${answeredCount}/${exam.questions.length})`}
      </button>
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
