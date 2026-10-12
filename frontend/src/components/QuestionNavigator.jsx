import { cn } from "@/lib/utils";

export const QuestionNavigator = ({ questions, current, onJump, statusOf, testPrefix = "nav-q" }) => (
  <div className="grid grid-cols-5 gap-2" data-testid="question-navigator">
    {questions.map((q, i) => {
      const status = statusOf(q);
      return (
        <button
          key={q.id}
          type="button"
          onClick={() => onJump(i)}
          data-testid={`${testPrefix}-${i}`}
          className={cn(
            "relative flex h-9 items-center justify-center rounded-lg border text-sm font-semibold transition-colors",
            status === "correct" && "border-emerald-200 bg-emerald-50 text-emerald-700",
            status === "wrong" && "border-rose-200 bg-rose-50 text-rose-700",
            status === "answered" && "border-sky-200 bg-sky-50 text-sky-700",
            status === "idle" && "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            i === current && "ring-2 ring-slate-900 ring-offset-1",
          )}
        >
          {i + 1}
          {status === "flagged" && <span className="absolute inset-0 rounded-lg border-2 border-amber-400 bg-amber-50 text-amber-700 flex items-center justify-center">{i + 1}</span>}
        </button>
      );
    })}
  </div>
);
