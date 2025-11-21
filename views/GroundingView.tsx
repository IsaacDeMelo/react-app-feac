import React, { useState } from 'react';
import { Globe, Search, Loader2, ExternalLink } from 'lucide-react';
import { searchWithGrounding } from '../services/geminiService';
import { GroundingChunk } from '../types';
import { Markdown } from '../components/Markdown';

export const GroundingView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<string>('');
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setResult('');
    setSources([]);

    try {
      const { text, groundingChunks } = await searchWithGrounding(query);
      setResult(text || "No answer found.");
      setSources(groundingChunks || []);
    } catch (error) {
      console.error("Search error:", error);
      setResult("Failed to perform grounded search.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
      <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Globe className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100">Grounded Search</h2>
            <p className="text-xs text-zinc-400">Live web data using Gemini Search Tool</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          
          <div className="text-center space-y-2 mt-8">
            <h1 className="text-2xl font-bold text-white">What do you want to know?</h1>
            <p className="text-zinc-400">Ask about current events, facts, or live data.</p>
          </div>

          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., What is the stock price of Google today?"
              className="w-full bg-zinc-800 text-zinc-100 text-lg rounded-2xl pl-6 pr-14 py-4 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-lg"
            />
            <button
              type="submit"
              disabled={!query.trim() || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white transition-colors"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </button>
          </form>

          {result && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50">
                <Markdown content={result} />
              </div>

              {sources.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3 ml-1">Sources & Citations</h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {sources.map((source, idx) => (
                      source.web ? (
                        <a
                          key={idx}
                          href={source.web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-emerald-500/30 hover:bg-zinc-800 transition-all group"
                        >
                          <div className="mt-1">
                            <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400" />
                          </div>
                          <div className="overflow-hidden">
                            <div className="text-sm font-medium text-zinc-300 truncate group-hover:text-emerald-300">
                              {source.web.title}
                            </div>
                            <div className="text-xs text-zinc-500 truncate">
                              {source.web.uri}
                            </div>
                          </div>
                        </a>
                      ) : null
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};