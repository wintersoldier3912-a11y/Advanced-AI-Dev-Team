import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { AGENT_COLORS } from '../constants';
import { Terminal as TerminalIcon } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="flex flex-col h-full bg-[#0a0f18] rounded-lg border border-gray-800 font-mono text-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 bg-surface border-b border-gray-800 text-gray-400 text-xs uppercase tracking-wider">
        <TerminalIcon size={14} />
        <span>System Output</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {logs.length === 0 && (
          <div className="text-gray-600 italic">Waiting for simulation to start...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3">
            <span className="text-gray-600 shrink-0">
              {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
            <span className={`font-bold shrink-0 w-32 ${AGENT_COLORS[log.agent]}`}>
              [{log.agent}]
            </span>
            <span className={`break-words ${log.level === 'error' ? 'text-red-500' : log.level === 'success' ? 'text-green-400' : 'text-gray-300'}`}>
              {log.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
