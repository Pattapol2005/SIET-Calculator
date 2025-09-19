import React, { useState } from "react";

const GEMINI_ENDPOINT =
  import.meta.env.VITE_GEMINI_ENDPOINT || "/.netlify/functions/gemini";

export default function GeminiRlcDirect() {
  const [q, setQ] = useState("");
  const [ans, setAns] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    setLoading(true);
    setAns("");
    try {
      const systemPrompt = `
คุณคือตัวช่วยทางวงจรไฟฟ้า หรือความรู้อิเล็กทรอนิกส์ 
ห้ามตอบเรื่องอื่น ถ้าอยู่นอกหัวข้อให้ปฏิเสธทันที
`.trim();

      const res = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q, systemPrompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(
          typeof data?.error === "string" ? data.error : JSON.stringify(data?.error)
        );
      }

      const text = data?.text ?? "(ไม่มีคำตอบ)";
      setAns(text);
      console.log("Raw API response:", data?.raw);
    } catch (e: any) {
      setAns("เกิดข้อผิดพลาด: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
        🤖 ถาม Gemini Electro <span className="text-sm text-gray-500"></span>
      </h2>

      <textarea
        className="w-full h-28 mt-4 border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="เช่น: คำนวณ XL ของตัวเหนี่ยวนำ 10 mH ที่ความถี่ 50Hz"
      />

      <div className="mt-4 flex justify-end">
        <button
          onClick={ask}
          disabled={loading}
          className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow disabled:opacity-50 transition"
        >
          {loading ? "กำลังถาม..." : "ถาม Gemini Electro"}
        </button>
      </div>

      {ans && (
        <div className="mt-6">
          <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200 mb-2">
            📌 คำตอบจาก Gemini Electro:
          </h3>
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
            {ans}
          </div>
        </div>
      )}
    </div>
  );
}
