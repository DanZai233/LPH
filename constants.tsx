
import React from 'react';
import { Package, PackageManagerType, Alias } from './types';

export const MOCK_PACKAGES: Package[] = [
  {
    id: '1',
    name: 'vim',
    version: '9.0.1234',
    description: 'Vi IMproved, a highly configurable text editor built to enable efficient text editing.',
    manager: PackageManagerType.APT,
    installDate: '2023-10-15',
    size: '34MB',
    usage: ['vim filename', 'vim -u NONE', 'vim +line_number file']
  },
  {
    id: '2',
    name: 'docker',
    version: '24.0.5',
    description: 'A platform to develop, ship, and run applications in containers.',
    manager: PackageManagerType.SNAP,
    installDate: '2023-11-02',
    size: '150MB',
    usage: ['docker ps', 'docker run -it ubuntu', 'docker-compose up']
  },
  {
    id: '3',
    name: 'htop',
    version: '3.2.2',
    description: 'An interactive process viewer for Unix systems.',
    manager: PackageManagerType.BREW,
    installDate: '2023-09-20',
    size: '2MB',
    usage: ['htop', 'htop -u user']
  },
  {
    id: '4',
    name: 'nginx',
    version: '1.24.0',
    description: 'A high-performance HTTP server and reverse proxy.',
    manager: PackageManagerType.YUM,
    installDate: '2023-08-11',
    size: '12MB',
    usage: ['nginx -s reload', 'nginx -t']
  },
  {
    id: '5',
    name: 'curl',
    version: '8.4.0',
    description: 'A command line tool for transferring data with URL syntax.',
    manager: PackageManagerType.PACMAN,
    installDate: '2023-12-01',
    size: '5MB',
    usage: ['curl -O https://example.com/file', 'curl -I google.com']
  }
];

export const MOCK_ALIASES: Alias[] = [
  { id: 'a1', name: 'll', command: 'ls -lah --color=auto', description: 'List all files with details and colors' },
  { id: 'a2', name: 'update', command: 'sudo apt update && sudo apt upgrade', description: 'Update system packages' },
  { id: 'a3', name: 'gs', command: 'git status', description: 'Quick git status check' },
];

export const SYSTEM_INFO = {
  os: 'Ubuntu 22.04 LTS',
  kernel: '5.15.0-89-generic',
  shell: '/bin/zsh',
  uptime: '12 days, 4 hours',
  managers: [PackageManagerType.APT, PackageManagerType.SNAP, PackageManagerType.BREW]
};
