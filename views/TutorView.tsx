import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, CalendarCheck, Paperclip, Trash2, MessageSquarePlus } from 'lucide-react';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { ChatMessage, Activity } from '../types';
import { getAiConfig, getActivities } from '../services/storageService';
import { Markdown } from '../components/Markdown';
import { Chat, GenerateContentResponse } from '@google/genai';

export const TutorView: React.FC = () => {
  const LUNA_STORAGE_KEY = 'ufal_luna_chat_history_v1';
  
  // Inicializar mensagens do LocalStorage se existirem
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(LUNA_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Estados para contexto
  const [storedActivities, setStoredActivities] = useState<Activity[]>([]);
  const [activityCount, setActivityCount] = useState(0);

  // Avatar da Luna
  const LUNA_AVATAR_URL = "https://img.icons8.com/?size=100&id=XwL1uwivrCEF&format=png&color=000000";

  // Salvar no LocalStorage sempre que houver mudança nas mensagens
  useEffect(() => {
    localStorage.setItem(LUNA_STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // Função para inicializar a sessão do Gemini
  const initializeSession = async (currentHistory: ChatMessage[] = []) => {
    setIsInitializing(true);
    try {
      // 1. Obter configurações salvas (contexto da disciplina)
      const aiConfig = await getAiConfig();
      
      // 2. Obter atividades do Mural
      const activities = await getActivities();
      setStoredActivities(activities);
      setActivityCount(activities.length);
      
      // 3. Obter data atual
      const today = new Date();
      const dateString = today.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });

      // 4. Formatar lista de atividades
      const activitiesList = activities.length > 0 
        ? activities.map(a => {
            const d = new Date(a.date);
            const formattedDate = d.toLocaleString('pt-BR');
            const hasAttachment = a.attachment ? "(Possui arquivo anexo)" : "";
            return `- DATA/HORA: ${formattedDate} | TIPO: ${a.type.toUpperCase()} | TÍTULO: ${a.title} | DISCIPLINA: ${a.subject} ${hasAttachment} | OBS: ${a.description}`;
          }).join('\n')
        : "Nenhum registro cadastrado no mural no momento.";

      // 5. Prompt de Sistema
      const systemContext = `
      VOCÊ É A LUNA, A MONITORA VIRTUAL DA TURMA. Sua função é tirar dúvidas sobre o conteúdo e auxiliar com o cronograma.
      
      --- PERSONA ---
      Nome: Luna
      Gênero: Feminino
      Tom de voz: Profissional e direta, porém simpática e prestativa. Use emojis pontuais para suavizar, mas mantenha a formalidade acadêmica.
      IMPORTANTE: Fale sempre no SINGULAR. Trate o usuário como "você".
      
      --- MEMÓRIA DA CONVERSA ---
      Esta é uma conversa contínua. Se o histórico mostrar que já nos cumprimentamos, NÃO se apresente novamente (não diga "Olá, sou a Luna" de novo). Apenas continue o assunto ou responda a nova pergunta.
      
      --- HOJE ---
      Data atual: ${dateString}
      
      --- MURAL DA TURMA ---
      ${activitiesList}

      --- CONTEXTO DA DISCIPLINA ---
      ${aiConfig.context}
      `;

      // Filtrar histórico para formato da API (remover erros e loadings)
      const apiHistory = currentHistory
        .filter(m => !m.isError && !m.isLoading && m.text)
        .map(m => ({ role: m.role, text: m.text }));

      chatSessionRef.current = createChatSession('gemini-2.5-flash', systemContext, apiHistory);
    } catch (e) {
      console.error("Erro ao iniciar chat", e);
    } finally {
      setIsInitializing(false);
    }
  };

  // Inicialização única ao montar o componente
  useEffect(() => {
    initializeSession(messages);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Executa apenas uma vez na montagem

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  const handleNewChat = () => {
    if (confirm("Deseja apagar o histórico e iniciar uma nova conversa?")) {
      localStorage.removeItem(LUNA_STORAGE_KEY);
      setMessages([]);
      initializeSession([]); // Reinicia sessão sem histórico
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || !chatSessionRef.current) return;

    const userMsg = input.trim();
    const lowerMsg = userMsg.toLowerCase();
    setInput('');
    setIsStreaming(true);

    // Lógica de Anexo Inteligente
    let attachmentToSend = undefined;
    let attachmentName = '';

    const relevantActivity = storedActivities.find(a => 
      a.attachment && 
      a.attachment.data && 
      (lowerMsg.includes(a.title.toLowerCase()) || lowerMsg.includes(a.subject.toLowerCase()))
    );

    if (relevantActivity && relevantActivity.attachment) {
      attachmentName = relevantActivity.attachment.name;
      attachmentToSend = {
        mimeType: relevantActivity.attachment.type,
        data: relevantActivity.attachment.data
      };
    }

    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    if (attachmentToSend) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: `*📎 Anexando automaticamente o arquivo "${attachmentName}" da atividade "${relevantActivity?.title}" para análise...*` 
      }]);
    }

    setMessages(prev => [...prev, { role: 'model', text: '', isLoading: true }]);

    try {
      const result = await sendMessageStream(chatSessionRef.current, userMsg, attachmentToSend);
      
      let fullText = '';
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        fullText += (c.text || '');
        setMessages(prev => {
          const newMsgs = [...prev];
          const last = newMsgs[newMsgs.length - 1];
          if (last.role === 'model' && last.isLoading) {
            last.text = fullText;
            last.isLoading = false;
          }
          return newMsgs;
        });
      }
    } catch (error) {
      setMessages(prev => {
        const newMsgs = [...prev];
        const last = newMsgs[newMsgs.length - 1];
        last.text = "Desculpe, tive um problema de conexão. Tente novamente.";
        last.isError = true;
        last.isLoading = false;
        return newMsgs;
      });
      // Recriar sessão em caso de erro crítico para tentar recuperar
      initializeSession(messages);
    } finally {
      setIsStreaming(false);
    }
  };

  if (isInitializing && messages.length === 0) {
    return (
      <div className="flex flex-col h-full items-center justify-center bg-slate-100 dark:bg-slate-950 gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
        <p className="text-slate-500 text-sm animate-pulse">Conectando com a Luna...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full relative bg-slate-100 dark:bg-slate-950">
      
      {/* Header Contexto + Botão Reset */}
      <div className="absolute top-4 left-0 right-0 z-10 flex justify-between items-start px-6 pointer-events-none">
         {/* Espaço vazio esquerda para balancear */}
         <div className="w-10"></div> 

         {/* Badge Central */}
         <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700 px-3 py-1 rounded-full shadow-sm flex items-center gap-2 animate-fade-in pointer-events-auto">
            <CalendarCheck className="w-3 h-3 text-green-500" />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">
              {activityCount > 0 ? `${activityCount} registros` : 'Mural vazio'}
            </span>
         </div>

         {/* Botão Nova Conversa */}
         <div className="pointer-events-auto">
           <button 
             onClick={handleNewChat}
             title="Apagar histórico e iniciar nova conversa"
             className="w-9 h-9 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 border border-slate-200 dark:border-slate-700 shadow-sm transition-all backdrop-blur-md"
           >
             <Trash2 className="w-4 h-4" />
           </button>
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
               <button onClick={() => setInput("O que temos agendado para esta semana?")} className="group p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/10 transition-all text-left flex items-center gap-3 shadow-sm">
                 <span className="p-2 bg-brand-50 dark:bg-brand-900/20 rounded-lg text-brand-600"><CalendarCheck className="w-4 h-4" /></span>
                 O que tenho agendado para essa semana?
               </button>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex w-full gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}>
            
            {msg.role === 'model' && (
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center flex-shrink-0 mt-auto mb-1 shadow-sm overflow-hidden p-2">
                <img src={LUNA_AVATAR_URL} alt="Luna" className="w-full h-full object-contain opacity-90" />
              </div>
            )}

            <div className="flex flex-col max-w-[85%] md:max-w-[70%]">
               {msg.role === 'model' && (
                 <span className="text-[10px] font-bold text-slate-400 ml-1 mb-1">Luna</span>
               )}
               
               <div className={`
                 relative px-5 py-4 text-[15px] leading-relaxed shadow-sm
                 ${msg.role === 'user' 
                   ? 'bg-brand-600 text-white rounded-[1.2rem] rounded-br-sm' 
                   : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-[1.2rem] rounded-bl-sm'
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
      <div className="p-2 bg-slate-100 dark:bg-slate-950 z-30 border-t border-slate-200 dark:border-slate-800">
         <div className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[1.5rem] shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200 dark:border-slate-800 p-2 flex items-end gap-2 transition-all focus-within:ring-2 focus-within:ring-brand-500/20">
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