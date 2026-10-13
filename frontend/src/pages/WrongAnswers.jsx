import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { XOctagon, BookOpen } from "lucide-react";
import { useCatalog } from "@/hooks/useQbank";
import { useProgress, wrongAttempts } from "@/lib/progress";
import { PageState } from "@/components/AppShell";
import { ExplanationPanel } from "@/components/ExplanationPanel";
import { LETTERS } from "@/components/QuestionCard";
import { getSubjectTheme } from "@/lib/subjectTheme";
import { cn } from "@/lib/utils";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const WrongItem = ({ a, live, subject, chapter }) => {
  const q = live || { ...a, id: a.qid };
  const theme = getSubjectTheme(a.subjectId);
  return (
    <AccordionItem value={a.qid} className="rounded-2xl border border-slate-200/90 bg-white px-5 shadow-xs" data-testid={`wrong-item-${a.qid}`}>
      <AccordionTrigger className="text-left hover:no-underline py-4">
        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span className={cn("font-mono font-bold px-2 py-0.5 rounded border", theme.tableBadge)}>
              {subject?.code || a.subjectId}
            </span>
            <span>· {chapter?.title || a.chapterId}</span>
            <span className="rounded-full bg-rose-100 px-2 py-0.5 font-bold text-rose-700">
              wrong {a.wrong}× of {a.attempts}
            </span>
            <span>· {formatDistanceToNow(new Date(a.lastAt), { addSuffix: true })}</span>
          </div>
          <div className="text-base font-bold text-slate-900 line-clamp-2">{a.stem}</div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        <div className="grid gap-6 pb-4 lg:grid-cols-2">
          <div className="space-y-3.5 text-sm">
            <div className="rounded-2xl border border-rose-300 bg-rose-50/90 p-4 text-rose-950 shadow-xs" data-testid="your-answer">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Your last selected answer</span>
              <div className="mt-1.5 font-bold text-base leading-snug">
                <span className="inline-block mr-1.5 rounded-md bg-rose-600 px-2 py-0.5 font-mono text-xs font-bold text-white">
                  {LETTERS[a.lastSelected]}
                </span>
                {a.options[a.lastSelected]}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">All choices</p>
              <ol className="space-y-2 text-slate-800 font-medium">
                {a.options.map((o, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <span className="font-mono font-bold text-slate-700 bg-white border border-slate-200 rounded px-1.5 py-0.5 text-xs shrink-0">
                      {LETTERS[i]}
                    </span>
                    <span>{o}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
          <div className="rounded-2xl border border-teal-200 bg-teal-50/60 p-5 shadow-xs">
            <ExplanationPanel question={q} selected={a.lastSelected} />
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
};

export default function WrongAnswers() {
  const { data, isLoading, error } = useCatalog();
  const progress = useProgress();
  const navigate = useNavigate();
  const [subjectId, setSubjectId] = useState("all");
  const subjects = useMemo(() => data?.flatMap((s) => s.subjects) || [], [data]);
  const lookup = useMemo(() => {
    const m = {};
    subjects.forEach((s) => s.chapters.forEach((c) => c.questions.forEach((q) => { m[q.id] = { q, s, c }; })));
    return m;
  }, [subjects]);
  const wrong = wrongAttempts(progress).filter((a) => subjectId === "all" || a.subjectId === subjectId);

  return (
    <PageState loading={isLoading} error={error}>
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-10" data-testid="wrong-answers-page">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-rose-600"><XOctagon className="h-4 w-4" /> Wrong-answer bank</p>
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Questions to review</h1>
            <p className="mt-1 text-sm text-slate-500">A question leaves this list once you answer it correctly.</p>
          </div>
          <div className="flex gap-2">
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="w-64" data-testid="wrong-subject-filter"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {subjects.map((s) => <SelectItem key={s.id} value={s.id}>{s.code} {s.title}</SelectItem>)}
              </SelectContent>
            </Select>
            {subjectId !== "all" && wrong.length > 0 && (
              <Button className="rounded-full bg-slate-900 hover:bg-slate-700" onClick={() => navigate(`/subject/${subjectId}/study/wrong`)} data-testid="practice-wrong-btn">
                <BookOpen className="h-4 w-4" /> Practice
              </Button>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-600" data-testid="wrong-total">{wrong.length} question{wrong.length === 1 ? "" : "s"}</p>
        <Accordion type="multiple" className="space-y-3">
          {wrong.map((a) => {
            const hit = lookup[a.qid];
            return <WrongItem key={a.qid} a={a} live={hit?.q} subject={hit?.s || subjects.find((s) => s.id === a.subjectId)} chapter={hit?.c} />;
          })}
        </Accordion>
        {wrong.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500" data-testid="wrong-empty">No wrong answers here.</div>
        )}
      </main>
    </PageState>
  );
}
