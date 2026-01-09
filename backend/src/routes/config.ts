import { Router, Request, Response } from 'express';
import { getAllAIConfigs, getAIConfigById, createAIConfig, updateAIConfig, deleteAIConfig, setActiveConfig } from '../utils/config';
import { AIProvider } from '../types';

const router = Router();

// Get all AI configurations
router.get('/ai', async (req: Request, res: Response) => {
  try {
    const configs = await getAllAIConfigs();
    // Hide full API keys for security (only show last 4 chars)
    const safeConfigs = configs.map(config => {
      const { apiKey, ...rest } = config;
      return {
        ...rest,
        apiKey: apiKey && apiKey.length > 4 ? '***' + apiKey.slice(-4) : '***'
      };
    });
    res.json(safeConfigs);
  } catch (error) {
    console.error('Error getting AI configs:', error);
    res.status(500).json({ error: 'Failed to get AI configurations' });
  }
});

// Get AI configuration by ID
router.get('/ai/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const config = await getAIConfigById(id);

    if (!config) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    // Don't expose full API key in response for security
    const { apiKey, ...safeConfig } = config;
    res.json({ 
      ...safeConfig, 
      apiKey: apiKey && apiKey.length > 4 ? '***' + apiKey.slice(-4) : '***' 
    });
  } catch (error) {
    console.error('Error getting AI config:', error);
    res.status(500).json({ error: 'Failed to get AI configuration' });
  }
});

// Create new AI configuration
router.post('/ai', async (req: Request, res: Response) => {
  try {
    const { provider, name, apiKey, baseUrl, model, isActive, enabled, config } = req.body;

    if (!provider || !name || !apiKey) {
      return res.status(400).json({ error: 'Provider, name, and API key are required' });
    }

    if (!Object.values(AIProvider).includes(provider)) {
      return res.status(400).json({ error: 'Invalid provider' });
    }

    const aiConfig = await createAIConfig({
      provider,
      name,
      apiKey,
      baseUrl,
      model,
      isActive: isActive || false,
      enabled: enabled !== false,
      config
    });

    const { apiKey: key, ...safeConfig } = aiConfig;
    res.status(201).json({ 
      ...safeConfig, 
      apiKey: key && key.length > 4 ? '***' + key.slice(-4) : '***' 
    });
  } catch (error: any) {
    console.error('Error creating AI config:', error);
    res.status(500).json({ error: 'Failed to create AI configuration' });
  }
});

// Update AI configuration
router.put('/ai/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { provider, name, apiKey, baseUrl, model, isActive, enabled, config } = req.body;

    // Get existing config to preserve API key if not provided
    const existing = await getAIConfigById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const updateData: any = {};
    if (provider !== undefined) updateData.provider = provider;
    if (name !== undefined) updateData.name = name;
    // Only update API key if a new one is provided (not the masked version)
    if (apiKey !== undefined && !apiKey.startsWith('***')) {
      updateData.apiKey = apiKey;
    }
    if (baseUrl !== undefined) updateData.baseUrl = baseUrl;
    if (model !== undefined) updateData.model = model;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (enabled !== undefined) updateData.enabled = enabled;
    if (config !== undefined) updateData.config = config;

    const updated = await updateAIConfig(id, updateData);

    if (!updated) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    const { apiKey: key, ...safeConfig } = updated;
    res.json({ ...safeConfig, apiKey: key && key.length > 4 ? '***' + key.slice(-4) : '***' });
  } catch (error: any) {
    console.error('Error updating AI config:', error);
    res.status(500).json({ error: 'Failed to update AI configuration' });
  }
});

// Delete AI configuration
router.delete('/ai/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteAIConfig(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Configuration not found' });
    }

    res.json({ message: 'Configuration deleted successfully' });
  } catch (error) {
    console.error('Error deleting AI config:', error);
    res.status(500).json({ error: 'Failed to delete AI configuration' });
  }
});

// Set active configuration
router.post('/ai/:id/activate', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const activated = await setActiveConfig(id);

    if (!activated) {
      return res.status(404).json({ error: 'Configuration not found or disabled' });
    }

    const { apiKey: key, ...safeConfig } = activated;
    res.json({ 
      ...safeConfig, 
      apiKey: key && key.length > 4 ? '***' + key.slice(-4) : '***' 
    });
  } catch (error) {
    console.error('Error activating AI config:', error);
    res.status(500).json({ error: 'Failed to activate AI configuration' });
  }
});

// Get available providers
router.get('/ai-providers', (req: Request, res: Response) => {
  res.json({
    providers: Object.values(AIProvider).map(provider => ({
      value: provider,
      label: provider.charAt(0).toUpperCase() + provider.slice(1),
      defaultBaseUrl: getDefaultBaseUrl(provider),
      defaultModel: getDefaultModel(provider),
    }))
  });
});

function getDefaultBaseUrl(provider: AIProvider): string {
  switch (provider) {
    case AIProvider.OPENAI:
      return 'https://api.openai.com/v1';
    case AIProvider.OPENROUTER:
      return 'https://openrouter.ai/api/v1';
    case AIProvider.VOLCENGINE:
      return 'https://ark.cn-beijing.volces.com/api/v3';
    case AIProvider.ANTHROPIC:
      return 'https://api.anthropic.com/v1';
    case AIProvider.GEMINI:
    default:
      return '';
  }
}

function getDefaultModel(provider: AIProvider): string {
  switch (provider) {
    case AIProvider.GEMINI:
      return 'gemini-1.5-flash';
    case AIProvider.OPENAI:
      return 'gpt-3.5-turbo';
    case AIProvider.OPENROUTER:
      return 'openai/gpt-3.5-turbo';
    case AIProvider.VOLCENGINE:
      return 'ep-xxx';
    case AIProvider.ANTHROPIC:
      return 'claude-3-haiku-20240307';
    default:
      return '';
  }
}

export default router;

