const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://192.168.1.26:3001";
const TIMEOUT_MS = 20000;

export type AiMsg = { role: "user" | "assistant"; content: string };

async function fetchWithTimeout(url: string, init?: RequestInit) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const r = await fetch(url, { ...init, signal: controller.signal });
    return r;
  } catch (e: any) {
    if (e?.name === "AbortError") {
      throw new Error(`AI timeout (${TIMEOUT_MS / 1000}s). API_BASE=${API_BASE}`);
    }
    throw e;
  } finally {
    clearTimeout(t);
  }
}

export async function aiHealth() {
  const r = await fetchWithTimeout(`${API_BASE}/health`);
  if (!r.ok) throw new Error(`Health failed: ${r.status}`);
  return true;
}

export async function aiChat(messages: AiMsg[]) {
  const r = await fetchWithTimeout(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`AI error: ${r.status} ${txt}`.trim());
  }

  const data = (await r.json()) as { text?: string };
  return (data.text ?? "").trim();
}
