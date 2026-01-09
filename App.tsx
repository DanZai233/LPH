
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import PackageList from './components/PackageList';
import AliasManager from './components/AliasManager';
import SmartSearch from './components/SmartSearch';
import { ViewType } from './types';
import { History as HistoryIcon } from 'lucide-react';

const HistoryPlaceholder = () => (
  <div className="h-full flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto">
    <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-slate-600 mb-6">
      <HistoryIcon size={40} />
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Command History</h2>
    <p className="text-slate-400">
      Synchronize your local shell history with LinuxHub to analyze usage patterns and search through previous commands.
    </p>
    <button className="mt-8 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-bold transition-all">
      Sync Shell History
    </button>
  </div>
);

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');

  const renderContent = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'packages':
        return <PackageList />;
      case 'aliases':
        return <AliasManager />;
      case 'ai-search':
        return <SmartSearch />;
      case 'history':
        return <HistoryPlaceholder />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      {renderContent()}
    </Layout>
  );
};

export default App;
