import React, { useMemo, useState } from "react";
import { Field, Badge, Card, FooterTip } from "../components/ui";
import {
  voltageUnits, resistanceUnits, inductanceUnits, capacitanceUnits, freqUnits,
  toBase, pretty, parseOrNull
} from "../lib/units";

export default function RlcCalculator() {
  const [vStr, setVStr] = useState(""); // Vrms (optional)
  const [rStr, setRStr] = useState("");
  const [lStr, setLStr] = useState("");
  const [cStr, setCStr] = useState("");
  const [fStr, setFStr] = useState("");

  const [vUnit, setVUnit] = useState("V");
  const [rUnit, setRUnit] = useState("Ω");
  const [lUnit, setLUnit] = useState("mH");
  const [cUnit, setCUnit] = useState("µF");
  const [fUnit, setFUnit] = useState("Hz");

  const V = toBase(parseOrNull(vStr), voltageUnits.find(u=>u.label===vUnit)!.factor);
  const R = toBase(parseOrNull(rStr), resistanceUnits.find(u=>u.label===rUnit)!.factor) ?? 0;
  const L = toBase(parseOrNull(lStr), inductanceUnits.find(u=>u.label===lUnit)!.factor) ?? 0;
  const C = toBase(parseOrNull(cStr), capacitanceUnits.find(u=>u.label===cUnit)!.factor) ?? 0;
  const f = toBase(parseOrNull(fStr), freqUnits.find(u=>u.label===fUnit)!.factor) ?? 0;

  const twoPi = 2*Math.PI;
  const omega = f>0 ? twoPi*f : 0;

  const XL = omega>0 ? omega*L : null;
  const XC = (omega>0 && C>0) ? 1/(omega*C) : (omega>0 ? Infinity : null);
  const react = (XL!=null && XC!=null) ? (XL - XC) : null;

  const Zmag = useMemo(()=>{
    if (react==null) return null;
    const rr = R>=0?R:NaN; if(!Number.isFinite(rr)) return null;
    return Math.sqrt(rr*rr + react*react);
  },[R,react]);

  const phaseRad = (react!=null && R>0) ? Math.atan2(react, R) : (react!=null && R===0 ? Math.sign(react)*Math.PI/2 : null);
  const phaseDeg = phaseRad!=null ? (phaseRad*180/Math.PI) : null;
  const pf = phaseRad!=null ? Math.cos(phaseRad) : null;
  const I = (V!=null && Zmag!=null && Zmag>0) ? V/Zmag : null;

  const f0 = (L>0 && C>0) ? (1/(twoPi*Math.sqrt(L*C))) : null;
  const Q = (L>0 && C>0 && R>0) ? (Math.sqrt(L/C)/R) : null;
  const BW = (f0!=null && Q!=null && Q>0) ? (f0/Q) : null;

  return (
    <>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="แรงดันแหล่งจ่าย (V rms) — ไม่จำเป็น" icon={<Badge>V</Badge>} value={vStr} onChange={setVStr}
               unit={vUnit} onUnitChange={setVUnit} unitOptions={voltageUnits} placeholder="เช่น 220" />
        <Field label="ความต้านทาน R" icon={<Badge>R</Badge>} value={rStr} onChange={setRStr}
               unit={rUnit} onUnitChange={setRUnit} unitOptions={resistanceUnits} placeholder="เช่น 100" />
        <Field label="เหนี่ยวนำ L" icon={<Badge>L</Badge>} value={lStr} onChange={setLStr}
               unit={lUnit} onUnitChange={setLUnit} unitOptions={inductanceUnits} placeholder="เช่น 10" />
        <Field label="คาปาซิแตนซ์ C" icon={<Badge>C</Badge>} value={cStr} onChange={setCStr}
               unit={cUnit} onUnitChange={setCUnit} unitOptions={capacitanceUnits} placeholder="เช่น 100" />
        <Field label="ความถี่ f" icon={<Badge>f</Badge>} value={fStr} onChange={setFStr}
               unit={fUnit} onUnitChange={setFUnit} unitOptions={freqUnits} placeholder="เช่น 50" />
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <Card title="รีแอกแตนซ์ของคอยล์ (XL)" note="XL = 2π f L" value={XL!=null && Number.isFinite(XL) ? `${pretty(XL)} Ω` : "—"} />
        <Card title="รีแอกแตนซ์ของคาปา (XC)" note="XC = 1/(2π f C)" value={XC!=null && Number.isFinite(XC) ? `${pretty(XC)} Ω` : (XC===Infinity?"∞ Ω":"—")} />
        <Card title="แมกนิจูดอิมพีแดนซ์ (|Z|)" note="|Z| = √(R² + (XL−XC)²)" value={Zmag!=null ? `${pretty(Zmag)} Ω` : "—"} />
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <Card title="เฟส (φ)" note="φ = atan((XL−XC)/R)" value={phaseDeg!=null ? `${pretty(phaseDeg,5)} °` : "—"} />
        <Card title="Power Factor" note="cos φ" value={pf!=null ? `${pretty(pf,5)}` : "—"} />
        <Card title="กระแส (I rms)" note="I = V/|Z| (ต้องกรอก V)" value={I!=null ? `${pretty(I)} A` : "—"} />
      </div>

      <div className="mt-4 grid md:grid-cols-3 gap-4">
        <Card title="ความถี่เรโซแนนซ์ (f₀)" note="1/(2π√(LC))" value={f0!=null ? `${pretty(f0)} Hz` : "—"} />
        <Card title="Q (series RLC)" note="√(L/C)/R" value={Q!=null ? `${pretty(Q)}` : "—"} />
        <Card title="แบนด์วิดท์ (BW)" note="f₀/Q" value={BW!=null ? `${pretty(BW)} Hz` : "—"} />
      </div>

      <FooterTip>
        หมายเหตุ: โมเดลนี้สำหรับ <b>RLC ต่ออนุกรม</b> และใช้ค่าเชิงเส้น (rms).
      </FooterTip>
    </>
  );
}
