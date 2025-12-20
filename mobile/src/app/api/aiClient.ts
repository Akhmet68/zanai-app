const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://192.168.1.26:3001";
const TIMEOUT_MS = 20000;

export type AiMsg = { role: "user" | "assistant"; content: string };

export async function aiChat(messages: AiMsg[]) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const r = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: controller.signal,
    });

    if (!r.ok) {
      const txt = await r.text().catch(() => "");
      throw new Error(`AI error: ${r.status} ${txt}`);
    }

    const data = (await r.json()) as { text?: string };
    return (data.text ?? "").trim();
  } catch (e: any) {
    // В RN/Expo abort часто приходит именно так
    if (e?.name === "AbortError") {
      throw new Error(`AI timeout (${TIMEOUT_MS / 1000}s). Проверь API_BASE и сервер.`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}
