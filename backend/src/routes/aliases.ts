import { Router, Request, Response } from 'express';
import { getAllAliases, getAliasById, createAlias, updateAlias, deleteAlias } from '../utils/database';
import { Alias } from '../types';

const router = Router();

// Get all aliases
router.get('/', async (req: Request, res: Response) => {
  try {
    const aliases = await getAllAliases();
    res.json(aliases);
  } catch (error) {
    console.error('Error getting aliases:', error);
    res.status(500).json({ error: 'Failed to get aliases' });
  }
});

// Get alias by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const alias = await getAliasById(id);

    if (!alias) {
      return res.status(404).json({ error: 'Alias not found' });
    }

    res.json(alias);
  } catch (error) {
    console.error('Error getting alias:', error);
    res.status(500).json({ error: 'Failed to get alias' });
  }
});

// Create new alias
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, command, description } = req.body;

    if (!name || !command) {
      return res.status(400).json({ error: 'Name and command are required' });
    }

    // Check if alias with same name already exists
    const existing = await getAllAliases();
    if (existing.some(a => a.name === name)) {
      return res.status(409).json({ error: 'Alias with this name already exists' });
    }

    const alias = await createAlias({ name, command, description: description || '' });
    res.status(201).json(alias);
  } catch (error: any) {
    console.error('Error creating alias:', error);
    res.status(500).json({ error: 'Failed to create alias' });
  }
});

// Update alias
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, command, description } = req.body;

    // Check if name conflict with other aliases
    if (name) {
      const existing = await getAllAliases();
      if (existing.some(a => a.name === name && a.id !== id)) {
        return res.status(409).json({ error: 'Alias with this name already exists' });
      }
    }

    const updated = await updateAlias(id, { name, command, description });

    if (!updated) {
      return res.status(404).json({ error: 'Alias not found' });
    }

    res.json(updated);
  } catch (error: any) {
    console.error('Error updating alias:', error);
    res.status(500).json({ error: 'Failed to update alias' });
  }
});

// Delete alias
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await deleteAlias(id);

    if (!deleted) {
      return res.status(404).json({ error: 'Alias not found' });
    }

    res.json({ message: 'Alias deleted successfully' });
  } catch (error) {
    console.error('Error deleting alias:', error);
    res.status(500).json({ error: 'Failed to delete alias' });
  }
});

export default router;

