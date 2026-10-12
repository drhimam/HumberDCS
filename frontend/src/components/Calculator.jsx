import { useCallback, useEffect, useState } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const rad = (d) => (d * Math.PI) / 180;
const FNS = { S: (d) => Math.sin(rad(d)), C: (d) => Math.cos(rad(d)), T: (d) => Math.tan(rad(d)) };
const MAP = [["Ans", "(A)"], ["×", "*"], ["÷", "/"], ["−", "-"], ["π", "(Math.PI)"], ["√(", "Math.sqrt("], ["log(", "Math.log10("],
  ["ln(", "Math.log("], ["sin(", "S("], ["cos(", "C("], ["tan(", "T("], ["E", "*10**"], ["^", "**"]];
// Bare "E" (not after a number literal) falls back to ×10^n.

const evaluate = (expr, ans) => {
  let js = expr.replace(/(\d+\.?\d*|\.\d+)E([−-]?)(\d+)/g, (_, m, s, n) => `(${m}e${s ? "-" : ""}${n})`);
  MAP.forEach(([a, b]) => { js = js.split(a).join(b); });
  // eslint-disable-next-line no-new-func
  const v = Function("S", "C", "T", "A", `"use strict"; return (${js});`)(FNS.S, FNS.C, FNS.T, ans);
  if (typeof v !== "number" || !Number.isFinite(v)) throw new Error("bad");
  return v;
};

export const formatNum = (v) => {
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a < 1e-3 || a >= 1e9) return v.toExponential(4).replace("e", "E");
  return String(Number(v.toPrecision(10)));
};

const KEYS = [
  ["sin(", "cos(", "tan(", "log(", "ln("],
  ["x²", "√(", "^", "E", "π"],
  ["7", "8", "9", "÷", "⌫"],
  ["4", "5", "6", "×", "("],
  ["1", "2", "3", "−", ")"],
  ["0", ".", "Ans", "+", "="],
];
const KEY_LABEL = { E: "×10ⁿ", "^": "xʸ", "sin(": "sin", "cos(": "cos", "tan(": "tan", "log(": "log", "ln(": "ln", "√(": "√" };
const KEY_ID = { "÷": "div", "×": "mul", "−": "sub", "+": "add", "=": "eq", "⌫": "back", ".": "dot", "(": "lparen", ")": "rparen", "^": "pow", "x²": "sq", "√(": "sqrt", "π": "pi" };

export const Calculator = ({ open, onClose }) => {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [ans, setAns] = useState(0);

  const press = useCallback((k) => {
    if (k === "=") {
      if (!expr) return;
      try { const v = evaluate(expr, ans); setAns(v); setResult(formatNum(v)); } catch { setResult("Error"); }
      return;
    }
    if (k === "⌫") return setExpr((e) => e.slice(0, -1));
    if (k === "C") { setExpr(""); setResult(""); return; }
    setExpr((e) => e + (k === "x²" ? "^2" : k));
  }, [expr, ans]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.target.closest("input, textarea")) return;
      const map = { "*": "×", "/": "÷", "-": "−", Enter: "=", "=": "=", Backspace: "⌫", Escape: "C" };
      const k = map[e.key] || (/^[0-9.+()^]$/.test(e.key) ? e.key : null);
      if (!k) return;
      e.preventDefault();
      press(k);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, press]);

  if (!open) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[300px] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-slate-300/60 animate-in fade-in slide-in-from-bottom-4" data-testid="calculator-panel">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-heading text-sm font-semibold text-slate-900">Calculator</span>
        <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" data-testid="calculator-close-btn"><X className="h-4 w-4" /></button>
      </div>
      <div className="mb-3 rounded-xl bg-slate-900 px-3 py-2 text-right font-mono">
        <div className="min-h-[20px] break-all text-xs text-slate-400" data-testid="calculator-expression">{expr || " "}</div>
        <div className={cn("min-h-[32px] text-2xl font-semibold", result === "Error" ? "text-rose-400" : "text-sky-400")} data-testid="calculator-result">{result || "0"}</div>
      </div>
      <div className="grid grid-cols-5 gap-1.5">
        {KEYS.flat().map((k) => (
          <button key={k} onClick={() => press(k)} data-testid={`calc-key-${KEY_ID[k] || k.replace("(", "")}`}
            className={cn("h-10 rounded-lg text-sm font-medium transition-colors active:scale-95",
              k === "=" ? "bg-sky-500 text-white hover:bg-sky-600" : /^[0-9.]$/.test(k) ? "bg-slate-100 text-slate-900 hover:bg-slate-200" : "bg-slate-50 text-slate-600 hover:bg-slate-100")}>
            {KEY_LABEL[k] || k}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">Angles in degrees · keyboard works</span>
        <button onClick={() => press("C")} className="rounded-md px-2 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50" data-testid="calc-key-clear">Clear</button>
      </div>
    </div>
  );
};
