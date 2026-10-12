import { useNavigate } from "react-router-dom";
import { BookOpen, Timer, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ModeOption = ({ icon: Icon, title, text, onClick, disabled, testId, tone }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    data-testid={testId}
    className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:border-sky-400 hover:bg-sky-50/40 disabled:cursor-not-allowed disabled:opacity-50"
  >
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon className="h-6 w-6" />
    </span>
    <span className="flex-1">
      <span className="block font-heading font-semibold text-slate-900">{title}</span>
      <span className="block text-sm text-slate-500">{text}</span>
    </span>
    <ChevronRight className="h-5 w-5 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-500" />
  </button>
);

export const ModeDialog = ({ subject, onClose }) => {
  const navigate = useNavigate();
  const empty = subject?.questionCount === 0;
  return (
    <Dialog open={!!subject} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg rounded-2xl" data-testid="mode-dialog">
        {subject && (
          <>
            <DialogHeader>
              <span className="font-mono text-xs font-semibold text-sky-700">{subject.code}</span>
              <DialogTitle className="font-heading text-xl">{subject.title}</DialogTitle>
              <DialogDescription>
                {empty ? "No questions have been added to this course yet." : "Choose how you want to practice."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <ModeOption
                icon={BookOpen} tone="bg-teal-50 text-teal-600" title="Study mode" disabled={empty}
                text="Go chapter by chapter. See the answer and explanation right after you pick an option."
                onClick={() => navigate(`/subject/${subject.id}/study`)} testId="study-mode-btn"
              />
              <ModeOption
                icon={Timer} tone="bg-sky-50 text-sky-600" title="Exam mode" disabled={empty}
                text="Take a timed test with your settings. You see your results when you finish."
                onClick={() => navigate(`/subject/${subject.id}/exam`)} testId="exam-mode-btn"
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
