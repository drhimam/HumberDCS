import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { CheckCircle2, XCircle, MinusCircle, Flag, RotateCcw, LayoutDashboard } from "lucide-react";
import { loadExamResult } from "@/lib/exam";
import { formatDuration } from "@/lib/stats";
import { QuestionCard } from "@/components/QuestionCard";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

const statusOf = (r, q) => (r.answers[q.id] === undefined ? "skipped" : r.answers[q.id] === q.answer ? "correct" : "wrong");
const ICON = {
  correct: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
  wrong: <XCircle className="h-5 w-5 text-rose-600" />,
  skipped: <MinusCircle className="h-5 w-5 text-slate-400" />,
};

const ScoreRing = ({ pct }) => (
  <div className="relative h-36 w-36" data-testid="score-ring">
    <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
      <circle cx="18" cy="18" r="15.9" fill="none" stroke={pct >= 70 ? "#0d9488" : pct >= 50 ? "#d97706" : "#e11d48"} strokeWidth="3"
        strokeDasharray={`${pct} 100`} strokeLinecap="round" />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="font-heading text-3xl font-bold text-slate-900" data-testid="score-percent">{pct}%</span>
      <span className="text-xs text-slate-500">score</span>
    </div>
  </div>
);

const Stat = ({ label, value, tone, testId }) => (
  <div className="rounded-xl bg-slate-50 p-4" data-testid={testId}>
    <div className="text-xs text-slate-500">{label}</div>
    <div className={`font-heading text-2xl font-bold ${tone}`}>{value}</div>
  </div>
);

export default function ExamResults() {
  const [r] = useState(loadExamResult);
  const [filter, setFilter] = useState("all");
  if (!r) return <Navigate to="/dashboard" replace />;
  const qs = r.questions;
  const counts = { correct: 0, wrong: 0, skipped: 0 };
  qs.forEach((q) => counts[statusOf(r, q)]++);
  const pct = Math.round((counts.correct / qs.length) * 100);
  const shown = qs.map((q, i) => ({ q, i })).filter(({ q }) =>
    filter === "all" ? true : filter === "flagged" ? r.flagged[q.id] : statusOf(r, q) === filter);
  const reasonText = { timeout: "Time ran out", ended: "Test ended early", finished: "Completed" }[r.reason];

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-10" data-testid="exam-results-page">
      <div className="flex flex-col gap-8 rounded-2xl border border-slate-200 bg-white p-6 md:flex-row md:items-center md:p-8">
        <ScoreRing pct={pct} />
        <div className="flex-1 space-y-4">
          <div>
            <span className="font-mono text-xs font-semibold text-sky-700">{r.subjectCode} · {r.label} · {reasonText}</span>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900">Exam results</h1>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Correct" value={counts.correct} tone="text-teal-700" testId="result-correct" />
            <Stat label="Incorrect" value={counts.wrong} tone="text-rose-600" testId="result-wrong" />
            <Stat label="Not answered" value={counts.skipped} tone="text-slate-600" testId="result-skipped" />
            <Stat label="Time used" value={formatDuration(r.durationSec)} tone="text-slate-900" testId="result-time" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="rounded-full bg-slate-900 hover:bg-slate-700"><Link to={`/subject/${r.subjectId}/exam`} data-testid="new-exam-btn"><RotateCcw className="h-4 w-4" /> New exam</Link></Button>
            <Button asChild variant="outline" className="rounded-full"><Link to="/dashboard" data-testid="results-dashboard-btn"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link></Button>
          </div>
        </div>
      </div>
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold text-slate-900">Review answers</h2>
          <Tabs value={filter} onValueChange={setFilter}>
            <TabsList>
              <TabsTrigger value="all" data-testid="filter-all">All ({qs.length})</TabsTrigger>
              <TabsTrigger value="wrong" data-testid="filter-wrong">Incorrect ({counts.wrong})</TabsTrigger>
              <TabsTrigger value="skipped" data-testid="filter-skipped">Skipped ({counts.skipped})</TabsTrigger>
              <TabsTrigger value="flagged" data-testid="filter-flagged"><Flag className="mr-1 h-3 w-3" />Flagged</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Accordion type="multiple" className="space-y-3" data-testid="review-list">
          {shown.map(({ q, i }) => (
            <AccordionItem key={q.id} value={q.id} className="rounded-2xl border border-slate-200 bg-white px-5" data-testid={`review-item-${i}`}>
              <AccordionTrigger className="gap-3 text-left hover:no-underline">
                <span className="flex min-w-0 flex-1 items-center gap-3">
                  {ICON[statusOf(r, q)]}
                  <span className="font-mono text-xs text-slate-400">Q{i + 1}</span>
                  <span className="truncate text-sm font-medium text-slate-800">{q.stem}</span>
                </span>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-6 pb-4 lg:grid-cols-[minmax(0,1fr)_340px]">
                  <QuestionCard question={q} number={i + 1} selected={r.answers[q.id]} reveal locked />
                  <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-5"><ExplanationPanel question={q} selected={r.answers[q.id]} /></div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          {shown.length === 0 && <p className="py-8 text-center text-sm text-slate-400">Nothing to show for this filter.</p>}
        </Accordion>
      </section>
    </main>
  );
}
