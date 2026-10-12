import { ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { subjectIcon } from "@/components/subjectIcons";

export const SubjectCard = ({ subject, stats, onOpen, index }) => {
  const Icon = subjectIcon(subject.id);
  const empty = subject.questionCount === 0;
  return (
    <button
      type="button"
      onClick={() => onOpen(subject)}
      data-testid={`subject-card-${subject.id}`}
      style={{ animationDelay: `${index * 40}ms` }}
      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-sky-400 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 animate-in fade-in slide-in-from-bottom-2 fill-mode-both"
    >
      <div>
        <div className="flex items-start justify-between">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-colors group-hover:bg-sky-50 group-hover:text-sky-600">
            <Icon className="h-5 w-5" />
          </span>
          <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-sky-500" />
        </div>
        <span className="mt-4 inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-600 group-hover:bg-sky-50 group-hover:text-sky-700">
          {subject.code}
        </span>
        <h3 className="mt-2 font-heading text-base font-semibold leading-snug text-slate-900 line-clamp-2">{subject.title}</h3>
        <p className="mt-1 text-xs text-slate-500">
          {subject.chapters.length} chapters · {subject.questionCount} questions
        </p>
      </div>
      <div className="mt-5 space-y-2">
        {empty ? (
          <span className="text-xs font-medium text-amber-600">Questions coming soon</span>
        ) : (
          <>
            <div className="flex justify-between text-xs text-slate-500">
              <span>{stats.answered}/{stats.total} done</span>
              <span className="font-semibold text-slate-700">{stats.accuracy === null ? "—" : `${stats.accuracy}%`}</span>
            </div>
            <Progress value={stats.completion} className="h-1.5 bg-slate-100 [&>div]:bg-sky-500" />
          </>
        )}
      </div>
    </button>
  );
};
