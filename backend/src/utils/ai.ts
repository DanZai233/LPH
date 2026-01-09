import { getActiveAIConfig } from './config';
import { AIProviderAdapter } from './ai-providers';

async function getAIAdapter(): Promise<AIProviderAdapter | null> {
  const config = await getActiveAIConfig();
  if (!config) {
    return null;
  }
  return new AIProviderAdapter(config);
}

export async function explainPackage(packageName: string): Promise<string> {
  const adapter = await getAIAdapter();
  if (!adapter) {
    throw new Error('No active AI provider configured. Please configure an AI provider in settings.');
  }

  try {
    const prompt = `Explain what the Linux package "${packageName}" is, its primary use cases, and give 3 common command examples. Format in clear sections.`;
    const response = await adapter.generateText(prompt);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.text;
  } catch (error: any) {
    console.error('Error explaining package:', error);
    throw error;
  }
}

export interface CommandSearchResult {
  command: string;
  package: string;
  description: string;
  usage: string;
}

export async function searchCommands(query: string): Promise<CommandSearchResult[]> {
  const adapter = await getAIAdapter();
  if (!adapter) {
    throw new Error('No active AI provider configured. Please configure an AI provider in settings.');
  }

  try {
    const prompt = `The user is looking for a Linux command or tool to do: "${query}". Suggest 3 relevant packages/commands, describe them briefly, and provide the command syntax. Return ONLY a valid JSON array with this exact structure:
[
  {
    "command": "command_name",
    "package": "package_name",
    "description": "brief description",
    "usage": "example usage command"
  }
]`;
    
    const result = await adapter.generateJSON(prompt, {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          command: { type: 'string' },
          package: { type: 'string' },
          description: { type: 'string' },
          usage: { type: 'string' }
        }
      }
    });
    
    if (!result || !Array.isArray(result)) {
      return [];
    }
    
    return result;
  } catch (error: any) {
    console.error('Error searching commands:', error);
    return [];
  }
}

export interface AliasSuggestion {
  alias: string;
  description: string;
}

export async function suggestAlias(command: string): Promise<AliasSuggestion> {
  const adapter = await getAIAdapter();
  if (!adapter) {
    throw new Error('No active AI provider configured. Please configure an AI provider in settings.');
  }

  try {
    const prompt = `Suggest a short, intuitive terminal alias name and a brief description for this complex command: "${command}". Return ONLY a valid JSON object with this exact structure:
{
  "alias": "short_alias_name",
  "description": "brief description of what it does"
}`;
    
    const result = await adapter.generateJSON(prompt, {
      type: 'object',
      properties: {
        alias: { type: 'string' },
        description: { type: 'string' }
      }
    });
    
    if (!result) {
      return { alias: '', description: '' };
    }
    
    return {
      alias: result.alias || '',
      description: result.description || ''
    };
  } catch (error: any) {
    console.error('Error suggesting alias:', error);
    return { alias: '', description: '' };
  }
}

