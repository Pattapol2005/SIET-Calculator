// src/modules/ParallelRlc.tsx
import React, { useMemo, useState } from "react";
import { Field, Badge, Card, FooterTip } from "../components/ui";
import {
  voltageUnits, resistanceUnits, inductanceUnits, capacitanceUnits, freqUnits,
  toBase, pretty, parseOrNull
} from "../lib/units";

/**
 * Parallel RLC (อนุกรมกับ "Y"): Y = G + j(ωC - 1/ωL)
 * - G = 1/R
 * - B = ωC - 1/(ωL)
 * - |Y| = sqrt(G^2 + B^2)
 * - |Z| = 1 / |Y|
 * - เฟสของอิมพีแดนซ์ Z: φz = -atan2(B, G)   (เพราะ Z = 1 / Y)
 * - PF = cos(φz)
 * - f0 = 1 / (2π√(LC))
 * - Q_parallel ≈ R * sqrt(C/L)        (high-Q approximation)
 * - BW = f0 / Q
 */
export default function ParallelRlc() {
  // Inputs
  const [vStr, setVStr] = useState("");     // Vrms (optional)
  const [rStr, setRStr] = useState("");
  const [lStr, setLStr] = useState("");
  const [cStr, setCStr] = useState("");
  const [fStr, setFStr] = useState("");

  const [vUnit, setVUnit] = useState("V");
  const [rUnit, setRUnit] = useState("Ω");
  const [lUnit, setLUnit] = useState("mH");
  const [cUnit, setCUnit] = useState("µF");
  const [fUnit, setFUnit] = useState("Hz");

  // Base values
  const V  = toBase(parseOrNull(vStr), voltageUnits.find(u=>u.label===vUnit)!.factor);
  const R  = toBase(parseOrNull(rStr), resistanceUnits.find(u=>u.label===rUnit)!.factor) ?? 0;
  const L  = toBase(parseOrNull(lStr), inductanceUnits.find(u=>u.label===lUnit)!.factor) ?? 0;
  const C  = toBase(parseOrNull(cStr), capacitanceUnits.find(u=>u.label===cUnit)!.factor) ?? 0;
  const f  = toBase(parseOrNull(fStr),  freqUnits.find(u=>u.label===fUnit)!.factor) ?? 0;

  const twoPi = 2 * Math.PI;
  const omega = f > 0 ? twoPi * f : 0;

  // Admittance parts
  const G  = (R > 0) ? (1 / R) : (R === 0 ? Infinity : 0);          // Conductance (S)
  const BC = (omega > 0 && C > 0) ? (omega * C) : (omega > 0 ? 0 : null); // Capacitive susceptance (S)
  const BL = (omega > 0 && L > 0) ? (-1 / (omega * L)) : (omega > 0 ? -Infinity : null); // Inductive susceptance (S)
  const B  = (BC != null && BL != null) ? (BC + BL) : null;         // Total susceptance (S)

  // |Y|, |Z|, phase(Z), PF, I
  const Ymag = useMemo(() => {
    if (B == null) return null;
    const g = Number.isFinite(G) ? G : 0; // handle Infinity -> treat as very large
    if (!Number.isFinite(g) || !Number.isFinite(B)) return null;
    return Math.sqrt(g * g + B * B);
  }, [G, B]);

  const Zmag = (Ymag != null && Ymag > 0) ? (1 / Ymag) : null;

  // Phase of impedance: φz = -atan2(B, G)
  const phaseZRad = (B != null && Number.isFinite(G)) ? (-Math.atan2(B as number, G as number)) : null;
  const phaseZDeg = phaseZRad != null ? (phaseZRad * 180 / Math.PI) : null;

  const pf = phaseZRad != null ? Math.cos(phaseZRad) : null; // power factor of Z
  const I  = (V != null && Zmag != null && Zmag > 0) ? (V / Zmag) : null; // Irms

  // Resonance + Q + BW (parallel)
  const f0 = (L > 0 && C > 0) ? (1 / (twoPi * Math.sqrt(L * C))) : null;
  const Qp = (L > 0 && C > 0 && R > 0) ? (R * Math.sqrt(C / L)) : null; // parallel Q (approx.)
  const BW = (f0 != null && Qp != null && Qp > 0) ? (f0 / Qp) : null;

  return (
    <>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="แรงดันแหล่งจ่าย (V rms) — ไม่จำเป็น" icon={<Badge>V</Badge>} value={vStr} onChange={setVStr}
               unit={vUnit} onUnitChange={setVUnit} unitOptions={voltageUnits} placeholder="เช่น 220" />
        <Field label="ความต้านทาน R (ขนาน)" icon={<Badge>R</Badge>} value={rStr} onChange={setRStr}
               unit={rUnit} onUnitChange={setRUnit} unitOptions={resistanceUnits} placeholder="เช่น 100" />
        <Field label="เหนี่ยวนำ L (ขนาน)" icon={<Badge>L</Badge>} value={lStr} onChange={setLStr}
               unit={lUnit} onUnitChange={setLUnit} unitOptions={inductanceUnits} placeholder="เช่น 10" />
        <Field label="คาปาซิแตนซ์ C (ขนาน)" icon={<Badge>C</Badge>} value={cStr} onChange={setCStr}
               unit={cUnit} onUnitChange={setCUnit} unitOptions={capacitanceUnits} placeholder="เช่น 100" />
        <Field label="ความถี่ f" icon={<Badge>f</Badge>} value={fStr} onChange={setFStr}
               unit={fUnit} onUnitChange={setFUnit} unitOptions={freqUnits} placeholder="เช่น 50" />
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card title="Susceptance ของ C (B_C)" note="B_C = ωC"
              value={BC != null && Number.isFinite(BC) ? `${pretty(BC)} S` : "—"} />
        <Card title="Susceptance ของ L (B_L)" note="B_L = −1/(ωL)"
              value={BL != null && Number.isFinite(BL) ? `${pretty(BL)} S` : (BL === -Infinity ? "−∞ S" : "—")} />
        <Card title="แมกนิจูดอิมพีแดนซ์ (|Z|)" note="สำหรับขนาน: |Z| = 1 / |Y|"
              value={Zmag != null ? `${pretty(Zmag)} Ω` : "—"} />
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <Card title="เฟสของ Z (φ)" note="φz = −atan2(B, G)"
              value={phaseZDeg != null ? `${pretty(phaseZDeg, 5)} °` : "—"} />
        <Card title="Power Factor" note="cos φz"
              value={pf != null ? `${pretty(pf, 5)}` : "—"} />
        <Card title="กระแสรวม (I rms)" note="I = V / |Z| (ต้องกรอก V)"
              value={I != null ? `${pretty(I)} A` : "—"} />
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <Card title="ความถี่เรโซแนนซ์ (f₀)" note="1/(2π√(LC))"
              value={f0 != null ? `${pretty(f0)} Hz` : "—"} />
        <Card title="Q (parallel)" note="≈ R √(C/L)"
              value={Qp != null ? `${pretty(Qp)}` : "—"} />
        <Card title="แบนด์วิดท์ (BW)" note="f₀ / Q"
              value={BW != null ? `${pretty(BW)} Hz` : "—"} />
      </div>

      <FooterTip>
        หมายเหตุ: โมเดลนี้คือ <b>R, L, C ต่อขนาน</b> อ้างอิงแบบ ideal/เชิงเส้น (rms).
      </FooterTip>
    </>
  );
}
