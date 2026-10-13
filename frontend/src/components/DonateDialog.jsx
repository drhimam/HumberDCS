import { useState } from "react";
import { Check, Coffee, ExternalLink, Heart, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const PRESET_AMOUNTS = [
  { amount: 5, label: "$5 CAD", icon: Coffee, desc: "Coffee & Server time" },
  { amount: 15, label: "$15 CAD", icon: Sparkles, desc: "Study supporter" },
  { amount: 30, label: "$30 CAD", icon: Trophy, desc: "Semester champion" },
];

export function DonateDialog({ open, onOpenChange }) {
  const [selectedAmount, setSelectedAmount] = useState(15);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  const effectiveAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;

  const handlePayPalRedirect = () => {
    if (effectiveAmount <= 0) {
      toast.error("Please enter or select a valid donation amount.");
      return;
    }

    // Default PayPal Donate URL / PayPal.me fallback (can be customized with specific merchant/hosted button)
    const paypalDonateUrl = `https://www.paypal.com/donate?business=rifa.numis%40gmail.com&currency_code=CAD&amount=${effectiveAmount}&item_name=DCSQbank+Supporter`;
    window.open(paypalDonateUrl, "_blank", "noopener,noreferrer");
    toast.info("Opening PayPal checkout in a new window...");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-7">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-md shadow-rose-100">
              <Heart className="h-6 w-6 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900">
                Support DCSQbank
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Keeping diagnostic sonography preparation free, ad-free, and community-driven
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {/* Mission Note */}
          <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-4 text-xs leading-relaxed text-slate-700">
            <p>
              DCSQbank was built by and for diagnostic cardiac sonography learners at Humber. Your contributions help cover Cloudflare D1 database hosting, verification email delivery, and continuous question bank maintenance.
            </p>
          </div>

          {/* Amount Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Select Donation Amount (CAD)
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {PRESET_AMOUNTS.map((preset) => {
                const Icon = preset.icon;
                const isSelected = !isCustom && selectedAmount === preset.amount;
                return (
                  <button
                    key={preset.amount}
                    type="button"
                    onClick={() => {
                      setIsCustom(false);
                      setSelectedAmount(preset.amount);
                    }}
                    className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                      isSelected
                        ? "border-sky-500 bg-sky-50/80 text-sky-900 shadow-sm ring-2 ring-sky-200"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 mb-1 ${isSelected ? "text-sky-600" : "text-slate-400"}`} />
                    <span className="text-sm font-bold">{preset.label}</span>
                    <span className="text-[10px] text-slate-500 mt-0.5">{preset.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* Custom Amount Toggle */}
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setIsCustom(true)}
                className={`w-full rounded-xl border p-2.5 text-xs text-left transition-colors flex items-center justify-between ${
                  isCustom
                    ? "border-sky-500 bg-sky-50/80 text-sky-900 ring-2 ring-sky-200"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span className="font-medium">Enter custom amount</span>
                {isCustom && (
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <span className="font-semibold text-slate-500">$</span>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      autoFocus
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="e.g. 50"
                      className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-800 outline-none focus:border-sky-500"
                    />
                    <span className="font-medium text-slate-500">CAD</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* PayPal Payment Action */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#003087]">Pay</span>
                <span className="text-xs font-bold text-[#0079C1]">Pal</span>
                <span className="text-xs text-slate-500">• Secure Checkout</span>
              </div>
              <span className="text-xs font-bold text-slate-800">
                ${effectiveAmount || 0} CAD
              </span>
            </div>

            <Button
              type="button"
              onClick={handlePayPalRedirect}
              className="h-11 w-full rounded-xl bg-[#0070BA] font-semibold text-white shadow hover:bg-[#003087] transition-all flex items-center justify-center gap-2"
            >
              <Heart className="h-4 w-4 fill-white" />
              Donate with PayPal
              <ExternalLink className="h-3.5 w-3.5 ml-1 opacity-70" />
            </Button>

            <p className="mt-2 text-center text-[11px] text-slate-400">
              You can pay using your PayPal balance, bank account, or any major Credit/Debit card.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
