/**
 * Ollama local service adapter
 * Expects a local Ollama HTTP API running (adjust OLLAMA_BASE_URL if necessary)
 * This file provides a simple `generate` function used by the global provider.
 */

const OLLAMA_BASE = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export async function generate(prompt: string, opts: any = {}, cfg: any = {}) {
  const model = cfg.model || "llama3-70b";
  const body: any = {
    model,
    prompt,
    max_tokens: opts.maxTokens ?? 2048,
    temperature: opts.temperature ?? 0.2,
  };

  const url = `${OLLAMA_BASE}/api/generate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Ollama error: ${res.status} ${t}`);
  }
  const data = await res.json();
  // Normalize to { text }
  if (data && data.text) return { text: data.text, raw: data };
  if (Array.isArray(data) && data.length && data[0].generated_text) {
    return { text: data[0].generated_text, raw: data };
  }
  return { text: JSON.stringify(data), raw: data };
}
