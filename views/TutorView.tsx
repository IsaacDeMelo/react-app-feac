import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const prompt = `
      [CONTEXTO ACADÊMICO - CURSO ADMINISTRAÇÃO]: 
      ${aiConfig.context}
      
      [ALUNO]:
      ${userMsg}
      
      Seja direto, educado e cite conceitos teóricos quando útil.
      `;

      const result = await sendMessageStream(chatSessionRef.current, prompt);
      
      let fullText = '';
      
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text || '';
        fullText += textChunk;

        setMessages(prev => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === 'model') {
            lastMsg.text = fullText;
            lastMsg.isLoading = false;
          }
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        lastMsg.text = "O servidor da universidade não está respondendo no momento.";
        lastMsg.isError = true;
        lastMsg.isLoading = false;
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white/50 dark:bg-white/5 backdrop-blur-3xl rounded-[2.5rem] border border-white/60 dark:border-white/5 shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-10 py-8 border-b border-gray-200/50 dark:border-white/5 flex items-center gap-6 bg-white/40 dark:bg-white/5 backdrop-blur-md z-10">
        <div className="relative">
          <div className="w-16 h-16 rounded-[1.2rem] bg-gradient-to-tr from-navy-900 to-gold-500 dark:from-gold-600 dark:to-blue-400 flex items-center justify-center shadow-xl">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-green-500 border-[3px] border-white dark:border-[#1a1a1a] rounded-full"></div>
        </div>
        <div>
          <h2 className="font-sans font-bold text-2xl text-navy-900 dark:text-white tracking-tight">Monitor Virtual</h2>
          <p className="text-base text-navy-900/60 dark:text-gray-400 font-medium flex items-center gap-2 mt-1">
            <Sparkles className="w-4 h-4 text-gold-500" />
            Disponível para tirar dúvidas
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full space-y-8 opacity-60">
            <div className="w-24 h-24 bg-white dark:bg-white/5 rounded-3xl flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-navy-900/40 dark:text-white/40" />
            </div>
            <p className="text-navy-900/60 dark:text-gray-400 font-medium text-center max-w-sm text-lg">
              Olá! Como posso ajudar com seus estudos de Administração hoje?
            </p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-6 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {msg.role === 'model' && (
              <div className="w-10 h-10 rounded-full bg-white dark:bg-white/10 border border-gray-200 dark:border-white/5 flex items-center justify-center flex-shrink-0 mt-4 shadow-md">
                <Bot className="w-5 h-5 text-navy-900 dark:text-gold-500" />
              </div>
            )}
            
            <div className={`max-w-[75%] rounded-3xl px-8 py-6 text-base leading-relaxed shadow-sm ${
              msg.role === 'user' 
                ? 'bg-navy-900 dark:bg-white text-white dark:text-black rounded-tr-none' 
                : 'bg-white dark:bg-[#1a1a1a] text-navy-900 dark:text-gray-200 border border-gray-100 dark:border-white/5 rounded-tl-none'
            }`}>
              {msg.isLoading && !msg.text ? (
                <div className="flex items-center gap-3 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-medium">Processando resposta...</span>
                </div>
              ) : (
                <Markdown content={msg.text} />
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/20 flex items-center justify-center flex-shrink-0 mt-4">
                <User className="w-5 h-5 text-gray-500 dark:text-white" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-8 bg-white/60 dark:bg-black/20 backdrop-blur-xl border-t border-gray-200/50 dark:border-white/5">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pergunte sobre provas, trabalhos ou teoria..."
            disabled={isStreaming}
            className="w-full bg-white dark:bg-[#0f1115] text-navy-900 dark:text-white placeholder-gray-400 rounded-3xl pl-8 pr-16 py-5 focus:outline-none focus:ring-2 focus:ring-navy-800 dark:focus:ring-gold-500/50 border border-gray-200 dark:border-white/10 transition-all shadow-sm group-hover:shadow-lg font-medium text-lg"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-navy-900 hover:bg-navy-800 dark:bg-white dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl text-white dark:text-black transition-all shadow-lg transform active:scale-90"
          >
            {isStreaming ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};