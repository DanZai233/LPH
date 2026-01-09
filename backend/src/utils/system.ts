import { execSync } from 'child_process';
import { PackageManagerType, SystemInfo, PackageManagerStatus } from '../types';

export function getSystemInfo(): SystemInfo {
  try {
    // Get OS distribution
    let os = 'Unknown';
    try {
      if (process.platform === 'linux') {
        const osRelease = execSync('cat /etc/os-release 2>/dev/null || echo ""', { encoding: 'utf8' });
        const match = osRelease.match(/PRETTY_NAME="(.+)"/);
        os = match ? match[1] : 'Linux';
      } else {
        os = `${process.platform} ${process.arch}`;
      }
    } catch (e) {
      os = 'Linux';
    }

    // Get kernel version
    let kernel = 'Unknown';
    try {
      kernel = execSync('uname -r', { encoding: 'utf8' }).trim();
    } catch (e) {
      kernel = 'Unknown';
    }

    // Get default shell
    let shell = process.env.SHELL || '/bin/bash';
    try {
      shell = execSync('echo $SHELL', { encoding: 'utf8' }).trim() || shell;
    } catch (e) {
      // Use default
    }

    // Get uptime
    let uptime = 'Unknown';
    try {
      const uptimeSeconds = parseInt(execSync('cat /proc/uptime 2>/dev/null | cut -d " " -f1', { encoding: 'utf8' }).trim());
      if (!isNaN(uptimeSeconds)) {
        const days = Math.floor(uptimeSeconds / 86400);
        const hours = Math.floor((uptimeSeconds % 86400) / 3600);
        uptime = `${days} days, ${hours} hours`;
      } else {
        uptime = 'Unknown';
      }
    } catch (e) {
      uptime = 'Unknown';
    }

    // Detect available package managers
    const managers: PackageManagerType[] = [];
    const managerChecks: { [key in PackageManagerType]: string[] } = {
      [PackageManagerType.APT]: ['apt', '--version'],
      [PackageManagerType.YUM]: ['yum', '--version'],
      [PackageManagerType.PACMAN]: ['pacman', '--version'],
      [PackageManagerType.SNAP]: ['snap', '--version'],
      [PackageManagerType.FLATPAK]: ['flatpak', '--version'],
      [PackageManagerType.BREW]: ['brew', '--version']
    };

    for (const [manager, command] of Object.entries(managerChecks)) {
      try {
        execSync(`${command[0]} ${command[1]} 2>/dev/null`, { encoding: 'utf8', stdio: 'ignore' });
        managers.push(manager as PackageManagerType);
      } catch (e) {
        // Manager not available
      }
    }

    return {
      os,
      kernel,
      shell,
      uptime,
      managers
    };
  } catch (error) {
    console.error('Error getting system info:', error);
    return {
      os: 'Linux',
      kernel: 'Unknown',
      shell: '/bin/bash',
      uptime: 'Unknown',
      managers: []
    };
  }
}

export function getPackageManagerStatus(): PackageManagerStatus[] {
  const statuses: PackageManagerStatus[] = [];
  const managerChecks: { [key in PackageManagerType]: string[] } = {
    [PackageManagerType.APT]: ['apt', '--version'],
    [PackageManagerType.YUM]: ['yum', '--version'],
    [PackageManagerType.PACMAN]: ['pacman', '--version'],
    [PackageManagerType.SNAP]: ['snap', '--version'],
    [PackageManagerType.FLATPAK]: ['flatpak', '--version'],
    [PackageManagerType.BREW]: ['brew', '--version']
  };

  for (const [manager, command] of Object.entries(managerChecks)) {
    try {
      const output = execSync(`${command[0]} ${command[1]} 2>/dev/null`, { encoding: 'utf8' });
      const versionMatch = output.match(/version\s+([\d.]+)/i);
      statuses.push({
        name: manager as PackageManagerType,
        available: true,
        version: versionMatch ? versionMatch[1] : undefined
      });
    } catch (e) {
      statuses.push({
        name: manager as PackageManagerType,
        available: false
      });
    }
  }

  return statuses;
}

export function getDiskUsage(): string {
  try {
    if (process.platform === 'linux') {
      const dfOutput = execSync('df -h / 2>/dev/null | tail -1 | awk \'{print $5}\'', { encoding: 'utf8' });
      return dfOutput.trim().replace('%', '') + '%';
    }
    return 'Unknown';
  } catch (e) {
    return 'Unknown';
  }
}

