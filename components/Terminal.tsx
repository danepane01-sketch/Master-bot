import React, { useEffect, useRef } from 'react';
import { Image, Video, FileAudio } from 'lucide-react';

interface TerminalProps {
  logs: string[];
}

const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const renderLogContent = (log: string) => {
    // Check for Image Prefix
    if (log.startsWith('IMAGE_GENERATED::')) {
        const src = log.replace('IMAGE_GENERATED::', '');
        return (
            <div className="mt-2 mb-2 p-2 border border-orange-500/30 bg-orange-950/20 rounded max-w-xs">
                <div className="flex items-center gap-2 text-orange-400 text-xs font-bold mb-1"><Image size={12}/> GENERATED ASSET</div>
                <img src={src} alt="Generated" className="w-full h-auto rounded border border-orange-500/10" />
            </div>
        );
    }
    
    // Check for Video Prefix
    if (log.startsWith('VIDEO_GENERATED::')) {
        const src = log.replace('VIDEO_GENERATED::', '');
        return (
            <div className="mt-2 mb-2 p-2 border border-purple-500/30 bg-purple-950/20 rounded max-w-xs">
                <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1"><Video size={12}/> VEO STREAM</div>
                <video src={src} controls className="w-full h-auto rounded border border-purple-500/10" autoPlay loop muted />
            </div>
        );
    }

    // Check for Audio Prefix
    if (log.startsWith('AUDIO_GENERATED::')) {
        const base64 = log.replace('AUDIO_GENERATED::', '');
        return (
             <div className="mt-2 mb-2 p-2 border border-indigo-500/30 bg-indigo-950/20 rounded max-w-xs">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold mb-1"><FileAudio size={12}/> SYNTH VOICE</div>
                <audio controls src={`data:audio/mp3;base64,${base64}`} className="w-full h-8" />
            </div>
        )
    }

    // Standard Text
    return <span className="text-gray-300 ml-2">{log}</span>;
  };

  return (
    <div className="bg-black border border-green-900 font-mono text-xs md:text-sm h-64 overflow-y-auto p-4 rounded shadow-[0_0_10px_rgba(0,255,0,0.1)]">
      {logs.map((log, index) => (
        <div key={index} className="mb-1 break-words">
          <span className="text-green-700 mr-2">[{new Date().toLocaleTimeString()}]</span>
          <span className="text-green-400">{'>'}</span>
          {renderLogContent(log)}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default Terminal;