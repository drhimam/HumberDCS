import { useMemo, useState } from "react";
import { useCatalog } from "@/hooks/useQbank";
import { useProgress } from "@/lib/progress";
import { buildStats } from "@/lib/stats";
import { PageState } from "@/components/AppShell";
import { SubjectCard } from "@/components/SubjectCard";
import { ModeDialog } from "@/components/ModeDialog";

export default function Courses() {
  const { data, isLoading, error } = useCatalog();
  const progress = useProgress();
  const [openSubject, setOpenSubject] = useState(null);
  const stats = useMemo(() => (data ? buildStats(data, progress) : null), [data, progress]);

  return (
    <PageState loading={isLoading} error={error}>
      {stats && (
        <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-10" data-testid="courses-page">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-sky-700">DCS Curriculum</p>
            <h1 className="mt-1 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              All Courses & QBanks
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-600">
              Select any sonography course to study chapter-by-chapter or take custom timed simulation exams.
            </p>
          </div>
          {data.map((sem) => (
            <section key={sem.id} className="space-y-4" data-testid={`semester-${sem.id}`}>
              <div className="flex items-center gap-3">
                <h2 className="font-heading text-2xl font-bold text-slate-900">{sem.title}</h2>
                <span className="text-xs font-bold text-slate-600 bg-slate-200/80 px-2.5 py-1 rounded-full">
                  {sem.subjects.length} courses
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {sem.subjects.map((s, i) => (
                  <SubjectCard key={s.id} subject={s} stats={stats.bySubject[s.id]} onOpen={setOpenSubject} index={i} />
                ))}
              </div>
            </section>
          ))}
          <ModeDialog subject={openSubject} onClose={() => setOpenSubject(null)} />
        </main>
      )}
    </PageState>
  );
}
