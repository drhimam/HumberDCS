import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Timer, RotateCcw, ChevronRight } from "lucide-react";
import { useSubject } from "@/hooks/useQbank";
import { useProgress } from "@/lib/progress";
import { summarize, subjectQuestions } from "@/lib/stats";
import { PageState } from "@/components/AppShell";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { subjectIcon } from "@/components/subjectIcons";
import { getSubjectTheme } from "@/lib/subjectTheme";
import { cn } from "@/lib/utils";

export const SubjectHeader = ({ subject, mode }) => {
  const Icon = subjectIcon(subject.id);
  const theme = getSubjectTheme(subject.id);

  return (
    <div className="space-y-4">
      <Link
        to="/courses"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-950 transition-colors"
        data-testid="back-to-courses"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Courses
      </Link>
      <div className={cn("rounded-3xl border p-6 sm:p-7 bg-gradient-to-br shadow-sm", theme.bannerGradient, theme.bannerBorder)}>
        <div className="flex items-start gap-4 sm:gap-5">
          <span className={cn("flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl shadow-xs", theme.iconBg)}>
            <Icon className="h-7 w-7" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={cn("inline-block rounded-md border px-2.5 py-0.5 font-mono text-xs font-bold", theme.badgeBg)}>
                {subject.code}
              </span>
              <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-bold text-slate-700 shadow-xs ring-1 ring-slate-200">
                {mode}
              </span>
            </div>
            <h1 className="mt-2 font-heading text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
              {subject.title}
            </h1>
            <p className="mt-1.5 text-xs font-semibold text-slate-600 sm:text-sm">
              {subject.chapters?.length || 0} chapters · {subject.questionCount || 0} practice questions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ChapterRow = ({ ch, index, stats, onStart, theme }) => {
  const empty = ch.questions.length === 0;
  return (
    <button
      type="button"
      disabled={empty}
      onClick={onStart}
      data-testid={`chapter-row-${ch.id}`}
      className="group flex w-full items-center gap-5 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-150 hover:border-sky-400 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-slate-200"
    >
      <span className="font-heading text-2xl font-extrabold text-slate-300 group-hover:text-sky-600 w-10 transition-colors">
        {String(index + 1).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-heading text-base font-bold text-slate-900 group-hover:text-sky-950">{ch.title}</div>
        <div className="mt-1 text-xs font-semibold text-slate-500">
          {empty ? "Questions coming soon" : `${ch.questions.length} questions · ${stats.answered} answered · ${stats.wrong} wrong`}
        </div>
        {!empty && <Progress value={stats.completion} className={cn("mt-3 h-2 max-w-sm rounded-full", theme?.progressBar || "[&>div]:bg-teal-500")} />}
      </div>
      <div className="text-right">
        <div className="font-heading text-lg font-extrabold text-slate-900">{stats.accuracy === null ? "—" : `${stats.accuracy}%`}</div>
        <div className="text-xs font-bold text-slate-500">accuracy</div>
      </div>
      <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-sky-600 transition-colors" />
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
            <p className="text-xs font-bold uppercase tracking-wider text-slate-600">Select a chapter</p>
            {subject.chapters.map((ch, i) => (
              <ChapterRow
                key={ch.id}
                ch={ch}
                index={i}
                stats={summarize(ch.questions, attempts)}
                theme={getSubjectTheme(subject.id)}
                onStart={() => navigate(`/subject/${sid}/study/${ch.id}`)}
              />
            ))}
          </div>
        </main>
      )}
    </PageState>
  );
}
