import React from "react";

export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
      {children}
    </span>
  );
}

export function Card({ title, value, note }: { title: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl bg-white/70 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
      <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
      <div className="text-2xl font-semibold mt-1 break-words">{value}</div>
      {note && <div className="text-xs mt-2 text-gray-500 dark:text-gray-400">{note}</div>}
    </div>
  );
}

export function ResultsGrid({ items }: { items: { title: string; value: string; note?: string }[] }) {
  return (
    <section className="mt-6 grid md:grid-cols-3 gap-4">
      {items.map((it, idx)=> <Card key={idx} title={it.title} value={it.value} note={it.note} />)}
    </section>
  );
}

export function Button({ onClick, children }: { onClick: ()=>void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="rounded-2xl px-5 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition shadow-sm">
      {children}
    </button>
  );
}

export function PrimaryButton({ onClick, children }: { onClick: ()=>void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="rounded-2xl px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm">
      {children}
    </button>
  );
}

export function FooterTip({ children }: { children: React.ReactNode }) {
  return (
    <footer className="mt-10 text-sm text-gray-500 dark:text-gray-400">{children}</footer>
  );
}

export function TabButton({ active, onClick, children }: { active: boolean; onClick: ()=>void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={`px-5 py-3 text-sm font-medium transition ${active? 'bg-indigo-600 text-white' : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
      {children}
    </button>
  );
}

/** Field — ช่องกรอก + ตัวเลือกหน่วย (เวอร์ชัน compact) */
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
        <span className="inline-flex items-center gap-2">{icon}{label}</span>
      </label>
      <div className="flex gap-2">
        <input
          inputMode="decimal"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <select
          value={unit}
          onChange={(e) => onUnitChange(e.target.value)}
          className="w-16 rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/50 px-2 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
