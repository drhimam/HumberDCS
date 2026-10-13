import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, PlayCircle, Settings, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useCatalog } from "@/hooks/useQbank";
import { useProgress, wrongAttempts } from "@/lib/progress";
import { buildStats } from "@/lib/stats";
import { loadActiveExam } from "@/lib/exam";
import { useAuthUser } from "@/lib/auth";
import { PageState } from "@/components/AppShell";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { SubjectAccuracyChart, ActivityChart } from "@/components/dashboard/Charts";
import { WrongAnswerCard } from "@/components/dashboard/WrongAnswerCard";
import { SubjectBreakdown, RecentSessions } from "@/components/dashboard/Tables";
import { Button } from "@/components/ui/button";
import { ProfileDialog } from "@/components/ProfileDialog";
import { DonateDialog } from "@/components/DonateDialog";

const ResumeBanner = () => {
  const active = loadActiveExam();
  if (!active) return null;
  return (
    <Link
      to="/exam/run"
      data-testid="resume-exam-banner"
      className="flex items-center gap-3 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sky-900 transition-colors hover:bg-sky-100"
    >
      <PlayCircle className="h-5 w-5 text-sky-600" />
      <span className="text-sm font-medium">
        You have an unfinished exam in {active.subjectCode}. Click to resume.
      </span>
    </Link>
  );
};

export default function Dashboard() {
  const { data, isLoading, error } = useCatalog();
  const progress = useProgress();
  const user = useAuthUser();
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);

  const stats = useMemo(() => (data ? buildStats(data, progress) : null), [data, progress]);

  const initials = (user?.displayName || user?.email || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <PageState loading={isLoading} error={error}>
      {stats && (
        <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10" data-testid="dashboard-page">
          {/* Post-login User Welcome Header */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* User greeting */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-teal-500 font-bold text-white shadow-md shadow-sky-100 text-base">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
                      Welcome back, {user?.displayName || "Sonographer"}!
                    </h2>
                    <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-500 mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Status pill on right */}
              <div className="text-xs font-semibold text-slate-400 sm:text-right">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                  Diagnostic Cardiac Sonography Curriculum
                </span>
              </div>
            </div>
          </div>

          {/* Progress Overview Header */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Study Analytics</p>
            <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Progress overview
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Track your DCS curriculum milestones, accuracy trends, and review areas.
            </p>
          </div>

          {/* Local Progress Analytics & Backup Notice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-amber-50/40 to-white p-4 text-amber-950 shadow-xs" data-testid="local-progress-notice">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">
                  Browser-Local Progress Storage
                </p>
                <p className="text-xs font-medium text-amber-800/90 mt-0.5 max-w-3xl leading-relaxed">
                  Your question answers, scores, and analytics are stored locally on this device/browser. They can be lost if browser cache, site data, or cookies are cleared. To keep your progress safe or move it to another computer, export a backup anytime from your <strong>Profile &amp; Settings</strong>.
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setProfileOpen(true)}
              className="shrink-0 rounded-xl border-amber-300 bg-white text-xs font-bold text-amber-900 hover:bg-amber-100/80 shadow-xs h-8 px-3"
              data-testid="open-settings-backup-btn"
            >
              <Settings className="mr-1.5 h-3.5 w-3.5 text-amber-700" />
              Settings &amp; Backup
            </Button>
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

          {/* Dialogs */}
          <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} onOpenDonate={() => setDonateOpen(true)} />
          <DonateDialog open={donateOpen} onOpenChange={setDonateOpen} />
        </main>
      )}
    </PageState>
  );
}
