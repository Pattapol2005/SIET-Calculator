import React, { useEffect, useState } from "react";
import OhmsLaw from "./modules/OhmsLaw";
import SerieslRlc from "./modules/SerieslRlc";
import ParallelRlc from "./modules/ParallelRlc";
import AskGemini from "./modules/askGemini";
import Resistor from "./modules/ResistorColorCode";
import PhasorCalculator from "./modules/PhasorCalculator";
import Digital from "./modules/bit";
import ScientificCalculator from "./modules/ScientificCalculator"; 
import logo from "./logo.png";
import { TabButton } from "./components/ui";

// Types
export type ToolKey =
  | "ohm"
  | "rlc series"
  | "rlc parallel"
  | "resistor color"
  | "phasor Calculator"
  | "ask gemini"
  | "bit";

export default function App() {
  const [tab, setTab] = useState<ToolKey>("ohm");
  const [view, setView] = useState<"home" | "module">("home");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && view === "module") setView("home");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <div className="text-center">
          <img src={logo} alt="Logo" className="w-[480px] h-auto animate-pulse mx-auto" />
        </div>
      </div>
    );
  }

  const openTool = (key: ToolKey) => {
    setTab(key);
    setView("module");
  };

  const backHomeBtn = (
    <div className="flex items-center justify-between gap-4 mb-4">
      <button
        onClick={() => setView("home")}
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        กลับหน้าหลัก (Esc)
      </button>

      <div className="hidden md:flex items-center gap-2">
        <TabButton active={tab === "ohm"} onClick={() => setTab("ohm")}>Ohm</TabButton>
        <TabButton active={tab === "resistor color"} onClick={() => setTab("resistor color")}>Resistor</TabButton>
        <TabButton active={tab === "rlc series"} onClick={() => setTab("rlc series")}>RLC Series</TabButton>
        <TabButton active={tab === "rlc parallel"} onClick={() => setTab("rlc parallel")}>RLC Parallel</TabButton>
        <TabButton active={tab === "phasor Calculator"} onClick={() => setTab("phasor Calculator")}>Phasor Cal</TabButton>
        <TabButton active={tab === "bit"} onClick={() => setTab("bit")}>Digital</TabButton>
        <TabButton active={tab === "ask gemini"} onClick={() => setTab("ask gemini")}>Ask Gemini</TabButton>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-10">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">SIET Calculator </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            เครื่องมือช่วยคำนวณวงจรไฟฟ้า / Gemini Electro <br />
            Facebook :
            <a href="https://www.facebook.com/profile.php?id=61580930048000" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 ml-1">
              SEIT Dev.
            </a>
            <span className="ml-2" /> | YouTube :
            <a href="https://www.youtube.com/@sietdev" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 ml-1">
              @sietdev
            </a>
            <span className="ml-2" /> | Tiktok :
            <a href="https://www.tiktok.com/@siet.dev" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 ml-1">
              @siet.dev
            </a>
          </p>
        </header>

        {view === "home" ? (
          <>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">แตะเพื่อเข้าสู่เครื่องมือ</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <ToolCard title="Ohm Law" desc="คำนวณ V, I, R, P" onOpen={() => openTool("ohm")} />
              <ToolCard title="Resistor Color" desc="อ่านค่าสีตัวต้านทาน" onOpen={() => openTool("resistor color")} />
              <ToolCard title="RLC Series" desc="วิเคราะห์อนุกรม RLC" onOpen={() => openTool("rlc series")} />
              <ToolCard title="RLC Parallel" desc="วิเคราะห์ขนาน RLC" onOpen={() => openTool("rlc parallel")} />
              <ToolCard title="Phasor Calculator" desc="คำนวณเฟสเซอร์" onOpen={() => openTool("phasor Calculator")} />
              <ToolCard title="Digital" desc="เลขฐาน/บิตโอเปอเรชัน" onOpen={() => openTool("bit")} />
              <ToolCard title="Ask Gemini 🤖" desc="ผู้ช่วยความรู้ไฟฟ้า" onOpen={() => openTool("ask gemini")} />
            </div>
          </>
        ) : (
          <div className="mt-2">
            {backHomeBtn}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm bg-white/60 dark:bg-white/5">
              {tab === "ohm" && <OhmsLaw />}
              {tab === "rlc series" && <SerieslRlc />}
              {tab === "rlc parallel" && <ParallelRlc />}
              {tab === "resistor color" && <Resistor />}
              {tab === "phasor Calculator" && <PhasorCalculator />}
              {tab === "bit" && <Digital />}
              {tab === "ask gemini" && <AskGemini />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Small Card on Home ===== */
function ToolCard({ title, desc, onOpen }: { title: string; desc: string; onOpen: () => void }) {
  return (
    <div className="group rounded-2xl border border-gray-200 dark:border-gray-700 p-5 bg-white/70 dark:bg-white/5 shadow-sm hover:shadow transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{desc}</p>
        </div>
        <span className="rounded-full border border-gray-200 dark:border-gray-700 px-2 py-1 text-xs text-gray-500">Tool</span>
      </div>
      <button
        onClick={onOpen}
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 px-4 py-2 hover:opacity-90 active:scale-[.99]"
      >
        เข้าใช้งาน
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}
