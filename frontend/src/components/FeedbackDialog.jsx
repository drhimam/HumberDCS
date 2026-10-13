import { useState } from "react";
import { MessageSquarePlus, Send, CheckCircle2, AlertCircle, Heart, Mail, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthUser } from "@/lib/auth";
import { submitFeedback } from "@/lib/feedback";

const CATEGORIES = [
  { value: "Question Error / Errata", label: "Question Error / Errata" },
  { value: "Curriculum Topic Suggestion", label: "Curriculum Topic Suggestion" },
  { value: "Feature Request", label: "Feature Request" },
  { value: "Technical Bug Report", label: "Technical Bug Report" },
  { value: "Faculty / Collaboration", label: "Faculty / Educational Collaboration" },
  { value: "Praise & General Feedback", label: "Praise & General Feedback" },
];

const COURSES = [
  { value: "", label: "General / Not Course Specific" },
  { value: "DCS5000", label: "DCS5000 - Intro to Echocardiography" },
  { value: "DCS5002", label: "DCS5002 - Cardiac Anatomy & Physiology" },
  { value: "DCS5003", label: "DCS5003 - Cardiac Pathophysiology I" },
  { value: "DCS5004", label: "DCS5004 - Ultrasound Physics & Instrumentation" },
  { value: "DCS5005", label: "DCS5005 - Sonography Principles & Scanning" },
  { value: "DCS5006", label: "DCS5006 - Patient Care & Professional Practice" },
  { value: "IPE101", label: "IPE101 - Interprofessional Education" },
  { value: "DCS5500", label: "DCS5500 - Advanced Echocardiography" },
  { value: "DCS5501", label: "DCS5501 - Valvular Heart Disease" },
  { value: "DCS5502", label: "DCS5502 - Congenital Heart Disease" },
  { value: "DCS5503", label: "DCS5503 - Cardiac Pathophysiology II" },
  { value: "DCS5504", label: "DCS5504 - Advanced Physics & Hemodynamics" },
  { value: "DCS5505", label: "DCS5505 - Clinical Applications & Case Studies" },
  { value: "DCS5506", label: "DCS5506 - Professional Ethics & Law" },
];

export const FeedbackDialog = ({ open, onOpenChange, initialSubjectId = "" }) => {
  const authUser = useAuthUser();
  const [name, setName] = useState(authUser?.displayName || "");
  const [email, setEmail] = useState(authUser?.email || "");
  const [category, setCategory] = useState("Question Error / Errata");
  const [subjectId, setSubjectId] = useState(initialSubjectId);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const resetForm = () => {
    setMessage("");
    setError(null);
    setSuccess(false);
    setLoading(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    if (success) {
      setTimeout(resetForm, 300);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || message.trim().length < 5) {
      setError("Please write at least a few words describing your feedback.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await submitFeedback({
        name: name.trim() || authUser?.displayName || "DCS Learner",
        email: email.trim() || authUser?.email || "",
        category,
        subjectId,
        message: message.trim(),
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Failed to submit feedback. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(true) : handleClose())}>
      <DialogContent className="max-w-lg rounded-3xl p-6 sm:p-7 bg-white text-slate-900 shadow-2xl" data-testid="feedback-dialog">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-teal-600 text-white shadow-md shadow-sky-600/25">
              <MessageSquarePlus className="h-6 w-6" />
            </span>
            <div>
              <DialogTitle className="font-heading text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                Share Your Feedback
              </DialogTitle>
              <DialogDescription className="text-xs font-semibold text-slate-500">
                Direct to <span className="text-sky-700 font-bold">dcsqbank@qbanks.org</span> · Dedicated to Humber DCS Excellence
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {success ? (
          <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95" data-testid="feedback-success">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner">
              <CheckCircle2 className="h-9 w-9" />
            </div>
            <div className="space-y-1.5">
              <h3 className="font-heading text-xl font-bold text-slate-950">Thank you for your feedback!</h3>
              <p className="text-xs font-medium text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your message has been delivered directly to <span className="font-bold text-sky-700">dcsqbank@qbanks.org</span>.
                {email && (
                  <span className="block mt-1 text-slate-500">
                    An automated confirmation receipt has been sent to <b>{email}</b>.
                  </span>
                )}
              </p>
            </div>
            <div className="pt-2">
              <Button onClick={handleClose} className="rounded-full bg-gradient-to-r from-sky-700 to-teal-600 text-white font-bold px-8 shadow-md hover:opacity-95">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700" data-testid="feedback-error">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Your Name (Optional)</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Alex (DCS Year 1)"
                  className="rounded-xl border-slate-200 text-xs font-medium"
                  disabled={loading}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Email (Optional)
                  <span className="text-[10px] text-slate-400 font-normal ml-1">For confirmation</span>
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@humber.ca"
                  className="rounded-xl border-slate-200 text-xs font-medium"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  disabled={loading}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Related Course</label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  disabled={loading}
                >
                  {COURSES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Message / Details</label>
                <span className="text-[10px] text-slate-400 font-mono">{message.length}/4000</span>
              </div>
              <textarea
                required
                rows={4}
                maxLength={4000}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Let us know what question can be improved, report an erratum, suggest a high-yield concept, or share your thoughts..."
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
                disabled={loading}
              />
            </div>

            <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3 flex items-start gap-2.5 text-[11px] text-sky-900 leading-relaxed">
              <Sparkles className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
              <span>
                Feedback helps ensure the highest standard of accuracy for <b>Sonography Canada (CRCS)</b> and <b>ARDMS</b> preparation across Humber College. Thank you for contributing!
              </span>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="rounded-full text-xs font-semibold">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !message.trim()}
                className="rounded-full bg-gradient-to-r from-sky-700 to-teal-600 text-white font-bold text-xs px-6 shadow-md hover:opacity-95"
                data-testid="submit-feedback-btn"
              >
                {loading ? "Sending..." : <><Send className="h-3.5 w-3.5 mr-1.5" /> Send Feedback</>}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
