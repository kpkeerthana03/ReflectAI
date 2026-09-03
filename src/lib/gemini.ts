import { ReflectionMode } from "../types";

export interface GeminiReflectRequest {
  prompt: string;
  mode: ReflectionMode;
  history?: Array<{ role: "user" | "model"; content: string }>;
}

export interface GeminiReflectResponse {
  success: boolean;
  text: string;
  modelUsed: string;
  mode: ReflectionMode;
  timestamp: string;
}

export async function callGeminiReflect(
  payload: GeminiReflectRequest
): Promise<GeminiReflectResponse> {
  const response = await fetch("/api/gemini/reflect", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(errorData.error || `Server responded with HTTP ${response.status}`);
  }

  return response.json();
}
