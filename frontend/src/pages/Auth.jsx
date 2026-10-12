import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, HeartPulse, LockKeyhole, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authRequest, saveAuthSession } from "@/lib/auth";

export function AuthPage({ mode = "signin" }) {
  const isSignUp = mode === "signup";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      const data = await authRequest(isSignUp ? "/auth/register" : "/auth/login", {
        method: "POST",
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          password: form.get("password"),
        }),
      });
      if (isSignUp) {
        setMessage("Your account was created. Check your email and verify your address before signing in.");
        toast.success("Account created. Check your email to verify it.");
      } else {
        saveAuthSession(data.user);
        toast.success("Signed in successfully.");
        navigate(location.state?.from || "/dashboard", { replace: true });
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_15%_10%,rgba(125,211,252,0.35),transparent_32rem),radial-gradient(circle_at_85%_90%,rgba(94,234,212,0.28),transparent_28rem)] px-4 py-10" data-testid={`${mode}-page`}>
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-teal-500 text-white shadow-lg shadow-sky-200"><HeartPulse className="h-5 w-5" /></span>
          <span className="font-heading text-2xl font-bold text-slate-900">DCSQbank</span>
        </Link>
        <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-xl shadow-sky-100/70 backdrop-blur sm:p-8">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-sky-700"><ArrowLeft className="h-4 w-4" /> Back home</Link>
          <h1 className="mt-6 font-heading text-3xl font-bold text-slate-900">{isSignUp ? "Create your account" : "Welcome back"}</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{isSignUp ? "Save your study progress and continue across devices." : "Sign in to continue your DCSQbank study journey."}</p>
          {message && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm leading-6 text-emerald-800" role="status">{message}</p>}
          <form className="mt-7 space-y-4" onSubmit={submit}>
            {isSignUp && <label className="block text-sm font-semibold text-slate-700">Name<div className="relative mt-1.5"><UserRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input required name="name" autoComplete="name" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" placeholder="Your name" /></div></label>}
            <label className="block text-sm font-semibold text-slate-700">Email<div className="relative mt-1.5"><Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input required type="email" name="email" autoComplete="email" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" placeholder="you@example.com" /></div></label>
            <label className="block text-sm font-semibold text-slate-700">Password<div className="relative mt-1.5"><LockKeyhole className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input required type="password" name="password" minLength={8} autoComplete={isSignUp ? "new-password" : "current-password"} className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100" placeholder="At least 8 characters" /></div></label>
            <Button type="submit" disabled={busy} className="h-11 w-full rounded-xl bg-gradient-to-r from-sky-600 to-teal-500 text-white hover:from-sky-700 hover:to-teal-600">{busy ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}</Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">{isSignUp ? "Already have an account?" : "New to DCSQbank?"} <Link to={isSignUp ? "/signin" : "/signup"} className="font-bold text-sky-700 hover:text-sky-900">{isSignUp ? "Sign in" : "Create an account"}</Link></p>
        </div>
      </div>
    </main>
  );
}
