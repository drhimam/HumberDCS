import { useState } from "react";
import { Link } from "react-router-dom";
import { HeartPulse, Heart, MessageSquarePlus, GraduationCap, ShieldCheck, Scale, Lock, AlertTriangle, Cookie, Mail, Sparkles, ExternalLink } from "lucide-react";
import { DonateDialog } from "@/components/DonateDialog";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { LegalDialog } from "@/components/LegalDialog";

export const Footer = () => {
  const [donateOpen, setDonateOpen] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [legalTab, setLegalTab] = useState(null);

  const openLegal = (tab) => {
    setLegalTab(tab);
  };

  return (
    <>
      <footer className="border-t border-slate-200/80 bg-slate-900 text-white relative z-10" data-testid="main-footer">
        {/* Humber DCS Dedication Top Banner */}
        <div className="border-b border-slate-800 bg-gradient-to-r from-sky-950 via-slate-900 to-teal-950 px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                <GraduationCap className="h-4 w-4" />
              </span>
              <span className="font-semibold text-slate-200">
                <b className="text-white font-bold">Dedicated with gratitude</b> to Humber College DCS Faculty, Instructors & Students.
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => openLegal("about")}
                className="font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1"
                data-testid="footer-link-about-dedication"
              >
                Read dedication & mission →
              </button>
            </div>
          </div>
        </div>

        {/* Main Footer Columns */}
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
            {/* Column 1 & 2: Platform Mission & Identity */}
            <div className="lg:col-span-2 space-y-4">
              <Link to="/" className="inline-flex items-center gap-2.5">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-white shadow-lg shadow-sky-950/40">
                  <HeartPulse className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-heading text-xl font-extrabold tracking-tight text-white">DCSQbank</span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wider text-sky-300">Diagnostic Cardiac Sonography</span>
                </span>
              </Link>

              <p className="text-xs text-slate-300 leading-relaxed font-medium max-w-md">
                A community-supported, <b>not-for-profit educational platform</b> created to empower Diagnostic Cardiac Sonography learners. We aim to help every DCS student achieve clinical excellence and pass with distinction on <b>Sonography Canada (CRCS)</b> and <b>ARDMS</b> credentialing exams.
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDonateOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-500/20 transition-colors"
                  data-testid="footer-donate-btn"
                >
                  <Heart className="h-3.5 w-3.5 fill-rose-400 text-rose-400" /> Support & Donate
                </button>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3.5 py-1.5 text-xs font-bold text-sky-300 hover:bg-sky-500/20 transition-colors"
                  data-testid="footer-feedback-btn"
                >
                  <MessageSquarePlus className="h-3.5 w-3.5" /> Send Feedback
                </button>
              </div>
            </div>

            {/* Column 3: Navigation */}
            <div className="space-y-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</h4>
              <ul className="space-y-2 text-xs font-medium text-slate-300">
                <li><Link to="/courses" className="hover:text-white transition-colors">Courses & Subjects</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Student Dashboard</Link></li>
                <li><Link to="/courses" className="hover:text-white transition-colors">Exam Simulation</Link></li>
                <li><Link to="/wrong-answers" className="hover:text-white transition-colors">Wrong Answers Review</Link></li>
                <li><Link to="/signin" className="hover:text-white transition-colors">Account Sign In</Link></li>
                <li><Link to="/signup" className="hover:text-white transition-colors">Create Free Account</Link></li>
              </ul>
            </div>

            {/* Column 4: Community & Feedback */}
            <div className="space-y-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">Support & Feedback</h4>
              <ul className="space-y-2 text-xs font-medium text-slate-300">
                <li>
                  <button type="button" onClick={() => setFeedbackOpen(true)} className="hover:text-white transition-colors text-left flex items-center gap-1.5" data-testid="footer-link-feedback">
                    <MessageSquarePlus className="h-3.5 w-3.5 text-sky-400" /> Submit Feedback / Errata
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setDonateOpen(true)} className="hover:text-white transition-colors text-left flex items-center gap-1.5" data-testid="footer-link-support">
                    <Heart className="h-3.5 w-3.5 text-rose-400" /> Support via PayPal
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => openLegal("about")} className="hover:text-white transition-colors text-left flex items-center gap-1.5" data-testid="footer-link-about">
                    <GraduationCap className="h-3.5 w-3.5 text-teal-400" /> About DCSQbank Mission
                  </button>
                </li>
                <li className="pt-1">
                  <span className="block text-[11px] text-slate-400">Direct Inquiries:</span>
                  <a href="mailto:dcsqbank@qbanks.org" className="font-bold text-sky-400 hover:underline">
                    dcsqbank@qbanks.org
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 5: Legal & Policies */}
            <div className="space-y-3">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-400">Policies & Disclaimers</h4>
              <ul className="space-y-2 text-xs font-medium text-slate-300">
                <li>
                  <button type="button" onClick={() => openLegal("terms")} className="hover:text-white transition-colors text-left flex items-center gap-1.5" data-testid="footer-link-terms">
                    <Scale className="h-3.5 w-3.5 text-slate-400" /> Terms of Service
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => openLegal("acceptable")} className="hover:text-white transition-colors text-left flex items-center gap-1.5" data-testid="footer-link-acceptable">
                    <ShieldCheck className="h-3.5 w-3.5 text-slate-400" /> Acceptable Use Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => openLegal("privacy")} className="hover:text-white transition-colors text-left flex items-center gap-1.5" data-testid="footer-link-privacy">
                    <Lock className="h-3.5 w-3.5 text-slate-400" /> Privacy Policy
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => openLegal("disclaimer")} className="hover:text-white transition-colors text-left flex items-center gap-1.5" data-testid="footer-link-disclaimer">
                    <AlertTriangle className="h-3.5 w-3.5 text-amber-400" /> Medical & Academic Disclaimer
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => openLegal("cookies")} className="hover:text-white transition-colors text-left flex items-center gap-1.5" data-testid="footer-link-cookies">
                    <Cookie className="h-3.5 w-3.5 text-slate-400" /> Cookie Policy
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright and Attribution Line */}
          <div className="mt-12 border-t border-slate-800 pt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400">
            <div className="space-y-1">
              <p className="font-semibold text-slate-300">
                © {new Date().getFullYear()} DCSQbank · Open Not-for-Profit Educational Initiative.
              </p>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Dedicated to Humber College DCS learners. Sonography Canada (CRCS) & ARDMS are trademarks of their respective credentialing organizations. Mention is for descriptive identification only.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold shrink-0">
              <button type="button" onClick={() => openLegal("privacy")} className="hover:text-white transition-colors">Privacy</button>
              <span className="text-slate-600">·</span>
              <button type="button" onClick={() => openLegal("terms")} className="hover:text-white transition-colors">Terms</button>
              <span className="text-slate-600">·</span>
              <button type="button" onClick={() => openLegal("disclaimer")} className="hover:text-white transition-colors">Disclaimer</button>
              <span className="text-slate-600">·</span>
              <button type="button" onClick={() => setFeedbackOpen(true)} className="hover:text-white transition-colors text-sky-400">Feedback</button>
            </div>
          </div>
        </div>
      </footer>

      {/* Global Dialogs triggered from Footer */}
      <DonateDialog open={donateOpen} onOpenChange={setDonateOpen} />
      <FeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
      <LegalDialog open={Boolean(legalTab)} onOpenChange={(open) => !open && setLegalTab(null)} initialTab={legalTab || "about"} />
    </>
  );
};
