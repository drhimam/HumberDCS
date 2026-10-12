import { CheckCircle2, XCircle, Lightbulb, BookMarked, MinusCircle } from "lucide-react";
import { RichText } from "@/components/RichText";
import { QImage } from "@/components/QImage";
import { LETTERS } from "@/components/QuestionCard";

const Verdict = ({ selected, answer }) => {
  if (selected === undefined || selected === null)
    return <div className="flex items-center gap-2 text-slate-600 font-semibold"><MinusCircle className="h-5 w-5" /> Not answered</div>;
  return selected === answer ? (
    <div className="flex items-center gap-2 text-emerald-700 font-semibold"><CheckCircle2 className="h-5 w-5" /> Correct</div>
  ) : (
    <div className="flex items-center gap-2 text-rose-700 font-semibold"><XCircle className="h-5 w-5" /> Incorrect</div>
  );
};

export const ExplanationPanel = ({ question, selected }) => (
  <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300" data-testid="explanation-panel">
    <div data-testid="answer-verdict"><Verdict selected={selected} answer={question.answer} /></div>
    <div className="rounded-xl border border-emerald-200 bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Correct answer</div>
      <div className="mt-1 font-medium text-slate-900" data-testid="correct-answer-text">
        {LETTERS[question.answer]}. {question.options[question.answer]}
      </div>
    </div>
    <div>
      <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-teal-800">
        <Lightbulb className="h-4 w-4" /> Explanation
      </div>
      <RichText text={question.explanation || "No explanation provided yet."} className="text-[15px] leading-relaxed text-slate-700" testId="explanation-text" />
    </div>
    <QImage src={question.explanationImage} alt="Explanation image" testId="explanation-image" />
    {question.reference && (
      <div className="flex items-start gap-2 text-sm text-slate-600"><BookMarked className="h-4 w-4 mt-0.5" /> {question.reference}</div>
    )}
    {question.tags?.length > 0 && (
      <div className="flex flex-wrap gap-1.5">
        {question.tags.map((t) => (
          <span key={t} className="rounded-md bg-teal-100/70 px-2 py-0.5 text-xs font-medium text-teal-800">{t}</span>
        ))}
      </div>
    )}
  </div>
);
