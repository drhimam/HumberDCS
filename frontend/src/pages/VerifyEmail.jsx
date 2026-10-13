import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, HeartPulse, Loader2, Mail, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authRequest } from "@/lib/auth";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(Boolean(token));
  const [verified, setVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [resendEmail, setResendEmail] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const verify = async () => {
      try {
        const data = await authRequest(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        if (isMounted) {
          setVerified(true);
          toast.success(data.message || "Email verified successfully!");
        }
      } catch (err) {
        if (isMounted) {
          setErrorMessage(err.message || "The verification link is invalid or has expired.");
          toast.error(err.message || "Verification failed");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResending(true);
    setResendSuccess("");
    try {
      const data = await authRequest("/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email: resendEmail.trim() }),
      });
      setResendSuccess(data.message || "Verification link sent! Please check your email inbox.");
      toast.success("Verification email sent!");
    } catch (err) {
      toast.error(err.message || "Failed to send verification link.");
    } finally {
      setResending(false);
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

          {loading ? (
            <div className="mt-8 flex flex-col items-center justify-center py-8 text-center">
              <Loader2 className="h-10 w-10 animate-spin text-sky-600" />
              <h1 className="mt-4 font-heading text-2xl font-bold text-slate-900">Verifying your email...</h1>
              <p className="mt-2 text-sm text-slate-500">Please wait while we confirm your verification link.</p>
            </div>
          ) : verified ? (
            <div className="mt-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-4 font-heading text-2xl font-bold text-slate-900">Email verified!</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your DCSQbank account is now verified and active. You can now sign in to track your study sessions and exam progress.
              </p>
              <div className="mt-8">
                <Link to="/signin">
                  <Button className="h-11 w-full rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 text-white shadow hover:from-sky-700 hover:to-teal-600">
                    Sign in to your account
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              {token && errorMessage ? (
                <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-center">
                  <XCircle className="mx-auto h-8 w-8 text-rose-500" />
                  <h2 className="mt-2 text-base font-bold text-rose-900">Verification Link Invalid or Expired</h2>
                  <p className="mt-1 text-xs text-rose-700">{errorMessage}</p>
                </div>
              ) : (
                <div className="mb-4 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                    <Mail className="h-6 w-6" />
                  </div>
                  <h1 className="mt-3 font-heading text-2xl font-bold text-slate-900">Resend Verification Email</h1>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Enter the email address you registered with to receive a new verification link.
                  </p>
                </div>
              )}

              {resendSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center">
                  <CheckCircle2 className="mx-auto h-7 w-7 text-emerald-600" />
                  <p className="mt-2 text-sm font-semibold text-emerald-900">Email Sent!</p>
                  <p className="mt-1 text-xs text-emerald-700">{resendSuccess}</p>
                  <div className="mt-4">
                    <Link to="/signin">
                      <Button variant="outline" className="h-9 w-full rounded-xl">
                        Go to Sign In
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleResend} className="mt-4 space-y-4">
                  <label className="block text-sm font-semibold text-slate-700">
                    Account Email
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        required
                        type="email"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        placeholder="you@example.com"
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </label>

                  <Button
                    type="submit"
                    disabled={resending}
                    className="h-11 w-full rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 text-white shadow hover:from-sky-700 hover:to-teal-600"
                  >
                    {resending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Verification Email
                      </>
                    )}
                  </Button>
                </form>
              )}

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
