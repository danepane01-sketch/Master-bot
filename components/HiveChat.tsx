import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot as BotIcon, Activity, Globe, Wifi, BrainCircuit, ShieldAlert, Paperclip, Image as ImageIcon, FileAudio, Video as VideoIcon, Volume2, Loader2 } from 'lucide-react';
import { ChatMessage, Bot } from '../types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateSpeech } from '../services/geminiService';

interface HiveChatProps {
  bots: Bot[];
  onSendMessage: (msg: string, attachment?: { data: string, mimeType: string }) => void;
  messages: ChatMessage[];
  isThinking: boolean;
  initialInput?: string;
}

const HiveChat: React.FC<HiveChatProps> = ({ bots, onSendMessage, messages, isThinking, initialInput = '' }) => {
  const [input, setInput] = useState(initialInput);
  const [attachment, setAttachment] = useState<{ data: string, mimeType: string, name: string } | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (initialInput) setInput(initialInput);
  }, [initialInput]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || attachment) {
      onSendMessage(input, attachment ? { data: attachment.data, mimeType: attachment.mimeType } : undefined);
      setInput('');
      setAttachment(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const base64 = (evt.target?.result as string).split(',')[1];
        setAttachment({
          data: base64,
          mimeType: file.type,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlayAudio = async (text: string, id: string) => {
    if (playingAudioId) return; // Prevent overlapping playback for now
    setPlayingAudioId(id);

    try {
        const base64Audio = await generateSpeech(text);
        if (base64Audio) {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioContextRef.current;
            const binaryString = atob(base64Audio);
            const len = binaryString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
            
            const audioBuffer = await ctx.decodeAudioData(bytes.buffer);
            const source = ctx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(ctx.destination);
            source.onended = () => setPlayingAudioId(null);
            source.start();
        } else {
            setPlayingAudioId(null);
        }
    } catch (e) {
        console.error("Audio Playback Error", e);
        setPlayingAudioId(null);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-950 relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-black to-black"></div>
      
      {/* Chat Area */}
      <div className="flex-grow flex flex-col relative z-10 h-full max-w-5xl mx-auto w-full border-x border-gray-900/50 bg-black/40 backdrop-blur-sm">
        
        {/* Header Strip */}
        <div className="bg-black/80 px-6 py-4 flex justify-between items-center border-b border-indigo-900/30 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3 text-indigo-400 font-display text-lg tracking-wider">
            <BrainCircuit size={24} className={isThinking ? "animate-pulse text-pink-500" : ""} />
            <div className="flex flex-col">
              <span className="font-bold leading-none">CORE_OVERWATCH_AI</span>
              <span className="text-[10px] font-mono text-gray-500 mt-0.5 tracking-widest">GEMINI V2.0 // MEMORY + TTS</span>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono border-l border-gray-800 pl-4">
             <div className="flex flex-col items-end">
                <span className="text-gray-400 text-[9px] uppercase">Real-Time Link</span>
                <div className="flex items-center gap-2 text-green-500">
                    <Activity size={12} className="animate-pulse" /> MONITORING_SWARM
                </div>
             </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-700 space-y-4 opacity-60">
              <ShieldAlert size={64} className="text-indigo-900/50" />
              <div className="text-center">
                <div className="text-lg font-display text-indigo-500 font-bold mb-2">INTELLIGENCE CORE ONLINE</div>
                <div className="text-xs font-mono uppercase tracking-widest max-w-md mx-auto leading-relaxed">
                  Ready for Strategic Analysis & Q/A.<br/>
                  Supports: /search, /think, /image, /video<br/>
                  Attach files for Analysis.
                </div>
              </div>
            </div>
          )}
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'} animate-fadeIn group`}>
              <div className={`max-w-[95%] md:max-w-[85%] rounded-sm px-5 py-4 text-sm md:text-base border shadow-xl backdrop-blur-md transition-all ${
                msg.sender === 'USER' 
                  ? 'bg-pink-950/20 border-pink-500/20 text-pink-100 rounded-tr-none' 
                  : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-100 rounded-tl-none'
              }`}>
                <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1">
                  <span className="text-[9px] opacity-60 font-bold tracking-widest uppercase font-display flex items-center gap-2">
                    {msg.sender === 'USER' ? 'OPERATOR_COMMAND' : `CORE_INTELLIGENCE_RESPONSE`}
                    {msg.sender !== 'USER' && (
                        <button 
                            onClick={() => handlePlayAudio(msg.text, msg.id)}
                            disabled={playingAudioId !== null}
                            className="p-1 hover:bg-white/10 rounded text-indigo-400 disabled:opacity-50"
                            title="Vocalize Response"
                        >
                            {playingAudioId === msg.id ? <Loader2 size={12} className="animate-spin" /> : <Volume2 size={12} />}
                        </button>
                    )}
                  </span>
                  <span className="text-[9px] font-mono opacity-40">
                    {msg.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                
                {/* Text Content with Markdown */}
                <div className="leading-relaxed font-sans text-gray-200 prose prose-invert prose-p:my-1 prose-pre:bg-black/50 prose-pre:border prose-pre:border-white/10 prose-code:text-pink-300 prose-code:bg-pink-900/20 prose-code:px-1 prose-code:rounded prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                    </ReactMarkdown>
                </div>

                {/* Media Content */}
                {msg.mediaUrl && msg.mediaType === 'image' && (
                    <div className="mt-3 rounded overflow-hidden border border-white/10">
                        <img src={msg.mediaUrl} alt="Generated Asset" className="max-w-full h-auto" />
                    </div>
                )}
                {msg.mediaUrl && msg.mediaType === 'video' && (
                    <div className="mt-3 rounded overflow-hidden border border-white/10">
                        <video src={msg.mediaUrl} controls className="max-w-full h-auto" />
                    </div>
                )}
              </div>
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
              <div className="flex items-center gap-2 text-indigo-400/70 text-xs font-mono px-2 py-2 bg-indigo-900/10 border border-indigo-500/20 rounded-full">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping"></div>
                PROCESSING MULTIMODAL DATA...
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 bg-black/60 backdrop-blur border-t border-gray-800/50">
          <form onSubmit={handleSubmit} className="flex gap-4 max-w-4xl mx-auto items-end">
            
            {/* File Attachment */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*"
            />
            <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`h-full p-4 border rounded-sm transition-all flex items-center justify-center aspect-square ${
                    attachment ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-black/50 border-gray-700 text-gray-400 hover:text-indigo-400'
                }`}
            >
                <Paperclip size={20} />
            </button>

            <div className="flex-grow relative group">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={attachment ? `Attached: ${attachment.name}` : "Enter command (/search, /think, /image, /video)..."}
                  className="relative w-full bg-black/50 border border-gray-700 rounded-sm px-4 py-4 text-sm md:text-base text-gray-100 font-mono focus:outline-none focus:border-indigo-500 transition-colors placeholder-gray-600"
                  autoFocus
                />
            </div>
            <button 
              type="submit" 
              disabled={isThinking} 
              className="h-full bg-indigo-900/40 hover:bg-indigo-800/60 border border-indigo-500/30 text-indigo-200 p-4 rounded-sm transition-all shadow-[0_0_10px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center aspect-square"
            >
              <Send size={20} />
            </button>
          </form>
          <div className="flex justify-between mt-2 px-2">
             <div className="text-[9px] text-gray-600 font-mono flex gap-2">
               <span>MODES:</span>
               <span className="text-blue-400">/search</span>
               <span className="text-purple-400">/think</span>
               <span className="text-pink-400">/image</span>
               <span className="text-yellow-400">/video</span>
             </div>
             <div className="text-[9px] text-indigo-800 font-mono">
               GEMINI-3-PRO // VEO-3.1 // SEARCH
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HiveChat;