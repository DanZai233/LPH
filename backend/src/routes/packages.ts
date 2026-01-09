import { Router, Request, Response } from 'express';
import { getAllPackages, searchPackageByName, filterPackagesByManager } from '../utils/packages';
import { PackageManagerType } from '../types';

const router = Router();

// Get all packages
router.get('/', (req: Request, res: Response) => {
  try {
    const { search, manager } = req.query;
    let packages = getAllPackages();

    // Filter by manager if specified
    if (manager && manager !== 'ALL') {
      packages = filterPackagesByManager(packages, manager as PackageManagerType);
    }

    // Search by name/description if specified
    if (search && typeof search === 'string') {
      packages = searchPackageByName(packages, search);
    }

    res.json(packages);
  } catch (error) {
    console.error('Error getting packages:', error);
    res.status(500).json({ error: 'Failed to get packages' });
  }
});

// Get package by ID
router.get('/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const packages = getAllPackages();
    const pkg = packages.find(p => p.id === id);

    if (!pkg) {
      return res.status(404).json({ error: 'Package not found' });
    }

    res.json(pkg);
  } catch (error) {
    console.error('Error getting package:', error);
    res.status(500).json({ error: 'Failed to get package' });
  }
});

// Search packages
router.get('/search/:query', (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const packages = getAllPackages();
    const results = searchPackageByName(packages, query);
    res.json(results);
  } catch (error) {
    console.error('Error searching packages:', error);
    res.status(500).json({ error: 'Failed to search packages' });
  }
});

export default router;

