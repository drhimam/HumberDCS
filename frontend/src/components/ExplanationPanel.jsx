import { CheckCircle2, XCircle, Lightbulb, BookMarked, MinusCircle } from "lucide-react";
import { RichText } from "@/components/RichText";
import { QImage } from "@/components/QImage";
import { LETTERS } from "@/components/QuestionCard";

const Verdict = ({ selected, answer }) => {
  if (selected === undefined || selected === null)
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-100/90 px-4 py-2.5 font-bold text-slate-800 text-sm">
        <MinusCircle className="h-5 w-5 text-slate-500" /> Not answered
      </div>
    );
  return selected === answer ? (
    <div className="flex items-center gap-2.5 rounded-xl border border-emerald-300 bg-emerald-100/90 px-4 py-2.5 font-bold text-emerald-900 text-sm shadow-xs">
      <CheckCircle2 className="h-5 w-5 text-emerald-700 stroke-[2.5]" /> Correct! Well done
    </div>
  ) : (
    <div className="flex items-center gap-2.5 rounded-xl border border-rose-300 bg-rose-100/90 px-4 py-2.5 font-bold text-rose-900 text-sm shadow-xs">
      <XCircle className="h-5 w-5 text-rose-700 stroke-[2.5]" /> Incorrect
    </div>
  );
};

export const ExplanationPanel = ({ question, selected }) => (
  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300" data-testid="explanation-panel">
    <div data-testid="answer-verdict"><Verdict selected={selected} answer={question.answer} /></div>
    <div className="rounded-2xl border border-emerald-200/90 bg-emerald-50/60 p-4 shadow-xs">
      <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">Correct answer</div>
      <div className="mt-1.5 font-bold text-slate-950 text-base leading-snug" data-testid="correct-answer-text">
        <span className="inline-block mr-1.5 rounded-md bg-emerald-600 px-2 py-0.5 font-mono text-xs font-bold text-white">
          {LETTERS[question.answer]}
        </span>
        {question.options[question.answer]}
      </div>
    </div>
    <div className="rounded-2xl border border-teal-200/80 bg-white p-5 shadow-xs">
      <div className="mb-2.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900">
        <Lightbulb className="h-4 w-4 text-teal-600 stroke-[2.5]" /> Clinical Explanation
      </div>
      <RichText text={question.explanation || "No explanation provided yet."} className="text-[16px] font-medium leading-relaxed text-slate-800" testId="explanation-text" />
    </div>
    <QImage src={question.explanationImage} alt="Explanation image" testId="explanation-image" />
    {question.reference && (
      <div className="flex items-start gap-2.5 rounded-xl bg-slate-100/80 p-3 text-xs font-semibold text-slate-700">
        <BookMarked className="h-4 w-4 mt-0.5 text-slate-500 shrink-0" />
        <span>Reference: {question.reference}</span>
      </div>
    )}
    {question.tags?.length > 0 && (
      <div className="flex flex-wrap gap-1.5 pt-1">
        {question.tags.map((t) => (
          <span key={t} className="rounded-lg border border-teal-200 bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-800">
            #{t}
          </span>
        ))}
      </div>
    )}
  </div>
);

