/**
 * Minimal Groq service placeholder.
 * Replace endpoint and payload with actual Groq API details and set GROQ_API_KEY in .env.local
 */

const GROQ_API_BASE = process.env.GROQ_API_BASE || "https://api.groq.com";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

export async function generate(prompt: string, opts: any = {}, cfg: any = {}) {
  const apiKey = cfg.apiKey || GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("Groq API key not configured. Set GROQ_API_KEY in .env.local or providerConfig.apiKey");
  }
  const model = cfg.model || "llama-3.1";

  const body = { model, prompt, max_tokens: opts.maxTokens ?? 8192, temperature: opts.temperature ?? 0.2 };

  const res = await fetch(`${GROQ_API_BASE}/v1/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Groq error: ${res.status} ${t}`);
  }
  return res.json();
}
