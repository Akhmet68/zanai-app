import "dotenv/config";
import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json({ limit: "2mb" }));

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.get("/health", (_req, res) => res.json({ ok: true }));

type ChatInMessage = {
  role: "developer" | "user" | "assistant";
  content: string;
};

app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body as { messages: ChatInMessage[] };

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing in .env" });
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages[] is required" });
    }

    const model = process.env.OPENAI_MODEL ?? "gpt-5";

    // Responses API умеет принимать input как массив сообщений role/content :contentReference[oaicite:2]{index=2}
    const response = await client.responses.create({
      model,
      // можно чуть “мягче”/дешевле:
      reasoning: { effort: "low" },
      input: [
        { role: "developer", content: "You are ZanAI — helpful assistant. Reply in Russian or Kazakh depending on user language." },
        ...messages,
      ],
    });

    return res.json({ text: response.output_text ?? "" });
  } catch (e: any) {
    return res.status(500).json({
      error: e?.message ?? "OpenAI request failed",
    });
  }
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`✅ zanai-server running on http://localhost:${port}`);
});
