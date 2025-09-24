import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { History, RotateCcw, ChevronDown } from "lucide-react";
import * as math from "mathjs";
import { TabButton } from "../components/ui"; 



function cn(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
      {children}
    </span>
  );
}

export function Button({
  onClick,
  children,
  className,
  title,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "rounded-2xl px-5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition shadow-sm",
        className
      )}
    >
      {children}
    </button>
  );
}

export function PrimaryButton({
  onClick,
  children,
  className,
  title,
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn("rounded-2xl px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm", className)}
    >
      {children}
    </button>
  );
}

export function FooterTip({ children }: { children: React.ReactNode }) {
  return <footer className="mt-4 text-xs text-gray-500 dark:text-gray-400">{children}</footer>;
}

/* ===== Types ===== */
type AngleMode = "DEG" | "RAD";
type HistoryItem = { expr: string; value: string };
type KeySpec = { label: string; onPress?: () => void; className?: string; title?: string };

/* ===== Main Component ===== */
export default function ScientificCalculator() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string>("");
  const [angleMode, setAngleMode] = useState<AngleMode>("DEG");
  const [memory, setMemory] = useState<number | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const translated = useMemo(() => translateExpression(expr, angleMode), [expr, angleMode]);
  
  useEffect(() => {
    try {
      if (!translated.trim()) { setResult(""); return; }
      const val = math.evaluate(translated);
      if (typeof val === "number") setResult(formatNumber(val));
      else if ((val as any)?.toString) setResult(String(val));
      else setResult("");
    } catch {
      setResult("");
    }
  }, [translated]);

  const push = useCallback((token: string) => setExpr((s) => s + token), []);
  const backspace = useCallback(() => setExpr((s) => s.slice(0, -1)), []);
  const clearAll = useCallback(() => { setExpr(""); setResult(""); }, []);

  const evaluateNow = useCallback(() => {
    try {
      if (!translated.trim()) return;
      const val = math.evaluate(translated);
      const out = typeof val === "number" ? formatNumber(val) : String(val);
      setHistory((h) => [{ expr, value: out }, ...h].slice(0, 20));
      setExpr(out);
      setResult("");
    } catch {
      setResult("Error");
    }
  }, [translated, expr]);
  
    const insertFunc = (fn: string) => {
    const el = inputRef.current;
    const start = el?.selectionStart ?? expr.length;
    const end = el?.selectionEnd ?? expr.length;

    const next = expr.slice(0, start) + fn + "()" + expr.slice(end);
    setExpr(next);

    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + fn.length + 1; 
      if (el) {
        el.selectionStart = pos;
        el.selectionEnd = pos;
      }
    });
  };
  const memoryClear = () => setMemory(null);
  const memoryRecall = () => memory != null && push(String(memory));
  const memoryAdd = () => { const v = safeEval(translated); if (v != null) setMemory((m) => (m ?? 0) + v); };
  const memorySub = () => { const v = safeEval(translated); if (v != null) setMemory((m) => (m ?? 0) - v); };


useEffect(() => {
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "=") {
      e.preventDefault();
      evaluateNow();
      return;
    }
    if (e.key === "Escape") {
      e.preventDefault();
      clearAll();
      return;
    }

  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [evaluateNow, clearAll]);


  const topKeys: KeySpec[] = [
    { label: angleMode, onPress: () => setAngleMode(angleMode === "DEG" ? "RAD" : "DEG"), className: "col-span-2" },
    { label: "MC", onPress: memoryClear },
    { label: "MR", onPress: memoryRecall },
    { label: "M+", onPress: memoryAdd },
    { label: "M-", onPress: memorySub },
  ];

  const sciKeys: KeySpec[] = [
    { label: "sin",  onPress: () => insertFunc("sin")  },
    { label: "cos",  onPress: () => insertFunc("cos")  },
    { label: "tan",  onPress: () => insertFunc("tan")  },
    { label: "asin", onPress: () => insertFunc("asin") },
    { label: "acos", onPress: () => insertFunc("acos") },
    { label: "atan", onPress: () => insertFunc("atan") },
    { label: "ln",   onPress: () => insertFunc("ln")   },
    { label: "log",  onPress: () => insertFunc("log")  },
    { label: "√", onPress: () => insertFunc("√") },

    { label: "x²", onPress: () => push("^2") },
    { label: "x³", onPress: () => push("^3") },
    { label: "10^x", onPress: () => push("10^") },
    { label: "π", onPress: () => push("π") },
    { label: "e", onPress: () => push("e") },
    { label: "(", onPress: () => push("(") },
    { label: ")", onPress: () => push(")") },
    { label: "%", onPress: () => applyPercent(setExpr) },
    { label: "!", onPress: () => push("!") },
  ];

  const mainKeys: KeySpec[] = [
    { label: "AC", onPress: clearAll, className: "col-span-2" },
    { label: "⌫", onPress: backspace },
    { label: "÷", onPress: () => push("÷") },
    { label: "7", onPress: () => push("7") },
    { label: "8", onPress: () => push("8") },
    { label: "9", onPress: () => push("9") },
    { label: "×", onPress: () => push("×") },
    { label: "4", onPress: () => push("4") },
    { label: "5", onPress: () => push("5") },
    { label: "6", onPress: () => push("6") },
    { label: "-", onPress: () => push("-") },
    { label: "1", onPress: () => push("1") },
    { label: "2", onPress: () => push("2") },
    { label: "3", onPress: () => push("3") },
    { label: "+", onPress: () => push("+") },
    { label: "0", onPress: () => push("0"), className: "col-span-2" },
    { label: ".", onPress: () => push(".") },
    { label: "=", onPress: evaluateNow },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-black flex items-center justify-center p-4">
      <div className="w-full max-w-3xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl sm:text-2xl font-semibold">Scientific Calculator</h1>
          <Button onClick={() => setShowHistory(v => !v)} className="gap-2" title="Toggle history">
            <History className="h-4 w-4" /> History
            <ChevronDown className={cn("h-4 w-4 transition", showHistory ? "rotate-180" : "rotate-0")} />
          </Button>
        </div>

        {/* Display */}
        <input
          ref={inputRef}
          value={expr}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setExpr(e.target.value)}
          placeholder="Type an expression or use the keys…"
          className="w-full text-right text-lg sm:text-2xl h-12 sm:h-14 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-slate-900/60 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="text-right min-h-6 text-sm sm:text-base text-slate-500 dark:text-slate-400">
          {result && <span>= {result}</span>}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-6 gap-2 mt-4">{topKeys.map((k, i) => <Key key={i} {...k} />)}</div>
        <div className="grid grid-cols-9 gap-2 mt-3">{sciKeys.map((k, i) => <Key key={i} {...k} />)}</div>
        <div className="grid grid-cols-4 gap-2 mt-3">{mainKeys.map((k, i) => <Key key={i} {...k} />)}</div>

        {/* History */}
        {showHistory && (
          <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 max-h-48 overflow-auto bg-white/60 dark:bg-slate-900/60">
            {history.length === 0 ? (
              <div className="text-sm text-slate-500">No history yet.</div>
            ) : (
              history.map((h, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <button className="text-left text-sm sm:text-base font-mono hover:underline" onClick={() => setExpr(h.expr)}>{h.expr}</button>
                  <button className="text-right text-sm sm:text-base font-semibold hover:underline" onClick={() => setExpr(h.value)}>{h.value}</button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer */}
        <FooterTip>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              <span>Keyboard: digits • + - × ÷ ^ ( ) . % • Enter = • Esc AC • Backspace ⌫</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs">Mode</span>
              <Badge>{angleMode}</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              <TabButton active={false} onClick={() => alert("กลับหน้าหลัก!")}>Home</TabButton>
            </div>
          </div>
        </FooterTip>
      </div>
    </div>
  );
}

function Key({ label, onPress, className, title }: KeySpec) {
  return label === "="
    ? <PrimaryButton onClick={onPress} className={cn("h-10 sm:h-12", className)} title={title}>{label}</PrimaryButton>
    : <Button onClick={onPress} className={cn("h-10 sm:h-12", className)} title={title}>{label}</Button>;
}

function safeEval(translated: string): number | null {
  try { const v = math.evaluate(translated); return typeof v === "number" ? v : Number(v); } catch { return null; }
}

function formatNumber(n: number) {
  return !isFinite(n) ? String(n) : Number.parseFloat(n.toPrecision(12)).toString();
}

function applyPercent(setExpr: React.Dispatch<React.SetStateAction<string>>) {
  setExpr((s) => {
    const m = s.match(/^(.*?)(\d+(?:\.\d+)?)$/);
    if (!m) return s + "%";
    const head = m[1], num = m[2];
    return head + `(${num}/100)`;
  });
}

function translateExpression(expr: string, angleMode: AngleMode): string {
  let s = expr.replace(/×/g, "*").replace(/÷/g, "/").replace(/π/g, "pi").replace(/√/g, "sqrt").replace(/–/g, "-");
  s = s.replace(/\bln\(/g, "log(").replace(/\blog\(/g, "log10(");
  if (angleMode === "DEG") {
    s = s
      .replace(/\bsin\(([^)]+)\)/g, (_m, a) => `sin((${a}) * pi/180)`)
      .replace(/\bcos\(([^)]+)\)/g, (_m, a) => `cos((${a}) * pi/180)`)
      .replace(/\btan\(([^)]+)\)/g, (_m, a) => `tan((${a}) * pi/180)`)
      .replace(/\basin\(([^)]+)\)/g, (_m, a) => `(asin(${a}) * 180/pi)`)
      .replace(/\bacos\(([^)]+)\)/g, (_m, a) => `(acos(${a}) * 180/pi)`)
      .replace(/\batan\(([^)]+)\)/g, (_m, a) => `(atan(${a}) * 180/pi)`);
  }
  // 5! => factorial(5)
  s = s.replace(/(\d+(?:\.\d+)?)\!/g, (_m, num) => `factorial(${num})`);
  return s;
}
