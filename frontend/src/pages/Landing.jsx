import { Link } from "react-router-dom";
import { ArrowRight, BookOpenCheck, CheckCircle2, HeartPulse, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  ["Focused study", "Work through reviewed DCS questions with explanations and progress tracking.", BookOpenCheck],
  ["Exam practice", "Build timed practice exams that help you prepare with confidence.", Sparkles],
  ["Your progress", "Create an account later to keep your learning history synchronized across devices.", ShieldCheck],
];

export default function Landing() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white" data-testid="landing-page">
      <div className="absolute inset-x-0 top-0 h-[38rem] bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.35),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(45,212,191,0.3),transparent_32%)]" />
      <nav className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/" className="flex items-center gap-3" data-testid="landing-brand">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-cyan-600 shadow-lg shadow-cyan-950/30">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span>
            <span className="block font-heading text-lg font-bold">DCSQbank</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-200">Diagnostic Cardiac Sonography</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" className="rounded-full text-white hover:bg-white/10 hover:text-white">
            <Link to="/signin">Sign in</Link>
          </Button>
          <Button asChild className="rounded-full bg-white text-sky-800 hover:bg-cyan-50">
            <Link to="/signup">Create account</Link>
          </Button>
        </div>
      </nav>
      <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-24">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-cyan-100">
            <Sparkles className="h-3.5 w-3.5" /> Built for DCS learners
          </p>
          <h1 className="max-w-3xl font-heading text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
            Study smarter. <span className="text-cyan-300">Sound more confident.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
            A colorful, focused question bank for Diagnostic Cardiac Sonography students. Practice by subject, learn from explanations, and see your progress grow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full bg-cyan-400 px-6 text-sky-950 hover:bg-cyan-300">
              <Link to="/courses">Explore subjects <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full border-white/25 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white">
              <Link to="/signup">Join DCSQbank</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-slate-400">You can start studying anonymously. An account will help you keep progress across devices.</p>
        </div>
        <div className="relative">
          <div className="absolute -inset-5 rounded-[2rem] bg-cyan-400/15 blur-2xl" />
          <div className="relative rounded-[2rem] border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur-xl">
            <div className="rounded-2xl bg-white p-5 text-slate-900">
              <div className="flex items-center justify-between">
                <div><p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Today&apos;s focus</p><p className="mt-1 font-heading text-xl font-bold">Cardiac imaging basics</p></div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Ready</span>
              </div>
              <div className="mt-6 rounded-xl border border-slate-200 p-4">
                <p className="text-sm font-semibold leading-6">Which modality displays motion along a single scan line over time?</p>
                <div className="mt-4 space-y-2">
                  {["2D (B-mode) imaging", "M-mode", "Color Doppler", "Pulsed-wave Doppler"].map((option, index) => (
                    <div key={option} className={`flex items-center gap-3 rounded-lg border p-3 text-sm ${index === 1 ? "border-cyan-300 bg-cyan-50 text-cyan-800" : "border-slate-100"}`}>
                      <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold">{String.fromCharCode(65 + index)}</span>{option}
                      {index === 1 && <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-600" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="relative mx-auto grid max-w-7xl gap-4 px-4 pb-16 sm:px-6 md:grid-cols-3">
        {features.map(([title, text, Icon]) => (
          <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.07] p-5">
            <Icon className="h-6 w-6 text-cyan-300" />
            <h2 className="mt-4 font-heading text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
