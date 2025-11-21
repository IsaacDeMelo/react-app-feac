import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, StopCircle } from 'lucide-react';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { getAiConfig } from '../services/storageService';
import { Markdown } from '../components/Markdown';
import { Chat, GenerateContentResponse } from '@google/genai';

export const TutorView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatSessionRef.current = createChatSession();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !chatSessionRef.current) return;

    const userMsg = input.trim();
    setInput('');
    setIsStreaming(true);

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setMessages(prev => [...prev, { role: 'model', text: '', isLoading: true }]);

    try {
      const aiConfig = getAiConfig();
      const prompt = `[CONTEXTO]: ${aiConfig.context} \n\n [ALUNO]: ${userMsg}`;
      const result = await sendMessageStream(chatSessionRef.current, prompt);
      
      let fullText = '';
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        fullText += (c.text || '');
        setMessages(prev => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          if (last.role === 'model') {
            last.text = fullText;
            last.isLoading = false;
          }
          return newMsgs;
        });
      }
    } catch (error) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'model', text: "Erro ao conectar com o monitor.", isError: true };
        return newMsgs;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative bg-slate-50 dark:bg-surface-900">
      {/* Chat Header */}
      <div className="absolute top-0 left-0 right-0 bg-white/80 dark:bg-surface-800/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 z-20 p-4 flex items-center justify-center shadow-sm">
         <div className="flex flex-col items-center">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white">Monitor Virtual</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Online</span>
            </div>
         </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 pt-20 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-50 mt-10">
            <div className="w-20 h-20 bg-gradient-to-tr from-brand-200 to-brand-50 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="w-10 h-10 text-brand-500" />
            </div>
            <p className="text-sm font-medium text-slate-500 text-center max-w-[200px]">Tire dúvidas sobre matérias, datas e avisos da turma.</p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`
              max-w-[85%] md:max-w-[70%] px-5 py-3.5 rounded-2xl shadow-sm relative
              ${msg.role === 'user' 
                ? 'bg-brand-600 text-white rounded-tr-sm' 
                : 'bg-white dark:bg-surface-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-white/5 rounded-tl-sm'
              }
            `}>
              {msg.isLoading && !msg.text ? (
                 <div className="flex gap-1.5 items-center h-5">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
                 </div>
              ) : (
                <Markdown content={msg.text} className={msg.role === 'user' ? 'prose-invert' : ''} />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 md:bottom-4 md:left-4 md:right-4 left-0 right-0 p-3 md:p-0 z-30">
         <div className="bg-white dark:bg-surface-800 md:rounded-2xl md:shadow-xl md:border md:border-gray-200 dark:md:border-white/10 border-t border-gray-200 dark:border-white/5 p-2 md:p-3">
            <form onSubmit={handleSubmit} className="flex items-end gap-2">
               <input
                  className="flex-1 bg-gray-100 dark:bg-surface-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-slate-900 dark:text-white placeholder-gray-400 transition-all resize-none h-12"
                  placeholder="Digite sua dúvida..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  disabled={isStreaming}
               />
               <button 
                 type="submit"
                 disabled={!input.trim() || isStreaming}
                 className="h-12 w-12 flex items-center justify-center bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-xl transition-all shadow-lg shadow-brand-500/20"
               >
                  {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
               </button>
            </form>
         </div>
      </div>
    </div>
  );
};
