import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Plus, Trash2, Edit2, Check, X, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { apiClient, AIConfig, AIProvider } from '../services/api';

const Settings: React.FC = () => {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [providers, setProviders] = useState<Array<{ value: string; label: string; defaultBaseUrl: string; defaultModel: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    provider: AIProvider.GEMINI,
    name: '',
    apiKey: '',
    baseUrl: '',
    model: '',
    enabled: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configsData, providersData] = await Promise.all([
        apiClient.getAIConfigs(),
        apiClient.getAIProviders()
      ]);
      setConfigs(configsData);
      setProviders(providersData.providers);
    } catch (err: any) {
      setError('Failed to load configurations: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (provider: AIProvider) => {
    const providerInfo = providers.find(p => p.value === provider);
    setFormData({
      ...formData,
      provider,
      baseUrl: providerInfo?.defaultBaseUrl || '',
      model: providerInfo?.defaultModel || '',
    });
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(null);

      if (!formData.name || !formData.apiKey) {
        setError('Name and API Key are required');
        return;
      }

      if (editingId) {
        await apiClient.updateAIConfig(editingId, formData);
        setSuccess('Configuration updated successfully');
      } else {
        await apiClient.createAIConfig(formData);
        setSuccess('Configuration created successfully');
      }

      setIsAdding(false);
      setEditingId(null);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) {
      return;
    }

    try {
      await apiClient.deleteAIConfig(id);
      setSuccess('Configuration deleted successfully');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete configuration');
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await apiClient.activateAIConfig(id);
      setSuccess('Configuration activated successfully');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to activate configuration');
    }
  };

  const startEdit = (config: AIConfig) => {
    setFormData({
      provider: config.provider,
      name: config.name,
      // If API key is masked (starts with ***), keep it empty so user can enter new one
      apiKey: (config.apiKey && config.apiKey.startsWith('***')) ? '' : (config.apiKey || ''),
      baseUrl: config.baseUrl || '',
      model: config.model || '',
      enabled: config.enabled,
    });
    setEditingId(config.id);
    setIsAdding(true);
  };

  const resetForm = () => {
    setFormData({
      provider: AIProvider.GEMINI,
      name: '',
      apiKey: '',
      baseUrl: '',
      model: '',
      enabled: true,
    });
    setEditingId(null);
  };

  const activeConfig = configs.find(c => c.isActive && c.enabled);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center">
            <SettingsIcon size={32} className="mr-3 text-blue-400" />
            AI Provider Settings
          </h2>
          <p className="text-slate-400 mt-1">Configure AI providers for smart features</p>
        </div>
        {!isAdding && (
          <button
            onClick={() => {
              resetForm();
              setIsAdding(true);
            }}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} />
            <span>Add Provider</span>
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start space-x-3">
          <AlertCircle size={20} className="text-rose-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-rose-400 font-medium">Error</p>
            <p className="text-rose-300 text-sm mt-1">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-300">
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4 flex items-start space-x-3">
          <CheckCircle2 size={20} className="text-green-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-green-400 font-medium">Success</p>
            <p className="text-green-300 text-sm mt-1">{success}</p>
          </div>
          <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-300">
            <X size={18} />
          </button>
        </div>
      )}

      {activeConfig && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center space-x-3 mb-2">
            <Sparkles size={20} className="text-blue-400" />
            <h3 className="text-lg font-bold text-blue-400">Active Provider</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">{activeConfig.name}</p>
              <p className="text-slate-400 text-sm mt-1">
                {activeConfig.provider.toUpperCase()} • {activeConfig.model || 'Default Model'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">ACTIVE</span>
            </div>
          </div>
        </div>
      )}

      {isAdding && (
        <div className="bg-slate-800/60 border border-blue-500/30 p-8 rounded-3xl space-y-6 animate-in slide-in-from-top-4">
          <h3 className="text-xl font-bold text-white">
            {editingId ? 'Edit Configuration' : 'Add New Provider'}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Provider</label>
              <select
                value={formData.provider}
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {providers.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Name</label>
              <input
                type="text"
                placeholder="e.g., My OpenAI Config"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">API Key</label>
              <input
                type="password"
                placeholder="Enter your API key"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Base URL (Optional)</label>
              <input
                type="text"
                placeholder="Auto-filled with default"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-400 uppercase tracking-wider">Model (Optional)</label>
              <input
                type="text"
                placeholder="Auto-filled with default"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm"
              />
            </div>

            <div className="flex items-center space-x-2 md:col-span-2">
              <input
                type="checkbox"
                id="enabled"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="enabled" className="text-slate-300">Enabled</label>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-700/50">
            <button
              onClick={() => {
                setIsAdding(false);
                setEditingId(null);
                resetForm();
              }}
              className="px-6 py-3 text-slate-400 hover:text-white transition-colors font-bold"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-slate-400 mt-4">Loading configurations...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {configs.map((config) => (
            <div
              key={config.id}
              className={`bg-slate-800/40 border rounded-3xl p-6 transition-all ${
                config.isActive
                  ? 'border-blue-500/50 bg-slate-800/60'
                  : 'border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-bold text-white flex items-center">
                    {config.name}
                    {config.isActive && (
                      <span className="ml-2 px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold">ACTIVE</span>
                    )}
                  </h4>
                  <p className="text-slate-400 text-sm mt-1">
                    {config.provider.toUpperCase()} • {config.model || 'Default Model'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(config)}
                    className="p-2 text-slate-500 hover:text-blue-400 transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="p-2 text-slate-500 hover:text-rose-500 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {config.baseUrl && (
                  <div className="text-xs text-slate-500 font-mono bg-slate-900/50 p-2 rounded">
                    {config.baseUrl}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${config.enabled ? 'bg-green-500' : 'bg-slate-600'}`} />
                  <span className="text-xs text-slate-400">
                    {config.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>

              {!config.isActive && config.enabled && (
                <button
                  onClick={() => handleActivate(config.id)}
                  className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 px-4 py-2 rounded-xl font-medium transition-colors border border-blue-500/20"
                >
                  Activate
                </button>
              )}
            </div>
          ))}

          {configs.length === 0 && !isAdding && (
            <div className="md:col-span-2 text-center py-20 bg-slate-800/20 border border-dashed border-slate-700 rounded-3xl">
              <SettingsIcon size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-slate-400 font-medium">No configurations</h3>
              <p className="text-slate-500 text-sm mt-1">Add your first AI provider to enable smart features.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Settings;

