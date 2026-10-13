import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CalendarClock,
  Check,
  Database,
  Download,
  Heart,
  Loader2,
  LogOut,
  Mail,
  RotateCcw,
  ShieldCheck,
  Upload,
  User,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { authRequest, logout, updateAuthUser, useAuthUser } from "@/lib/auth";
import {
  exportProgress,
  getLastExportAt,
  importProgress,
  resetProgress,
  validateProgressImport,
} from "@/lib/progress";

export function ProfileDialog({ open, onOpenChange, onOpenDonate }) {
  const user = useAuthUser();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [name, setName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Backup & Data Tools State
  const [lastExportAt, setLastExportAt] = useState(() => getLastExportAt());
  const [pendingImport, setPendingImport] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

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

  const handleExport = () => {
    try {
      const exportedAt = exportProgress();
      setLastExportAt(exportedAt);
      toast.success("Progress backup downloaded successfully!");
    } catch (err) {
      toast.error("Failed to export progress: " + err.message);
    }
  };

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const valid = validateProgressImport(data);
      setPendingImport(valid);
    } catch (err) {
      toast.error(err.message || "This file is not a valid progress export.");
    }
  };

  const doImport = (strategy) => {
    try {
      importProgress(pendingImport, strategy);
      toast.success(strategy === "merge" ? "Progress merged successfully!" : "Progress replaced successfully!");
    } catch (err) {
      toast.error(err.message);
    }
    setPendingImport(null);
  };

  const handleReset = () => {
    try {
      resetProgress();
      toast.success("Progress records reset successfully.");
    } catch (err) {
      toast.error(err.message);
    }
    setConfirmReset(false);
  };

  const handleLogout = async () => {
    onOpenChange(false);
    await logout();
    toast.success("Signed out successfully.");
    navigate("/signin", { replace: true });
  };

  const formatBackupTime = (iso) => {
    if (!iso) return "No backup saved yet";
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } catch {
      return iso;
    }
  };

  const initials = (user?.displayName || user?.email || "U")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto" data-testid="profile-settings-dialog">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-600 to-teal-500 font-bold text-white shadow-md shadow-sky-200 text-lg">
                {initials}
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-slate-900">
                  {user?.displayName || "Profile & Settings"}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500 mt-0.5">
                  Manage your account credentials, local data backups, and preferences
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            {/* Account Overview Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Account Status</span>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Verified Active
                </div>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Role</span>
                <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-sky-700 capitalize">
                  <UserCheck className="h-4 w-4 text-sky-600" />
                  {user?.role || "Sonography Learner"}
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
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 font-medium"
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
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-100 pl-9 pr-3 text-sm text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Email is linked to your registered DCSQbank account.
                </span>
              </label>

              <div className="pt-1">
                <Button
                  type="submit"
                  disabled={saving || name.trim() === (user?.displayName || "")}
                  className="h-9 w-full rounded-xl bg-sky-600 text-xs font-bold text-white hover:bg-sky-700 shadow-xs"
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
            <div className="rounded-2xl border border-slate-200/80 p-3.5 text-xs bg-slate-50/50">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-800">Password & Security</p>
                  <p className="text-slate-500 text-[11px]">Request a secure reset link to update your password</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={resetting || resetRequested}
                  onClick={handleRequestPasswordReset}
                  className="rounded-xl text-xs h-8 font-semibold shrink-0"
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
                <p className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-medium">
                  A password reset email has been sent. Check your inbox to choose a new password.
                </p>
              )}
            </div>

            {/* INTEGRATED DATA & PROGRESS BACKUP SECTION */}
            <div className="rounded-2xl border border-sky-200/90 bg-gradient-to-br from-sky-50/60 to-slate-50/80 p-4 space-y-3" data-testid="settings-data-tools">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-sky-600 shrink-0" />
                  <span className="font-bold text-slate-900 text-sm">Study Progress Backup & Storage</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Your question attempts and exam results are stored locally in this browser. To prevent loss if browser data or history is cleared, export a backup file periodically.
              </p>

              {/* Last Backup Timestamp */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 rounded-xl bg-white/90 border border-slate-200/80 px-3 py-2 shadow-xs" data-testid="last-export-status">
                <CalendarClock className="h-4 w-4 text-sky-600 shrink-0" />
                <span>Last backup: <strong className="text-slate-900">{formatBackupTime(lastExportAt)}</strong></span>
              </div>

              {/* Backup & Reset Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  type="button"
                  onClick={handleExport}
                  className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs h-8 px-3 shadow-xs"
                  data-testid="export-progress-btn"
                >
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Export
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileRef.current?.click()}
                  className="rounded-xl border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs h-8 px-3 shadow-xs"
                  data-testid="import-progress-btn"
                >
                  <Upload className="mr-1.5 h-3.5 w-3.5 text-slate-600" />
                  Import
                </Button>

                <input
                  ref={fileRef}
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={onFile}
                  data-testid="import-file-input"
                />

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setConfirmReset(true)}
                  className="rounded-xl text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold text-xs h-8 px-3 ml-auto"
                  data-testid="reset-progress-btn"
                >
                  <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                  Reset
                </Button>
              </div>
            </div>

            {/* SUPPORT & SIGN OUT ACTIONS */}
            <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2.5">
              <Button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onOpenDonate?.();
                }}
                className="w-full sm:flex-1 rounded-xl border border-rose-200 bg-rose-50/80 text-rose-700 hover:bg-rose-100 hover:text-rose-800 text-xs font-bold h-9 shadow-xs"
                data-testid="settings-donate-btn"
              >
                <Heart className="mr-1.5 h-3.5 w-3.5 fill-rose-500 text-rose-500" />
                Support & Donate
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleLogout}
                className="w-full sm:w-auto rounded-xl border-slate-200 text-xs font-bold h-9 px-4 text-rose-600 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200"
                data-testid="settings-logout-btn"
              >
                <LogOut className="mr-1.5 h-3.5 w-3.5" />
                Sign Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={!!pendingImport} onOpenChange={(o) => !o && setPendingImport(null)}>
        <AlertDialogContent data-testid="import-dialog" className="rounded-3xl p-6 sm:p-7">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">Import progress backup</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 leading-relaxed">
              This backup file contains {Object.keys(pendingImport?.attempts || {}).length} answered questions and {pendingImport?.sessions?.length || 0} study sessions.
              <br /><br />
              <strong>Merge:</strong> Keeps the newest answer for each question and adds previous sessions.<br />
              <strong>Replace:</strong> Completely overwrites your current device history with this file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel data-testid="import-cancel-btn" className="rounded-xl text-xs font-semibold">
              Cancel
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={() => doImport("replace")}
              data-testid="import-replace-btn"
              className="rounded-xl border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold"
            >
              Replace All
            </Button>
            <AlertDialogAction
              onClick={() => doImport("merge")}
              data-testid="import-merge-btn"
              className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold"
            >
              Merge Progress
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent data-testid="reset-dialog" className="rounded-3xl p-6 sm:p-7">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-slate-900">Reset all study progress?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 leading-relaxed">
              All questions answered, exam scores, session logs, and your wrong-answer bank on this device will be permanently deleted.
              <br /><br />
              {lastExportAt ? `Your last saved backup was on ${formatBackupTime(lastExportAt)}.` : "You have not saved a backup yet."}
              <br />
              We strongly recommend exporting a backup first if you want to keep your study milestones.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel data-testid="reset-cancel-btn" className="rounded-xl text-xs font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              data-testid="reset-confirm-btn"
              className="rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
            >
              Confirm Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
