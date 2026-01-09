
import React from 'react';
import { SYSTEM_INFO } from '../constants';
import { Cpu, Database, Activity, Box, ShieldCheck, Terminal as TerminalIcon } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }: { icon: any, label: string, value: string, color: string }) => (
  <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-3xl hover:border-slate-600 transition-colors group">
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={24} className="text-white" />
    </div>
    <p className="text-slate-400 text-sm font-medium">{label}</p>
    <p className="text-2xl font-bold text-white mt-1">{value}</p>
  </div>
);

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">System Health Overview</h2>
          <p className="text-slate-400 mt-1">Real-time status of your Linux environment and package managers.</p>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors">Refresh Stats</button>
          <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-medium transition-colors">Export Report</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Box} label="Installed Packages" value="1,284" color="bg-blue-600 shadow-blue-500/20 shadow-lg" />
        <StatCard icon={TerminalIcon} label="Custom Aliases" value="18" color="bg-purple-600 shadow-purple-500/20 shadow-lg" />
        <StatCard icon={ShieldCheck} label="Sec Updates" value="2 Pending" color="bg-amber-500 shadow-amber-500/20 shadow-lg" />
        <StatCard icon={Database} label="Disk Usage" value="78%" color="bg-rose-500 shadow-rose-500/20 shadow-lg" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Activity className="mr-2 text-blue-400" size={20} />
            Environment Specs
          </h3>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
              <span className="text-slate-400">OS Distribution</span>
              <span className="text-slate-200 font-medium">{SYSTEM_INFO.os}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
              <span className="text-slate-400">Kernel Version</span>
              <span className="text-slate-200 font-mono text-sm">{SYSTEM_INFO.kernel}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-slate-700/50">
              <span className="text-slate-400">Default Shell</span>
              <span className="text-slate-200 font-mono text-sm">{SYSTEM_INFO.shell}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-slate-400">System Uptime</span>
              <span className="text-slate-200 font-medium">{SYSTEM_INFO.uptime}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-8">
          <h3 className="text-xl font-bold text-white flex items-center">
            <Cpu className="mr-2 text-emerald-400" size={20} />
            Package Managers Found
          </h3>
          <div className="mt-6 flex flex-wrap gap-3">
            {SYSTEM_INFO.managers.map(mgr => (
              <div key={mgr} className="bg-slate-700/50 border border-slate-600 px-4 py-3 rounded-2xl flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center text-[10px] font-bold">
                  {mgr[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{mgr}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active</p>
                </div>
              </div>
            ))}
            <div className="bg-slate-900/40 border border-slate-700 border-dashed px-4 py-3 rounded-2xl flex items-center justify-center text-slate-500 cursor-pointer hover:border-slate-500 transition-colors">
              <span className="text-sm">+ Scan More</span>
            </div>
          </div>
          
          <div className="mt-8 bg-blue-600/10 border border-blue-500/20 p-4 rounded-2xl flex items-start space-x-4">
             <div className="bg-blue-600 rounded-lg p-2 text-white mt-1">
               <ShieldCheck size={16} />
             </div>
             <div>
               <p className="text-sm font-semibold text-blue-200">AI Recommendation</p>
               <p className="text-xs text-blue-300/80 mt-1">Based on your usage, consider installing 'fd-find' as a faster alternative to 'find'.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
