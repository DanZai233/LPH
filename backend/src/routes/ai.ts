import { Router, Request, Response } from 'express';
import { explainPackage, searchCommands, suggestAlias } from '../utils/ai';

const router = Router();

// Explain a package
router.post('/explain-package', async (req: Request, res: Response) => {
  try {
    const { packageName } = req.body;

    if (!packageName) {
      return res.status(400).json({ error: 'Package name is required' });
    }

    const explanation = await explainPackage(packageName);
    res.json({ explanation });
  } catch (error: any) {
    console.error('Error explaining package:', error);
    if (error.message && error.message.includes('API key')) {
      return res.status(503).json({ error: 'AI service not configured. Please set GEMINI_API_KEY environment variable.' });
    }
    res.status(500).json({ error: 'Failed to explain package' });
  }
});

// Search commands
router.post('/search-commands', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const results = await searchCommands(query);
    res.json(results);
  } catch (error: any) {
    console.error('Error searching commands:', error);
    if (error.message && error.message.includes('API key')) {
      return res.status(503).json({ error: 'AI service not configured. Please set GEMINI_API_KEY environment variable.' });
    }
    res.status(500).json({ error: 'Failed to search commands' });
  }
});

// Suggest alias
router.post('/suggest-alias', async (req: Request, res: Response) => {
  try {
    const { command } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    const suggestion = await suggestAlias(command);
    res.json(suggestion);
  } catch (error: any) {
    console.error('Error suggesting alias:', error);
    if (error.message && error.message.includes('API key')) {
      return res.status(503).json({ error: 'AI service not configured. Please set GEMINI_API_KEY environment variable.' });
    }
    res.status(500).json({ error: 'Failed to suggest alias' });
  }
});

export default router;

