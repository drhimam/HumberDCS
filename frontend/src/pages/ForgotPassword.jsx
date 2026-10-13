import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, HeartPulse, KeyRound, Loader2, Mail, Send } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authRequest } from "@/lib/auth";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setBusy(true);
    try {
      await authRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      setSubmitted(true);
      toast.success("Reset link sent! Check your email inbox.");
    } catch (error) {
      toast.error(error.message || "Failed to request password reset.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_15%_10%,rgba(125,211,252,0.35),transparent_32rem),radial-gradient(circle_at_85%_90%,rgba(94,234,212,0.28),transparent_28rem)] px-4 py-10">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-200">
            <HeartPulse className="h-5 w-5" />
          </span>
          <span className="font-heading text-2xl font-bold text-slate-900">DCSQbank</span>
        </Link>

        <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-xl shadow-sky-100/70 backdrop-blur sm:p-8">
          <Link to="/signin" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-sky-700">
            <ArrowLeft className="h-4 w-4" /> Back to sign in
          </Link>

          {submitted ? (
            <div className="mt-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                <CheckCircle2 className="h-8 w-8 text-sky-600" />
              </div>
              <h1 className="mt-4 font-heading text-2xl font-bold text-slate-900">Check your inbox</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                If an account with <strong>{email}</strong> exists, we’ve sent an email with a secure link to reset your password.
              </p>
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-500">
                The link is valid for 2 hours. Be sure to check your spam or junk folder if you don't see it within a couple minutes.
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <Link to="/signin">
                  <Button className="h-11 w-full rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 text-white shadow hover:from-sky-700 hover:to-teal-600">
                    Return to Sign In
                  </Button>
                </Link>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-semibold text-slate-500 hover:text-sky-700"
                >
                  Try another email address
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <div className="mb-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h1 className="mt-3 font-heading text-2xl font-bold text-slate-900">Forgot your password?</h1>
                <p className="mt-1.5 text-xs text-slate-500">
                  Enter the email address associated with your DCSQbank account and we'll send you a password reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Account Email
                  <div className="relative mt-1.5">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                  </div>
                </label>

                <Button
                  type="submit"
                  disabled={busy}
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 text-white shadow hover:from-sky-700 hover:to-teal-600"
                >
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Reset Link
                    </>
                  )}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-slate-500">
                Remember your password?{" "}
                <Link to="/signin" className="font-semibold text-sky-600 hover:text-sky-700">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
