import { ArrowUpRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { subjectIcon } from "@/components/subjectIcons";
import { getSubjectTheme } from "@/lib/subjectTheme";
import { cn } from "@/lib/utils";

export const SubjectCard = ({ subject, stats, onOpen, index }) => {
  const Icon = subjectIcon(subject.id);
  const theme = getSubjectTheme(subject.id);
  const empty = subject.questionCount === 0;

  return (
    <button
      type="button"
      onClick={() => onOpen(subject)}
      data-testid={`subject-card-${subject.id}`}
      style={{ animationDelay: `${index * 40}ms` }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 animate-in fade-in slide-in-from-bottom-2 fill-mode-both",
        theme.cardBg,
        theme.cardBorder,
      )}
    >
      <div>
        <div className="flex items-start justify-between">
          <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl shadow-md ring-2 ring-white/20 transition-transform group-hover:scale-105", theme.iconBg)}>
            <Icon className="h-5 w-5" />
          </span>
          <ArrowUpRight className={cn("h-4 w-4 text-white/70 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white", theme.accentText)} />
        </div>
        <span className={cn("mt-4 inline-block rounded-md border px-2.5 py-0.5 font-mono text-xs font-bold tracking-wide shadow-xs", theme.badgeBg)}>
          {subject.code}
        </span>
        <h3 className="mt-2.5 font-heading text-base font-bold leading-snug text-white line-clamp-2">
          {subject.title}
        </h3>
        <p className="mt-1.5 text-xs font-semibold text-white/85">
          {subject.chapters.length} chapters · {subject.questionCount} questions
        </p>
      </div>
      <div className="mt-5 space-y-2">
        {empty ? (
          <span className="text-xs font-bold text-amber-200 bg-amber-400/20 border border-amber-300/30 px-2.5 py-1 rounded-md inline-block backdrop-blur-xs">
            Questions coming soon
          </span>
        ) : (
          <>
            <div className="flex justify-between text-xs font-semibold text-white/90">
              <span>{stats.answered}/{stats.total} completed</span>
              <span className="font-extrabold text-white">{stats.accuracy === null ? "—" : `${stats.accuracy}%`}</span>
            </div>
            <Progress value={stats.completion} className={cn("h-2 rounded-full bg-black/20 backdrop-blur-xs", theme.progressBar)} />
          </>
        )}
      </div>
    </button>
  );
};

