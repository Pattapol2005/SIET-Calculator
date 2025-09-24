import React from "react";

/* ---------- Badge ---------- */
export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
      {children}
    </span>
  );
}

/* ---------- Card (รองรับ children) ---------- */
type CardProps = {
  title: string;
  value: string;
  note?: string;
  children?: React.ReactNode;
};

export function Card({ title, value, note, children }: CardProps) {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
      <div className="flex items-baseline justify-between mb-2">
        <div className="text-sm text-gray-600 dark:text-gray-300">{title}</div>
        {note ? <div className="text-xs text-gray-500 dark:text-gray-400">{note}</div> : null}
      </div>
      <div className="text-2xl font-semibold mt-1 break-words mb-2">{value}</div>
      {children ? <div className="space-y-2">{children}</div> : null}
    </div>
  );
}

/* ---------- ResultsGrid ---------- */
export function ResultsGrid({
  items,
}: {
  items: { title: string; value: string; note?: string }[];
}) {
  return (
    <section className="mt-6 grid md:grid-cols-3 gap-4">
      {items.map((it, idx) => (
        <Card key={idx} title={it.title} value={it.value} note={it.note} />
      ))}
    </section>
  );
}

/* ---------- Buttons ---------- */
export function Button({
  onClick,
  children,
  className,
  title,
  variant = "secondary", // รับได้ แต่ใช้แค่เลือกสไตล์
}: {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  title?: string;
  variant?: "secondary" | "ghost" | "default";
}) {
  const base =
    "rounded-2xl px-5 py-3 border transition shadow-sm " +
    "border-gray-200 dark:border-gray-700";
  const styles =
    variant === "ghost"
      ? "bg-transparent hover:bg-gray-100/60 dark:hover:bg-gray-800/60"
      : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700";
  return (
    <button onClick={onClick} title={title} className={`${base} ${styles} ${className ?? ""}`}>
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
      className={
        "rounded-2xl px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm " +
        (className ?? "")
      }
    >
      {children}
    </button>
  );
}

/* ---------- FooterTip ---------- */
export function FooterTip({ children }: { children: React.ReactNode }) {
  return (
    <footer className="mt-10 text-sm text-gray-500 dark:text-gray-400">{children}</footer>
  );
}

/* ---------- TabButton ---------- */
export function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-3 text-sm font-medium transition ${
        active
          ? "bg-indigo-600 text-white"
          : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
    >
      {children}
    </button>
  );
}

/* ---------- Field (compact) ---------- */
export function Field({
  label,
  icon,
  value,
  onChange,
  unit,
  onUnitChange,
  unitOptions,
  placeholder,
}: {
  label: string;
  icon: React.ReactNode;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  onUnitChange: (u: string) => void;
  unitOptions: { label: string; factor: number }[];
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm text-gray-600 dark:text-gray-300 font-medium">
        <span className="inline-flex items-center gap-2">
          {icon}
          {label}
        </span>
      </label>
      <div className="flex gap-2">
        <input
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={unit}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onUnitChange(e.target.value)}
          className="w-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 px-2 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {unitOptions.map((u) => (
            <option key={u.label} value={u.label}>
              {u.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
