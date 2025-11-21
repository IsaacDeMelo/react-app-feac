import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { createChatSession, sendMessageStream } from '../services/geminiService';
import { ChatMessage } from '../types';
import { Markdown } from '../components/Markdown';
import { Chat, GenerateContentResponse } from '@google/genai';

export const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize session on mount
    chatSessionRef.current = createChatSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    // Add user message
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);

    // Add placeholder for model response
    setMessages(prev => [...prev, { role: 'model', text: '', isLoading: true }]);

    try {
      const result = await sendMessageStream(chatSessionRef.current, userMsg);
      
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
        lastMsg.text = "Error: Failed to generate response. Please try again.";
        lastMsg.isError = true;
        lastMsg.isLoading = false;
        return newMessages;
      });
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100">Gemini Flash Chat</h2>
            <p className="text-xs text-zinc-400">Powered by gemini-2.5-flash</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 space-y-4">
            <Bot className="w-12 h-12 opacity-20" />
            <p>Start a conversation with Gemini...</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
            )}
            
            <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
              msg.role === 'user' 
                ? 'bg-zinc-100 text-zinc-900' 
                : 'bg-zinc-800/50 text-zinc-200 border border-zinc-700/50'
            }`}>
              {msg.isLoading && !msg.text ? (
                <Loader2 className="w-5 h-5 animate-spin text-indigo-400" />
              ) : (
                <Markdown content={msg.text} />
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-zinc-300" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-zinc-900 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={isStreaming}
            className="w-full bg-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-xl pl-5 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-zinc-700 transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isStreaming}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
          >
            {isStreaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};