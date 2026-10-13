import { useState } from "react";
import { Check, HeartPulse, Loader2, Mail, ShieldCheck, User, UserCheck } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { authRequest, updateAuthUser, useAuthUser } from "@/lib/auth";

export function ProfileDialog({ open, onOpenChange }) {
  const user = useAuthUser();
  const [name, setName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Sync initial name
  useState(() => {
    if (user?.displayName) setName(user.displayName);
  }, [user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }

    setSaving(true);
    try {
      const data = await authRequest("/auth/profile", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      });
      updateAuthUser({ displayName: data.user.displayName });
      toast.success("Profile name updated successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPasswordReset = async () => {
    if (!user?.email) return;
    setResetting(true);
    try {
      await authRequest("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email: user.email }),
      });
      setResetRequested(true);
      toast.success("Password reset instructions sent to your email!");
    } catch (error) {
      toast.error(error.message || "Failed to send reset email.");
    } finally {
      setResetting(false);
    }
  };

  const initials = (user?.displayName || user?.email || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6 sm:p-7">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-teal-500 font-bold text-white shadow-md shadow-sky-200 text-lg">
              {initials}
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                {user?.displayName || "User Profile"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Manage your DCSQbank account details and settings
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {/* Account Overview Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Status</span>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Verified Active
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Role</span>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-sky-700 capitalize">
                <UserCheck className="h-4 w-4 text-sky-600" />
                {user?.role || "Learner"}
              </div>
            </div>
          </div>

          {/* Edit Name Form */}
          <form onSubmit={handleSaveProfile} className="space-y-3">
            <label className="block text-xs font-semibold text-slate-700">
              Display Name
              <div className="relative mt-1">
                <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                />
              </div>
            </label>

            <label className="block text-xs font-semibold text-slate-700">
              Account Email
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  disabled
                  type="email"
                  value={user?.email || ""}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 pl-9 pr-3 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Email address is linked to your verified account credentials.
              </span>
            </label>

            <div className="pt-1">
              <Button
                type="submit"
                disabled={saving || name.trim() === (user?.displayName || "")}
                className="h-9 w-full rounded-xl bg-sky-600 text-xs font-semibold text-white hover:bg-sky-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Save Display Name
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Password Security Section */}
          <div className="rounded-2xl border border-slate-200/80 p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-800">Password & Security</p>
                <p className="text-slate-500 text-[11px]">Request a password reset link to change your password</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={resetting || resetRequested}
                onClick={handleRequestPasswordReset}
                className="rounded-xl text-xs h-8"
              >
                {resetting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : resetRequested ? (
                  "Sent to inbox"
                ) : (
                  "Reset password"
                )}
              </Button>
            </div>
            {resetRequested && (
              <p className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                A password reset link was sent to your email. Check your inbox to set a new password.
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
