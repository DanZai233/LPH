
import React, { useState } from 'react';
import { Search, Sparkles, Terminal, Book, Box, ArrowRight, Loader2 } from 'lucide-react';
import { searchCommands } from '../services/geminiService';

const SmartSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setIsLoading(true);
    const searchResults = await searchCommands(query);
    setResults(searchResults);
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">
          <Sparkles size={14} className="mr-2" />
          AI-Powered Command Discovery
        </div>
        <h2 className="text-4xl md:text-5xl font-black text-white">Find any tool or command</h2>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Don't remember the exact syntax? Just describe what you want to achieve in natural language.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
          <Search size={24} className="text-slate-500 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="How do I search for text recursively in files?" 
          className="w-full bg-slate-800/40 border-2 border-slate-700/50 rounded-[32px] py-6 pl-16 pr-32 text-xl text-white outline-none focus:border-blue-500/50 transition-all shadow-2xl shadow-black/40"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button 
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center space-x-2 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <ArrowRight size={20} />}
          <span>Search</span>
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['Batch resize images', 'Scan network for ports', 'Kill process on port 8080', 'Compress folder to tar.gz'].map(suggestion => (
          <button 
            key={suggestion}
            onClick={() => { setQuery(suggestion); }}
            className="text-left p-4 bg-slate-800/20 border border-slate-700/50 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800/50 hover:border-slate-600 transition-all text-sm font-medium"
          >
            "{suggestion}"
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {isLoading && (
          <div className="py-20 text-center space-y-4">
            <Loader2 size={48} className="mx-auto text-blue-600 animate-spin" />
            <p className="text-slate-400 font-medium">Querying Linux manual pages and AI knowledge...</p>
          </div>
        )}

        {results.map((res, i) => (
          <div key={i} className="bg-slate-800/60 border border-slate-700 rounded-3xl p-8 animate-in slide-in-from-bottom-4 transition-all hover:border-slate-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600/20 text-blue-400 p-3 rounded-2xl">
                  <Terminal size={24} />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-white font-mono">{res.command}</h4>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">Package: {res.package}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-colors" title="View Docs">
                  <Book size={20} />
                </button>
                <button className="p-3 bg-slate-700/50 hover:bg-slate-700 text-white rounded-xl transition-colors" title="Install Package">
                  <Box size={20} />
                </button>
              </div>
            </div>
            
            <p className="text-slate-300 leading-relaxed mb-6">{res.description}</p>
            
            <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl group relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4">
                 <button className="text-slate-500 hover:text-white transition-colors">
                   <Copy size={18} />
                 </button>
               </div>
               <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-3">Usage Example</p>
               <code className="text-blue-400 text-lg font-mono">{res.usage}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Copy = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;

export default SmartSearch;
