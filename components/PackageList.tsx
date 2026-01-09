
import React, { useState, useMemo } from 'react';
import { MOCK_PACKAGES } from '../constants';
import { Search, Filter, Info, Package as PackageIcon, Download, Trash2, Terminal } from 'lucide-react';
import { PackageManagerType } from '../types';

const PackageList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterManager, setFilterManager] = useState<PackageManagerType | 'ALL'>('ALL');
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

  const filteredPackages = useMemo(() => {
    return MOCK_PACKAGES.filter(pkg => {
      const matchesSearch = pkg.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           pkg.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterManager === 'ALL' || pkg.manager === filterManager;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterManager]);

  const selectedPackage = MOCK_PACKAGES.find(p => p.id === selectedPackageId);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Search installed packages, libraries, tools..." 
            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 pl-12 pr-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2 bg-slate-800/50 border border-slate-700 rounded-2xl p-1 w-full md:w-auto overflow-x-auto no-scrollbar">
          {(['ALL', ...Object.values(PackageManagerType)] as const).map(mgr => (
            <button
              key={mgr}
              onClick={() => setFilterManager(mgr)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                filterManager === mgr 
                  ? 'bg-slate-700 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {mgr}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {filteredPackages.map(pkg => (
            <div 
              key={pkg.id}
              onClick={() => setSelectedPackageId(pkg.id)}
              className={`group bg-slate-800/40 border p-5 rounded-2xl transition-all cursor-pointer hover:shadow-xl hover:shadow-black/20 ${
                selectedPackageId === pkg.id 
                  ? 'border-blue-500 bg-slate-800/80 shadow-lg' 
                  : 'border-slate-700/50 hover:border-slate-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                    selectedPackageId === pkg.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                  }`}>
                    <PackageIcon size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white flex items-center">
                      {pkg.name}
                      <span className="ml-2 px-2 py-0.5 bg-slate-700/50 rounded text-[10px] text-slate-400 font-mono">{pkg.version}</span>
                    </h4>
                    <p className="text-sm text-slate-400 line-clamp-1 mt-0.5">{pkg.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold px-2 py-1 bg-slate-900 text-slate-400 border border-slate-700 rounded-md uppercase tracking-wider">
                    {pkg.manager}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {filteredPackages.length === 0 && (
            <div className="text-center py-20 bg-slate-800/20 border border-dashed border-slate-700 rounded-3xl">
              <PackageIcon size={48} className="mx-auto text-slate-600 mb-4" />
              <h3 className="text-slate-400 font-medium">No packages found</h3>
              <p className="text-slate-500 text-sm mt-1">Try a different search term or filter.</p>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          {selectedPackage ? (
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 sticky top-4 animate-in slide-in-from-right-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Package Details</h3>
                <button 
                  onClick={() => setSelectedPackageId(null)}
                  className="p-2 hover:bg-slate-700 rounded-xl text-slate-400"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-4xl font-black text-white">{selectedPackage.name}</h4>
                  <p className="text-slate-400 mt-2 leading-relaxed">{selectedPackage.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/30">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Version</p>
                    <p className="text-slate-200 font-mono text-sm mt-1">{selectedPackage.version}</p>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/30">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Size</p>
                    <p className="text-slate-200 font-medium text-sm mt-1">{selectedPackage.size || 'Unknown'}</p>
                  </div>
                </div>

                <div>
                  <h5 className="text-sm font-bold text-slate-200 mb-3 flex items-center">
                    <Terminal size={14} className="mr-2 text-blue-400" />
                    Common Usage
                  </h5>
                  <div className="space-y-2">
                    {selectedPackage.usage?.map((u, i) => (
                      <div key={i} className="bg-slate-900 p-3 rounded-xl border border-slate-700/50 group flex items-center justify-between">
                        <code className="text-xs text-blue-400 font-mono">{u}</code>
                        <button className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-slate-300 transition-opacity">
                          <Info size={14} />
                        </button>
                      </div>
                    )) || <p className="text-xs text-slate-500 italic">No usage data available.</p>}
                  </div>
                </div>

                <div className="flex space-x-2 pt-4 border-t border-slate-700/50">
                  <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center transition-colors">
                    <Download size={18} className="mr-2" />
                    Update
                  </button>
                  <button className="flex-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 px-4 py-3 rounded-xl font-bold flex items-center justify-center border border-rose-500/20 transition-colors">
                    <Trash2 size={18} className="mr-2" />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/20 border border-dashed border-slate-700/50 rounded-3xl p-10 flex flex-col items-center justify-center text-center h-[400px]">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-slate-600 mb-4">
                <Info size={32} />
              </div>
              <h3 className="text-slate-400 font-medium">Select a package</h3>
              <p className="text-slate-500 text-sm mt-2">Click on any package in the list to view detailed technical specifications and usage instructions.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const X = ({ size }: { size: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;

export default PackageList;
