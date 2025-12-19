const API_BASE = "http://192.168.0.23:3001"; // <-- замени на свой IPv4

export async function aiChat(messages: { role: "user" | "assistant"; content: string }[]) {
  const payload = {
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  };

  const r = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const txt = await r.text().catch(() => "");
    throw new Error(`AI error: ${r.status} ${txt}`);
  }

  const data = (await r.json()) as { text: string };
  return data.text;
}
