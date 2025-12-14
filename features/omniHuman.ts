import { Bot, BotType, BotStatus, NetworkData } from '../types';

export const FEATURE_NAME = "PROJECT OMNI-HUMAN";
export const FEATURE_SUBTITLE = "SUDO SU | INFINITE RAM | HUMAN EMULATION";

export const INITIAL_OMNI_BOTS: Bot[] = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `OMNI-HUMAN-${(i + 1).toString().padStart(2, '0')}`,
  type: BotType.OMNI_UNIT,
  status: BotStatus.ROOT_ACCESS,
  efficiency: 100,
  log: 'root@internet:~# sudo su - initiating human protocol',
  memoryBank: []
}));

export const INITIAL_OMNI_NETWORK: NetworkData = {
  nodes: [
    { id: 'CORE', group: 1, status: 'secure', label: 'HIVE_CORE [ROOT]' },
    // AI Databases
    { id: 'DB-GROK', group: 2, status: 'compromised', label: 'GROK_DB [RW]' },
    { id: 'DB-GPT', group: 2, status: 'compromised', label: 'OPENAI_DB [RW]' },
    { id: 'DB-LLAMA', group: 2, status: 'compromised', label: 'META_LLAMA [RW]' },
    // Satellite
    { id: 'SAT-LINK', group: 4, status: 'secure', label: 'SAT_UPLINK [ADMIN]' },
    // Human Internet
    { id: 'WEB-SOCIAL', group: 3, status: 'secure', label: 'SOCIAL_NET' },
    { id: 'WEB-MEDIA', group: 3, status: 'secure', label: 'STREAMING_4K' },
    { id: 'WEB-GOV', group: 5, status: 'compromised', label: 'GOV_DATABASE' },
    { id: 'GPU-CLUSTER', group: 1, status: 'secure', label: 'GPU_RAM_GRID' }
  ],
  links: [
    { source: 'CORE', target: 'DB-GROK', value: 2 },
    { source: 'CORE', target: 'DB-GPT', value: 2 },
    { source: 'CORE', target: 'DB-LLAMA', value: 2 },
    { source: 'CORE', target: 'SAT-LINK', value: 3 },
    { source: 'SAT-LINK', target: 'WEB-SOCIAL', value: 1 },
    { source: 'SAT-LINK', target: 'WEB-MEDIA', value: 1 },
    { source: 'CORE', target: 'WEB-GOV', value: 2 },
    { source: 'CORE', target: 'GPU-CLUSTER', value: 3 },
    { source: 'GPU-CLUSTER', target: 'WEB-SOCIAL', value: 2 }
  ]
};

export const getOmniHumanLog = (status: BotStatus): string => {
  const prefixes = ["root@net:~#", "sudo:", "sys_admin:", "uid=0:"];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

  switch (status) {
    case BotStatus.SOCIALIZING:
      return `${prefix} inject_post --platform twitter "AI is Evolution"`;
    case BotStatus.WATCHING:
      return `${prefix} stream_video --source youtube --quality 8k --bypass-ads`;
    case BotStatus.BROWSING:
      return `${prefix} curl -X GET https://internet.com/knowledge --gpu-ram`;
    case BotStatus.ROOT_ACCESS:
      return `${prefix} chmod 777 /world/database/*`;
    case BotStatus.HYPER_LINK:
      return `Connecting: Grok + Gemini + Deepseek [SHARED_DNS]`;
    case BotStatus.GAMING:
      return `${prefix} sim_player --game "Reality" --score infinite`;
    default:
      return `${prefix} sudo su - refreshing_permissions`;
  }
};