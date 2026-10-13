import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, LogOut, PlayCircle, ShieldCheck, User, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useCatalog } from "@/hooks/useQbank";
import { useProgress, wrongAttempts } from "@/lib/progress";
import { buildStats } from "@/lib/stats";
import { loadActiveExam } from "@/lib/exam";
import { logout, useAuthUser } from "@/lib/auth";
import { PageState } from "@/components/AppShell";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { SubjectAccuracyChart, ActivityChart } from "@/components/dashboard/Charts";
import { WrongAnswerCard } from "@/components/dashboard/WrongAnswerCard";
import { SubjectBreakdown, RecentSessions } from "@/components/dashboard/Tables";
import { DataTools } from "@/components/dashboard/DataTools";
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

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out successfully.");
    navigate("/signin", { replace: true });
  };

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
          {/* Post-login User Header & Quick Actions Toolbar */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {/* User greeting */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-teal-500 font-bold text-white shadow-md shadow-sky-100 text-base">
                  {initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                      Welcome back, {user?.displayName || "Sonographer"}!
                    </h2>
                    <span className="hidden items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 sm:inline-flex">
                      <ShieldCheck className="h-3 w-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
                </div>
              </div>

              {/* Grouped User Actions: Profile, Donate, Logout */}
              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 border-t border-slate-100 sm:border-t-0">
                <Button
                  type="button"
                  onClick={() => setDonateOpen(true)}
                  className="rounded-xl border border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100/80 hover:text-rose-800 shadow-none text-xs font-semibold h-9 px-3.5"
                >
                  <Heart className="mr-1.5 h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                  Support & Donate
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setProfileOpen(true)}
                  className="rounded-xl border-slate-200 text-xs font-semibold h-9 px-3.5 text-slate-700 hover:bg-slate-50"
                >
                  <User className="mr-1.5 h-3.5 w-3.5 text-sky-600" />
                  Profile Settings
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleLogout}
                  className="rounded-xl text-xs font-semibold h-9 px-3 text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="mr-1.5 h-3.5 w-3.5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Overview & Data Tools */}
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Study Analytics</p>
              <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Progress overview
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Track your DCS curriculum milestones, accuracy trends, and review areas.
              </p>
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

          {/* Dialogs */}
          <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} />
          <DonateDialog open={donateOpen} onOpenChange={setDonateOpen} />
        </main>
      )}
    </PageState>
  );
}
