import { Library, CheckCheck, Target, XCircle, Clock, Trophy, BookOpen, Timer } from "lucide-react";
import { formatDuration } from "@/lib/stats";

const Tile = ({ icon: Icon, label, value, sub, tone, testId }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5" data-testid={testId}>
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <Icon className={`h-4 w-4 ${tone}`} />
    </div>
    <div className="mt-3 font-heading text-3xl font-bold text-slate-900" data-testid={`${testId}-value`}>{value}</div>
    {sub && <div className="mt-1 text-xs text-slate-500">{sub}</div>}
  </div>
);

export const StatTiles = ({ stats }) => {
  const o = stats.overall;
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4" data-testid="stats-overview">
      <Tile icon={Library} tone="text-slate-400" label="In bank" value={o.total} sub={`${stats.subjects.length} courses`} testId="stat-total" />
      <Tile icon={CheckCheck} tone="text-sky-500" label="Answered" value={o.answered} sub={`${o.completion}% of bank covered`} testId="stat-answered" />
      <Tile icon={Target} tone="text-teal-600" label="Accuracy" value={o.accuracy === null ? "—" : `${o.accuracy}%`} sub={`${o.attempts} total attempts`} testId="stat-accuracy" />
      <Tile icon={XCircle} tone="text-rose-500" label="Wrong (latest)" value={o.wrong} sub={`${o.correct} currently correct`} testId="stat-wrong" />
      <Tile icon={Clock} tone="text-amber-500" label="Time practiced" value={formatDuration(stats.studyTimeSec)} sub="Study + exam sessions" testId="stat-time" />
      <Tile icon={BookOpen} tone="text-teal-600" label="Study sessions" value={stats.studyCount} testId="stat-study-sessions" />
      <Tile icon={Timer} tone="text-sky-500" label="Exams taken" value={stats.examCount} testId="stat-exams" />
      <Tile icon={Trophy} tone="text-amber-500" label="Avg exam score" value={stats.avgExamScore === null ? "—" : `${stats.avgExamScore}%`} testId="stat-avg-exam" />
    </div>
  );
};
