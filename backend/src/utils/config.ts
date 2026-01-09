import { AIConfig, AIProvider } from '../types';
import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';

// 确保数据目录存在
const dbDir = process.env.DATABASE_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const aiConfigsPath = path.join(dbDir, 'ai_configs.json');

interface AIConfigStore {
  configs: Array<AIConfig & { createdAt?: string; updatedAt?: string }>;
}

// 读取和写入 JSON 文件的辅助函数
function readConfigs(): AIConfigStore {
  if (!existsSync(aiConfigsPath)) {
    return { configs: [] };
  }
  try {
    const content = readFileSync(aiConfigsPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read ${aiConfigsPath}:`, error);
    return { configs: [] };
  }
}

function writeConfigs(store: AIConfigStore): void {
  try {
    writeFileSync(aiConfigsPath, JSON.stringify(store, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to write ${aiConfigsPath}:`, error);
    throw error;
  }
}

export async function getAllAIConfigs(): Promise<AIConfig[]> {
  const store = readConfigs();
  return store.configs.sort((a, b) => {
    // Sort by creation time (id contains timestamp)
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : parseInt(a.id.split('-')[2] || '0');
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : parseInt(b.id.split('-')[2] || '0');
    return timeB - timeA;
  });
}

export async function getAIConfigById(id: string): Promise<AIConfig | undefined> {
  const store = readConfigs();
  return store.configs.find(c => c.id === id);
}

export async function getActiveAIConfig(): Promise<AIConfig | undefined> {
  const store = readConfigs();
  return store.configs.find(c => c.isActive && c.enabled);
}

export async function createAIConfig(config: Omit<AIConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<AIConfig> {
  const store = readConfigs();
  const id = `ai-config-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date().toISOString();
  
  // If setting to active, deactivate others first
  if (config.isActive) {
    store.configs.forEach(c => {
      if (c.isActive) {
        c.isActive = false;
        c.updatedAt = now;
      }
    });
  }
  
  const newConfig: AIConfig & { createdAt?: string; updatedAt?: string } = {
    id,
    ...config,
    createdAt: now,
    updatedAt: now,
  };
  
  store.configs.push(newConfig);
  writeConfigs(store);
  return newConfig;
}

export async function updateAIConfig(id: string, config: Partial<Omit<AIConfig, 'id' | 'createdAt' | 'updatedAt'>>): Promise<AIConfig | null> {
  const store = readConfigs();
  const index = store.configs.findIndex(c => c.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // If setting to active, deactivate others first
  if (config.isActive) {
    store.configs.forEach(c => {
      if (c.isActive && c.id !== id) {
        c.isActive = false;
        c.updatedAt = new Date().toISOString();
      }
    });
  }
  
  store.configs[index] = {
    ...store.configs[index],
    ...config,
    updatedAt: new Date().toISOString(),
  };
  
  writeConfigs(store);
  return store.configs[index];
}

export async function deleteAIConfig(id: string): Promise<boolean> {
  const store = readConfigs();
  const initialLength = store.configs.length;
  store.configs = store.configs.filter(c => c.id !== id);
  
  if (store.configs.length < initialLength) {
    writeConfigs(store);
    return true;
  }
  
  return false;
}

export async function setActiveConfig(id: string): Promise<AIConfig | null> {
  const config = await getAIConfigById(id);
  if (!config || !config.enabled) return null;
  
  return await updateAIConfig(id, { isActive: true });
}
