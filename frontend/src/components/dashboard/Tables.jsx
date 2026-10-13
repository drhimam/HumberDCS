import { formatDistanceToNow } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { formatDuration } from "@/lib/stats";
import { subjectIcon } from "@/components/subjectIcons";
import { getSubjectTheme } from "@/lib/subjectTheme";
import { cn } from "@/lib/utils";

const ago = (iso) => (iso ? formatDistanceToNow(new Date(iso), { addSuffix: true }) : "—");

export const SubjectBreakdown = ({ stats }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs" data-testid="subject-breakdown">
    <h2 className="font-heading text-lg font-bold text-slate-900">Course breakdown</h2>
    <p className="text-sm font-medium text-slate-600">Detailed progress and accuracy across all DCS courses</p>
    <div className="mt-4 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200 hover:bg-transparent">
            <TableHead className="font-bold text-slate-700 uppercase tracking-wider text-xs">Course</TableHead>
            <TableHead className="w-48 font-bold text-slate-700 uppercase tracking-wider text-xs">Coverage</TableHead>
            <TableHead className="text-right font-bold text-slate-700 uppercase tracking-wider text-xs">Answered</TableHead>
            <TableHead className="text-right font-bold text-slate-700 uppercase tracking-wider text-xs">Correct</TableHead>
            <TableHead className="text-right font-bold text-slate-700 uppercase tracking-wider text-xs">Wrong</TableHead>
            <TableHead className="text-right font-bold text-slate-700 uppercase tracking-wider text-xs">Accuracy</TableHead>
            <TableHead className="text-right font-bold text-slate-700 uppercase tracking-wider text-xs">Last activity</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stats.subjects.map((s) => {
            const b = stats.bySubject[s.id];
            const theme = getSubjectTheme(s.id);
            const Icon = subjectIcon(s.id);
            return (
              <TableRow key={s.id} data-testid={`breakdown-row-${s.id}`} className="hover:bg-slate-50/70 border-slate-100">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border", theme.pillTone)}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0">
                      <span className={cn("inline-block rounded px-1.5 py-0.5 font-mono text-[11px] font-bold mr-1.5 border", theme.tableBadge)}>
                        {s.code}
                      </span>
                      <span className="font-semibold text-slate-900 text-sm">{s.title}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={b.completion} className={cn("h-2 rounded-full bg-slate-100", theme.tableProgressBar)} />
                    <span className="w-9 text-right text-xs font-bold text-slate-600">{b.completion}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-semibold text-slate-700">{b.answered}/{b.total}</TableCell>
                <TableCell className="text-right font-bold text-teal-700">{b.correct}</TableCell>
                <TableCell className="text-right font-bold text-rose-600">{b.wrong}</TableCell>
                <TableCell className="text-right font-extrabold text-slate-900">{b.accuracy === null ? "—" : `${b.accuracy}%`}</TableCell>
                <TableCell className="text-right text-xs font-medium text-slate-500">{ago(b.lastAt)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  </div>
);

export const RecentSessions = ({ sessions }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-6 lg:col-span-2" data-testid="recent-sessions">
    <h2 className="font-heading text-lg font-semibold text-slate-900">Recent sessions</h2>
    <p className="text-sm text-slate-500">Your latest study and exam sessions</p>
    <ul className="mt-4 divide-y divide-slate-100">
      {sessions.slice(0, 7).map((s) => {
        const pct = s.answered ? Math.round((s.correct / (s.mode === "exam" ? s.total : s.answered)) * 100) : 0;
        return (
          <li key={s.id} className="flex items-center gap-3 py-3" data-testid={`session-row-${s.id}`}>
            <span className={`rounded-md px-2 py-0.5 text-[11px] font-semibold uppercase ${s.mode === "exam" ? "bg-sky-50 text-sky-700" : "bg-teal-50 text-teal-700"}`}>{s.mode}</span>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-slate-800">{s.subjectCode} · {s.label}</div>
              <div className="text-xs text-slate-500">{ago(s.endedAt)} · {formatDuration(s.durationSec)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-900">{pct}%</div>
              <div className="text-xs text-slate-500">{s.correct}/{s.mode === "exam" ? s.total : s.answered}</div>
            </div>
          </li>
        );
      })}
      {sessions.length === 0 && <li className="py-8 text-center text-sm text-slate-400">No sessions yet.</li>}
    </ul>
  </div>
);
