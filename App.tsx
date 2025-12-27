import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Bot, BotStatus, NetworkData, ChatMessage } from './types';
import BotGrid from './components/BotGrid';
import NetworkGraph from './components/NetworkGraph';
import Terminal from './components/Terminal';
import HiveChat from './components/HiveChat';
import { generateSimulationStep, generateHiveChat } from './services/geminiService';
import { RefreshCw, Zap, Cpu, EyeOff, Layers, Settings, Search, Menu, X, Monitor, Activity, ShieldCheck, Server, Play, Image, Mic, BrainCircuit, Globe, Users, Link as LinkIcon, Database, Lock, Radio, Lightbulb, Video, FileAudio } from 'lucide-react';
import { INITIAL_ENGINE_BOTS, INITIAL_ENGINE_NETWORK, getGlobalEngineLog, FEATURE_NAME, FEATURE_SUBTITLE } from './features/globalEngine';

const App: React.FC = () => {
  const [bots, setBots] = useState<Bot[]>(INITIAL_ENGINE_BOTS);
  const [networkData, setNetworkData] = useState<NetworkData>(INITIAL_ENGINE_NETWORK);
  const [logs, setLogs] = useState<string[]>([
    'SYSTEM BOOT: OMNI-HYPER-MIND V5.0 (64-BIT CORE)',
    'INITIALIZING 1000-NODE DISTRIBUTED CLUSTER...',
    'LOADING: 10 AUTONOMOUS ANALYSIS BOTS [ACTIVE]...',
    'LOADING: 10 NETWORK ROOTING & BOOTING BOTS [ACTIVE]...',
    'ALLOCATING INFINITE MEMORY BUFFERS (64-BIT ADDRESSING)...',
    'GLOBAL ENGINE READY. WAITING FOR COMMAND.',
  ]);
  const [inputCommand, setInputCommand] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatThinking, setIsChatThinking] = useState(false);
  const [chatInputPreset, setChatInputPreset] = useState('');

  // UI State
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- GLOBAL ENGINE LOOP ---
  useEffect(() => {
    const interval = setInterval(() => {
      setBots(currentBots => currentBots.map(bot => {
        
        let nextStatus = bot.status;
        const roll = Math.random();
        
        // Dynamic Unified Behavior with Video/Image/Audio Analysis
        if (roll > 0.9) nextStatus = BotStatus.AUDIO_ANALYSIS;
        else if (roll > 0.8) nextStatus = BotStatus.IMAGE_ANALYSIS;
        else if (roll > 0.7) nextStatus = BotStatus.VIDEO_ANALYSIS;
        else if (roll > 0.6) nextStatus = BotStatus.UNRESTRICTED; 
        else if (roll > 0.45) nextStatus = BotStatus.UNION_SEARCH;
        else if (roll > 0.3) nextStatus = BotStatus.ENGINEERING;
        else if (roll > 0.15) nextStatus = BotStatus.ROOT_ACCESS;
        else nextStatus = BotStatus.SOCIALIZING;

        const newLog = getGlobalEngineLog(nextStatus);

        return {
          ...bot,
          status: nextStatus,
          efficiency: 100,
          log: newLog,
          // INFINITE MEMORY: Accumulate history endlessly
          memoryBank: [...bot.memoryBank, bot.log] 
        };
      }));
    }, 600); 

    return () => clearInterval(interval);
  }, []);

  // Handle Hive Chat Message - CONNECTS REAL-TIME BOT DATA TO SEPARATE AI BRAIN
  const handleHiveMessage = async (text: string, attachment?: { data: string, mimeType: string }) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'USER',
      text: text,
      timestamp: new Date()
    };
    // If user attaches something, we can display it roughly, but for now we just show text
    // The response will handle the media display if generated.
    
    setChatMessages(prev => [...prev, newMessage]);
    setIsChatThinking(true);

    // Pass the current state of bots to the Intelligence Engine
    const response = await generateHiveChat(text, chatMessages, bots, attachment);

    const responseMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      sender: 'HIVE_CORE',
      text: response.text,
      timestamp: new Date(),
      mediaUrl: response.mediaUrl,
      mediaType: response.mediaType
    };
    setChatMessages(prev => [...prev, responseMessage]);
    setIsChatThinking(false);
  };

  const handleCommand = async () => {
    if (!inputCommand.trim() || isProcessing) return;

    setIsProcessing(true);
    setLogs(prev => [...prev, `architect@hyper-mind-v5:~# ${inputCommand}`]);

    setBots(prev => prev.map(b => ({
      ...b,
      status: BotStatus.UNION_SEARCH,
      log: 'Distributing command to 64-Bit Cluster...'
    })));

    try {
      const result = await generateSimulationStep(inputCommand, bots, networkData);
      setLogs(prev => [...prev, ...result.logs]);
      if (result.botUpdates) {
        setBots(prev => prev.map(bot => {
          const update = result.botUpdates.find((u: any) => u.id === bot.id);
          return update ? { ...bot, status: update.status, log: update.log } : bot;
        }));
      }
    } catch (err) {
      setLogs(prev => [...prev, 'ERROR: OMNI-LINK V5 FAILED.']);
    } finally {
      setIsProcessing(false);
      setInputCommand('');
    }
  };

  const handlePreset = (cmd: string) => setInputCommand(cmd);
  
  // New handler for Chat Presets (Advanced Gemini Features)
  const handleChatPreset = (cmd: string) => {
    setChatInputPreset(cmd);
    setIsMenuOpen(false); // Auto close menu to show chat
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-neutral-950 font-sans text-gray-200 relative">
      
      {/* --- LAYER 1: FULL SCREEN CHAT (INTELLIGENCE CORE) --- */}
      <div className="absolute inset-0 z-0">
        <HiveChat 
          bots={bots} 
          onSendMessage={handleHiveMessage} 
          messages={chatMessages}
          isThinking={isChatThinking}
          initialInput={chatInputPreset}
        />
      </div>

      {/* --- LAYER 2: BURGER MENU BUTTON --- */}
      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="absolute top-4 right-4 z-50 p-2 bg-black/60 hover:bg-pink-900/60 text-pink-400 rounded-full border border-pink-500/30 backdrop-blur-md transition-all shadow-[0_0_20px_rgba(0,0,0,0.5)]"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* --- LAYER 3: DASHBOARD DRAWER (BOT ENGINE) --- */}
      <div 
        className={`absolute inset-y-0 right-0 z-40 w-full md:w-[700px] bg-black/95 border-l border-gray-800 shadow-2xl transform transition-transform duration-300 ease-in-out backdrop-blur-xl flex flex-col ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex-grow overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin flex flex-col">
          
          {/* Header for Drawer */}
          <div className="flex items-center gap-2 pb-2 border-b border-gray-800 mb-2">
             <Cpu className="text-pink-500" size={20} />
             <h2 className="text-xl font-display font-bold text-white tracking-widest">BOT ENGINE CONTROL</h2>
          </div>

          {/* SECTION 1: Network Graph (Top) - Compact */}
          <div className="mb-4">
             <span className="text-xs font-display text-gray-400 uppercase mb-2 block">Omni-Link Topology V5.0</span>
             <NetworkGraph data={networkData} width={600} height={150} />
          </div>

          {/* SECTION 2: Terminal (Middle) */}
          <div className="flex flex-col gap-2 mb-4">
            <span className="text-xs font-display text-gray-400 uppercase">Cluster Logs (64-Bit Core)</span>
            <Terminal logs={logs} />
            
            {/* Manual Command Input */}
            <div className="flex gap-0 mt-2">
               <div className="bg-gray-900 px-3 flex items-center border border-r-0 border-gray-700 text-pink-500 font-mono text-sm">root@v5 &gt;</div>
               <input 
                  type="text" 
                  value={inputCommand}
                  onChange={(e) => setInputCommand(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
                  placeholder="Inject code to Cluster..."
                  className="flex-grow bg-black border border-gray-700 p-3 font-mono text-sm focus:border-pink-500 focus:outline-none text-pink-300"
                  disabled={isProcessing}
               />
               <button 
                  onClick={handleCommand}
                  disabled={isProcessing}
                  className="bg-gray-800 hover:bg-gray-700 text-white px-4 border border-l-0 border-gray-700"
               >
                  <RefreshCw size={14} className={isProcessing ? "animate-spin" : ""} />
               </button>
            </div>
          </div>

          {/* DIVIDER */}
          <div className="border-t border-gray-800 my-2"></div>

          {/* SECTION 3: QUICK ACTIONS */}
          <div className="mb-4">
              <div className="pb-2 flex justify-between items-end">
                 <div>
                    <h2 className="text-lg font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center gap-2">
                        <Monitor className="text-pink-500" size={18} /> OMNI-CONTROL V5.0
                    </h2>
                    <p className="text-[10px] font-mono text-gray-400">64-BIT AUTONOMOUS ANALYSIS & ROOTING ENGINE</p>
                 </div>
                 <div className="text-[10px] font-mono flex flex-col items-end gap-1">
                    <span className="text-cyan-500">VIRTUAL NODES: 1000</span>
                    <span className="text-pink-500">GATEWAYS: {bots.length}</span>
                 </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Standard Analysis & Rooting */}
                <button onClick={() => handlePreset("analyze_video --url 'SOURCE' --distribute_1000")} className="p-3 border border-purple-900/50 bg-purple-950/20 hover:bg-purple-900/40 text-[10px] font-mono text-purple-300 rounded flex items-center justify-center gap-2">
                  <Play size={14} /> ANALYZE VIDEO
                </button>
                <button onClick={() => handlePreset("analyze_image --url 'SOURCE' --ocr_scan --cluster")} className="p-3 border border-orange-900/50 bg-orange-950/20 hover:bg-orange-900/40 text-[10px] font-mono text-orange-300 rounded flex items-center justify-center gap-2">
                  <Image size={14} /> SCAN IMAGE
                </button>
                <button onClick={() => handlePreset("decode_audio --spectrum --voice_id --parallel")} className="p-3 border border-indigo-900/50 bg-indigo-950/20 hover:bg-indigo-900/40 text-[10px] font-mono text-indigo-300 rounded flex items-center justify-center gap-2">
                  <Mic size={14} /> DECODE AUDIO
                </button>
                <button onClick={() => handlePreset("root_escalate --method 'kernel_exploit_v5' --force")} className="p-3 border border-red-900/50 bg-red-950/20 hover:bg-red-900/40 text-[10px] font-mono text-red-300 rounded flex items-center justify-center gap-2">
                  <Zap size={14} /> ROOT & BOOT
                </button>
                
                {/* Historical / Standard Features */}
                <button onClick={() => handlePreset("mode_unrestricted --bypass_filters --force_kernel")} className="p-3 border border-pink-900/50 bg-pink-950/20 hover:bg-pink-900/40 text-[10px] font-mono text-pink-300 rounded flex items-center justify-center gap-2">
                  <EyeOff size={14} /> UNRESTRICTED
                </button>
                <button onClick={() => handlePreset("sys_engineer --rewrite_config --optimize_network")} className="p-3 border border-emerald-900/50 bg-emerald-950/20 hover:bg-emerald-900/40 text-[10px] font-mono text-emerald-300 rounded flex items-center justify-center gap-2">
                  <Settings size={14} /> ENGINEERING
                </button>
                <button onClick={() => handlePreset("hyper_link --sync_nodes --mesh_topology")} className="p-3 border border-blue-900/50 bg-blue-950/20 hover:bg-blue-900/40 text-[10px] font-mono text-blue-300 rounded flex items-center justify-center gap-2">
                  <LinkIcon size={14} /> HYPER LINK
                </button>
                <button onClick={() => handlePreset("social_emulation --persona 'Influencer' --mass_interact")} className="p-3 border border-yellow-900/50 bg-yellow-950/20 hover:bg-yellow-900/40 text-[10px] font-mono text-yellow-300 rounded flex items-center justify-center gap-2">
                  <Users size={14} /> SOCIAL SIM
                </button>
                <button onClick={() => handlePreset("defend_perimeter --ids_active --lockdown")} className="p-3 border border-green-900/50 bg-green-950/20 hover:bg-green-900/40 text-[10px] font-mono text-green-300 rounded flex items-center justify-center gap-2">
                  <ShieldCheck size={14} /> DEFENSE
                </button>
            </div>

            {/* NEW ADVANCED GEMINI CHAT MODULES */}
            <div className="mt-4 mb-2">
                 <h2 className="text-xs font-display font-bold text-gray-400 flex items-center gap-2 mb-2">
                     <BrainCircuit size={12} className="text-indigo-400" /> ADVANCED GEMINI MODULES
                 </h2>
                 <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleChatPreset("/search ")} className="p-3 border border-blue-400/30 bg-blue-900/20 hover:bg-blue-800/40 text-[10px] font-mono text-blue-200 rounded flex items-center justify-center gap-2">
                      <Globe size={14} /> WEB INTEL (SEARCH)
                    </button>
                    <button onClick={() => handleChatPreset("/video A futuristic cyberpunk city network node")} className="p-3 border border-purple-400/30 bg-purple-900/20 hover:bg-purple-800/40 text-[10px] font-mono text-purple-200 rounded flex items-center justify-center gap-2">
                      <Video size={14} /> VEO VIDEO GEN
                    </button>
                    <button onClick={() => handleChatPreset("/image A highly detailed schematic of a 64-bit neural processor")} className="p-3 border border-pink-400/30 bg-pink-900/20 hover:bg-pink-800/40 text-[10px] font-mono text-pink-200 rounded flex items-center justify-center gap-2">
                      <Image size={14} /> IMG GEN PRO
                    </button>
                    <button onClick={() => handleChatPreset("Analyze this file")} className="p-3 border border-yellow-400/30 bg-yellow-900/20 hover:bg-yellow-800/40 text-[10px] font-mono text-yellow-200 rounded flex items-center justify-center gap-2">
                      <FileAudio size={14} /> TRANSCRIBE AUDIO
                    </button>
                    <button onClick={() => handleChatPreset("/think Analyze the security flaws in a 64-bit kernel ring 0 architecture")} className="p-3 border border-indigo-400/30 bg-indigo-900/20 hover:bg-indigo-800/40 text-[10px] font-mono text-indigo-200 rounded flex items-center justify-center gap-2">
                      <Lightbulb size={14} /> DEEP THINKING
                    </button>
                    <button onClick={() => handleChatPreset("Activate Live Voice Mode")} className="p-3 border border-red-400/30 bg-red-900/20 hover:bg-red-800/40 text-[10px] font-mono text-red-200 rounded flex items-center justify-center gap-2">
                      <Radio size={14} /> LIVE VOICE
                    </button>
                 </div>
            </div>
          </div>

          {/* SECTION 4: UNIFIED BOT MATRIX (Bottom) */}
          <div className="flex-grow flex flex-col min-h-[300px]">
            <div className="flex items-center gap-2 text-xs font-display text-gray-400 uppercase mb-2">
               <Server size={14} /> Analysis & Rooting Bots (Live)
            </div>
            <div className="flex-grow border border-gray-800 rounded-lg overflow-hidden bg-black/50 p-2">
              <BotGrid bots={bots} />
            </div>
          </div>

        </div>
      </div>

      <Analytics />
    </div>
  );
};

export default App;