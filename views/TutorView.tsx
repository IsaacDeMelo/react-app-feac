import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, GraduationCap } from 'lucide-react';
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
      const prompt = `[CONTEXTO DA DISCIPLINA]: ${aiConfig.context} \n\n [DÚVIDA DO ALUNO]: ${userMsg}`;
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
        newMsgs[newMsgs.length - 1] = { role: 'model', text: "Desculpe, tive um problema de conexão. Tente novamente.", isError: true };
        return newMsgs;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full relative">
      
      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 pb-0 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-tr from-brand-200 to-brand-50 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-brand-500/10">
              <Sparkles className="w-10 h-10 text-brand-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Monitor Virtual</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-[260px] text-sm leading-relaxed">
              Olá! Sou seu assistente baseado em IA. Tire dúvidas sobre o cronograma, provas ou assuntos da aula.
            </p>
            
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
               <button onClick={() => setInput("Quais são as próximas provas?")} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:border-brand-300 transition-colors text-left">
                 📅 Quais são as próximas provas?
               </button>
               <button onClick={() => setInput("Resuma o conteúdo da última aula")} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:border-brand-300 transition-colors text-left">
                 📚 Resumo do conteúdo
               </button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex w-full gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            
            {/* Avatar Bot */}
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}

            <div className={`
              relative max-w-[85%] md:max-w-[70%] px-5 py-3.5 text-sm leading-relaxed shadow-sm
              ${msg.role === 'user' 
                ? 'bg-brand-600 text-white rounded-2xl rounded-tr-sm' 
                : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tl-sm'
              }
            `}>
              {msg.isLoading && !msg.text ? (
                 <div className="flex gap-1.5 items-center h-5 px-1">
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms'}}></span>
                 </div>
              ) : (
                <Markdown content={msg.text} className={msg.role === 'user' ? 'prose-invert' : ''} />
              )}
            </div>

            {/* Avatar User */}
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-slate-500" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Fixed Input Area */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 z-30 sticky bottom-0">
         <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 p-2 flex items-end gap-2">
            <textarea
               className="flex-1 bg-transparent text-slate-900 dark:text-white px-4 py-3 focus:outline-none placeholder-slate-400 resize-none max-h-32 min-h-[50px]"
               placeholder="Digite sua mensagem..."
               value={input}
               onChange={e => setInput(e.target.value)}
               onKeyDown={(e) => {
                 if (e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSubmit(e);
                 }
               }}
               disabled={isStreaming}
               rows={1}
            />
            <button 
              onClick={handleSubmit}
              disabled={!input.trim() || isStreaming}
              className={`
                h-10 w-10 flex items-center justify-center rounded-xl transition-all mb-1
                ${!input.trim() || isStreaming 
                   ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                   : 'bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/20 active:scale-90'
                }
              `}
            >
               {isStreaming ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
            </button>
         </div>
      </div>
    </div>
  );
};