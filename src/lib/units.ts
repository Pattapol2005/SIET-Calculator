export const voltageUnits = [
  { label: "V", factor: 1 },
  { label: "mV", factor: 1e-3 },
  { label: "kV", factor: 1e3 },
];

export const currentUnits = [
  { label: "A", factor: 1 },
  { label: "mA", factor: 1e-3 },
  { label: "µA", factor: 1e-6 },
];

export const resistanceUnits = [
  { label: "Ω", factor: 1 },
  { label: "kΩ", factor: 1e3 },
  { label: "MΩ", factor: 1e6 },
];

export const inductanceUnits = [
  { label: "H", factor: 1 },
  { label: "mH", factor: 1e-3 },
  { label: "µH", factor: 1e-6 },
];

export const capacitanceUnits = [
  { label: "F", factor: 1 },
  { label: "µF", factor: 1e-6 },
  { label: "nF", factor: 1e-9 },
  { label: "pF", factor: 1e-12 },
];

export const freqUnits = [
  { label: "Hz", factor: 1 },
  { label: "kHz", factor: 1e3 },
  { label: "MHz", factor: 1e6 },
];

export function toBase(value: number | null, factor: number) {
  if (value == null || Number.isNaN(value)) return null;
  return value * factor;
}
export function fromBase(value: number | null, factor: number) {
  if (value == null || Number.isNaN(value)) return null;
  return value / factor;
}
export function pretty(value: number | null, digits = 6) {
  if (value == null || !Number.isFinite(value)) return "";
  return Number.parseFloat(value.toPrecision(digits)).toString();
}
export function parseOrNull(s: string) {
  if (!s.trim()) return null;
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
