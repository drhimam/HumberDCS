import { useState, useEffect, useRef } from "react";
import {
  Check,
  CheckCircle2,
  Coffee,
  ExternalLink,
  Heart,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  Trophy,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthUser } from "@/lib/auth";
import {
  getDonationConfig,
  createDonationOrder,
  captureDonationOrder,
  getDonationStats,
} from "@/lib/donations";

const PRESET_AMOUNTS = [
  { amount: 5, label: "$5 CAD", icon: Coffee, desc: "Coffee & Server time" },
  { amount: 15, label: "$15 CAD", icon: Sparkles, desc: "Study supporter" },
  { amount: 30, label: "$30 CAD", icon: Trophy, desc: "Semester champion" },
  { amount: 50, label: "$50 CAD", icon: Heart, desc: "Registry patron" },
];

export function DonateDialog({ open, onOpenChange }) {
  const authUser = useAuthUser();
  const [selectedAmount, setSelectedAmount] = useState(15);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);

  // Donor optional details
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");

  // Config & SDK status
  const [config, setConfig] = useState(null);
  const [configLoading, setConfigLoading] = useState(true);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [communityStats, setCommunityStats] = useState(null);

  // Successful completion state
  const [successData, setSuccessData] = useState(null);

  const paypalContainerRef = useRef(null);
  const buttonsInstanceRef = useRef(null);

  const effectiveAmount = isCustom ? parseFloat(customAmount) || 0 : selectedAmount;

  // Keep refs for callbacks so PayPal buttons don't re-render on every keystroke
  const effectiveAmountRef = useRef(effectiveAmount);
  effectiveAmountRef.current = effectiveAmount;
  const donorNameRef = useRef(donorName);
  donorNameRef.current = donorName;
  const donorEmailRef = useRef(donorEmail);
  donorEmailRef.current = donorEmail;

  // Auto-fill logged in user info
  useEffect(() => {
    if (authUser?.displayName && !donorName) {
      setDonorName(authUser.displayName);
    }
    if (authUser?.email && !donorEmail) {
      setDonorEmail(authUser.email);
    }
  }, [authUser, donorName, donorEmail]);

  // Reset success state when dialog reopens
  useEffect(() => {
    if (open) {
      setSuccessData(null);
      setIsProcessing(false);
    }
  }, [open]);

  // Load donation config and stats when dialog opens
  useEffect(() => {
    if (!open) return;
    let mounted = true;
    setConfigLoading(true);

    Promise.all([getDonationConfig(), getDonationStats()])
      .then(([cfg, stats]) => {
        if (!mounted) return;
        setConfig(cfg);
        setCommunityStats(stats);
      })
      .catch((err) => {
        console.warn("Error loading donation config:", err);
      })
      .finally(() => {
        if (mounted) setConfigLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open]);

  // Load PayPal SDK dynamically once client ID is available
  useEffect(() => {
    if (!open || !config?.clientId) return;

    const clientId = config.clientId.trim();
    const currency = config.currency || "CAD";
    const scriptId = "dcsqbank-paypal-sdk";

    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.addEventListener("load", () => setSdkReady(true));
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(clientId)}&currency=${currency}&intent=capture&components=buttons&enable-funding=card`;
    script.async = true;

    script.onload = () => {
      setSdkReady(true);
      setSdkError(false);
    };

    script.onerror = (err) => {
      console.error("Failed to load PayPal SDK:", err);
      setSdkError(true);
      setSdkReady(false);
    };

    document.head.appendChild(script);
  }, [open, config?.clientId, config?.currency]);

  // Render PayPal buttons once SDK is ready and container exists
  useEffect(() => {
    if (!open || !sdkReady || !window.paypal?.Buttons || !paypalContainerRef.current || successData) {
      return;
    }

    // Clean up any previously rendered button
    paypalContainerRef.current.innerHTML = "";
    if (buttonsInstanceRef.current?.close) {
      try {
        buttonsInstanceRef.current.close();
      } catch {}
    }

    try {
      const buttons = window.paypal.Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "donate",
          height: 44,
        },
        createOrder: async () => {
          const amt = effectiveAmountRef.current;
          if (amt < 1) {
            toast.error("Please enter a donation amount of at least $1 CAD.");
            throw new Error("Invalid donation amount");
          }

          try {
            const res = await createDonationOrder({
              amount: amt,
              currency: config?.currency || "CAD",
              donorEmail: donorEmailRef.current.trim() || undefined,
              donorName: donorNameRef.current.trim() || undefined,
            });
            return res.orderId;
          } catch (err) {
            toast.error(err.message || "Failed to initialize PayPal order.");
            throw err;
          }
        },
        onApprove: async (data) => {
          setIsProcessing(true);
          try {
            const capture = await captureDonationOrder({ orderId: data.orderID });
            setSuccessData({
              amount: capture.amount || effectiveAmountRef.current,
              currency: capture.currency || "CAD",
              orderId: capture.orderId,
              captureId: capture.captureId,
              donorEmail: capture.donorEmail || donorEmailRef.current,
              donorName: capture.donorName || donorNameRef.current,
              thankYouSent: capture.thankYouSent,
            });
            toast.success("Heartfelt thanks! Your donation was completed successfully.");
          } catch (err) {
            console.error("Capture failed:", err);
            toast.error(err.message || "Payment verification failed. Please check your PayPal account.");
          } finally {
            setIsProcessing(false);
          }
        },
        onError: (err) => {
          console.error("PayPal checkout error:", err);
          toast.error("PayPal checkout encountered an error. Please try again.");
        },
        onCancel: () => {
          toast.info("Donation checkout cancelled. No charges were made.");
        },
      });

      buttonsInstanceRef.current = buttons;
      buttons.render(paypalContainerRef.current);
    } catch (err) {
      console.error("Error creating PayPal buttons:", err);
    }

    return () => {
      if (buttonsInstanceRef.current?.close) {
        try {
          buttonsInstanceRef.current.close();
        } catch {}
      }
    };
  }, [open, sdkReady, config?.currency, successData]);

  // Fallback / retry handler
  const handleFallbackDonate = () => {
    if (effectiveAmount <= 0) {
      toast.error("Please enter or select a valid donation amount.");
      return;
    }
    toast.info("Connecting to PayPal checkout...");
    setSdkError(false);
    setSdkReady(false);
    setConfigLoading(true);
    getDonationConfig()
      .then((cfg) => setConfig(cfg))
      .finally(() => setConfigLoading(false));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-3xl p-6 sm:p-7 max-h-[92vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-md shadow-rose-100">
              <Heart className="h-6 w-6 fill-rose-500 text-rose-500 animate-pulse" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
                Support DCSQbank
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                  Community-Driven
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-0.5">
                Keeping diagnostic cardiac sonography preparation 100% free, ad-free, and accessible for everyone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* --- SUCCESS VIEW --- */}
        {successData ? (
          <div className="mt-4 space-y-5 py-2">
            <div className="rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/80 to-teal-50/50 p-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <h3 className="mt-3 text-lg font-bold text-slate-900">
                Thank You for Your Generous Support! ❤️
              </h3>
              <p className="mt-1 text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                Your contribution powers Cloudflare database hosting, student verification emails, and continuous question bank curation for Humber College learners.
              </p>

              {/* Receipt Summary Box */}
              <div className="mt-5 rounded-2xl border border-emerald-200/80 bg-white p-4 text-left shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                  <span className="text-xs font-semibold text-slate-500">Donation Amount</span>
                  <span className="text-base font-bold text-emerald-600">
                    ${successData.amount} {successData.currency}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-600 py-1">
                  <span className="text-slate-500">Status</span>
                  <span className="font-semibold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Verified & Completed
                  </span>
                </div>
                {successData.captureId && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 py-1">
                    <span>Transaction ID</span>
                    <span className="font-mono text-slate-700">{successData.captureId}</span>
                  </div>
                )}
                {successData.donorEmail && (
                  <div className="flex items-center justify-between text-[11px] text-slate-500 py-1">
                    <span>Receipt Sent To</span>
                    <span className="font-medium text-slate-700">{successData.donorEmail}</span>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="h-11 w-full rounded-xl bg-slate-900 font-semibold text-white shadow hover:bg-slate-800 transition-all"
            >
              Back to Studying
            </Button>
          </div>
        ) : (
          /* --- DONATION FORM VIEW --- */
          <div className="mt-4 space-y-5">
            {/* Mission & Impact Note */}
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3.5 text-xs leading-relaxed text-slate-700">
              <p>
                DCSQbank was built by and for diagnostic cardiac sonography learners at Humber College. Every dollar directly covers Cloudflare D1 database hosting, student verification emails, and Sonography Canada / ARDMS question curation.
              </p>
              {communityStats?.totalDonations > 0 && (
                <div className="mt-2.5 flex items-center gap-2 border-t border-sky-200/60 pt-2 text-[11px] font-semibold text-sky-900">
                  <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                  <span>
                    Supported by <strong>{communityStats.totalDonations}</strong> community donors (${communityStats.totalAmountCad} CAD raised)
                  </span>
                </div>
              )}
            </div>

            {/* Amount Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Select Donation Amount (CAD)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                      className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition-all ${
                        isSelected
                          ? "border-sky-500 bg-sky-50/90 text-sky-900 shadow-sm ring-2 ring-sky-300"
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
              <div className="mt-2.5">
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className={`w-full rounded-xl border p-2.5 text-xs text-left transition-colors flex items-center justify-between ${
                    isCustom
                      ? "border-sky-500 bg-sky-50/90 text-sky-900 ring-2 ring-sky-300"
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

            {/* Optional Donor Information (for receipt & thank-you email) */}
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-slate-500" />
                  Donor Details (Optional)
                </span>
                <span className="text-[10px] text-slate-400">For official email receipt</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    placeholder="Your Name (optional)"
                    className="h-8 pl-8 text-xs bg-white rounded-lg border-slate-200"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="Your Email (for receipt)"
                    className="h-8 pl-8 text-xs bg-white rounded-lg border-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* PayPal Payment Action Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#003087]">Pay</span>
                  <span className="text-xs font-bold text-[#0079C1]">Pal</span>
                  <span className="text-xs text-slate-400">• Secure Checkout</span>
                </div>
                <span className="text-xs font-bold text-slate-800">
                  ${effectiveAmount > 0 ? Number(effectiveAmount).toFixed(2) : "0.00"} CAD
                </span>
              </div>

              {/* Processing Overlay */}
              {isProcessing && (
                <div className="my-4 flex flex-col items-center justify-center p-6 text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-800">Verifying donation with PayPal...</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Please wait while we confirm your receipt.</p>
                </div>
              )}

              {/* Loading Config or SDK */}
              {!isProcessing && configLoading && (
                <div className="flex items-center justify-center py-6 text-xs text-slate-500 gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                  Loading payment options...
                </div>
              )}

              {/* Official PayPal Buttons Container */}
              {!isProcessing && !configLoading && config?.configured && (
                <div>
                  <div
                    ref={paypalContainerRef}
                    id="paypal-button-container"
                    className="min-h-[44px]"
                  />
                  {!sdkReady && !sdkError && (
                    <div className="flex items-center justify-center py-4 text-xs text-slate-400 gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-sky-500" />
                      Initializing secure PayPal checkout...
                    </div>
                  )}
                  {sdkError && (
                    <div className="mt-2 text-center text-xs text-rose-500">
                      Could not load PayPal SDK. You can still use the direct link below.
                    </div>
                  )}
                </div>
              )}

              {/* Fallback button if PayPal credentials are not yet configured in Worker */}
              {!isProcessing && !configLoading && (!config?.configured || sdkError) && (
                <div className="space-y-3">
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-[11px] leading-relaxed text-amber-900">
                    <p className="font-semibold flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
                      PayPal Environment Setup
                    </p>
                    <p>
                      PayPal credentials can be activated by adding <code className="font-mono text-amber-800 bg-amber-100/80 px-1 py-0.5 rounded">PAYPAL_CLIENT_ID</code> and <code className="font-mono text-amber-800 bg-amber-100/80 px-1 py-0.5 rounded">PAYPAL_CLIENT_SECRET</code> to your Cloudflare Worker environment.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handleFallbackDonate}
                    className="h-11 w-full rounded-xl bg-[#0070BA] font-semibold text-white shadow hover:bg-[#003087] transition-all flex items-center justify-center gap-2"
                  >
                    <Heart className="h-4 w-4 fill-white" />
                    Retry PayPal Connection
                  </Button>
                </div>
              )}

              <div className="mt-3 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                <span>Supports PayPal balance, bank account, and major Credit/Debit cards.</span>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
