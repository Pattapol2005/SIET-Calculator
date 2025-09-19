import React, { useMemo, useState } from "react";
import { Card, FooterTip } from "../components/ui";

type BandColorKey =
  | "black" | "brown" | "red" | "orange" | "yellow"
  | "green" | "blue" | "violet" | "gray" | "white"
  | "gold" | "silver";

type BandColorInfo = {
  key: BandColorKey;
  th: string; 
  hex: string;
  digit: number | null;
  mult?: number; 
  tol?: string;
};

const COLOR_TABLE: Record<BandColorKey, BandColorInfo> = {
  black:  { key: "black",  th: "ดำ",   hex: "#000000", digit: 0, mult: 1 },
  brown:  { key: "brown",  th: "น้ำตาล", hex: "#6B4F2A", digit: 1, mult: 10,      tol: "±1%" },
  red:    { key: "red",    th: "แดง",  hex: "#E11D48", digit: 2, mult: 100,     tol: "±2%" },
  orange: { key: "orange", th: "ส้ม",  hex: "#F97316", digit: 3, mult: 1e3 },
  yellow: { key: "yellow", th: "เหลือง", hex: "#EAB308", digit: 4, mult: 10e3 },
  green:  { key: "green",  th: "เขียว", hex: "#10B981", digit: 5, mult: 100e3,  tol: "±0.5%" },
  blue:   { key: "blue",   th: "น้ำเงิน", hex: "#3B82F6", digit: 6, mult: 1e6,  tol: "±0.25%" },
  violet: { key: "violet", th: "ม่วง", hex: "#8B5CF6", digit: 7, mult: 10e6,    tol: "±0.1%" },
  gray:   { key: "gray",   th: "เทา",  hex: "#6B7280", digit: 8, mult: 100e6,   tol: "±0.05%" },
  white:  { key: "white",  th: "ขาว",  hex: "#FFFFFF", digit: 9, mult: 1e9 },
  gold:   { key: "gold",   th: "ทอง",  hex: "#D4AF37", digit: null, mult: 0.1,   tol: "±5%" },
  silver: { key: "silver", th: "เงิน", hex: "#C0C0C0", digit: null, mult: 0.01,  tol: "±10%" },
};

const DIGIT_COLORS: BandColorKey[] = ["black","brown","red","orange","yellow","green","blue","violet","gray","white"];
const MULT_COLORS: BandColorKey[]  = [...DIGIT_COLORS, "gold", "silver"];
const TOL_COLORS: BandColorKey[]   = ["brown","red","green","blue","violet","gray","gold","silver"];

function prettyOhm(v: number) {
  if (!Number.isFinite(v)) return "—";
  if (Math.abs(v) >= 1e6) return `${(v/1e6).toFixed(2)} MΩ`;
  if (Math.abs(v) >= 1e3) return `${(v/1e3).toFixed(2)} kΩ`;
  return `${v} Ω`;
}

function ColorSelect({
  label, value, onChange, allowed,
}: {
  label: string;
  value: BandColorKey | "";
  onChange: (k: BandColorKey | "") => void;
  allowed: BandColorKey[];
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">{label}</label>
      <div className="flex items-center gap-2">
        <div
          className="h-5 w-8 rounded border border-gray-300 dark:border-gray-700"
          style={{ background: value ? COLOR_TABLE[value].hex : "transparent" }}
          title={value ? COLOR_TABLE[value].th : ""}
        />
        <select
          className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/60 px-2 py-2 text-sm"
          value={value}
          onChange={(e)=>onChange(e.target.value as BandColorKey | "")}
        >
          <option value="">— เลือกสี —</option>
          {allowed.map(k => (
            <option key={k} value={k}>
              {COLOR_TABLE[k].th} ({k})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}


function ResistorSVG({ bands, mode }:{
  bands: (BandColorKey | "")[];
  mode: "4" | "5";
}) {

  const bandXs = mode === "4" ? [120, 150, 180, 225] : [110, 140, 170, 200, 235];

  return (
    <svg viewBox="0 0 360 120" className="w-full max-w-xl">
      {/* leads */}
      <line x1="20" y1="60" x2="100" y2="60" stroke="#bbb" strokeWidth="6" />
      <line x1="260" y1="60" x2="340" y2="60" stroke="#bbb" strokeWidth="6" />
      {/* body */}
      <rect x="100" y="30" width="160" height="60" rx="14" fill="#f5deb3" stroke="#c4a484" strokeWidth="2"/>
      {/* bands */}
      {bands.map((b, i) => b ? (
        <rect key={i} x={bandXs[i] - 5} y="30" width="10" height="60" rx="2"
              fill={COLOR_TABLE[b].hex} stroke="#222" strokeWidth="0.6"/>
      ) : null)}
    </svg>
  );
}

export default function ResistorColorCode() {
  const [mode, setMode] = useState<"4"|"5">("4");
  const [b1, setB1] = useState<BandColorKey | "">("");
  const [b2, setB2] = useState<BandColorKey | "">("");
  const [b3, setB3] = useState<BandColorKey | "">("");
  const [bMult, setBMult] = useState<BandColorKey | "">("");
  const [bTol, setBTol] = useState<BandColorKey | "">("");

  const { value, tolText } = useMemo(() => {
    const d1 = b1 ? COLOR_TABLE[b1].digit : null;
    const d2 = b2 ? COLOR_TABLE[b2].digit : null;
    const d3 = b3 ? COLOR_TABLE[b3].digit : null;
    const m  = bMult ? COLOR_TABLE[bMult].mult : null;
    const tol = bTol ? (COLOR_TABLE[bTol].tol ?? "±20%") : "±20%";

    if (mode === "4") {
      if (d1 == null || d2 == null || m == null) return { value: NaN, tolText: tol };
      const val = (d1*10 + d2) * m;
      return { value: val, tolText: tol };
    } else {
      if (d1 == null || d2 == null || d3 == null || m == null) return { value: NaN, tolText: tol };
      const val = (d1*100 + d2*10 + d3) * m;
      return { value: val, tolText: tol };
    }
  }, [mode, b1, b2, b3, bMult, bTol]);

  const bandList: (BandColorKey | "")[] = mode === "4"
    ? [b1, b2, bMult, bTol]
    : [b1, b2, b3, bMult, bTol];

  return (
    <div className="space-y-6">
      {/* ตัวอย่างรูปตัวต้านทาน */}
      <ResistorSVG bands={bandList} mode={mode} />

      {/* สลับโหมด */}
      <div className="inline-flex rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <button
          className={`px-4 py-2 text-sm ${mode==="4" ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-900"}`}
          onClick={()=>setMode("4")}
        >4 แถบ</button>
        <button
          className={`px-4 py-2 text-sm ${mode==="5" ? "bg-indigo-600 text-white" : "bg-white dark:bg-gray-900"}`}
          onClick={()=>setMode("5")}
        >5 แถบ</button>
      </div>

      {/* ตัวเลือกสี */}
      <div className="grid md:grid-cols-5 gap-4">
        <ColorSelect label="แถบ 1 (หลักแรก)" value={b1} onChange={setB1} allowed={DIGIT_COLORS}/>
        <ColorSelect label="แถบ 2 (หลักสอง)" value={b2} onChange={setB2} allowed={DIGIT_COLORS}/>
        {mode === "5" && (
          <ColorSelect label="แถบ 3 (หลักสาม)" value={b3} onChange={setB3} allowed={DIGIT_COLORS}/>
        )}
        <ColorSelect label="ตัวคูณ (Mult.)" value={bMult} onChange={setBMult} allowed={MULT_COLORS}/>
        <ColorSelect label="ค.เคลื่อน (Tol.)" value={bTol} onChange={setBTol} allowed={TOL_COLORS}/>
      </div>

      {/* ผลลัพธ์ */}
      <Card
        title="ค่าตัวต้านทาน"
        note={`มาตรฐาน ${mode} แถบ`}
        value={Number.isFinite(value) ? `${prettyOhm(value)}  ${tolText}` : "—"}
      />

      {/* อ้างอิงสี (ภาษาไทย + swatch) */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <h3 className="font-semibold mb-3">ตารางสีมาตรฐาน (ภาษาไทย)</h3>
        <div className="grid md:grid-cols-2 gap-3 text-sm">
          {Object.values(COLOR_TABLE).map((c) => (
            <div key={c.key} className="flex items-center gap-3">
              <div className="h-4 w-6 rounded border" style={{ background: c.hex }} />
              <div className="w-20">{c.th} ({c.key})</div>
              <div className="flex-1">
                {c.digit != null && <span className="mr-3">ดิจิต: {c.digit}</span>}
                {c.mult != null && <span className="mr-3">คูณ: {c.mult.toLocaleString()}</span>}
                {c.tol && <span>Tol: {c.tol}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <FooterTip>
        เลือกสีด้านบนเพื่อดูค่าโอห์มแบบ 4 หรือ 5 แถบ—รูปตัวต้านทานจะเปลี่ยนแถบสีตามที่เลือกโดยอัตโนมัติ
      </FooterTip>
    </div>
  );
}
