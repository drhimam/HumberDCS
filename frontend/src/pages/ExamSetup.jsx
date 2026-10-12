import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Play, BookOpen } from "lucide-react";
import { useSubject } from "@/hooks/useQbank";
import { useProgress, newId } from "@/lib/progress";
import { buildPool, pickQuestions, saveActiveExam } from "@/lib/exam";
import { formatDuration } from "@/lib/stats";
import { PageState } from "@/components/AppShell";
import { SubjectHeader } from "@/pages/StudyChapters";
import { SectionFilter } from "@/components/SectionFilter";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TIMES = [["0", "Untimed"], ["30", "30 seconds"], ["45", "45 seconds"], ["60", "1 minute"], ["90", "1.5 minutes"], ["120", "2 minutes"]];

const Toggle = ({ id, label, hint, checked, onChange }) => (
  <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
    <span>
      <span className="block text-sm font-medium text-slate-900">{label}</span>
      <span className="block text-xs text-slate-500">{hint}</span>
    </span>
    <Switch id={id} checked={checked} onCheckedChange={onChange} data-testid={`toggle-${id}`} />
  </label>
);

const Section = ({ title, children }) => (
  <div className="space-y-3">
    <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</h2>
    {children}
  </div>
);

export default function ExamSetup() {
  const { sid } = useParams();
  const navigate = useNavigate();
  const { subject, isLoading, error } = useSubject(sid);
  const { attempts } = useProgress();
  const [chapters, setChapters] = useState(null);
  const [count, setCount] = useState(20);
  const [time, setTime] = useState("60");
  const [opts, setOpts] = useState({ excludeCorrect: false, includeWrong: false, shuffleQuestions: true, shuffleOptions: false });
  const selected = useMemo(() => chapters ?? subject?.chapters.filter((c) => c.questions.length).map((c) => c.id) ?? [], [chapters, subject]);
  const [excludedSections, setExcludedSections] = useState([]);
  const activeExcluded = useMemo(() => excludedSections.filter((k) => selected.includes(k.split("::")[0])), [excludedSections, selected]);

  const pool = useMemo(() => (subject ? buildPool(subject, selected, attempts, opts.excludeCorrect, activeExcluded) : []), [subject, selected, attempts, opts.excludeCorrect, activeExcluded]);
  const wrongInPool = opts.includeWrong ? pool.filter((q) => attempts[q.id]?.lastCorrect === false).length : 0;
  const n = Math.min(pool.length, Math.max(Math.min(count, pool.length), wrongInPool));
  const setOpt = (k) => (v) => setOpts((o) => ({ ...o, [k]: v }));
  const toggleChapter = (id) => setChapters(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);

  const start = () => {
    const questions = pickQuestions(pool, n, attempts, opts);
    saveActiveExam({
      id: newId(), subjectId: subject.id, subjectCode: subject.code, subjectTitle: subject.title,
      label: (selected.length === subject.chapters.filter((c) => c.questions.length).length ? "All chapters" : `${selected.length} chapter(s)`) + (activeExcluded.length ? " · selected sections" : ""),
      questions, answers: {}, flagged: {}, current: 0, startedAt: Date.now(), timeLimitSec: Number(time) * questions.length,
      settings: { ...opts, timePerQuestion: Number(time), chapters: selected, excludedSections: activeExcluded },
    });
    navigate("/exam/run");
  };

  return (
    <PageState loading={isLoading} error={error}>
      {subject && (
        <main className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10" data-testid="exam-setup-page">
          <SubjectHeader subject={subject} mode="Exam mode" />
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-8 rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
              <Section title="Chapters">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-full" onClick={() => setChapters(subject.chapters.filter((c) => c.questions.length).map((c) => c.id))} data-testid="select-all-chapters-btn">Select all</Button>
                  <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setChapters([])} data-testid="clear-chapters-btn">Clear</Button>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {subject.chapters.map((c) => (
                    <label key={c.id} className={`flex items-center gap-3 rounded-xl border p-3 ${c.questions.length ? "cursor-pointer border-slate-200 hover:bg-slate-50" : "opacity-50 border-slate-100"}`}>
                      <Checkbox checked={selected.includes(c.id)} disabled={!c.questions.length} onCheckedChange={() => toggleChapter(c.id)} data-testid={`chapter-checkbox-${c.id}`} />
                      <span className="flex-1 text-sm text-slate-800">{c.title}</span>
                      <span className="text-xs text-slate-500">{c.questions.length}</span>
                    </label>
                  ))}
                </div>
              </Section>
              <Section title="Sections">
                <p className="-mt-1 text-xs text-slate-500">Tap a section to leave it out. All sections are included by default.</p>
                <SectionFilter chapters={subject.chapters.filter((c) => selected.includes(c.id))} excluded={activeExcluded} onChange={setExcludedSections} />
              </Section>
              <Section title="Number of questions">
                <div className="flex items-center gap-4">
                  <Slider min={1} max={Math.max(1, pool.length)} step={1} value={[Math.min(count, Math.max(1, pool.length))]} onValueChange={([v]) => setCount(v)} disabled={!pool.length} className="flex-1" data-testid="question-count-slider" />
                  <Input type="number" min={1} max={pool.length} value={Math.min(count, pool.length)} onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))} className="w-20" data-testid="question-count-input" />
                </div>
                <p className="text-xs text-slate-500">{pool.length} questions available with the current settings</p>
              </Section>
              <Section title="Time per question">
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger className="w-60" data-testid="time-per-question-select"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIMES.map(([v, l]) => <SelectItem key={v} value={v} data-testid={`time-option-${v}`}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Section>
              <Section title="Options">
                <div className="grid gap-3 md:grid-cols-2">
                  <Toggle id="exclude-correct" label="Leave out questions I got right" hint="Skips questions you answered correctly last time" checked={opts.excludeCorrect} onChange={setOpt("excludeCorrect")} />
                  <Toggle id="include-wrong" label="Include every question I got wrong" hint="Adds all wrong answers from the chosen chapters" checked={opts.includeWrong} onChange={setOpt("includeWrong")} />
                  <Toggle id="shuffle-questions" label="Shuffle questions" hint="Random question order" checked={opts.shuffleQuestions} onChange={setOpt("shuffleQuestions")} />
                  <Toggle id="shuffle-options" label="Shuffle answer options" hint="Random A–D order" checked={opts.shuffleOptions} onChange={setOpt("shuffleOptions")} />
                </div>
              </Section>
            </div>
            <aside className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24 lg:self-start" data-testid="exam-summary">
              <h2 className="font-heading text-lg font-semibold text-slate-900">Exam summary</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between"><dt className="text-slate-500">Questions</dt><dd className="font-semibold" data-testid="summary-question-count">{n}</dd></div>
                <div className="flex justify-between"><dt className="text-slate-500">Chapters</dt><dd className="font-semibold">{selected.length}</dd></div>
                {activeExcluded.length > 0 && <div className="flex justify-between"><dt className="text-slate-500">Sections left out</dt><dd className="font-semibold" data-testid="summary-excluded-sections">{activeExcluded.length}</dd></div>}
                <div className="flex justify-between"><dt className="text-slate-500">Total time</dt><dd className="font-semibold" data-testid="summary-total-time">{time === "0" ? "Untimed" : formatDuration(Number(time) * n)}</dd></div>
                {opts.includeWrong && <div className="flex justify-between"><dt className="text-slate-500">Wrong answers included</dt><dd className="font-semibold text-rose-600">{wrongInPool}</dd></div>}
              </dl>
              <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">Answers and explanations stay hidden until you finish or end the test.</p>
              <Button className="w-full rounded-full bg-sky-500 hover:bg-sky-600" disabled={!n} onClick={start} data-testid="start-exam-btn">
                <Play className="h-4 w-4" /> Start exam
              </Button>
              <Button variant="ghost" className="w-full rounded-full" onClick={() => navigate(`/subject/${sid}/study`)} data-testid="switch-to-study-btn">
                <BookOpen className="h-4 w-4" /> Study mode instead
              </Button>
            </aside>
          </div>
        </main>
      )}
    </PageState>
  );
}
