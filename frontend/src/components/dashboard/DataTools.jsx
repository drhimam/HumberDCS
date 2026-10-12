import { useRef, useState } from "react";
import { Download, Upload, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { exportProgress, getLastExportAt, importProgress, resetProgress, validateProgressImport } from "@/lib/progress";

export const DataTools = () => {
  const fileRef = useRef(null);
  const [pending, setPending] = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [lastExportAt, setLastExportAt] = useState(() => getLastExportAt());

  const onFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      setPending(validateProgressImport(data));
    } catch {
      toast.error("This file is not a valid progress export.");
    }
  };

  const doImport = (strategy) => {
    try {
      importProgress(pending, strategy);
      toast.success(strategy === "merge" ? "Progress merged" : "Progress replaced");
    } catch (err) {
      toast.error(err.message);
    }
    setPending(null);
  };

  return (
    <div className="flex flex-wrap gap-2" data-testid="data-tools">
      <Button variant="outline" className="rounded-full" onClick={() => { setLastExportAt(exportProgress()); toast.success("Progress exported"); }} data-testid="export-progress-btn">
        <Download className="h-4 w-4" /> Export
      </Button>
      <Button variant="outline" className="rounded-full" onClick={() => fileRef.current?.click()} data-testid="import-progress-btn">
        <Upload className="h-4 w-4" /> Import
      </Button>
      <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onFile} data-testid="import-file-input" />
      <p className="basis-full text-xs text-slate-500" data-testid="last-export-status">
        {lastExportAt ? `Last backup: ${new Date(lastExportAt).toLocaleString()}` : "No backup saved yet. Export before replacing or resetting progress."}
      </p>
      <Button variant="ghost" className="rounded-full text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setConfirmReset(true)} data-testid="reset-progress-btn">
        <RotateCcw className="h-4 w-4" /> Reset
      </Button>

      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent data-testid="import-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Import progress</AlertDialogTitle>
            <AlertDialogDescription>
              This file has {Object.keys(pending?.attempts || {}).length} answered questions and {pending?.sessions?.length || 0} sessions.
              Merge keeps the newest record for each question. Replace overwrites everything on this device. Export your current progress first if you need a recovery point.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="import-cancel-btn">Cancel</AlertDialogCancel>
            <Button variant="outline" onClick={() => doImport("replace")} data-testid="import-replace-btn">Replace</Button>
            <AlertDialogAction onClick={() => doImport("merge")} data-testid="import-merge-btn">Merge</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent data-testid="reset-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Reset all progress?</AlertDialogTitle>
            <AlertDialogDescription>
              All answers, sessions, and your wrong-answer bank on this device will be deleted.
              {lastExportAt ? ` Your last backup was ${new Date(lastExportAt).toLocaleString()}.` : " You have not created a backup yet."}
              Export a backup first if you want to keep them.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="reset-cancel-btn">Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-600 hover:bg-rose-700" onClick={() => { resetProgress(); toast.success("Progress reset"); }} data-testid="reset-confirm-btn">
              Reset
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
