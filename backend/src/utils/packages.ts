import { execSync } from 'child_process';
import { Package, PackageManagerType } from '../types';

export function getPackagesFromApt(): Package[] {
  try {
    const output = execSync('dpkg-query -W -f=\'${Package}|${Version}|${Description}\\n\' 2>/dev/null', { encoding: 'utf8' });
    const packages: Package[] = [];
    const lines = output.split('\n').filter(line => line.trim());

    lines.forEach((line, index) => {
      const parts = line.split('|');
      if (parts.length >= 2) {
        packages.push({
          id: `apt-${parts[0]}-${index}`,
          name: parts[0],
          version: parts[1] || 'Unknown',
          description: parts.slice(2).join('|') || 'No description',
          manager: PackageManagerType.APT
        });
      }
    });

    return packages;
  } catch (error) {
    console.error('Error getting APT packages:', error);
    return [];
  }
}

export function getPackagesFromYum(): Package[] {
  try {
    // Try dnf first (Fedora/RHEL 8+), then yum
    let output = '';
    try {
      output = execSync('dnf list installed --format "%{name}|%{version}|%{summary}\\n" 2>/dev/null', { encoding: 'utf8' });
    } catch (e) {
      output = execSync('rpm -qa --queryformat "%{NAME}|%{VERSION}|%{SUMMARY}\\n" 2>/dev/null', { encoding: 'utf8' });
    }
    
    const packages: Package[] = [];
    const lines = output.split('\n').filter(line => line.trim() && !line.startsWith('已安装'));

    lines.forEach((line, index) => {
      const parts = line.split('|');
      if (parts.length >= 2) {
        packages.push({
          id: `yum-${parts[0]}-${index}`,
          name: parts[0],
          version: parts[1] || 'Unknown',
          description: parts.slice(2).join('|') || 'No description',
          manager: PackageManagerType.YUM
        });
      }
    });

    return packages;
  } catch (error) {
    console.error('Error getting YUM packages:', error);
    return [];
  }
}

export function getPackagesFromPacman(): Package[] {
  try {
    const output = execSync('pacman -Q 2>/dev/null', { encoding: 'utf8' });
    const packages: Package[] = [];
    const lines = output.split('\n').filter(line => line.trim());

    lines.forEach((line, index) => {
      const parts = line.split(' ');
      if (parts.length >= 2) {
        packages.push({
          id: `pacman-${parts[0]}-${index}`,
          name: parts[0],
          version: parts[1] || 'Unknown',
          description: 'Arch Linux package',
          manager: PackageManagerType.PACMAN
        });
      }
    });

    return packages;
  } catch (error) {
    console.error('Error getting Pacman packages:', error);
    return [];
  }
}

export function getPackagesFromSnap(): Package[] {
  try {
    const output = execSync('snap list 2>/dev/null', { encoding: 'utf8' });
    const packages: Package[] = [];
    const lines = output.split('\n').slice(1).filter(line => line.trim()); // Skip header

    lines.forEach((line, index) => {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        packages.push({
          id: `snap-${parts[0]}-${index}`,
          name: parts[0],
          version: parts[1] || 'Unknown',
          description: parts.slice(5).join(' ') || 'Snap package',
          manager: PackageManagerType.SNAP
        });
      }
    });

    return packages;
  } catch (error) {
    console.error('Error getting Snap packages:', error);
    return [];
  }
}

export function getPackagesFromFlatpak(): Package[] {
  try {
    const output = execSync('flatpak list 2>/dev/null', { encoding: 'utf8' });
    const packages: Package[] = [];
    const lines = output.split('\n').slice(1).filter(line => line.trim()); // Skip header

    lines.forEach((line, index) => {
      const parts = line.split(/\s+/);
      if (parts.length >= 2) {
        packages.push({
          id: `flatpak-${parts[0]}-${index}`,
          name: parts[0],
          version: parts[1] || 'Unknown',
          description: 'Flatpak package',
          manager: PackageManagerType.FLATPAK
        });
      }
    });

    return packages;
  } catch (error) {
    console.error('Error getting Flatpak packages:', error);
    return [];
  }
}

export function getAllPackages(): Package[] {
  const allPackages: Package[] = [];

  try {
    allPackages.push(...getPackagesFromApt());
  } catch (e) {
    console.error('APT not available');
  }

  try {
    allPackages.push(...getPackagesFromYum());
  } catch (e) {
    console.error('YUM not available');
  }

  try {
    allPackages.push(...getPackagesFromPacman());
  } catch (e) {
    console.error('Pacman not available');
  }

  try {
    allPackages.push(...getPackagesFromSnap());
  } catch (e) {
    console.error('Snap not available');
  }

  try {
    allPackages.push(...getPackagesFromFlatpak());
  } catch (e) {
    console.error('Flatpak not available');
  }

  return allPackages;
}

export function searchPackageByName(packages: Package[], query: string): Package[] {
  const lowerQuery = query.toLowerCase();
  return packages.filter(pkg => 
    pkg.name.toLowerCase().includes(lowerQuery) ||
    pkg.description.toLowerCase().includes(lowerQuery)
  );
}

export function filterPackagesByManager(packages: Package[], manager: PackageManagerType | 'ALL'): Package[] {
  if (manager === 'ALL') {
    return packages;
  }
  return packages.filter(pkg => pkg.manager === manager);
}

