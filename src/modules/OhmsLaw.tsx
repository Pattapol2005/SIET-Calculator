import React, { useMemo, useState } from "react";
import { Field, Badge, ResultsGrid, Button, PrimaryButton, FooterTip } from "../components/ui";
import { voltageUnits, currentUnits, resistanceUnits, toBase, fromBase, pretty, parseOrNull } 
from "../lib/units";

export default function OhmsLaw() {
  const [vStr, setVStr] = useState("");
  const [iStr, setIStr] = useState("");
  const [rStr, setRStr] = useState("");

  const [vUnit, setVUnit] = useState("V");
  const [iUnit, setIUnit] = useState("A");
  const [rUnit, setRUnit] = useState("Ω");

  const vInput = parseOrNull(vStr);
  const iInput = parseOrNull(iStr);
  const rInput = parseOrNull(rStr);

  const vBase = toBase(vInput, voltageUnits.find((u) => u.label === vUnit)!.factor);
  const iBase = toBase(iInput, currentUnits.find((u) => u.label === iUnit)!.factor);
  const rBase = toBase(rInput, resistanceUnits.find((u) => u.label === rUnit)!.factor);

  const provided = [vBase != null, iBase != null, rBase != null].filter(Boolean).length;

  const { vCalc, iCalc, rCalc, pCalc } = useMemo(() => {
    let vCalc: number | null = null,
        iCalc: number | null = null,
        rCalc: number | null = null,
        pCalc: number | null = null;

    if (provided >= 2) {
      if (vBase == null && iBase != null && rBase != null) vCalc = iBase * rBase;
      else if (iBase == null && vBase != null && rBase != null) iCalc = rBase === 0 ? null : vBase / rBase;
      else if (rBase == null && vBase != null && iBase != null) rCalc = iBase === 0 ? null : vBase / iBase;
    }

    // คำนวณ Power ถ้ามีค่าเพียงพอ
    if (vBase != null && iBase != null) {
      pCalc = vBase * iBase; // ใช้ P = VI
    } else if (iBase != null && rBase != null) {
      pCalc = iBase * iBase * rBase; // ใช้ P = I^2R
    } else if (vBase != null && rBase != null && rBase > 0) {
      pCalc = (vBase * vBase) / rBase; // ใช้ P = V^2 / R
    }

    return { vCalc, iCalc, rCalc, pCalc };
  }, [provided, vBase, iBase, rBase]);

  const vDisplay = fromBase(vCalc, voltageUnits.find((u) => u.label === vUnit)!.factor);
  const iDisplay = fromBase(iCalc, currentUnits.find((u) => u.label === iUnit)!.factor);
  const rDisplay = fromBase(rCalc, resistanceUnits.find((u) => u.label === rUnit)!.factor);

  const handleReset = () => {
    setVStr(""); setIStr(""); setRStr("");
    setVUnit("V"); setIUnit("A"); setRUnit("Ω");
  };

  const hint = provided < 2 ? (
    <p className="text-sm text-gray-500 dark:text-gray-400">
      ป้อนค่าให้ครบสองตัวแปร แล้วระบบจะคำนวณตัวที่เหลือให้อัตโนมัติ
    </p>
  ) : null;

  return (
    <>
      <div className="grid md:grid-cols-3 gap-5">
        <Field label="แรงดันไฟฟ้า (V)" icon={<Badge>V</Badge>} value={vStr} onChange={setVStr}
               unit={vUnit} onUnitChange={setVUnit} unitOptions={voltageUnits} placeholder="เช่น 5" />
        <Field label="กระแสไฟฟ้า (I)" icon={<Badge>I</Badge>} value={iStr} onChange={setIStr}
               unit={iUnit} onUnitChange={setIUnit} unitOptions={currentUnits} placeholder="เช่น 2" />
        <Field label="ความต้านทาน (R)" icon={<Badge>R</Badge>} value={rStr} onChange={setRStr}
               unit={rUnit} onUnitChange={setRUnit} unitOptions={resistanceUnits} placeholder="เช่น 10" />
      </div>

      <div className="mt-3">{hint}</div>
      <ResultsGrid items={[
        { title: "ผลลัพธ์ V", value: vCalc != null ? `${pretty(vDisplay)} ${vUnit}` : "—", note: "V = I × R" },
        { title: "ผลลัพธ์ I", value: iCalc != null ? `${pretty(iDisplay)} ${iUnit}` : "—", note: "I = V / R" },
        { title: "ผลลัพธ์ R", value: rCalc != null ? `${pretty(rDisplay)} ${rUnit}` : "—", note: "R = V / I" },
        { title: "กำลังไฟฟ้า (P)", value: pCalc != null ? `${pretty(pCalc)} W` : "—", note: "P = V×I, I²R, V²/R" },
      ]} />

      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={handleReset}>ล้างค่า</Button>
        <PrimaryButton onClick={() => { setVStr(""); setIStr("10"); setRStr("1"); setVUnit("V"); setIUnit("mA"); setRUnit("kΩ"); }}>
          ใส่ตัวอย่าง (I=10mA, R=1kΩ)
        </PrimaryButton>
      </div>

      <FooterTip>
        เคล็ดลับ: ป้อนค่าให้ครบ 2 ตัว ระบบจะคำนวณตัวที่เหลืออัตโนมัติ และยังคำนวณ P (กำลังไฟฟ้า) ให้ด้วย
      </FooterTip>
    </>
  );
}
