import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Loader2, Sparkles, X } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { Markdown } from '../components/Markdown';

export const VisionView: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(''); // Clear previous result
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setResult('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!image) return;
    
    setIsLoading(true);
    setResult('');
    
    try {
      const text = await analyzeImage(image, prompt);
      setResult(text || "No details found.");
    } catch (error) {
      console.error("Vision error:", error);
      setResult("Error analyzing image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-2xl border border-zinc-800 shadow-xl overflow-hidden">
      <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <ImageIcon className="w-5 h-5 text-pink-400" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100">Vision Analysis</h2>
            <p className="text-xs text-zinc-400">Multimodal processing with gemini-2.5-flash-image</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Upload Area */}
          <div className="space-y-4">
            {!image ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-700 hover:border-pink-500/50 hover:bg-zinc-800/50 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-all group"
              >
                <div className="w-16 h-16 rounded-full bg-zinc-800 group-hover:bg-pink-500/10 flex items-center justify-center mb-4 transition-colors">
                  <Upload className="w-8 h-8 text-zinc-400 group-hover:text-pink-400" />
                </div>
                <h3 className="text-lg font-medium text-zinc-200">Upload an Image</h3>
                <p className="text-zinc-500 mt-1">Click to browse your files</p>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-zinc-700 group">
                <img src={image} alt="Preview" className="w-full max-h-[400px] object-contain bg-black" />
                <button 
                  onClick={clearImage}
                  className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white backdrop-blur-sm transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          {/* Controls */}
          {image && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ask something about the image (optional)..."
                  className="flex-1 bg-zinc-800 text-zinc-100 rounded-xl px-4 py-3 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                />
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Analyze
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-zinc-800/50 rounded-2xl p-6 border border-zinc-700/50 animate-fade-in">
              <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-3">Analysis Result</h3>
              <Markdown content={result} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
};