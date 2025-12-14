/**
 * globalEngine.ts
 * This engine routes all chat generation to the provider layer (Ollama by default)
 * and provides the initial simulation state for the React App.
 */

import { generate } from "../services/provider";
import { Bot, BotType, BotStatus, NetworkData } from '../types';

// --- Configuration Types ---
type BotConfig = {
  id: string;
  name?: string;
  provider?: string;
  providerConfig?: any;
  apiKeys?: { [k:string]: string };
};

// Internal registry for the provider logic
let bots: BotConfig[] = [];

// --- Frontend Simulation Exports (Required by App.tsx) ---

export const FEATURE_NAME = "OMNI-HYPER-MIND V5.0";
export const FEATURE_SUBTITLE = "64-BIT AUTONOMOUS NEURAL CLUSTER";

export const INITIAL_ENGINE_BOTS: Bot[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `UNIT-${(i + 1).toString().padStart(2, '0')}`,
  type: BotType.OMNI_UNIT,
  status: BotStatus.IDLE,
  efficiency: 100,
  log: 'System initialization...',
  memoryBank: []
}));

export const INITIAL_ENGINE_NETWORK: NetworkData = {
  nodes: [
    { id: 'CORE', group: 1, status: 'secure', label: 'CORE_HYPERVISOR' },
    { id: 'FW-01', group: 2, status: 'secure', label: 'PERIMETER_FW' },
    { id: 'FW-02', group: 2, status: 'secure', label: 'INT_FW' },
    { id: 'DB-SHARD-A', group: 3, status: 'secure', label: 'DATA_SHARD_A' },
    { id: 'DB-SHARD-B', group: 3, status: 'compromised', label: 'DATA_SHARD_B' },
    { id: 'AI-NODE-1', group: 4, status: 'vulnerable', label: 'NEURAL_PROC_1' },
    { id: 'AI-NODE-2', group: 4, status: 'secure', label: 'NEURAL_PROC_2' },
    { id: 'WEB-FRONT', group: 5, status: 'compromised', label: 'PUBLIC_GATEWAY' },
    { id: 'BACKUP', group: 6, status: 'offline', label: 'COLD_STORAGE' }
  ],
  links: [
    { source: 'CORE', target: 'FW-01', value: 5 },
    { source: 'CORE', target: 'FW-02', value: 5 },
    { source: 'FW-01', target: 'WEB-FRONT', value: 3 },
    { source: 'FW-02', target: 'DB-SHARD-A', value: 3 },
    { source: 'FW-02', target: 'DB-SHARD-B', value: 3 },
    { source: 'CORE', target: 'AI-NODE-1', value: 4 },
    { source: 'CORE', target: 'AI-NODE-2', value: 4 },
    { source: 'DB-SHARD-B', target: 'BACKUP', value: 1 }
  ]
};

export const getGlobalEngineLog = (status: BotStatus): string => {
  const logs = [
    "Analyzing packet headers...",
    "Decrypting secure stream...",
    "Handshake protocol initiated.",
    "Buffer overflow detected in sector 7G.",
    "Rerouting traffic via proxy chain...",
    "Neural weights updated.",
    "Scanning ports 1024-65535...",
    "Brute-force attempt: 45%...",
    "Injecting payload...",
    "Connection established.",
    "Running heuristics analysis...",
    "Garbage collection in thread 4...",
    "Optimizing kernel ring 0..."
  ];
  
  // Custom logs based on status
  if (status === BotStatus.ROOT_ACCESS) return "ROOT ACCESS GRANTED. SYSTEM COMPROMISED.";
  if (status === BotStatus.VIDEO_ANALYSIS) return "Processing frame buffer... [VIDEO]";
  if (status === BotStatus.AUDIO_ANALYSIS) return "Decoding frequency spectrum... [AUDIO]";
  
  const randomMsg = logs[Math.floor(Math.random() * logs.length)];
  const prefixes = ["SYS:", "NET:", "AI:", "LOG:", "ERR:", "WARN:"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  
  return `${prefix} ${randomMsg}`;
};

// --- Provider / Registry Functions ---

export function getBotConfig(botId: string): BotConfig | undefined {
  return bots.find(b => b.id === botId);
}

export async function askBot(botId: string, prompt: string, opts: any = {}) {
  const botConfig = getBotConfig(botId) || { id: botId };
  // Use provider.generate which defaults to Ollama
  try {
    const resp = await generate(prompt, opts, botConfig);
    // Normalize response where possible
    if (resp && (resp.text || resp.output)) {
      return resp.text || resp.output || resp;
    }
    return resp;
  } catch (err) {
    // fallback: return error string
    return `Error invoking provider for bot ${botId}: ${err}`;
  }
}

// Expose a registration API for dynamic bots
export function registerBot(cfg: BotConfig) {
  const idx = bots.findIndex(b => b.id === cfg.id);
  if (idx >= 0) bots[idx] = cfg;
  else bots.push(cfg);
}
