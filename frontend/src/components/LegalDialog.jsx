import { useState, useEffect } from "react";
import { ShieldCheck, Scale, FileText, Lock, AlertTriangle, Cookie, Heart, GraduationCap, Award } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "about", label: "About Us & Dedication", icon: GraduationCap },
  { id: "terms", label: "Terms of Service", icon: Scale },
  { id: "privacy", label: "Privacy Policy", icon: Lock },
  { id: "disclaimer", label: "Medical Disclaimer", icon: AlertTriangle },
  { id: "acceptable", label: "Acceptable Use", icon: ShieldCheck },
  { id: "cookies", label: "Cookie Policy", icon: Cookie },
];

export const LegalDialog = ({ open, onOpenChange, initialTab = "about" }) => {
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (open && initialTab) {
      setActiveTab(initialTab);
    }
  }, [open, initialTab]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-3xl p-6 sm:p-8 bg-white text-slate-900 shadow-2xl max-h-[90vh] flex flex-col" data-testid="legal-dialog">
        <DialogHeader className="text-left space-y-1.5 pb-2 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-600 to-teal-600 text-white shadow-md">
              <Scale className="h-5 w-5" />
            </span>
            <div>
              <DialogTitle className="font-heading text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Legal, Policies & About DCSQbank
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-500">
                Dedicated to Humber College DCS Faculty & Students · Not-For-Profit Educational Initiative
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab navigation pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-b border-slate-100 shrink-0 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all",
                  active
                    ? "bg-sky-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                )}
                data-testid={`legal-tab-${tab.id}`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content scroll area */}
        <div className="overflow-y-auto py-4 pr-1 text-xs text-slate-700 space-y-4 leading-relaxed flex-1">
          {activeTab === "about" && (
            <div className="space-y-4 animate-in fade-in" data-testid="legal-content-about">
              <div className="rounded-2xl border border-sky-200 bg-sky-50/80 p-5 space-y-2">
                <div className="flex items-center gap-2 text-sky-900 font-heading font-extrabold text-base">
                  <GraduationCap className="h-5 w-5 text-sky-700" />
                  <span>Dedicated to Humber College DCS Faculty and Students</span>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed font-medium">
                  DCSQbank was created with profound respect for the dedicated faculty, clinical instructors, and aspiring students of the <b>Diagnostic Cardiac Sonography (DCS)</b> program at Humber College Institute of Technology & Advanced Learning.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-heading text-sm font-bold text-slate-950 uppercase tracking-wide">Our Mission & Purpose</h4>
                <p>
                  DCSQbank is a <b>not-for-profit, student-centered learning initiative</b> designed to elevate sonography education. Our sole mission is to empower Humber DCS learners with rigorous, curriculum-aligned practice questions that translate into clinical excellence and board exam triumph.
                </p>
                <p>
                  The question bank systematically targets the core competencies required for certification with:
                </p>
                <ul className="list-disc pl-5 space-y-1 font-semibold text-slate-800">
                  <li><b>Sonography Canada</b>: Canadian Registered Cardiac Sonographer (CRCS) credentialing and physics foundations.</li>
                  <li><b>ARDMS</b>: American Registry for Diagnostic Medical Sonography Adult Echocardiography (AE) & Sonography Principles & Instrumentation (SPI) examinations.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <h4 className="font-heading text-sm font-bold text-slate-950 uppercase tracking-wide">Community & Open Education</h4>
                <p>
                  As an open educational initiative, DCSQbank is completely free to access. Community support and donations help cover Cloudflare infrastructure, secure verification email relay, and domain expenses. All question contributions undergo continuous review to ensure alignment with active Canadian clinical standards.
                </p>
                <p className="font-medium text-slate-600">
                  Contact and feedback channel: <a href="mailto:dcsqbank@qbanks.org" className="text-sky-700 font-bold hover:underline">dcsqbank@qbanks.org</a>.
                </p>
              </div>
            </div>
          )}

          {activeTab === "terms" && (
            <div className="space-y-3 animate-in fade-in" data-testid="legal-content-terms">
              <h4 className="font-heading text-sm font-bold text-slate-950">1. Acceptance of Terms</h4>
              <p>
                By accessing or using DCSQbank (the &quot;Platform&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, please discontinue use of the platform immediately.
              </p>

              <h4 className="font-heading text-sm font-bold text-slate-950">2. Educational & Non-Profit Nature</h4>
              <p>
                DCSQbank is provided free of charge as a non-profit educational study companion. It is intended solely for personal study, curriculum revision, and credentialing exam self-assessment. Any unauthorized commercial exploitation, resale, or distribution of platform contents is strictly prohibited.
              </p>

              <h4 className="font-heading text-sm font-bold text-slate-950">3. User Accounts</h4>
              <p>
                When you create an account, you agree to provide an authentic email address and maintain the confidentiality of your credentials. You are responsible for all activities occurring under your account. We reserve the right to suspend or terminate accounts that violate our Acceptable Use Policy.
              </p>

              <h4 className="font-heading text-sm font-bold text-slate-950">4. Intellectual Property & Academic Fair Use</h4>
              <p>
                Question items, clinical rationales, and platform code are created for educational purposes. Diagnostic images and diagrams are shared under educational fair use guidelines for non-clinical academic training.
              </p>

              <h4 className="font-heading text-sm font-bold text-slate-950">5. Limitation of Liability</h4>
              <p>
                The platform is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranty of any kind. Under no circumstances will DCSQbank or its contributors be liable for any direct, indirect, or consequential damages resulting from the use or inability to use this platform.
              </p>
            </div>
          )}

          {activeTab === "privacy" && (
            <div className="space-y-3 animate-in fade-in" data-testid="legal-content-privacy">
              <h4 className="font-heading text-sm font-bold text-slate-950">1. Local-First Privacy Architecture</h4>
              <p>
                DCSQbank prioritizes student privacy. By default, your practice question answers, accuracy analytics, session history, and exam attempts are stored locally on your own device using browser storage (localStorage). You retain complete control over your data and can export, backup, or delete it at any time.
              </p>

              <h4 className="font-heading text-sm font-bold text-slate-950">2. Information We Collect</h4>
              <p>
                When you register for an account to enable cross-device synchronization:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li><b>Name & Email Address</b>: Used solely for authentication, password recovery, and email verification.</li>
                <li><b>Password</b>: Cryptographically salted and hashed using PBKDF2 with SHA-256 (100,000 iterations); plain passwords are never stored or transmitted.</li>
                <li><b>Feedback Submissions</b>: Feedback messages and optional contact information submitted via our forms are processed to improve curriculum quality.</li>
              </ul>

              <h4 className="font-heading text-sm font-bold text-slate-950">3. Zero Selling of Personal Data</h4>
              <p>
                We never sell, rent, or monetize your personal information or study history with third parties, advertisers, or data brokers.
              </p>

              <h4 className="font-heading text-sm font-bold text-slate-950">4. Service Providers</h4>
              <p>
                We utilize trusted infrastructure providers strictly for core platform functionality: Cloudflare (hosting, D1 database, and edge routing) and Zoho ZeptoMail (transactional email verification and password reset dispatch).
              </p>
            </div>
          )}

          {activeTab === "disclaimer" && (
            <div className="space-y-3 animate-in fade-in" data-testid="legal-content-disclaimer">
              <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-950 font-semibold space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <span>Important Medical Notice</span>
                </div>
                <p className="text-xs font-medium">
                  DCSQbank is an academic revision question bank and NOT a provider of medical diagnosis, patient care advice, or clinical guidelines.
                </p>
              </div>

              <h4 className="font-heading text-sm font-bold text-slate-950">1. Not Medical Advice</h4>
              <p>
                The information, clinical scenarios, calculations, and explanations on DCSQbank are intended strictly for educational review and test preparation. They should never be used as clinical decision-making tools, diagnostic criteria, or medical advice for patient management. Always defer to institutional hospital policies, licensed cardiologists, and certified clinical sonographers.
              </p>

              <h4 className="font-heading text-sm font-bold text-slate-950">2. Institutional Independence</h4>
              <p>
                While dedicated to Humber College DCS students and tailored to the diploma course structure, DCSQbank is an independent, non-profit community initiative and is not an official publication of, or directly endorsed by, Humber College, Sonography Canada, or the ARDMS.
              </p>

              <h4 className="font-heading text-sm font-bold text-slate-950">3. Trademark Notice</h4>
              <p>
                &quot;Sonography Canada&quot;, &quot;CRCS&quot;, &quot;ARDMS&quot;, &quot;SPI&quot;, and &quot;Adult Echocardiography&quot; are registered trademarks of their respective credentialing organizations. Their mention on this platform is for descriptive, nominative educational identification only.
              </p>
            </div>
          )}

          {activeTab === "acceptable" && (
            <div className="space-y-3 animate-in fade-in" data-testid="legal-content-acceptable">
              <h4 className="font-heading text-sm font-bold text-slate-950">1. Academic Honesty & Integrity</h4>
              <p>
                DCSQbank is designed to support honest, active learning. Users are encouraged to test their own knowledge, learn from explanations, and use timed exam simulations to prepare for certification.
              </p>

              <h4 className="font-heading text-sm font-bold text-slate-950">2. Prohibited Activities</h4>
              <p>When using DCSQbank, you agree NOT to:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Deploy automated bots, scrapers, or extraction crawlers to bulk harvest questions or image assets.</li>
                <li>Attempt to disrupt platform infrastructure, flood transactional email endpoints, or probe for vulnerabilities.</li>
                <li>Impersonate faculty members, students, or administrators.</li>
                <li>Submit abusive, misleading, or malicious content through the feedback forms.</li>
              </ul>

              <h4 className="font-heading text-sm font-bold text-slate-950">3. Enforcement</h4>
              <p>
                We reserve the right to restrict access or revoke credentials for any user found in violation of these acceptable use policies.
              </p>
            </div>
          )}

          {activeTab === "cookies" && (
            <div className="space-y-3 animate-in fade-in" data-testid="legal-content-cookies">
              <h4 className="font-heading text-sm font-bold text-slate-950">1. How We Use Cookies</h4>
              <p>
                DCSQbank uses only strictly necessary technical cookies. We do not use third-party tracking, profiling, or behavioral advertising cookies.
              </p>

              <h4 className="font-heading text-sm font-bold text-slate-950">2. Essential Cookies Used</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <b><code>dcsqbank_session</code></b>: An encrypted, <code>HttpOnly</code>, <code>SameSite=Lax</code> session token used exclusively to authenticate signed-in users with our Cloudflare Worker API.
                </li>
              </ul>

              <h4 className="font-heading text-sm font-bold text-slate-950">3. Local Browser Storage</h4>
              <p>
                In addition to cookies, our application utilizes browser <code>localStorage</code> to store your offline study answers, question bookmarks, active exam timers, and theme preferences so you can continue learning seamlessly without interruptions.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-semibold text-slate-500">
            Questions? Contact <a href="mailto:dcsqbank@qbanks.org" className="text-sky-700 font-bold hover:underline">dcsqbank@qbanks.org</a>
          </span>
          <Button onClick={() => onOpenChange(false)} className="rounded-full bg-slate-900 text-white font-bold text-xs px-6 hover:bg-slate-800">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
