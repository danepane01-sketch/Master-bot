import * as ollama from "./ollamaService";
import * as groq from "./groqService";

export type GenerateOpts = {
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
};

export async function generate(prompt: string, opts: GenerateOpts = {}, botConfig: any = {}) {
  // Global default: use Ollama as global engine
  const provider = (botConfig && botConfig.provider) ? botConfig.provider : "ollama";

  if (provider === "groq") {
    // groqService may not exist in some setups; fall back to ollama
    if (groq && (groq as any).generate) {
      return (groq as any).generate(prompt, opts, botConfig.providerConfig || {});
    } else {
      return ollama.generate(prompt, opts, botConfig.providerConfig || {});
    }
  } else {
    return ollama.generate(prompt, opts, botConfig.providerConfig || {});
  }
}
