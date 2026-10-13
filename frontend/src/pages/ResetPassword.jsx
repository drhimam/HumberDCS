import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Eye, EyeOff, HeartPulse, Loader2, LockKeyhole, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authRequest } from "@/lib/auth";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!token) {
      setErrorMessage("Reset token is missing. Please request a new link.");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const data = await authRequest("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      setSuccess(true);
      toast.success(data.message || "Password reset successfully!");
    } catch (error) {
      setErrorMessage(error.message || "Failed to reset password.");
      toast.error(error.message || "Failed to reset password.");
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

          {!token ? (
            <div className="mt-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <XCircle className="h-8 w-8" />
              </div>
              <h1 className="mt-4 font-heading text-2xl font-bold text-slate-900">Invalid Reset Link</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                This password reset link is missing a token or is invalid. Please request a new link.
              </p>
              <div className="mt-6">
                <Link to="/forgot-password">
                  <Button className="h-11 w-full rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 text-white shadow hover:from-sky-700 hover:to-teal-600">
                    Request new reset link
                  </Button>
                </Link>
              </div>
            </div>
          ) : success ? (
            <div className="mt-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="mt-4 font-heading text-2xl font-bold text-slate-900">Password Reset Complete</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your password has been updated successfully. You can now sign in using your new credentials.
              </p>
              <div className="mt-6">
                <Link to="/signin">
                  <Button className="h-11 w-full rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 text-white shadow hover:from-sky-700 hover:to-teal-600">
                    Sign In Now
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6">
              <div className="mb-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
                  <LockKeyhole className="h-6 w-6" />
                </div>
                <h1 className="mt-3 font-heading text-2xl font-bold text-slate-900">Set new password</h1>
                <p className="mt-1.5 text-xs text-slate-500">
                  Please choose a strong password with at least 8 characters.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs text-rose-700">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  New Password
                  <div className="relative mt-1.5">
                    <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                      minLength={8}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoComplete="new-password"
                      className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Confirm New Password
                  <div className="relative mt-1.5">
                    <LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      minLength={8}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      autoComplete="new-password"
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
                      Updating password...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
