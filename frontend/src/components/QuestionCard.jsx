import { Check, X } from "lucide-react";
import { RichText } from "@/components/RichText";
import { QImage } from "@/components/QImage";
import { cn } from "@/lib/utils";

const LETTERS = "ABCDEFGH";

const optionClass = (i, selected, answer, reveal) => {
  if (reveal && i === answer) return "border-2 border-emerald-500 bg-emerald-50/90 text-emerald-950 shadow-xs ring-1 ring-emerald-200";
  if (reveal && i === selected) return "border-2 border-rose-500 bg-rose-50/90 text-rose-950 shadow-xs ring-1 ring-rose-200";
  if (!reveal && i === selected) return "border-2 border-sky-500 bg-sky-50/90 ring-2 ring-sky-200/80 text-sky-950 shadow-xs";
  return "border border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50/80";
};

export const QuestionCard = ({ question, number, total, selected, reveal, onSelect, locked, fontSize = "normal" }) => (
  <div className="space-y-6" data-testid="question-card">
    <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-600">
      <span data-testid="question-number" className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-800">
        Question {number}{total ? ` of ${total}` : ""}
      </span>
      <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 font-mono text-xs font-bold normal-case tracking-normal text-slate-500">
        {question.id}
      </span>
    </div>
    <RichText
      text={question.stem}
      className={cn(
        "leading-relaxed text-slate-950 tracking-tight",
        fontSize === "large" ? "text-2xl font-bold" : fontSize === "larger" ? "text-3xl font-extrabold" : "text-xl font-bold",
      )}
      testId="question-stem"
    />
    <QImage src={question.image} alt="Question image" testId="question-image" />
    <div className="space-y-3 pt-1" role="radiogroup">
      {question.options.map((opt, i) => (
        <button
          key={i}
          type="button"
          disabled={locked}
          onClick={() => onSelect?.(i)}
          data-testid={`option-choice-${i}`}
          className={cn(
            "w-full text-left p-4 rounded-2xl border flex items-start gap-3.5 transition-all duration-150 disabled:cursor-default",
            optionClass(i, selected, question.answer, reveal),
          )}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-current/20 bg-white font-mono text-sm font-bold shadow-xs">
            {LETTERS[i]}
          </span>
          <span className={cn("flex-1 pt-1 font-semibold leading-relaxed", fontSize === "large" ? "text-lg" : fontSize === "larger" ? "text-xl" : "text-base")}>
            {opt}
          </span>
          {reveal && i === question.answer && <Check className="h-5 w-5 text-emerald-600 stroke-[2.5] mt-1 shrink-0" />}
          {reveal && i === selected && i !== question.answer && <X className="h-5 w-5 text-rose-600 stroke-[2.5] mt-1 shrink-0" />}
        </button>
      ))}
    </div>
  </div>
);

export { LETTERS };

