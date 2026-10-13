import { useNavigate } from "react-router-dom";
import { BookOpen, Timer, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { subjectIcon } from "@/components/subjectIcons";
import { getSubjectTheme } from "@/lib/subjectTheme";
import { cn } from "@/lib/utils";

const ModeOption = ({ icon: Icon, title, text, onClick, disabled, testId, tone }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    data-testid={testId}
    className="group flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-150 hover:border-sky-400 hover:bg-sky-50/40 hover:shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
  >
    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
      <Icon className="h-6 w-6" />
    </span>
    <span className="flex-1">
      <span className="block font-heading text-base font-bold text-slate-900">{title}</span>
      <span className="block text-xs font-medium text-slate-600 mt-0.5 leading-relaxed">{text}</span>
    </span>
    <ChevronRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-sky-600" />
  </button>
);

export const ModeDialog = ({ subject, onClose }) => {
  const navigate = useNavigate();
  const empty = subject?.questionCount === 0;
  const theme = subject ? getSubjectTheme(subject.id) : null;
  const Icon = subject ? subjectIcon(subject.id) : null;

  return (
    <Dialog open={!!subject} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg rounded-3xl p-6" data-testid="mode-dialog">
        {subject && (
          <>
            <DialogHeader className="text-left space-y-2">
              <div className="flex items-start gap-3.5">
                <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-xs", theme.iconBg)}>
                  <Icon className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <span className={cn("inline-block rounded-md border px-2 py-0.5 font-mono text-xs font-bold", theme.badgeBg)}>
                    {subject.code}
                  </span>
                  <DialogTitle className="mt-1 font-heading text-lg font-bold text-slate-900 leading-snug sm:text-xl">
                    {subject.title}
                  </DialogTitle>
                </div>
              </div>
              <DialogDescription className="text-xs font-medium text-slate-600 pt-1">
                {empty ? "No questions have been added to this course yet." : "Choose how you want to practice."}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <ModeOption
                icon={BookOpen}
                tone="bg-teal-100 text-teal-800"
                title="Study mode"
                disabled={empty}
                text="Go chapter by chapter. See the answer and explanation right after you pick an option."
                onClick={() => navigate(`/subject/${subject.id}/study`)}
                testId="study-mode-btn"
              />
              <ModeOption
                icon={Timer}
                tone="bg-sky-100 text-sky-800"
                title="Exam mode"
                disabled={empty}
                text="Take a timed test with your settings. You see your results when you finish."
                onClick={() => navigate(`/subject/${subject.id}/exam`)}
                testId="exam-mode-btn"
              />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

