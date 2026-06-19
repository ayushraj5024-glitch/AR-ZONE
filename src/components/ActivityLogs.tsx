import React from 'react';
import { ShieldAlert, Activity } from 'lucide-react';

export default function ActivityLogs() {
  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-orbitron text-slate-200 tracking-wider">Security & Activity Logs</h2>
          <div className="flex items-center text-xs text-slate-500 mt-1 uppercase tracking-widest font-exo font-bold">
            <span className="text-slate-400">ADMIN</span>
            <span className="mx-2">/</span>
            <span className="text-[--primary]">Logs</span>
          </div>
        </div>
      </div>

      <div className="bg-[#05100a] border border-[--primary]/20 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[--primary]/20 bg-[#030a06] flex items-center justify-between">
           <div className="flex items-center space-x-2 text-[--primary]">
             <Activity size={18} />
             <h3 className="font-orbitron font-bold">Recent System Activity</h3>
           </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[#020503] text-slate-400 border-b border-[--primary]/20">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User/Admin</th>
                <th className="px-4 py-3">Action Type</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[--primary]/10 hover:bg-[#020503]/50">
                <td className="px-4 py-3 text-slate-400">2 mins ago</td>
                <td className="px-4 py-3 font-medium text-[--primary]">admin_main</td>
                <td className="px-4 py-3"><span className="text-yellow-400 font-bold text-xs uppercase tracking-wider">Settings Change</span></td>
                <td className="px-4 py-3 text-slate-300">Updated Commission Limits for agent_x</td>
                <td className="px-4 py-3 text-slate-500 font-mono">192.168.1.45</td>
              </tr>
              <tr className="border-b border-[--primary]/10 hover:bg-[#020503]/50">
                <td className="px-4 py-3 text-slate-400">15 mins ago</td>
                <td className="px-4 py-3 font-medium text-[--primary]">admin_main</td>
                <td className="px-4 py-3"><span className="text-emerald-400 font-bold text-xs uppercase tracking-wider">Balance Update</span></td>
                <td className="px-4 py-3 text-slate-300">Added ₹10,000 to user_789</td>
                <td className="px-4 py-3 text-slate-500 font-mono">192.168.1.45</td>
              </tr>
              <tr className="border-b border-[--primary]/10 hover:bg-[#020503]/50">
                <td className="px-4 py-3 text-slate-400">1 hour ago</td>
                <td className="px-4 py-3 font-medium text-[--primary]">system</td>
                <td className="px-4 py-3"><span className="text-rose-400 font-bold text-xs uppercase tracking-wider">Market Closed</span></td>
                <td className="px-4 py-3 text-slate-300">Settled IND vs AUS Match Odds</td>
                <td className="px-4 py-3 text-slate-500 font-mono">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
