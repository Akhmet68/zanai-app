import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true, name: "zanai-server", time: new Date().toISOString() });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
