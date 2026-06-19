import React, { useState } from 'react';
import { FileText, Download, Filter } from 'lucide-react';

export default function BetHistory() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-orbitron text-slate-200 tracking-wider">Comprehensive Bet History</h2>
          <div className="flex items-center text-xs text-slate-500 mt-1 uppercase tracking-widest font-exo font-bold">
            <span className="text-slate-400">REPORTS</span>
            <span className="mx-2">/</span>
            <span className="text-[--primary]">All Slips</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 text-sm rounded transition-all">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button className="flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold px-4 py-2 text-sm rounded transition-all border border-emerald-500/50">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="bg-[#05100a] border border-[--primary]/20 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[--primary]/20 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#030a06]">
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              placeholder="Search by username, match, or runner..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#020503] border border-[--primary]/20 rounded py-2 px-4 text-sm text-slate-200 focus:outline-none focus:border-[--primary]/50 transition-colors placeholder-slate-600"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[#020503] text-slate-400 border-b border-[--primary]/20">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Match Event</th>
                <th className="px-4 py-3">Runner / Session</th>
                <th className="px-4 py-3 text-right">Odds / Rate</th>
                <th className="px-4 py-3 text-right">Stake</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[--primary]/10 hover:bg-[#020503]/50">
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">2026-06-18 11:45</td>
                <td className="px-4 py-3 font-medium text-[--primary]">user_789</td>
                <td className="px-4 py-3 text-slate-200">IND vs AUS</td>
                <td className="px-4 py-3 text-slate-300">Match Odds - IND</td>
                <td className="px-4 py-3 text-right font-medium">1.92</td>
                <td className="px-4 py-3 text-right font-bold text-slate-200">₹ 2,000</td>
                <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-bold uppercase tracking-wider">Lagai</span></td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs font-bold uppercase tracking-wider">Won</span></td>
              </tr>
              <tr className="border-b border-[--primary]/10 hover:bg-[#020503]/50">
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">2026-06-18 11:30</td>
                <td className="px-4 py-3 font-medium text-[--primary]">vip_client2</td>
                <td className="px-4 py-3 text-slate-200">IND vs AUS</td>
                <td className="px-4 py-3 text-slate-300">10 over run IND</td>
                <td className="px-4 py-3 text-right font-medium">90/100</td>
                <td className="px-4 py-3 text-right font-bold text-slate-200">₹ 5,000</td>
                <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-rose-500/20 text-rose-400 rounded text-xs font-bold uppercase tracking-wider">Khai</span></td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-bold uppercase tracking-wider">Lost</span></td>
              </tr>
              <tr className="border-b border-[--primary]/10 hover:bg-[#020503]/50">
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">2026-06-18 10:15</td>
                <td className="px-4 py-3 font-medium text-[--primary]">demo_user</td>
                <td className="px-4 py-3 text-slate-200">CSK vs MI</td>
                <td className="px-4 py-3 text-slate-300">Match Odds - CSK</td>
                <td className="px-4 py-3 text-right font-medium">2.04</td>
                <td className="px-4 py-3 text-right font-bold text-slate-200">₹ 1,000</td>
                <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-xs font-bold uppercase tracking-wider">Lagai</span></td>
                <td className="px-4 py-3"><span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded text-xs font-bold uppercase tracking-wider">Void</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
