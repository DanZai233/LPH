export enum PackageManagerType {
  APT = 'APT',
  YUM = 'YUM',
  PACMAN = 'PACMAN',
  SNAP = 'SNAP',
  FLATPAK = 'FLATPAK',
  BREW = 'BREW'
}

export interface Package {
  id: string;
  name: string;
  version: string;
  description: string;
  manager: PackageManagerType;
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
  managers: PackageManagerType[];
}

export interface PackageManagerStatus {
  name: PackageManagerType;
  available: boolean;
  version?: string;
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
  config?: string; // JSON string for additional config
  createdAt?: string;
  updatedAt?: string;
}

