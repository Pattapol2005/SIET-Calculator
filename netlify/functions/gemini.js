exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) return json(500, { error: "Server missing API key" });

  let body;
  try { body = JSON.parse(event.body || "{}"); }
  catch { return json(400, { error: "Invalid JSON body" }); }

  const { q, systemPrompt } = body;
  if (!q || typeof q !== "string") return json(400, { error: "Missing 'q' string" });

  const sys = (systemPrompt && String(systemPrompt)) || `คุณคือตัวช่วยทางวงจรไฟฟ้า หรือความรู้อิเล็กทรอนิกส์ 
ห้ามตอบเรื่องอื่น ถ้าอยู่นอกหัวข้อให้ปฏิเสธทันที`.trim();

  const payload = {
    contents: [
      { role: "user", parts: [{ text: sys }] },
      { role: "user", parts: [{ text: q }] },
    ],
  };

  const r = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
  );

  const upstreamRaw = await r.text();
  let upstream;
  try { upstream = upstreamRaw ? JSON.parse(upstreamRaw) : null; }
  catch { return json(502, { error: "Upstream returned non-JSON", raw: upstreamRaw }); }

  if (!r.ok) return json(502, { error: upstream?.error || upstream });

  const text = upstream?.candidates?.[0]?.content?.parts?.map(p => p.text).join("") ?? "(ไม่มีคำตอบ)";
  return json(200, { text, raw: upstream });
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify(obj),
  };
}
