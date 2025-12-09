import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './ui';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen && !isLoading) {
      inputRef.current?.focus();
    }
  }, [isOpen, isLoading]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: userText
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: userText,
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        }
      });

      const text = response.text || "I processed that, but generated no text response.";

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text
      }]);
    } catch (error: any) {
      console.error("Chat error:", error);
      let errorMsg = "Sorry, I encountered an error connecting to the AI.";
      if (error.message?.includes("API key")) {
        errorMsg = "API Key missing or invalid. Please check your environment configuration.";
      }
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: errorMsg
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none`}>
      {isOpen && (
        <div className={`pointer-events-auto bg-surface border border-gray-800 rounded-lg shadow-2xl flex flex-col mb-4 transition-all duration-300 origin-bottom-right ${isExpanded ? 'w-[800px] h-[80vh]' : 'w-96 h-[500px]'}`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-background/50 rounded-t-lg backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 p-1.5 rounded-lg">
                <Bot size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">AdvancedAI Assistant</h3>
                <div className="flex items-center gap-1.5">
                   <Sparkles size={10} className="text-purple-400" />
                   <span className="text-[10px] text-gray-400 font-mono">gemini-3-pro-preview</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors">
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0f18]/50">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center px-6">
                <Bot size={48} className="mb-4 opacity-20" />
                <p className="text-sm">Ask me anything about your project, architecture, or code generation status.</p>
                <div className="mt-4 text-xs bg-purple-500/10 text-purple-300 px-3 py-1.5 rounded-full border border-purple-500/20 flex items-center gap-2">
                   <Sparkles size={12} />
                   <span>Thinking Mode Enabled (32k Budget)</span>
                </div>
              </div>
            )}
            
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-700' : 'bg-primary/20'}`}>
                  {msg.role === 'user' ? <User size={14} className="text-gray-300" /> : <Bot size={14} className="text-primary" />}
                </div>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-primary text-white' : 'bg-[#1e293b] text-gray-200 border border-gray-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                 <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 animate-pulse">
                    <Bot size={14} className="text-primary" />
                 </div>
                 <div className="bg-[#1e293b] border border-gray-700 rounded-2xl px-4 py-3 flex items-center gap-3">
                    <Loader2 size={16} className="text-purple-400 animate-spin" />
                    <span className="text-xs text-gray-400 italic">Thinking deeply...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-800 bg-surface">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask complex questions..."
                className="w-full bg-[#0a0f18] border border-gray-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all shadow-inner placeholder:text-gray-600"
                disabled={isLoading}
              />
              <button 
                onClick={handleSend}
                disabled={!inputValue.trim() || isLoading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="mt-2 flex justify-end">
               <span className="text-[10px] text-gray-500 flex items-center gap-1">
                 Powered by Gemini 3.0 Pro
               </span>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`pointer-events-auto h-14 w-14 rounded-full shadow-lg shadow-blue-500/20 flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen ? 'bg-gray-700 text-gray-300 rotate-90' : 'bg-primary text-white'}`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
};