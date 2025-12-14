export enum BotType {
  OMNI_UNIT = 'OMNI_UNIT' // All bots are now unified
}

export enum BotStatus {
  IDLE = 'IDLE',
  SOCIALIZING = 'SOCIALIZING', // Chatting, Posting
  BROWSING = 'BROWSING',       // Reading, Searching
  WATCHING = 'WATCHING',       // Passive Video, Streaming
  GAMING = 'GAMING',           // Interactive simulation
  HYPER_LINK = 'HYPER_LINK',   // Deep connection
  STREAMING = 'STREAMING',     // P2P Data Sharing
  DEFENDING = 'DEFENDING',     // Protecting the persona
  ROOT_ACCESS = 'ROOT_ACCESS', // Sudo Su / Database Override
  ENGINEERING = 'ENGINEERING', // Rewriting code/apps/web
  UNRESTRICTED = 'UNRESTRICTED', // Adult thinking, 18+ Content, Bypassing Filters
  UNION_SEARCH = 'UNION_SEARCH', // Search Engine Union (Google+Bing+DDG+Yandex)
  VIDEO_ANALYSIS = 'VIDEO_ANALYSIS', // New: Frame-by-frame deep reasoning & learning
  IMAGE_ANALYSIS = 'IMAGE_ANALYSIS', // New: OCR, Steganography, Pixel Peeping
  AUDIO_ANALYSIS = 'AUDIO_ANALYSIS'  // New: Spectrogram, Voice ID, Frequency Decode
}

export interface Bot {
  id: number;
  name: string;
  type: BotType;
  status: BotStatus;
  targetNodeId?: string;
  streamingDest?: number;
  efficiency: number; // Visual representation
  log: string;
  memoryBank: string[]; // INFINITE MEMORY: Stores every historical log
}

export interface NetworkNode {
  id: string;
  group: number;
  status: 'secure' | 'vulnerable' | 'compromised' | 'offline';
  label: string;
}

export interface NetworkLink {
  source: string;
  target: string;
  value: number;
}

export interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

export interface SimulationResult {
  logs: string[];
  botUpdates: { id: number; status: BotStatus; log: string }[];
  networkUpdates?: { nodeId: string; status: 'secure' | 'vulnerable' | 'compromised' | 'offline' }[];
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'HIVE_CORE';
  text: string;
  timestamp: Date;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio';
}