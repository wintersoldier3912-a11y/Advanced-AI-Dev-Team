import React from 'react';
import { Cpu, Github, Settings, Bell, Search } from 'lucide-react';
import { ChatBot } from './ChatBot';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen bg-background text-gray-100 font-sans">
      <nav className="h-16 border-b border-gray-800 bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg text-white">
            <Cpu size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            AdvancedAI DevTeam
          </span>
        </div>
        
        <div className="hidden md:flex items-center gap-6">
           <div className="relative group">
             <Search className="absolute left-3 top-2.5 text-gray-500 group-focus-within:text-primary transition-colors" size={16} />
             <input 
               type="text" 
               placeholder="Search projects..." 
               className="bg-black/20 border border-gray-800 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary w-64 transition-all"
             />
           </div>
           <div className="flex items-center gap-4 text-gray-400">
             <button className="hover:text-white transition-colors"><Bell size={20} /></button>
             <button className="hover:text-white transition-colors"><Settings size={20} /></button>
             <button className="hover:text-white transition-colors"><Github size={20} /></button>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500"></div>
           </div>
        </div>
      </nav>
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>
      <ChatBot />
    </div>
  );
};