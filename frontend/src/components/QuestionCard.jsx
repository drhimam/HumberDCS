import { Check, X } from "lucide-react";
import { RichText } from "@/components/RichText";
import { QImage } from "@/components/QImage";
import { cn } from "@/lib/utils";

const LETTERS = "ABCDEFGH";

const optionClass = (i, selected, answer, reveal) => {
  if (reveal && i === answer) return "border-emerald-500 bg-emerald-50 text-emerald-900";
  if (reveal && i === selected) return "border-rose-500 bg-rose-50 text-rose-900";
  if (!reveal && i === selected) return "border-sky-500 bg-sky-50/70 ring-2 ring-sky-200 text-sky-900";
  return "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50";
};

export const QuestionCard = ({ question, number, total, selected, reveal, onSelect, locked, fontSize = "normal" }) => (
  <div className="space-y-6" data-testid="question-card">
    <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
      <span data-testid="question-number">Question {number}{total ? ` of ${total}` : ""}</span>
      <span className="font-mono normal-case tracking-normal text-slate-400">{question.id}</span>
    </div>
    <RichText
      text={question.stem}
      className={cn(
        "leading-relaxed text-slate-900 font-medium",
        fontSize === "large" ? "text-2xl" : fontSize === "larger" ? "text-3xl" : "text-lg",
      )}
      testId="question-stem"
    />
    <QImage src={question.image} alt="Question image" testId="question-image" />
    <div className="space-y-3" role="radiogroup">
      {question.options.map((opt, i) => (
        <button
          key={i}
          type="button"
          disabled={locked}
          onClick={() => onSelect?.(i)}
          data-testid={`option-choice-${i}`}
          className={cn(
            "w-full text-left p-4 rounded-xl border flex items-start gap-3 transition-colors duration-150 disabled:cursor-default",
            optionClass(i, selected, question.answer, reveal),
          )}
        >
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-current/20 bg-white/70 font-mono text-sm font-semibold">
            {LETTERS[i]}
          </span>
          <span className={cn("flex-1 pt-0.5 leading-relaxed", fontSize === "large" ? "text-lg" : fontSize === "larger" ? "text-xl" : "text-base")}>{opt}</span>
          {reveal && i === question.answer && <Check className="h-5 w-5 text-emerald-600 mt-0.5" />}
          {reveal && i === selected && i !== question.answer && <X className="h-5 w-5 text-rose-600 mt-0.5" />}
        </button>
      ))}
    </div>
  </div>
);

export { LETTERS };
