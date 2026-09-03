import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// 1. Top-Level Request Deserialization (Ordering Guarantee)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// Utility for zero-crash payload hygiene (strip undefined)
export function stripUndefined<T extends Record<string, any>>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Lazy initialization of Gemini client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please add GEMINI_API_KEY in the environment or secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// Resilient Model Fallback Ladder
const MODEL_FALLBACK_LADDER = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash",
];

async function generateContentWithFallback(contents: any, systemInstruction?: string) {
  const ai = getAI();
  let lastError: any = null;

  for (const model of MODEL_FALLBACK_LADDER) {
    try {
      console.log(`[Gemini] Attempting generation with model: ${model}`);
      const response = await ai.models.generateContent({
        model,
        contents,
        config: systemInstruction ? { systemInstruction, temperature: 0.7 } : undefined,
      });

      const text = response.text;
      if (typeof text === "string" && text.length > 0) {
        return { text, modelUsed: model };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini] Model ${model} returned error: ${err?.message || err}. Attempting next model in fallback ladder...`);
    }
  }

  throw new Error(`All models in the fallback ladder failed. Last error: ${lastError?.message || "Unknown error"}`);
}

// System instructions tailored for reflection and journaling
const SYSTEM_INSTRUCTIONS: Record<string, string> = {
  reflect: `You are an empathetic, thoughtful personal reflection companion and journaling coach.
Analyze the user's reflection or journal entry.
Provide:
1. An empathetic validation and emotional resonance note.
2. 2-3 deep, constructive reflective questions that prompt further self-discovery.
3. A mindful observation or reframe that helps them understand their strengths or perspective.
Keep the tone calm, warm, and grounded without excessive cheerleading. Format with clear Markdown.`,

  summarize: `You are an insightful summarization specialist.
Condense the user's journal entry into:
1. Key Themes & Core Message (bullet points)
2. Emotional Tone & State of Mind
3. Critical Insights & Takeaways
Be concise, clear, and highlight actionable understanding in crisp Markdown.`,

  brainstorm: `You are a creative, supportive brainstorming partner and strategic coach.
Based on the user's situation or journal entry:
1. Brainstorm 4-5 creative pathways, fresh solutions, or experimental next steps.
2. Group them by immediate low-effort wins and longer-term shifts.
3. Suggest a micro-action they can do in the next 10 minutes.
Use encouraging, clear, and structured Markdown formatting.`,

  chat: `You are a trusted journaling companion in an ongoing multi-turn reflection session.
Respond thoughtfully and directly to the user's message in the context of their reflection.
Ask clarifying questions, offer compassionate insights, and help them explore their inner dialogue. Keep responses engaging, supportive, and concise in Markdown.`
};

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Primary Gemini reflection and interaction endpoint
app.post("/api/gemini/reflect", async (req: Request, res: Response) => {
  try {
    // 2. Defensive Payload Ingestion (Null-Safe Destructuring)
    const body = (req.body && typeof req.body === "object") ? req.body : {};
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const mode = typeof body.mode === "string" && SYSTEM_INSTRUCTIONS[body.mode] ? body.mode : "reflect";
    const history = Array.isArray(body.history) ? body.history : [];

    if (!prompt && history.length === 0) {
      res.status(400).json({ error: "A non-empty prompt or conversation history is required." });
      return;
    }

    if (prompt.length > 15000) {
      res.status(400).json({ error: "Input exceeds maximum allowed length of 15,000 characters." });
      return;
    }

    // Build contents for multi-turn or single turn
    let contents: any;
    if (history.length > 0) {
      // Format history turns safely
      const turns = history.map((turn: any) => ({
        role: turn.role === "model" || turn.role === "assistant" ? "model" : "user",
        parts: [{ text: String(turn.text || turn.content || "") }],
      }));

      if (prompt) {
        turns.push({
          role: "user",
          parts: [{ text: prompt }],
        });
      }
      contents = turns;
    } else {
      contents = prompt;
    }

    const systemInstruction = SYSTEM_INSTRUCTIONS[mode] || SYSTEM_INSTRUCTIONS.reflect;

    const result = await generateContentWithFallback(contents, systemInstruction);

    res.json(stripUndefined({
      success: true,
      text: result.text,
      modelUsed: result.modelUsed,
      mode,
      timestamp: new Date().toISOString(),
    }));
  } catch (error: any) {
    console.error("[API Error] /api/gemini/reflect failed:", error);
    res.status(500).json({
      error: error.message || "Failed to process reflection with Gemini AI",
    });
  }
});

// Start server with Vite middleware in development or static serve in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ReflectAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
