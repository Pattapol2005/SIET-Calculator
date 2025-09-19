import React, { useCallback, useMemo, useState } from "react";
import { Card, Button, PrimaryButton, Badge } from "../components/ui";

/* ===== Types ===== */
type Radix = 2 | 8 | 10 | 16;
type Width = 8 | 16 | 32 | 64;
type ShiftKind = "LSL" | "LSR" | "ASR" | "ROL" | "ROR";
type BitwiseKind = "AND" | "OR" | "XOR" | "NOT";

/* ===== Utils (คงเดิม) ===== */
function clamp(n: number, lo: number, hi: number) { return Math.min(Math.max(n, lo), hi); }
function maskByWidth(width: Width): bigint { return (1n << BigInt(width)) - 1n; }
function fromTwos(x: bigint, width: Width): bigint {
  const signBit = 1n << (BigInt(width) - 1n);
  return (x & signBit) ? (x - (1n << BigInt(width))) : x;
}
function toTwos(x: bigint, width: Width): bigint { return (x & maskByWidth(width)); }
function parseTypedInt(s: string, radix: Radix): bigint | null {
  if (!s?.trim()) return null;
  let txt = s.trim();
  if (/^0[bB][01_]+$/.test(txt)) { txt = txt.replace(/^0[bB]/, ""); radix = 2; }
  else if (/^0[oO][0-7_]+$/.test(txt)) { txt = txt.replace(/^0[oO]/, ""); radix = 8; }
  else if (/^0[xX][0-9a-fA-F_]+$/.test(txt)) { txt = txt.replace(/^0[xX]/, ""); radix = 16; }
  txt = txt.replace(/_/g, "");
  const isNeg = txt.startsWith("-") && radix === 10;
  if (isNeg) txt = txt.slice(1);
  const re: Record<Radix, RegExp> = { 2:/^[01]+$/,8:/^[0-7]+$/,10:/^\d+$/,16:/^[0-9a-fA-F]+$/ };
  if (!re[radix].test(txt)) return null;
  const base = BigInt(radix);
  let acc = 0n;
  for (const ch of txt) {
    let v = 0;
    if (radix === 16) v = parseInt(ch, 16);
    else if (radix === 10 || radix === 8) v = ch.charCodeAt(0) - 48;
    else v = ch === "1" ? 1 : 0;
    acc = acc * base + BigInt(v);
  }
  return isNeg ? -acc : acc;
}
function formatBin(n: bigint, width: Width, group = 4): string {
  const bits = (n & maskByWidth(width)).toString(2).padStart(width, "0");
  if (group <= 0) return bits;
  const out: string[] = [];
  for (let i = 0; i < bits.length; i += group) out.push(bits.slice(i, i + group));
  return out.join("_");
}
function formatOct(n: bigint, width: Width): string {
  const octDigits = Math.ceil(Number(width) / 3);
  return ((n & maskByWidth(width)).toString(8)).padStart(octDigits, "0");
}
function formatHex(n: bigint, width: Width, upper = true, group = 2): string {
  const hexDigits = Math.ceil(Number(width) / 4);
  let s = ((n & maskByWidth(width)).toString(16)).padStart(hexDigits, "0");
  if (upper) s = s.toUpperCase();
  if (group > 0) {
    const parts: string[] = [];
    for (let i = 0; i < s.length; i += group) parts.push(s.slice(i, i + group));
    return parts.join("_");
  }
  return s;
}
function formatDecUnsigned(n: bigint, width: Width): string { return ((n & maskByWidth(width)).toString(10)); }
function formatDecSigned(n: bigint, width: Width): string { return fromTwos(n, width).toString(10); }
function rotL(x: bigint, sh: number, width: Width): bigint {
  const w = Number(width), s = ((sh % w) + w) % w, m = maskByWidth(width);
  return (((x << BigInt(s)) | (x >> BigInt(w - s))) & m);
}
function rotR(x: bigint, sh: number, width: Width): bigint {
  const w = Number(width), s = ((sh % w) + w) % w, m = maskByWidth(width);
  return (((x >> BigInt(s)) | (x << BigInt(w - s))) & m);
}
function logicalShiftLeft(x: bigint, sh: number, width: Width) { return (x << BigInt(sh)) & maskByWidth(width); }
function logicalShiftRight(x: bigint, sh: number, width: Width) { return (x >> BigInt(sh)) & maskByWidth(width); }
function arithmeticShiftRight(x: bigint, sh: number, width: Width) {
  const shifted = fromTwos(x, width) >> BigInt(sh);
  return toTwos(shifted, width);
}
function bytesBigEndian(x: bigint, width: Width): string[] {
  const hex = formatHex(x, width, true, 2).replace(/_/g, "");
  const parts: string[] = [];
  for (let i = 0; i < hex.length; i += 2) parts.push(hex.slice(i, i + 2));
  return parts;
}
function bytesLittleEndian(x: bigint, width: Width): string[] { return bytesBigEndian(x, width).reverse(); }

/* ===== Options (memo-friendly) ===== */
const RADIX_OPTIONS: Array<{ label: string; value: Radix; prefix?: string }> = [
  { label: "Bin", value: 2, prefix: "0b" },
  { label: "Oct", value: 8, prefix: "0o" },
  { label: "Dec", value: 10 },
  { label: "Hex", value: 16, prefix: "0x" },
];
const WIDTH_OPTIONS: Width[] = [8, 16, 32, 64];

/* ===== Small UI helpers ===== */
const Seg = ({
  active, children, onClick,
}: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`px-3 py-1.5 text-sm rounded-xl border transition
      ${active
        ? "bg-indigo-600 text-white border-indigo-600"
        : "bg-white/70 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
  >
    {children}
  </button>
);

const Label = ({ children }: { children: React.ReactNode }) => (
  <div className="text-xs text-gray-500 dark:text-gray-400 tracking-wide">{children}</div>
);

/* ===== Page ===== */
export default function BaseBitLab() {
  /* Inputs */
  const [src, setSrc] = useState<string>("");
  const [radix, setRadix] = useState<Radix>(10);
  const [width, setWidth] = useState<Width>(32);
  const [signed, setSigned] = useState<boolean>(false);

  const [opB, setOpB] = useState<string>("0");
  const [opBRadix, setOpBRadix] = useState<Radix>(16);

  const [shiftKind, setShiftKind] = useState<ShiftKind>("LSL");
  const [shiftAmountStr, setShiftAmountStr] = useState<string>("1");

  const RADIX_OPTS = useMemo(() => RADIX_OPTIONS, []);
  const WIDTH_OPTS = useMemo(() => WIDTH_OPTIONS, []);

  const parsedA = useMemo(() => parseTypedInt(src, radix), [src, radix]);
  const parsedB = useMemo(() => parseTypedInt(opB, opBRadix), [opB, opBRadix]);

  const value = useMemo(() => (parsedA == null ? null : toTwos(parsedA, width)), [parsedA, width]);

  /* Derived */
  const dispBin = useMemo(() => (value == null ? "—" : formatBin(value, width, 4)), [value, width]);
  const dispOct = useMemo(() => (value == null ? "—" : formatOct(value, width)), [value, width]);
  const dispDecUnsigned = useMemo(() => (value == null ? "—" : formatDecUnsigned(value, width)), [value, width]);
  const dispDecSigned = useMemo(() => (value == null ? "—" : formatDecSigned(value, width)), [value, width]);
  const dispHex = useMemo(() => (value == null ? "—" : formatHex(value, width, true, 2)), [value, width]);

  const beBytes = useMemo(() => (value == null ? [] : bytesBigEndian(value, width)), [value, width]);
  const leBytes = useMemo(() => (value == null ? [] : bytesLittleEndian(value, width)), [value, width]);

  /* Shift/Rotate */
  const shiftAmount = useMemo(() => {
    const n = Number(shiftAmountStr);
    if (!Number.isFinite(n)) return 0;
    return clamp(Math.floor(n), 0, Number(width));
  }, [shiftAmountStr, width]);

  const shifted = useMemo(() => {
    if (value == null) return null;
    switch (shiftKind) {
      case "LSL": return logicalShiftLeft(value, shiftAmount, width);
      case "LSR": return logicalShiftRight(value, shiftAmount, width);
      case "ASR": return arithmeticShiftRight(value, shiftAmount, width);
      case "ROL": return rotL(value, shiftAmount, width);
      case "ROR": return rotR(value, shiftAmount, width);
      default: return value;
    }
  }, [value, shiftKind, shiftAmount, width]);

  /* Bitwise */
  const [bitwiseKind, setBitwiseKind] = useState<BitwiseKind>("AND");
  const bitwiseResult = useMemo(() => {
    if (value == null) return null;
    const m = maskByWidth(width);
    if (bitwiseKind === "NOT") return (~value) & m;
    if (parsedB == null) return null;
    const b = toTwos(parsedB, width);
    switch (bitwiseKind) {
      case "AND": return (value & b) & m;
      case "OR":  return (value | b) & m;
      case "XOR": return (value ^ b) & m;
      default: return null;
    }
  }, [value, bitwiseKind, parsedB, width]);

  /* helpers */
  const copy = useCallback((text: string) => { if (text && text !== "—") navigator.clipboard?.writeText(text); }, []);
  const setPreset = useCallback((text: string, r: Radix) => { setSrc(text); setRadix(r); }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Base & Bit Tools</h1>
      </header>

      {/* Toolbar */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/40 p-4 shadow-sm">
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <Label>ฐาน (Radix)</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {RADIX_OPTS.map(o => (
                <Seg key={o.value} active={radix === o.value} onClick={() => setRadix(o.value)}>
                  {o.label}{o.prefix ? <span className="opacity-70 ml-1">{o.prefix}</span> : null}
                </Seg>
              ))}
            </div>
          </div>
          <div>
            <Label>ความกว้าง</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {WIDTH_OPTS.map(w => (
                <Seg key={w} active={width === w} onClick={() => setWidth(w)}>
                  {w}-bit
                </Seg>
              ))}
            </div>
          </div>
          <div>
            <Label>Signed</Label>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setSigned(s => !s)}
                className={`w-[120px] inline-flex items-center justify-between px-3 py-1.5 rounded-xl border transition
                  ${signed ? "bg-emerald-600 text-white border-emerald-600" : "bg-white/70 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700"}`}
              >
                <span className="text-sm">{signed ? "Two’s (Signed)" : "Unsigned"}</span>
                <span className={`h-5 w-5 rounded-full ${signed ? "bg-white/90" : "bg-gray-400/60"}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Input & Actions */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card title="อินพุต A" value="" note="รองรับ 0b / 0o / 0x">
          <div className="space-y-3">
            <input
              className="w-full px-3 py-2 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900"
              placeholder="เช่น 255 หรือ 0xFF หรือ 0b11111111"
              value={src}
              onChange={(e) => setSrc(e.target.value)}
              autoComplete="off"
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setPreset("255", 10)}>ตั้งค่า 255 (dec)</Button>
              <Button onClick={() => setPreset("0xFFFF", 16)}>ตั้งค่า 0xFFFF</Button>
              <Button onClick={() => setPreset("0b1010_1100", 2)}>ตั้งค่า 0b1010_1100</Button>
              <Button onClick={() => setSrc("")}>ล้างค่า</Button>
            </div>
          </div>
        </Card>

        <Card title="เลื่อนบิต / หมุนบิต" value="" note="ผลลัพธ์ถูกตัดให้พอดีกับความกว้าง">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(["LSL","LSR","ASR","ROL","ROR"] as ShiftKind[]).map(k => (
                <Seg key={k} active={shiftKind === k} onClick={() => setShiftKind(k)}>{k}</Seg>
              ))}
              <input
                className="w-24 px-3 py-2 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 ml-2"
                value={shiftAmountStr}
                onChange={(e) => setShiftAmountStr(e.target.value)}
                placeholder="จำนวนบิต"
                inputMode="numeric"
                autoComplete="off"
              />
            </div>

            <div className="text-sm space-y-1">
              <div>หลังเลื่อน (Bin): <code className="break-all">{shifted == null ? "—" : formatBin(shifted, width, 4)}</code></div>
              <div>หลังเลื่อน (Hex): <code>{shifted == null ? "—" : "0x" + formatHex(shifted, width)}</code></div>
              <div className="flex gap-2">
                <Button onClick={() => copy(shifted == null ? "" : formatBin(shifted, width, 4))}>คัดลอก Bin</Button>
                <Button onClick={() => copy(shifted == null ? "" : "0x" + formatHex(shifted, width))}>คัดลอก Hex</Button>
              </div>
            </div>
          </div>
        </Card>

        <Card title="บิตไวส์" value="" note="AND / OR / XOR / NOT">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(["AND","OR","XOR","NOT"] as BitwiseKind[]).map(k => (
                <Seg key={k} active={true && k===k && k===k && k===k && (k===k && k===k) && (k=== (k as BitwiseKind)) && (k === (k as BitwiseKind)) && (k===k) && (k===k) && (k===k) && (k===k) && (k===k) && (k===k) && (k===k) && (k===k) && (k===k) && (k===k) && (k===k) && (k===k) && (k===k) && (k===k) && (k===k) ? bitwiseKind===k : false} onClick={() => setBitwiseKind(k)}>{k}</Seg>
              ))}
              <select
                className="px-3 py-2 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900 ml-2"
                value={opBRadix}
                onChange={(e) => setOpBRadix(Number(e.target.value) as Radix)}
                disabled={bitwiseKind === "NOT"}
              >
                {RADIX_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>

            <input
              className="w-full px-3 py-2 rounded-xl border dark:border-gray-700 bg-white dark:bg-gray-900"
              placeholder={bitwiseKind === "NOT" ? "ไม่ต้องใส่ค่า B สำหรับ NOT" : "ค่า B เช่น 0xFF / 255 / 0b1010"}
              value={bitwiseKind === "NOT" ? "" : opB}
              onChange={(e) => setOpB(e.target.value)}
              disabled={bitwiseKind === "NOT"}
              autoComplete="off"
            />

            <div className="text-sm space-y-1">
              <div>ผลลัพธ์ (Bin): <code className="break-all">{bitwiseResult == null ? "—" : formatBin(bitwiseResult, width, 4)}</code></div>
              <div>ผลลัพธ์ (Hex): <code>{bitwiseResult == null ? "—" : "0x" + formatHex(bitwiseResult, width)}</code></div>
              <div className="flex gap-2">
                <Button onClick={() => copy(bitwiseResult == null ? "" : formatBin(bitwiseResult, width, 4))}>คัดลอก Bin</Button>
                <Button onClick={() => copy(bitwiseResult == null ? "" : "0x" + formatHex(bitwiseResult, width))}>คัดลอก Hex</Button>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Conversions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Binary" note="กลุ่มละ 4 บิต" value="">
          <div className="flex items-center gap-2">
            <code className="break-all text-sm">{dispBin}</code>
            <Button onClick={() => copy(dispBin)}>คัดลอก</Button>
          </div>
        </Card>
        <Card title="Octal" value="" note="">
          <div className="flex items-center gap-2">
            <code className="text-sm">{dispOct === "—" ? "—" : "0o" + dispOct}</code>
            <Button onClick={() => copy(dispOct === "—" ? "" : "0o" + dispOct)}>คัดลอก</Button>
          </div>
        </Card>
        <Card title={`Decimal (${signed ? "Signed" : "Unsigned"})`} value="">
          <div className="flex items-center gap-2">
            <code className="text-sm">{signed ? dispDecSigned : dispDecUnsigned}</code>
            <Button onClick={() => copy(signed ? dispDecSigned : dispDecUnsigned)}>คัดลอก</Button>
          </div>
        </Card>
        <Card title="Hex" note="กลุ่มละ 1 ไบต์" value="">
          <div className="flex items-center gap-2">
            <code className="text-sm">{dispHex === "—" ? "—" : "0x" + dispHex}</code>
            <Button onClick={() => copy(dispHex === "—" ? "" : "0x" + dispHex)}>คัดลอก</Button>
          </div>
        </Card>
      </div>

      {/* Bytes */}
      <Card title="Byte View" note="Big-endian / Little-endian" value="">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm mb-1">Big-endian (MSB → LSB)</div>
            <div className="flex flex-wrap gap-2">
              {beBytes.length === 0 ? <span>—</span> : beBytes.map((b, i) => (
                <span key={i} className="px-2 py-1 rounded-md border dark:border-gray-700">{b}</span>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm mb-1">Little-endian (LSB → MSB)</div>
            <div className="flex flex-wrap gap-2">
              {leBytes.length === 0 ? <span>—</span> : leBytes.map((b, i) => (
                <span key={i} className="px-2 py-1 rounded-md border dark:border-gray-700">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Tips */}
      <Card title="ทริค & ตัวอย่าง" value="">
        <ul className="list-disc pl-5 text-sm space-y-1">
          <li>รองรับคั่นตัวเลขด้วยขีดล่าง เช่น <code>0b1111_0000</code></li>
          <li>Dec รองรับเครื่องหมายลบ เช่น <code>-42</code> (ตีความแบบ two’s complement ตามความกว้าง)</li>
          <li>ASR รักษาบิตเครื่องหมาย (signed)</li>
          <li>ROL/ROR หมุนบิตวนซ้าย/ขวา</li>
          <li>ผลลัพธ์ทั้งหมดถูกตัดให้พอดีกับความกว้างที่เลือก</li>
        </ul>
      </Card>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <PrimaryButton onClick={() => { setSrc("0x1234ABCD"); setRadix(16); setWidth(32); setSigned(false); }}>
          ตั้งค่าทดสอบ 0x1234ABCD (32-bit)
        </PrimaryButton>
        <Button onClick={() => { setSrc(""); setOpB("0"); }}>
          ล้างทั้งหมด
        </Button>
      </div>
    </div>
  );
}
