
import React from 'react';
import { ViewType } from '../types';
import { 
  LayoutDashboard, 
  Package, 
  Terminal, 
  History, 
  Search,
  Settings,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: ViewType;
  onViewChange: (view: ViewType) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onViewChange }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'ai-search', label: 'Smart Search', icon: Search },
    { id: 'aliases', label: 'Alias Manager', icon: Terminal },
    { id: 'history', label: 'Cmd History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const NavContent = () => (
    <div className="flex flex-col h-full py-6">
      <div className="px-6 mb-10 flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
          L
        </div>
        <span className="text-xl font-bold tracking-tight text-white">LinuxHub</span>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onViewChange(item.id as ViewType);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'} />
              <span className="ml-3 font-medium">{item.label}</span>
              {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
            </button>
          );
        })}
      </nav>

      <div className="px-6 mt-auto">
        <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
          <p className="text-xs text-slate-500 font-medium uppercase mb-2">Logged in as</p>
          <p className="text-sm font-semibold text-slate-200">root@local-vm</p>
          <div className="mt-2 h-1 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 w-3/4 rounded-full"></div>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">CPU: 24% | MEM: 3.2GB</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#0f172a] overflow-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:block w-72 border-r border-slate-800 bg-[#0f172a]">
        <NavContent />
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#0f172a] z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 border-b border-slate-800 bg-[#0f172a]/80 backdrop-blur-md flex items-center justify-between px-6 z-30">
          <div className="flex items-center">
            <button 
              className="md:hidden mr-4 p-2 hover:bg-slate-800 rounded-lg text-slate-400"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-semibold text-white capitalize">{activeView.replace('-', ' ')}</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-1 text-xs text-slate-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              ssh: connected
            </div>
            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
              <X size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 no-scrollbar">
          <div className="max-w-6xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
