import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const sectionOf = (q) => q.tags?.[0] || "General";

const groupSections = (chapter) => {
  const map = new Map();
  chapter.questions.forEach((q) => map.set(sectionOf(q), (map.get(sectionOf(q)) || 0) + 1));
  return [...map.entries()].map(([name, count]) => ({ name, count, key: `${chapter.id}::${name}` }));
};

const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-");

export const SectionFilter = ({ chapters, excluded, onChange }) => {
  const groups = chapters.map((c) => ({ chapter: c, sections: groupSections(c) })).filter((g) => g.sections.length > 1 || g.sections[0]?.name !== "General");
  if (!groups.length) return <p className="text-xs text-slate-500">The chosen chapters have no sections to filter.</p>;
  const toggle = (key) => onChange(excluded.includes(key) ? excluded.filter((k) => k !== key) : [...excluded, key]);
  const setAll = (sections, on) => {
    const keys = sections.map((s) => s.key);
    onChange(on ? excluded.filter((k) => !keys.includes(k)) : [...new Set([...excluded, ...keys])]);
  };
  return (
    <div className="space-y-4" data-testid="section-filter">
      {groups.map(({ chapter, sections }) => (
        <div key={chapter.id} className="rounded-xl border border-slate-200 p-4" data-testid={`section-group-${chapter.id}`}>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-slate-900">{chapter.title}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-7 rounded-full text-xs" onClick={() => setAll(sections, true)} data-testid={`sections-all-${chapter.id}`}>All</Button>
              <Button size="sm" variant="ghost" className="h-7 rounded-full text-xs" onClick={() => setAll(sections, false)} data-testid={`sections-none-${chapter.id}`}>None</Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {sections.map((s) => {
              const on = !excluded.includes(s.key);
              return (
                <button key={s.key} onClick={() => toggle(s.key)} aria-pressed={on} data-testid={`section-chip-${chapter.id}-${slug(s.name)}`}
                  className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    on ? "border-sky-300 bg-sky-50 text-sky-800 hover:bg-sky-100" : "border-slate-200 bg-white text-slate-400 line-through hover:bg-slate-50")}>
                  {s.name} <span className="ml-1 font-mono opacity-70">{s.count}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
