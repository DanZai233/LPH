// Legacy service - now uses backend API
// Kept for backward compatibility, redirects to apiClient
import { apiClient } from './api';

export async function explainPackage(packageName: string): Promise<string> {
  try {
    const result = await apiClient.explainPackage(packageName);
    return result.explanation;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to explain package');
  }
}

export async function searchCommands(query: string) {
  try {
    return await apiClient.searchCommands(query);
  } catch (error: any) {
    console.error('Error searching commands:', error);
    return [];
  }
}

export async function suggestAlias(command: string) {
  try {
    return await apiClient.suggestAlias(command);
  } catch (error: any) {
    console.error('Error suggesting alias:', error);
    return { alias: '', description: '' };
  }
}
