import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PlayCircle } from "lucide-react";
import { useCatalog } from "@/hooks/useQbank";
import { useProgress, wrongAttempts } from "@/lib/progress";
import { buildStats } from "@/lib/stats";
import { loadActiveExam } from "@/lib/exam";
import { PageState } from "@/components/AppShell";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { SubjectAccuracyChart, ActivityChart } from "@/components/dashboard/Charts";
import { WrongAnswerCard } from "@/components/dashboard/WrongAnswerCard";
import { SubjectBreakdown, RecentSessions } from "@/components/dashboard/Tables";
import { DataTools } from "@/components/dashboard/DataTools";

const ResumeBanner = () => {
  const active = loadActiveExam();
  if (!active) return null;
  return (
    <Link to="/exam/run" data-testid="resume-exam-banner" className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-900 transition-colors hover:bg-sky-100">
      <PlayCircle className="h-5 w-5 text-sky-600" />
      <span className="text-sm font-medium">You have an unfinished exam in {active.subjectCode}. Click to resume.</span>
    </Link>
  );
};

export default function Dashboard() {
  const { data, isLoading, error } = useCatalog();
  const progress = useProgress();
  const stats = useMemo(() => (data ? buildStats(data, progress) : null), [data, progress]);

  return (
    <PageState loading={isLoading} error={error}>
      {stats && (
        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10" data-testid="dashboard-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Your dashboard</p>
              <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Progress overview</h1>
              <p className="mt-1 text-sm text-slate-500">Saved in this browser. Export it to back up or move to another device.</p>
            </div>
            <DataTools />
          </div>
          <ResumeBanner />
          <StatTiles stats={stats} />
          <div className="grid gap-6 lg:grid-cols-3">
            <SubjectAccuracyChart stats={stats} />
            <WrongAnswerCard wrong={wrongAttempts(progress)} subjects={stats.subjects} />
          </div>
          <div className="grid gap-6 lg:grid-cols-4">
            <ActivityChart stats={stats} />
            <RecentSessions sessions={progress.sessions} />
          </div>
          <SubjectBreakdown stats={stats} />
        </main>
      )}
    </PageState>
  );
}
