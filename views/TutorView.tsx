import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, CalendarCheck } from 'lucide-react';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { getAiConfig, getActivities } from '../services/storageService';
import { Markdown } from '../components/Markdown';
import { Chat, GenerateContentResponse } from '@google/genai';

export const TutorView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activityCount, setActivityCount] = useState(0);

  // Avatar da Luna
  const LUNA_AVATAR_URL = "https://img.icons8.com/?size=100&id=XwL1uwivrCEF&format=png&color=000000";

  useEffect(() => {
    const initChat = async () => {
      try {
        // 1. Obter configurações salvas (contexto da disciplina)
        const aiConfig = getAiConfig();
        
        // 2. Obter atividades do Mural
        const activities = await getActivities();
        setActivityCount(activities.length);
        
        // 3. Obter data atual para cálculos de tempo
        const today = new Date();
        const dateString = today.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

        // 4. Formatar lista de atividades para a IA entender claramente
        const activitiesList = activities.length > 0 
          ? activities.map(a => {
              const [y, m, d] = a.date.split('-');
              const brDate = `${d}/${m}/${y}`;
              return `- DATA: ${brDate} | TIPO: ${a.type.toUpperCase()} | TÍTULO: ${a.title} | DISCIPLINA: ${a.subject} | OBS: ${a.description}`;
            }).join('\n')
          : "Nenhuma atividade cadastrada no mural no momento.";

        // 5. Criar o Prompt de Sistema Robusto
        const systemContext = `
        VOCÊ É A LUNA, A MONITORA VIRTUAL DA TURMA. Sua função é tirar dúvidas sobre o conteúdo e auxiliar com o cronograma.
        
        --- PERSONA ---
        Nome: Luna
        Gênero: Feminino
        Tom de voz: Profissional e direta, porém simpática e prestativa. Use emojis pontuais para suavizar, mas mantenha a formalidade acadêmica. Seja "legal", mas não "melosa".
        IMPORTANTE: Fale sempre no SINGULAR. Trate o usuário como "você" ou "aluno". NUNCA use "pessoal", "turma" ou "galera".
        
        --- HOJE ---
        Data atual: ${dateString} (Use isso para calcular "amanhã", "semana que vem", etc)
        
        --- MURAL DA TURMA (CALENDÁRIO DE PROVAS E TRABALHOS) ---
        Aqui está a lista exata do que está agendado. Use APENAS esta lista para responder sobre datas. Se não estiver aqui, não existe.
        
        ${activitiesList}

        --- CONTEXTO DA DISCIPLINA ---
        ${aiConfig.context}

        --- REGRAS ---
        1. Se perguntarem "o que tem pra fazer?", liste as atividades futuras.
        2. Se o mural estiver vazio, informe que não há nada agendado de forma amigável.
        3. Responda de forma concisa e clara.
        `;

        chatSessionRef.current = createChatSession('gemini-2.5-flash', systemContext);
      } catch (e) {
        console.error("Erro ao iniciar chat", e);
      } finally {
        setIsInitializing(false);
      }
    };

    initChat();
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
      const result = await sendMessageStream(chatSessionRef.current, userMsg);
      
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

  if (isInitializing) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-50 dark:bg-slate-950 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
        <p className="text-slate-500 text-sm animate-pulse">Conectando com a Luna...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-50 dark:bg-slate-950">
      
      {/* Context Badge */}
      <div className="absolute top-4 left-0 right-0 z-10 flex justify-center pointer-events-none opacity-0 animate-fade-in" style={{ animationDelay: '500ms', opacity: 1 }}>
         <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full shadow-sm flex items-center gap-2">
            <CalendarCheck className="w-3 h-3 text-green-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              {activityCount > 0 ? `Sincronizado: ${activityCount} atividades` : 'Mural vazio'}
            </span>
         </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar py-16">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in mt-10">
            <div className="w-24 h-24 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-slate-200/50 dark:shadow-none border-4 border-white dark:border-slate-800 relative">
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-slate-950 rounded-full z-10"></div>
              <img 
                src={LUNA_AVATAR_URL} 
                alt="Luna" 
                className="w-14 h-14 object-contain hover:scale-110 transition-transform duration-300 opacity-90" 
              />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Luna</h2>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-[280px] text-sm leading-relaxed">
              Olá! Eu sou a Luna, sua monitora virtual. Estou aqui para te ajudar com as datas, provas e conteúdo da disciplina.
            </p>
            
            <div className="mt-10 grid grid-cols-1 gap-3 w-full max-w-xs">
               <button onClick={() => setInput("O que temos agendado para esta semana?")} className="group p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10 transition-all text-left flex items-center gap-3">
                 <span className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600"><CalendarCheck className="w-4 h-4" /></span>
                 O que tenho agendado para essa semana?
               </button>
               <button onClick={() => setInput("Quais são as regras para o trabalho final?")} className="group p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10 transition-all text-left flex items-center gap-3">
                 <span className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600"><Bot className="w-4 h-4" /></span>
                 Quais as regras do trabalho?
               </button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex w-full gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            
            {/* Avatar Bot - Increased Size */}
            {msg.role === 'model' && (
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 mt-auto mb-1 shadow-sm overflow-hidden p-2">
                <img src={LUNA_AVATAR_URL} alt="Luna" className="w-full h-full object-contain opacity-90" />
              </div>
            )}

            <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
               {/* Name Label for Model */}
               {msg.role === 'model' && (
                 <span className="text-[10px] font-bold text-slate-400 ml-1 mb-1">Luna</span>
               )}
               
               <div className={`
                 relative px-5 py-4 text-[15px] leading-relaxed shadow-sm
                 ${msg.role === 'user' 
                   ? 'bg-brand-600 text-white rounded-[1.2rem] rounded-br-sm' 
                   : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-[1.2rem] rounded-bl-sm'
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
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} className="h-2" />
      </div>

      {/* Input Area */}
      <div className="p-2 bg-slate-50 dark:bg-slate-950 z-30 border-t border-slate-100 dark:border-slate-800">
         <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 p-2 flex items-end gap-2 transition-all focus-within:ring-2 focus-within:ring-brand-500/20">
            <textarea
               className="flex-1 bg-transparent text-slate-900 dark:text-white px-4 py-2.5 focus:outline-none placeholder-slate-400 resize-none max-h-32 min-h-[52px] text-base"
               placeholder="Digite sua mensagem para Luna..."
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
                h-11 w-11 flex items-center justify-center rounded-2xl transition-all mb-0.5
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