
import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Plus, Terminal, Trash2, Edit2, Sparkles, Copy, Check } from 'lucide-react';
import { suggestAlias } from '../services/geminiService';
import { Alias } from '../types';

const AliasManager: React.FC = () => {
  const [aliases, setAliases] = useState<Alias[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAliases();
  }, []);

  const loadAliases = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getAliases();
      setAliases(data);
    } catch (err: any) {
      console.error('Failed to load aliases:', err);
      setError(err.message || 'Failed to load aliases');
      setAliases([]);
    } finally {
      setLoading(false);
    }
  };
  const [newAlias, setNewAlias] = useState({ name: '', command: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSuggest = async () => {
    if (!newAlias.command) return;
    setIsSuggesting(true);
    const suggestion = await suggestAlias(newAlias.command);
    setNewAlias(prev => ({ 
      ...prev, 
      name: suggestion.alias || prev.name, 
      description: suggestion.description || prev.description 
    }));
    setIsSuggesting(false);
  };

  const addAlias = async () => {
    if (!newAlias.name || !newAlias.command) return;
    try {
      const created = await apiClient.createAlias(newAlias);
      setAliases([...aliases, created]);
      setNewAlias({ name: '', command: '', description: '' });
      setIsAdding(false);
    } catch (err: any) {
      console.error('Failed to create alias:', err);
      setError(err.message || 'Failed to create alias');
    }
  };

  const deleteAlias = async (id: string) => {
    try {
      await apiClient.deleteAlias(id);
      setAliases(aliases.filter(a => a.id !== id));
    } catch (err: any) {
      console.error('Failed to delete alias:', err);
      setError(err.message || 'Failed to delete alias');
    }
  };

  const copyAlias = (alias: Alias) => {
    const text = `alias ${alias.name}='${alias.command}'`;
    navigator.clipboard.writeText(text);
    setCopiedId(alias.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4">
          <p className="text-rose-400">{error}</p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">Alias Manager</h2>
          <p className="text-slate-400 mt-1">Shortcuts for your most used long commands.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} />
            <span>New Alias</span>
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-slate-800/60 border border-blue-500/30 p-8 rounded-3xl space-y-6 animate-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Alias Name</label>
              <input 
                type="text" 
                placeholder="e.g., dps" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                value={newAlias.name}
                onChange={e => setNewAlias({...newAlias, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Command</label>
              <input 
                type="text" 
                placeholder="e.g., docker ps --format 'table {{.Names}}\t{{.Status}}'" 
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                value={newAlias.command}
                onChange={e => setNewAlias({...newAlias, command: e.target.value})}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Description</label>
            <textarea 
              placeholder="What does this alias do?" 
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none h-24"
              value={newAlias.description}
              onChange={e => setNewAlias({...newAlias, description: e.target.value})}
            />
          </div>
          <div className="flex justify-between items-center pt-4">
            <button 
              onClick={handleSuggest}
              disabled={!newAlias.command || isSuggesting}
              className="flex items-center space-x-2 text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50"
            >
              <Sparkles size={18} />
              <span className="font-semibold">{isSuggesting ? 'Thinking...' : 'AI Suggestion'}</span>
            </button>
            <div className="flex space-x-3">
              <button 
                onClick={() => setIsAdding(false)}
                className="px-6 py-3 text-slate-400 hover:text-white transition-colors font-bold"
              >
                Cancel
              </button>
              <button 
                onClick={addAlias}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                Create Alias
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-400 mt-4">Loading aliases...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aliases.map((alias) => (
          <div key={alias.id} className="group bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl hover:border-slate-500 transition-all flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-slate-700/50 p-3 rounded-2xl text-blue-400">
                <Terminal size={24} />
              </div>
              <div className="flex space-x-1">
                <button 
                  onClick={() => copyAlias(alias)}
                  className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                  title="Copy alias string"
                >
                  {copiedId === alias.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
                <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
                  <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => deleteAlias(alias.id)}
                  className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <h4 className="text-xl font-bold text-white mb-2 font-mono">{alias.name}</h4>
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 mb-4 flex-1">
              <code className="text-xs text-blue-300 font-mono break-all">{alias.command}</code>
            </div>
            <p className="text-sm text-slate-400">{alias.description}</p>
          </div>
        ))}
        {aliases.length === 0 && !loading && (
          <div className="md:col-span-2 lg:col-span-3 text-center py-20 bg-slate-800/20 border border-dashed border-slate-700 rounded-3xl">
            <Terminal size={48} className="mx-auto text-slate-600 mb-4" />
            <h3 className="text-slate-400 font-medium">No aliases</h3>
            <p className="text-slate-500 text-sm mt-1">Create your first alias to get started.</p>
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default AliasManager;
