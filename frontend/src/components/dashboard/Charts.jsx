import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const Panel = ({ title, sub, children, testId, className = "" }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-6 ${className}`} data-testid={testId}>
    <h2 className="font-heading text-lg font-semibold text-slate-900">{title}</h2>
    {sub && <p className="text-sm text-slate-500">{sub}</p>}
    <div className="mt-4 h-60">{children}</div>
  </div>
);

const tooltipStyle = { borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 };

export const SubjectAccuracyChart = ({ stats }) => {
  const data = stats.subjects
    .filter((s) => stats.bySubject[s.id].attempts > 0)
    .map((s) => ({ name: s.code, accuracy: stats.bySubject[s.id].accuracy, completion: stats.bySubject[s.id].completion }));
  return (
    <Panel title="Accuracy by course" sub="Share of attempts answered correctly" testId="subject-accuracy-chart" className="lg:col-span-2">
      {data.length === 0 ? (
        <div className="flex h-full items-center justify-center text-sm text-slate-400">Answer some questions to see your accuracy here.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4}>
            <CartesianGrid vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} unit="%" width={40} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc" }} />
            <Bar dataKey="accuracy" name="Accuracy %" fill="#0d9488" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="completion" name="Coverage %" fill="#bae6fd" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Panel>
  );
};

export const ActivityChart = ({ stats }) => (
  <Panel title="Last 14 days" sub="Questions answered per day" testId="activity-chart" className="lg:col-span-2">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={stats.activity}>
        <CartesianGrid vertical={false} stroke="#f1f5f9" />
        <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} interval={1} />
        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} width={30} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#f8fafc" }} />
        <Bar dataKey="correct" name="Correct" stackId="a" fill="#0d9488" maxBarSize={22} />
        <Bar dataKey="answered" name="Answered" fill="#38bdf8" radius={[6, 6, 0, 0]} maxBarSize={22} />
      </BarChart>
    </ResponsiveContainer>
  </Panel>
);
