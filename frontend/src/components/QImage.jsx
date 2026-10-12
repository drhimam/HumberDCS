import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { assetUrl } from "@/lib/qbank";
import { Maximize2 } from "lucide-react";

export const QImage = ({ src, alt, testId }) => {
  const [open, setOpen] = useState(false);
  if (!src) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative inline-block rounded-xl border border-slate-200 bg-slate-950 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        data-testid={testId}
      >
        <img src={assetUrl(src)} alt={alt} className="max-h-72 w-auto object-contain" />
        <span className="absolute right-2 top-2 rounded-md bg-white/90 p-1.5 text-slate-700 opacity-0 transition-opacity group-hover:opacity-100">
          <Maximize2 className="h-4 w-4" />
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl bg-slate-950 border-slate-800 p-3">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <img src={assetUrl(src)} alt={alt} className="max-h-[80vh] w-full object-contain" />
        </DialogContent>
      </Dialog>
    </>
  );
};
