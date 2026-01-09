const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Package {
  id: string;
  name: string;
  version: string;
  description: string;
  manager: string;
  installDate?: string;
  size?: string;
  usage?: string[];
}

export interface Alias {
  id: string;
  name: string;
  command: string;
  description: string;
}

export interface SystemInfo {
  os: string;
  kernel: string;
  shell: string;
  uptime: string;
  managers: string[];
}

export interface SystemStats {
  totalPackages: number;
  packageCounts: { [key: string]: number };
  packageManagers: number;
  diskUsage: string;
  systemInfo: SystemInfo;
}

export interface CommandSearchResult {
  command: string;
  package: string;
  description: string;
  usage: string;
}

export interface AliasSuggestion {
  alias: string;
  description: string;
}

export enum AIProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  OPENROUTER = 'openrouter',
  VOLCENGINE = 'volcengine',
  ANTHROPIC = 'anthropic'
}

export interface AIConfig {
  id: string;
  provider: AIProvider;
  name: string;
  apiKey: string;
  baseUrl?: string;
  model?: string;
  isActive: boolean;
  enabled: boolean;
  config?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // System APIs
  async getSystemInfo(): Promise<SystemInfo> {
    return this.request<SystemInfo>('/system/info');
  }

  async getSystemStats(): Promise<SystemStats> {
    return this.request<SystemStats>('/system/stats');
  }

  // Package APIs
  async getPackages(search?: string, manager?: string): Promise<Package[]> {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (manager) params.append('manager', manager);
    const query = params.toString();
    return this.request<Package[]>(`/packages${query ? `?${query}` : ''}`);
  }

  async getPackage(id: string): Promise<Package> {
    return this.request<Package>(`/packages/${id}`);
  }

  async searchPackages(query: string): Promise<Package[]> {
    return this.request<Package[]>(`/packages/search/${encodeURIComponent(query)}`);
  }

  // Alias APIs
  async getAliases(): Promise<Alias[]> {
    return this.request<Alias[]>('/aliases');
  }

  async getAlias(id: string): Promise<Alias> {
    return this.request<Alias>(`/aliases/${id}`);
  }

  async createAlias(alias: Omit<Alias, 'id'>): Promise<Alias> {
    return this.request<Alias>('/aliases', {
      method: 'POST',
      body: JSON.stringify(alias),
    });
  }

  async updateAlias(id: string, alias: Partial<Omit<Alias, 'id'>>): Promise<Alias> {
    return this.request<Alias>(`/aliases/${id}`, {
      method: 'PUT',
      body: JSON.stringify(alias),
    });
  }

  async deleteAlias(id: string): Promise<void> {
    return this.request<void>(`/aliases/${id}`, {
      method: 'DELETE',
    });
  }

  // AI APIs
  async explainPackage(packageName: string): Promise<{ explanation: string }> {
    return this.request<{ explanation: string }>('/ai/explain-package', {
      method: 'POST',
      body: JSON.stringify({ packageName }),
    });
  }

  async searchCommands(query: string): Promise<CommandSearchResult[]> {
    return this.request<CommandSearchResult[]>('/ai/search-commands', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  }

  async suggestAlias(command: string): Promise<AliasSuggestion> {
    return this.request<AliasSuggestion>('/ai/suggest-alias', {
      method: 'POST',
      body: JSON.stringify({ command }),
    });
  }

  // Config APIs
  async getAIConfigs(): Promise<AIConfig[]> {
    return this.request<AIConfig[]>('/config/ai');
  }

  async getAIConfig(id: string): Promise<AIConfig> {
    return this.request<AIConfig>(`/config/ai/${id}`);
  }

  async createAIConfig(config: Omit<AIConfig, 'id'>): Promise<AIConfig> {
    return this.request<AIConfig>('/config/ai', {
      method: 'POST',
      body: JSON.stringify(config),
    });
  }

  async updateAIConfig(id: string, config: Partial<Omit<AIConfig, 'id'>>): Promise<AIConfig> {
    return this.request<AIConfig>(`/config/ai/${id}`, {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  async deleteAIConfig(id: string): Promise<void> {
    return this.request<void>(`/config/ai/${id}`, {
      method: 'DELETE',
    });
  }

  async activateAIConfig(id: string): Promise<AIConfig> {
    return this.request<AIConfig>(`/config/ai/${id}/activate`, {
      method: 'POST',
    });
  }

  async getAIProviders(): Promise<{ providers: Array<{ value: string; label: string; defaultBaseUrl: string; defaultModel: string }> }> {
    return this.request('/config/ai-providers');
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export { AIProvider };

