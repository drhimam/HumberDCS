import { Link } from "react-router-dom";
import { ArrowRight, XOctagon } from "lucide-react";

export const WrongAnswerCard = ({ wrong, subjects }) => {
  const counts = subjects
    .map((s) => ({ s, n: wrong.filter((w) => w.subjectId === s.id).length }))
    .filter((x) => x.n > 0)
    .sort((a, b) => b.n - a.n)
    .slice(0, 4);
  return (
    <div className="flex flex-col rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50 to-white p-6" data-testid="wrong-answer-card">
      <div className="flex items-center gap-2 text-rose-600">
        <XOctagon className="h-5 w-5" />
        <span className="text-xs font-semibold uppercase tracking-wider">Wrong-answer bank</span>
      </div>
      <div className="mt-3 font-heading text-4xl font-bold text-slate-900" data-testid="wrong-answer-count">{wrong.length}</div>
      <p className="text-sm text-slate-500">questions you last answered wrong</p>
      <ul className="mt-4 flex-1 space-y-2">
        {counts.map(({ s, n }) => (
          <li key={s.id} className="flex items-center justify-between text-sm">
            <span className="truncate text-slate-700"><span className="font-mono text-xs text-slate-500">{s.code}</span> {s.title}</span>
            <span className="ml-2 rounded-full bg-rose-100 px-2 text-xs font-semibold text-rose-700">{n}</span>
          </li>
        ))}
        {counts.length === 0 && <li className="text-sm text-slate-400">No wrong answers yet. Keep going!</li>}
      </ul>
      <Link
        to="/wrong-answers"
        data-testid="open-wrong-answers-btn"
        className="mt-5 inline-flex items-center gap-2 self-start rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        Review wrong answers <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
};
