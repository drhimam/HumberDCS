import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  HeartPulse,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  Award,
  Timer,
  BookOpen,
  MessageSquarePlus,
  HelpCircle,
  Activity,
  Layers,
  Heart,
  FileCheck2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { DonateDialog } from "@/components/DonateDialog";
import { LegalDialog } from "@/components/LegalDialog";

const PILLARS = [
  {
    title: "100% Not-for-Profit",
    description: "Built strictly as an open educational initiative for Humber College DCS students. No subscriptions, paywalls, or ads.",
    icon: Heart,
    color: "from-rose-500 to-pink-600",
  },
  {
    title: "Curriculum Aligned",
    description: "Maps directly to Humber College's 14 diploma courses across Semesters 1, 2, and 3, covering core clinical sonography topics.",
    icon: GraduationCap,
    color: "from-sky-500 to-cyan-600",
  },
  {
    title: "Board Exam Mastery",
    description: "Prepares you for Sonography Canada (CRCS) and ARDMS (Adult Echo & SPI) credentialing with clinical rationale and physics formulas.",
    icon: Award,
    color: "from-teal-500 to-emerald-600",
  },
  {
    title: "Real Exam Simulation",
    description: "Experience realistic timed mock exams with question flagging, integrated calculator, and detailed score performance review.",
    icon: Timer,
    color: "from-purple-500 to-indigo-600",
  },
];

const COURSES_HIGHLIGHT = [
  { code: "DCS5000", title: "Introduction to Echocardiography", tag: "Semester 1", color: "from-sky-600 to-cyan-600" },
  { code: "DCS5002", title: "Cardiac Anatomy & Physiology", tag: "Semester 1", color: "from-rose-600 to-pink-600" },
  { code: "DCS5003", title: "Cardiac Pathophysiology I", tag: "Semester 1", color: "from-amber-600 to-orange-600" },
  { code: "DCS5004", title: "Ultrasound Physics & Instrumentation", tag: "Semester 1", color: "from-indigo-600 to-blue-600" },
  { code: "DCS5005", title: "Sonography Principles & Scanning", tag: "Semester 1", color: "from-emerald-600 to-teal-600" },
  { code: "DCS5500", title: "Advanced Echocardiography", tag: "Semester 2/3", color: "from-cyan-600 to-blue-600" },
  { code: "DCS5501", title: "Valvular Heart Disease", tag: "Semester 2/3", color: "from-orange-600 to-amber-600" },
  { code: "DCS5502", title: "Congenital Heart Disease", tag: "Semester 2/3", color: "from-fuchsia-600 to-purple-600" },
  { code: "DCS5504", title: "Advanced Physics & Hemodynamics", tag: "Semester 2/3", color: "from-purple-600 to-indigo-600" },
];

const SAMPLE_QUESTION = {
  stem: "Which ultrasound Doppler modality displays cardiac motion along a single ultrasound scan line plotted continuously over time?",
  options: [
    { text: "2D (B-mode) real-time imaging", explanation: "B-mode displays a two-dimensional cross-sectional anatomical slice." },
    { text: "M-mode (Motion mode)", correct: true, explanation: "Correct! M-mode plots depth along a single scan line over time with exceptionally high temporal resolution." },
    { text: "Color Doppler mapping", explanation: "Color Doppler superimposes mean velocity estimates onto anatomical B-mode images." },
    { text: "Pulsed-wave spectral Doppler", explanation: "PW Doppler displays velocity vs. time spectra at a designated sample volume gate." },
  ],
};

export default function Landing() {
  const [selectedOption, setSelectedOption] = useState(1);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [donateOpen, setDonateOpen] = useState(false);
  const [legalTab, setLegalTab] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-cyan-500 selection:text-white" data-testid="landing-page">
      {/* Background radial medical glows */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[46rem] bg-[radial-gradient(circle_at_20%_10%,rgba(34,211,238,0.28),transparent_40%),radial-gradient(circle_at_80%_5%,rgba(45,212,191,0.25),transparent_38%),radial-gradient(circle_at_50%_35%,rgba(14,165,233,0.18),transparent_42%)]" />

      {/* Top Header Navigation */}
      <header className="relative z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/" className="flex items-center gap-3" data-testid="landing-brand">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-teal-400 text-slate-950 shadow-lg shadow-cyan-950/40 ring-2 ring-white/20">
              <HeartPulse className="h-6 w-6 text-slate-950" />
            </span>
            <span>
              <span className="block font-heading text-xl font-extrabold tracking-tight">DCSQbank</span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-cyan-300">Diagnostic Cardiac Sonography</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setDonateOpen(true)}
              className="hidden sm:inline-flex rounded-full text-xs font-semibold text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
            >
              <Heart className="h-3.5 w-3.5 mr-1 fill-rose-300" /> Donate
            </Button>
            <Button asChild variant="ghost" className="rounded-full text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white">
              <Link to="/signin">Sign in</Link>
            </Button>
            <Button asChild className="rounded-full bg-gradient-to-r from-sky-400 to-teal-400 text-slate-950 font-bold text-xs px-5 shadow-md hover:opacity-95">
              <Link to="/signup">Create account</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {/* Dedicated Humber DCS Honor Strip */}
        <div className="border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/80 via-slate-900/90 to-teal-950/80 px-4 py-3">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 text-center text-xs font-semibold text-cyan-200">
            <GraduationCap className="h-4 w-4 text-cyan-400 shrink-0" />
            <span>
              Dedicated with gratitude to <b>Humber College DCS Faculty, Clinical Instructors & Students</b> · Supporting Sonography Canada & ARDMS Success
            </span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-20">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-cyan-200 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" /> Not-For-Profit Platform for DCS Learners
            </div>
            <h1 className="max-w-3xl font-heading text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl text-white">
              Study smarter. <br />
              <span className="bg-gradient-to-r from-cyan-300 via-sky-300 to-teal-300 bg-clip-text text-transparent">
                Sound more confident.
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
              A colorful, high-yield Diagnostic Cardiac Sonography question bank. Master hemodynamic principles, valvular pathology, Doppler calculations, and adult echocardiography with verified clinical rationales.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-cyan-400 via-sky-400 to-teal-400 px-7 text-slate-950 font-extrabold shadow-lg shadow-cyan-950/40 hover:opacity-95">
                <Link to="/courses">
                  Explore 14 Courses <ArrowRight className="h-4 w-4 ml-1.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full border-white/20 bg-white/5 px-6 font-bold text-white hover:bg-white/10 hover:text-white">
                <Link to="/signup">Join Free Today</Link>
              </Button>
              <Button
                type="button"
                size="lg"
                variant="ghost"
                onClick={() => setFeedbackOpen(true)}
                className="rounded-full text-xs font-semibold text-cyan-300 hover:bg-cyan-500/10"
              >
                <MessageSquarePlus className="h-4 w-4 mr-1.5" /> Submit Feedback
              </Button>
            </div>

            <div className="mt-6 flex items-center gap-4 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-400" /> Free & Non-Profit
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-400" /> Sonography Canada (CRCS)
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-teal-400" /> ARDMS (AE & SPI)
              </span>
            </div>
          </div>

          {/* Interactive Live Preview Question Card */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-sky-500/20 to-teal-500/20 blur-2xl" />
            <div className="relative rounded-3xl border border-white/15 bg-slate-900/90 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
              <div className="rounded-2xl bg-white p-5 sm:p-6 text-slate-900 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">Practice Question Preview</span>
                    <h3 className="font-heading text-lg font-bold text-slate-950">Ultrasound Physics & Instrumentation</h3>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-800">
                    Live Demo
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <p className="text-sm font-bold text-slate-900 leading-snug">
                    {SAMPLE_QUESTION.stem}
                  </p>
                  <div className="mt-3 space-y-2">
                    {SAMPLE_QUESTION.options.map((opt, i) => {
                      const isSelected = selectedOption === i;
                      const isCorrect = opt.correct;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setSelectedOption(i)}
                          className={`w-full text-left flex items-start gap-3 rounded-xl border p-3 text-xs font-semibold transition-all ${
                            isSelected
                              ? isCorrect
                                ? "border-emerald-400 bg-emerald-50 text-emerald-950 shadow-xs"
                                : "border-rose-400 bg-rose-50 text-rose-950"
                              : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
                            isSelected
                              ? isCorrect ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="flex-1 pt-0.5">{opt.text}</span>
                          {isSelected && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />}
                        </button>
                      );
                    })}
                  </div>

                  {selectedOption !== null && (
                    <div className="mt-3 rounded-lg border border-teal-200 bg-teal-50/80 p-3 text-xs text-teal-950 animate-in fade-in">
                      <b className="text-teal-900">Clinical Explanation:</b> {SAMPLE_QUESTION.options[selectedOption].explanation}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Interactive learning with immediate rationale</span>
                  <Link to="/courses" className="font-bold text-sky-700 hover:underline">
                    Try full chapter →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4 Pillars of DCSQbank */}
        <section className="border-t border-white/10 bg-slate-900/60 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Built Exclusively for Diagnostic Cardiac Sonography
              </h2>
              <p className="mt-3 text-sm text-slate-400 font-medium">
                Every component is tailored to support Humber College learners from day one through clinical practicum and credentialing exams.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PILLARS.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-3 hover:border-white/20 transition-all">
                    <span className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.color} text-white shadow-md`}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <h3 className="font-heading text-base font-bold text-white">{p.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed font-medium">{p.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Curriculum Alignment Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">Complete Program Coverage</span>
                <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl mt-1">
                  Humber College DCS Curriculum Roadmaps
                </h2>
                <p className="mt-2 text-sm text-slate-400 font-medium max-w-xl">
                  Practice questions grouped by actual course codes. From foundational cardiac anatomy to complex valvular and congenital pathologies.
                </p>
              </div>
              <Button asChild className="rounded-full bg-white text-slate-900 font-bold hover:bg-slate-100 self-start md:self-auto">
                <Link to="/courses">View All 14 Courses</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {COURSES_HIGHLIGHT.map((c) => (
                <Link
                  key={c.code}
                  to="/courses"
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:bg-white/[0.07] hover:border-cyan-400/40 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`rounded-md bg-gradient-to-r ${c.color} px-2.5 py-0.5 font-mono text-xs font-bold text-white shadow-xs`}>
                        {c.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">{c.tag}</span>
                    </div>
                    <h3 className="mt-3 font-heading text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {c.title}
                    </h3>
                  </div>
                  <div className="mt-5 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-white">
                    <span>Study & exam modes</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Sonography Canada (CRCS) & ARDMS Credentialing Focus */}
        <section className="border-t border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-sky-950/80 via-slate-900 to-teal-950/80 p-8 sm:p-12 shadow-2xl">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-center">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1 text-xs font-bold text-teal-300">
                    <Award className="h-3.5 w-3.5" /> Dual Board Preparedness
                  </div>
                  <h2 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-4xl">
                    Engineered for Success in Sonography Canada & ARDMS
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    Diagnostic Cardiac Sonographers in Canada must conquer comprehensive national examinations. DCSQbank tests the exact clinical scenarios, Bernoulli pressure gradient calculations, continuity equation valve areas, and 2D chamber quantification standards demanded by:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <h4 className="font-heading font-bold text-sm text-cyan-300">Sonography Canada (CRCS)</h4>
                      <p className="text-xs text-slate-400 mt-1">Canadian Registered Cardiac Sonographer credentialing & Core Physics.</p>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <h4 className="font-heading font-bold text-teal-300">ARDMS (AE & SPI)</h4>
                      <p className="text-xs text-slate-400 mt-1">Adult Echocardiography & Sonography Principles and Instrumentation.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 space-y-4 text-xs">
                  <h3 className="font-heading text-base font-bold text-white flex items-center gap-2">
                    <FileCheck2 className="h-5 w-5 text-cyan-400" /> High-Yield Core Competencies Tested
                  </h3>
                  <ul className="space-y-2.5 text-slate-300 font-medium">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      <span><b>Quantitative Hemodynamics</b>: Modified Bernoulli equation, continuity equation, proximal isovelocity surface area (PISA).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      <span><b>Valvular Disease Grading</b>: Aortic stenosis mean gradients, mitral regurgitation jet areas, prosthetic valve assessments.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      <span><b>Physics & Instrumentation</b>: Nyquist limits, aliasing, axial & lateral resolution, acoustic impedance matching, bioeffects.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                      <span><b>Congenital & Shunts</b>: ASD, VSD, Tetralogy of Fallot, Coarctation of the aorta, Qp:Qs shunt calculations.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Feedback & Faculty Collaboration Strip */}
        <section className="py-16 sm:py-20 border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="rounded-3xl border border-white/15 bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 p-8 sm:p-12 text-center space-y-4 max-w-4xl mx-auto shadow-xl">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <MessageSquarePlus className="h-6 w-6" />
              </span>
              <h2 className="font-heading text-2xl font-bold text-white sm:text-3xl">
                Help Us Improve DCSQbank
              </h2>
              <p className="text-sm text-slate-300 max-w-xl mx-auto font-medium leading-relaxed">
                Found a typo? Disagree with a rationale? Want to submit an essential high-yield question or clinical scenario? Send your feedback directly to our sonography review team at <b className="text-sky-300">dcsqbank@qbanks.org</b>.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="rounded-full bg-gradient-to-r from-sky-400 to-teal-400 text-slate-950 font-bold px-7 shadow-md hover:opacity-95"
                >
                  <MessageSquarePlus className="h-4 w-4 mr-1.5" /> Open Feedback Form
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDonateOpen(true)}
                  className="rounded-full border-white/20 bg-white/5 font-semibold text-white hover:bg-white/10"
                >
                  <Heart className="h-4 w-4 mr-1.5 fill-rose-400 text-rose-400" /> Support Platform
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Complete Footer with all policies, dedication, and about links */}
      <Footer />

      {/* Interactive Global Modals */}
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      <DonateDialog open={donateOpen} onOpenChange={setDonateOpen} />
      <LegalDialog open={Boolean(legalTab)} onOpenChange={(open) => !open && setLegalTab(null)} initialTab={legalTab || "about"} />
    </div>
  );
}
