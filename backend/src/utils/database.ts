import path from 'path';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { Alias } from '../types';

// 确保数据目录存在
const dbDir = process.env.DATABASE_DIR || path.join(process.cwd(), 'data');
if (!existsSync(dbDir)) {
  mkdirSync(dbDir, { recursive: true });
}

const aliasesPath = path.join(dbDir, 'aliases.json');
const aiConfigsPath = path.join(dbDir, 'ai_configs.json');

// 读取 JSON 文件的辅助函数
function readJSON<T>(filePath: string, defaultValue: T): T {
  if (!existsSync(filePath)) {
    writeJSON(filePath, defaultValue);
    return defaultValue;
  }
  try {
    const content = readFileSync(filePath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error);
    return defaultValue;
  }
}

// 写入 JSON 文件的辅助函数
function writeJSON<T>(filePath: string, data: T): void {
  try {
    writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Failed to write ${filePath}:`, error);
    throw error;
  }
}

interface AliasStore {
  aliases: Alias[];
}

interface AIConfigStore {
  configs: any[];
}

// 别名管理函数
export async function getAllAliases(): Promise<Alias[]> {
  const store = readJSON<AliasStore>(aliasesPath, { aliases: [] });
  return store.aliases.sort((a, b) => {
    // Sort by creation time (id contains timestamp)
    return b.id.localeCompare(a.id);
  });
}

export async function getAliasById(id: string): Promise<Alias | undefined> {
  const store = readJSON<AliasStore>(aliasesPath, { aliases: [] });
  return store.aliases.find(a => a.id === id);
}

export async function createAlias(alias: Omit<Alias, 'id'>): Promise<Alias> {
  const store = readJSON<AliasStore>(aliasesPath, { aliases: [] });
  const id = `alias-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const newAlias: Alias = { id, ...alias };
  store.aliases.push(newAlias);
  writeJSON(aliasesPath, store);
  return newAlias;
}

export async function updateAlias(id: string, alias: Partial<Omit<Alias, 'id'>>): Promise<Alias | null> {
  const store = readJSON<AliasStore>(aliasesPath, { aliases: [] });
  const index = store.aliases.findIndex(a => a.id === id);
  
  if (index === -1) {
    return null;
  }
  
  store.aliases[index] = { ...store.aliases[index], ...alias };
  writeJSON(aliasesPath, store);
  return store.aliases[index];
}

export async function deleteAlias(id: string): Promise<boolean> {
  const store = readJSON<AliasStore>(aliasesPath, { aliases: [] });
  const initialLength = store.aliases.length;
  store.aliases = store.aliases.filter(a => a.id !== id);
  
  if (store.aliases.length < initialLength) {
    writeJSON(aliasesPath, store);
    return true;
  }
  
  return false;
}

// 导出数据库接口（用于向后兼容）
export async function getDatabase(): Promise<any> {
  return {
    prepare: (sql: string) => {
      // 这是一个简化的接口，实际使用中应该用 JSON 文件操作
      throw new Error('Direct database access not supported. Use provided functions instead.');
    },
    export: () => new Uint8Array(),
  };
}

export async function ensureDb(): Promise<any> {
  return getDatabase();
}

export default { getDatabase, ensureDb };
