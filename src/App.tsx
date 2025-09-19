import React, { useState, useEffect } from "react";
import OhmsLaw from "./modules/OhmsLaw";
import SerieslRlc from "./modules/SerieslRlc";
import ParallelRlc from "./modules/ParallelRlc";
import AskGemini from "./modules/askGemini";
import Resistor from "./modules/ResistorColorCode";
import PhasorCalculator from "./modules/PhasorCalculator";
import Digital from "./modules/bit";
import logo from "./logo.png";
import { TabButton } from "./components/ui";

export default function App() {
  const [tab, setTab] = useState<
    "ohm" | "rlc series" | "rlc parallel" | "resistor color" | "phasor Calculator" | "ask gemini" | "bit"
  >("ohm");

  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <img 
            src={logo} 
            alt="Logo" 
            className="w-[800px] h-auto animate-pulse mx-auto" 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <header className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">SIET Calculator</h1>
          <p className="mt-1 text-gray-600 dark:text-gray-300">
            เครื่องมือช่วยคำนวณวงจรไฟฟ้า / Gemini Electro <br />
            Facebook :{" "}
            <a
              href="https://www.facebook.com/profile.php?id=61580930048000"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
            >
              SEIT Dev.
            </a>
            <span className="ml-2" /> | YouTube :{" "}
            <a
              href="https://www.youtube.com/@sietdev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
            >
              @sietdev
            </a>
            <span className="ml-2" /> | Tiktok :{" "}
            <a
              href="https://www.tiktok.com/@calc0010"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800"
            >
              @calc0010
            </a>
          </p>
        </header>

        <div
          className="
            inline-flex flex-wrap items-center
            gap-2
            rounded-2xl border border-gray-200 dark:border-gray-700
            shadow-sm p-1
            w-fit
          "
        >
          <TabButton active={tab === "ohm"} onClick={() => setTab("ohm")}>
            Ohm Law
          </TabButton>
          <TabButton active={tab === "resistor color"} onClick={() => setTab("resistor color")}>
            Resistor
          </TabButton>
          <TabButton active={tab === "rlc series"} onClick={() => setTab("rlc series")}>
            RLC Series
          </TabButton>
          <TabButton active={tab === "rlc parallel"} onClick={() => setTab("rlc parallel")}>
            RLC Parallel
          </TabButton>
          <TabButton active={tab === "phasor Calculator"} onClick={() => setTab("phasor Calculator")}>
            Phasor Cal
          </TabButton>
          <TabButton active={tab === "bit"} onClick={() => setTab("bit")}>
            Digital
          </TabButton>
          <TabButton active={tab === "ask gemini"} onClick={() => setTab("ask gemini")}>
            Ask Gemini 🤖
          </TabButton>
        </div>

        <div className="mt-8">
          {tab === "ohm" && <OhmsLaw />}
          {tab === "rlc series" && <SerieslRlc />}
          {tab === "rlc parallel" && <ParallelRlc />}
          {tab === "resistor color" && <Resistor />}
          {tab === "phasor Calculator" && <PhasorCalculator />}
          {tab === "bit" && <Digital />}
          {tab === "ask gemini" && <AskGemini />}
        </div>
      </div>
    </div>
  );
}
