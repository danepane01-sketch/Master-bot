import React from 'react';
import { Bot, BotType, BotStatus } from '../types';
import { User, MessageCircle, Video, Search, Database, Code, Key, EyeOff, Globe, Sparkles, Copy, Cpu, PlayCircle, Image, Mic, HardDrive } from 'lucide-react';

interface BotGridProps {
  bots: Bot[];
  grouped?: boolean; // Prop kept for compatibility but ignored in logic
}

const BotGrid: React.FC<BotGridProps> = ({ bots }) => {
  
  const handleCopyLog = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusColor = (status: BotStatus) => {
    switch (status) {
      case BotStatus.UNRESTRICTED: return 'text-pink-400 border-pink-500/50 bg-pink-900/20';
      case BotStatus.UNION_SEARCH: return 'text-cyan-400 border-cyan-500/50 bg-cyan-900/20';
      case BotStatus.ENGINEERING: return 'text-emerald-400 border-emerald-500/50 bg-emerald-900/20';
      case BotStatus.ROOT_ACCESS: return 'text-red-400 border-red-500/50 bg-red-900/20';
      case BotStatus.VIDEO_ANALYSIS: return 'text-purple-400 border-purple-500/50 bg-purple-900/20';
      case BotStatus.IMAGE_ANALYSIS: return 'text-orange-400 border-orange-500/50 bg-orange-900/20';
      case BotStatus.AUDIO_ANALYSIS: return 'text-indigo-400 border-indigo-500/50 bg-indigo-900/20';
      default: return 'text-gray-400 border-gray-600/50 bg-gray-900/20';
    }
  };

  const getStatusIcon = (status: BotStatus) => {
    switch (status) {
      case BotStatus.VIDEO_ANALYSIS: return <PlayCircle size={10} className="animate-pulse" />;
      case BotStatus.IMAGE_ANALYSIS: return <Image size={10} />;
      case BotStatus.AUDIO_ANALYSIS: return <Mic size={10} className="animate-pulse" />;
      default: return <Cpu size={10} />;
    }
  }

  // Helper to format memory size. Since memoryBank grows, we simulate a massive size.
  // We use the array length to calculate a fictitious TB size to represent "Infinite".
  const getMemorySize = (count: number) => {
    // Arbitrary multiplier to look cool
    return (count * 0.05 + 128).toFixed(2); 
  };

  return (
    <div className="grid grid-cols-2 gap-2 h-full content-start overflow-y-auto pr-1">
      {bots.map((bot) => (
        <div 
          key={bot.id} 
          onClick={() => handleCopyLog(bot.log)}
          className={`relative p-2 border rounded-sm flex flex-col gap-1 cursor-pointer hover:bg-white/5 transition-all group ${getStatusColor(bot.status)}`}
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/10 pb-1">
            <div className="flex items-center gap-1.5 font-display font-bold text-[10px]">
              {getStatusIcon(bot.status)}
              {bot.name}
            </div>
            <div className="text-[8px] font-mono opacity-70 flex items-center gap-1">
               <HardDrive size={8} />
               RAM: ∞
            </div>
          </div>

          {/* Status Badge & Memory Count */}
          <div className="flex justify-between items-center">
             <span className="text-[9px] font-bold uppercase tracking-wider opacity-90">
                {bot.status.replace('_', ' ')}
             </span>
             <span className="text-[8px] font-mono opacity-60">
                {getMemorySize(bot.memoryBank.length)} TB
             </span>
          </div>

          {/* Log Line */}
          <div className="text-[9px] font-mono truncate opacity-70 border-t border-white/5 pt-1 mt-1">
            <span className="opacity-50 mr-1">&gt;</span>{bot.log}
          </div>

          {/* Activity Indicator */}
          <div className="absolute top-1 right-1 w-1 h-1 rounded-full bg-current animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};

export default BotGrid;
// NOTE: FileBot state integration may require manual adjustments.
