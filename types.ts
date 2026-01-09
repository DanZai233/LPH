
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

export interface CommandHistoryItem {
  id: string;
  command: string;
  timestamp: number;
}

export type ViewType = 'dashboard' | 'packages' | 'aliases' | 'history' | 'ai-search';
