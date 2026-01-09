import { Router, Request, Response } from 'express';
import { getSystemInfo, getPackageManagerStatus, getDiskUsage } from '../utils/system';
import { getAllPackages } from '../utils/packages';

const router = Router();

// Get system information
router.get('/info', (req: Request, res: Response) => {
  try {
    const systemInfo = getSystemInfo();
    res.json(systemInfo);
  } catch (error) {
    console.error('Error getting system info:', error);
    res.status(500).json({ error: 'Failed to get system information' });
  }
});

// Get system statistics
router.get('/stats', (req: Request, res: Response) => {
  try {
    const packages = getAllPackages();
    const systemInfo = getSystemInfo();
    const diskUsage = getDiskUsage();
    
    // Count packages by manager
    const packageCounts: { [key: string]: number } = {};
    packages.forEach(pkg => {
      packageCounts[pkg.manager] = (packageCounts[pkg.manager] || 0) + 1;
    });

    res.json({
      totalPackages: packages.length,
      packageCounts,
      packageManagers: systemInfo.managers.length,
      diskUsage,
      systemInfo
    });
  } catch (error) {
    console.error('Error getting system stats:', error);
    res.status(500).json({ error: 'Failed to get system statistics' });
  }
});

// Get package manager status
router.get('/package-managers', (req: Request, res: Response) => {
  try {
    const statuses = getPackageManagerStatus();
    res.json(statuses);
  } catch (error) {
    console.error('Error getting package manager status:', error);
    res.status(500).json({ error: 'Failed to get package manager status' });
  }
});

export default router;

