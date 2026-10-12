import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Timer, RotateCcw, ChevronRight } from "lucide-react";
import { useSubject } from "@/hooks/useQbank";
import { useProgress } from "@/lib/progress";
import { summarize, subjectQuestions } from "@/lib/stats";
import { PageState } from "@/components/AppShell";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export const SubjectHeader = ({ subject, mode }) => (
  <div className="space-y-3">
    <Link to="/courses" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900" data-testid="back-to-courses">
      <ArrowLeft className="h-4 w-4" /> Courses
    </Link>
    <div>
      <span className="font-mono text-xs font-semibold text-sky-700">{subject.code} · {mode}</span>
      <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{subject.title}</h1>
    </div>
  </div>
);

const ChapterRow = ({ ch, index, stats, onStart }) => {
  const empty = ch.questions.length === 0;
  return (
    <button
      type="button"
      disabled={empty}
      onClick={onStart}
      data-testid={`chapter-row-${ch.id}`}
      className="group flex w-full items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-colors hover:border-sky-400 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-slate-200"
    >
      <span className="font-heading text-2xl font-bold text-slate-300 group-hover:text-sky-500 w-10">{String(index + 1).padStart(2, "0")}</span>
      <div className="min-w-0 flex-1">
        <div className="font-heading font-semibold text-slate-900">{ch.title}</div>
        <div className="mt-1 text-xs text-slate-500">
          {empty ? "Questions coming soon" : `${ch.questions.length} questions · ${stats.answered} answered · ${stats.wrong} wrong`}
        </div>
        {!empty && <Progress value={stats.completion} className="mt-3 h-1.5 max-w-sm bg-slate-100 [&>div]:bg-teal-500" />}
      </div>
      <div className="text-right">
        <div className="font-heading text-lg font-semibold text-slate-900">{stats.accuracy === null ? "—" : `${stats.accuracy}%`}</div>
        <div className="text-xs text-slate-500">accuracy</div>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-sky-500" />
    </button>
  );
};

export default function StudyChapters() {
  const { sid } = useParams();
  const navigate = useNavigate();
  const { subject, isLoading, error } = useSubject(sid);
  const { attempts } = useProgress();
  const wrongCount = subject ? subjectQuestions(subject).filter((q) => attempts[q.id]?.lastCorrect === false).length : 0;

  return (
    <PageState loading={isLoading} error={error}>
      {subject && (
        <main className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 sm:py-10" data-testid="study-chapters-page">
          <SubjectHeader subject={subject} mode="Study mode" />
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => navigate(`/subject/${sid}/exam`)} data-testid="switch-to-exam-btn">
              <Timer className="h-4 w-4" /> Switch to exam mode
            </Button>
            <Button
              variant="outline" className="rounded-full border-rose-200 text-rose-700 hover:bg-rose-50" disabled={!wrongCount}
              onClick={() => navigate(`/subject/${sid}/study/wrong`)} data-testid="study-wrong-btn"
            >
              <RotateCcw className="h-4 w-4" /> Review wrong answers ({wrongCount})
            </Button>
          </div>
          <div className="space-y-3" data-testid="chapter-list">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Select a chapter</p>
            {subject.chapters.map((ch, i) => (
              <ChapterRow key={ch.id} ch={ch} index={i} stats={summarize(ch.questions, attempts)} onStart={() => navigate(`/subject/${sid}/study/${ch.id}`)} />
            ))}
          </div>
        </main>
      )}
    </PageState>
  );
}
