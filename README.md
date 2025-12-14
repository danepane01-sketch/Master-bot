<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1Retayzxqj5ojdT_j_B1LQb9LyweFmFLX

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Unified Merge Notes
- File Browser embedded into `public/filebrowser` and exposed to every bot via `components/FileBot.tsx`.
- BotGrid includes a demo Browse button per bot (may need UI tuning).
- Unrestricted tools copied to `plugins/unrestricted-ai-tools`.


## Changes: Global Ollama Engine Applied
- Ollama set as the **global engine** via `services/provider.ts` -> `services/ollamaService.ts`.
- `features/globalEngine.ts` updated to use provider.generate() and register bots from metadata.json.
- metadata.json now includes 20 bots by default, each with `provider: "ollama"` and `apiKeys` slots.
- Groq placeholder service added to `services/groqService.ts` (set GROQ_API_KEY to enable per-bot Groq usage).

### Running Ollama
- Start Ollama locally and ensure HTTP API is reachable at the URL in `.env.local` (OLLAMA_BASE_URL).
- Then run `npm install` and `npm run dev` in project root.


## Parabot Mesh + Hub Architecture (Updated)
 - Hub: /hub (WebSocket + HTTP orchestration). Run: cd hub && npm install && npm start
 - Parabots: /parabots/bot01 .. bot20. Each runs on its own port and connects to hub.
 - Each bot stores infinite-memory in memory.log.jsonl and streams events to hub for real-time monitoring.
 - Chat AI (Ollama) is offline and used by bots via local HTTP (OLLAMA_BASE_URL). Bots call Ollama for replies.
