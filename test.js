import http from "k6/http";
import { sleep } from "k6";

export let options = {
  vus: 100,          // 100 concurrent virtual users
  duration: "30s",   // รัน 30 วินาที
  // หรือแทนด้วย stages เพื่อ ramp-up:
  // stages: [{ duration: "10s", target: 20 }, { duration: "20s", target: 100 }, { duration: "20s", target: 0 }],
};

export default function () {
  http.get("https://concord-whale-bringing-cabinets.trycloudflare.com/"); // <-- เปลี่ยนเป็น URL ของคุณ
  // ถ้าต้องการทดสอบหลาย endpoint ให้เรียกหลาย request
  sleep(1);
}
