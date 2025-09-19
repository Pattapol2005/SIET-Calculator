import React, { useMemo, useState } from "react";
import {
  Field,
  Badge,
  Card,
  FooterTip,
  Button,
  PrimaryButton,
} from "../components/ui";
import {
  voltageUnits,
  currentUnits,
  toBase,
  parseOrNull,
  pretty,
} from "../lib/units";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type PhaseMode = "angle" | "cos" | "sin" | "tan";

export default function PhasorCalculator() {
  // Inputs
  const [vStr, setVStr] = useState("");
  const [iStr, setIStr] = useState("");
  const [vUnit, setVUnit] = useState("V");
  const [iUnit, setIUnit] = useState("A");

  // Phase input
  const [mode, setMode] = useState<PhaseMode>("angle");
  const [phiStr, setPhiStr] = useState("");
  const [cosStr, setCosStr] = useState("");
  const [sinStr, setSinStr] = useState("");
  const [tanStr, setTanStr] = useState("");

  // Parse V/I
  const V = toBase(
    parseOrNull(vStr),
    voltageUnits.find((u) => u.label === vUnit)!.factor
  );
  const I = toBase(
    parseOrNull(iStr),
    currentUnits.find((u) => u.label === iUnit)!.factor
  );

  // Phase calculation
  const { phiRad, phiDeg, cosPhi, sinPhi, tanPhi, phaseWarning } = useMemo(() => {
    let phiR: number | null = null;
    let warn: string | null = null;

    const clamp = (x: number, lo: number, hi: number) =>
      Math.min(Math.max(x, lo), hi);

    if (mode === "angle") {
      const deg = parseOrNull(phiStr);
      if (deg != null) phiR = (deg * Math.PI) / 180;
    } else if (mode === "cos") {
      const c = parseOrNull(cosStr);
      if (c != null) {
        const cc = clamp(c, -1, 1);
        if (c !== cc) warn = "cosφ ถูกปรับให้อยู่ใน [-1,1]";
        phiR = Math.acos(cc);
      }
    } else if (mode === "sin") {
      const s = parseOrNull(sinStr);
      if (s != null) {
        const ss = clamp(s, -1, 1);
        if (s !== ss) warn = "sinφ ถูกปรับให้อยู่ใน [-1,1]";
        phiR = Math.asin(ss);
      }
    } else if (mode === "tan") {
      const t = parseOrNull(tanStr);
      if (t != null) phiR = Math.atan(t);
    }

    const cosφ = phiR != null ? Math.cos(phiR) : null;
    const sinφ = phiR != null ? Math.sin(phiR) : null;
    const tanφ = phiR != null ? Math.tan(phiR) : null;
    const deg = phiR != null ? (phiR * 180) / Math.PI : null;

    return {
      phiRad: phiR,
      phiDeg: deg,
      cosPhi: cosφ,
      sinPhi: sinφ,
      tanPhi: tanφ,
      phaseWarning: warn,
    };
  }, [mode, phiStr, cosStr, sinStr, tanStr]);

  // Power calculation
  const results = useMemo(() => {
    if (V == null || I == null || phiRad == null) return null;
    const S = V * I;
    const c = Math.cos(phiRad);
    const s = Math.sin(phiRad);
    const P = S * c;
    const Q = S * s;
    const PF = c;
    return { S, P, Q, PF };
  }, [V, I, phiRad]);

  // Reset
  const handleReset = () => {
    setVStr("");
    setIStr("");
    setVUnit("V");
    setIUnit("A");
    setMode("angle");
    setPhiStr("");
    setCosStr("");
    setSinStr("");
    setTanStr("");
  };

  // ✅ Waveform data
  const waveData = useMemo(() => {
    if (phiRad == null) return [];
    const Vm = V ?? 1;
    const Im = I ?? 1;
    const points = [];
    for (let deg = 0; deg <= 360; deg += 5) {
      const rad = (deg * Math.PI) / 180;
      const v = Vm * Math.sin(rad);
      const i = Im * Math.sin(rad - phiRad);
      points.push({ angle: deg, Voltage: v, Current: i });
    }
    return points;
  }, [V, I, phiRad]);

  // Input field for phase
  const PhaseField = () => {
    if (mode === "angle") {
      return (
        <Field
          label="เฟส (φ)"
          icon={<Badge>φ</Badge>}
          value={phiStr}
          onChange={setPhiStr}
          unit="°"
          onUnitChange={() => {}}
          unitOptions={[{ label: "°", factor: 1 }]}
          placeholder="เช่น 30"
        />
      );
    }
    if (mode === "cos") {
      return (
        <Field
          label="cosφ"
          icon={<Badge>cos</Badge>}
          value={cosStr}
          onChange={setCosStr}
          unit=""
          onUnitChange={() => {}}
          unitOptions={[{ label: "-", factor: 1 }]}
          placeholder="ระบุ -1 ถึง 1"
        />
      );
    }
    if (mode === "sin") {
      return (
        <Field
          label="sinφ"
          icon={<Badge>sin</Badge>}
          value={sinStr}
          onChange={setSinStr}
          unit=""
          onUnitChange={() => {}}
          unitOptions={[{ label: "-", factor: 1 }]}
          placeholder="ระบุ -1 ถึง 1"
        />
      );
    }
    return (
      <Field
        label="tanφ"
        icon={<Badge>tan</Badge>}
        value={tanStr}
        onChange={setTanStr}
        unit=""
        onUnitChange={() => {}}
        unitOptions={[{ label: "-", factor: 1 }]}
        placeholder="เช่น 0.577 (≈ tan 30°)"
      />
    );
  };

  return (
    <div className="space-y-6">
      {/* Mode selection */}
      <div className="inline-flex rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
        <button
          className={`px-4 py-2 text-sm ${
            mode === "angle"
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-gray-900"
          }`}
          onClick={() => setMode("angle")}
        >
          φ°
        </button>
        <button
          className={`px-4 py-2 text-sm ${
            mode === "cos"
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-gray-900"
          }`}
          onClick={() => setMode("cos")}
        >
          cosφ
        </button>
        <button
          className={`px-4 py-2 text-sm ${
            mode === "sin"
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-gray-900"
          }`}
          onClick={() => setMode("sin")}
        >
          sinφ
        </button>
        <button
          className={`px-4 py-2 text-sm ${
            mode === "tan"
              ? "bg-indigo-600 text-white"
              : "bg-white dark:bg-gray-900"
          }`}
          onClick={() => setMode("tan")}
        >
          tanφ
        </button>
      </div>

      {/* Inputs */}
      <div className="grid md:grid-cols-3 gap-5">
        <Field
          label="แรงดัน (Vrms)"
          icon={<Badge>V</Badge>}
          value={vStr}
          onChange={setVStr}
          unit={vUnit}
          onUnitChange={setVUnit}
          unitOptions={voltageUnits}
          placeholder="เช่น 220"
        />
        <Field
          label="กระแส (Irms)"
          icon={<Badge>I</Badge>}
          value={iStr}
          onChange={setIStr}
          unit={iUnit}
          onUnitChange={setIUnit}
          unitOptions={currentUnits}
          placeholder="เช่น 5"
        />
        <PhaseField />
      </div>

      {phaseWarning && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {phaseWarning}
        </p>
      )}

      {/* cos/sin/tan */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card
          title="cosφ"
          note="P/S"
          value={cosPhi != null ? pretty(cosPhi, 6) : "—"}
        />
        <Card
          title="sinφ"
          note="Q/S"
          value={sinPhi != null ? pretty(sinPhi, 6) : "—"}
        />
        <Card
          title="tanφ"
          note="Q/P"
          value={tanPhi != null ? pretty(tanPhi, 6) : "—"}
        />
      </div>

      {/* Power results */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card
          title="P (กำลังจริง)"
          note="P = V·I·cosφ"
          value={results ? `${pretty(results.P)} W` : "—"}
        />
        <Card
          title="Q (กำลังรีแอกทีฟ)"
          note="Q = V·I·sinφ"
          value={results ? `${pretty(results.Q)} var` : "—"}
        />
        <Card
          title="S (กำลังปรากฏ)"
          note="S = V·I"
          value={results ? `${pretty(results.S)} VA` : "—"}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card
          title="φ (องศา)"
          note="มุมเฟส"
          value={phiDeg != null ? `${pretty(phiDeg, 6)} °` : "—"}
        />
        <Card
          title="PF"
          note="Power Factor = cosφ"
          value={results ? pretty(results.PF, 6) : "—"}
        />
        <Card
          title="Q:P"
          note="= tanφ"
          value={tanPhi != null ? pretty(tanPhi, 6) : "—"}
        />
      </div>

      {/* ✅ Waveform plot */}
      {phiRad != null && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">เฟส (waveform)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={waveData}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis
                dataKey="angle"
                label={{
                  value: "องศา (°)",
                  position: "insideBottom",
                  offset: -5,
                }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Voltage"
                stroke="#1f77b4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="Current"
                stroke="#ff7f0e"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleReset}>ล้างค่า</Button>
        <PrimaryButton
          onClick={() => {
            setVStr("220");
            setIStr("5");
            setVUnit("V");
            setIUnit("A");
            setMode("angle");
            setPhiStr("30");
            setCosStr("");
            setSinStr("");
            setTanStr("");
          }}
        >
          ตัวอย่าง (220V, 5A, φ=30°)
        </PrimaryButton>
      </div>

      <FooterTip>
        กราฟแสดงคลื่น <b>แรงดัน</b> (สีน้ำเงิน) และ <b>กระแส</b> (สีส้ม)
        ที่มีการเลื่อนเฟส φ<br />
        ใช้กับระบบ <b>Single-Phase</b>. สำหรับ 3 เฟส (3φ) สูตรจะต่างออกไป
        เล็กน้อย
      </FooterTip>
    </div>
  );
}
