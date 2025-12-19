const API_BASE = process.env.EXPO_PUBLIC_API_BASE ?? "http://192.168.1.26:3001";

export async function aiChat(messages: { role: "user" | "assistant"; content: string }[]) {
  const r = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages }),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`AI error: ${r.status} ${txt}`);
  }

  const data = (await r.json()) as { text: string };
  return data.text ?? "";
}
