import React, { useState } from 'react';
import { Wrench, Loader2 } from 'lucide-react';

interface LedgerTableProps {
  title: string;
  breadcrumb: string;
}

export default function LedgerTable({ title, breadcrumb }: LedgerTableProps) {
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 500);
  };

  const mockLedgers = [
    { date: '04 Jun 2026', entry: 'Deposit from Master', debit: '0.00', credit: '500.00', balance: '1500.00', note: 'Fund addition' },
    { date: '03 Jun 2026', entry: 'Withdrawal', debit: '200.00', credit: '0.00', balance: '1000.00', note: 'Requested payout' }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white uppercase">{title}</h2>
        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span className="text-white">{breadcrumb}</span>
        </div>
      </div>

      <div className="bg-[#05100a] border text-left border-[#00ff88]/20 rounded-lg shadow-sm overflow-hidden flex flex-col">
        {title === 'Agent' ? (
          <div className="p-4 bg-[#020503]/50 border-b border-[#00ff88]/20 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input type="date" defaultValue="2026-06-03" className="border border-[#00ff88]/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00ff88] bg-[#05100a]" />
              <input type="date" defaultValue="2026-06-05" className="border border-[#00ff88]/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00ff88] bg-[#05100a]" />
            </div>
            <button onClick={handleSearch} disabled={isSearching} className="bg-[#60999b] hover:bg-[#4d7a7c] text-white px-4 py-1.5 rounded text-sm font-medium transition-colors min-w-[80px] flex justify-center items-center">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-[#020503]/50 border-b border-[#00ff88]/20 flex items-center space-x-4">
             <div className="relative">
              <input type="text" placeholder="Search..." className="border border-[#00ff88]/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00ff88] bg-[#05100a] w-48" />
             </div>
             <input type="date" className="border border-[#00ff88]/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00ff88] bg-[#05100a]" />
            <button onClick={handleSearch} disabled={isSearching} className="bg-[#60999b] hover:bg-[#4d7a7c] text-white px-4 py-1.5 rounded text-sm font-medium transition-colors min-w-[80px] flex justify-center items-center">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        )}

        <div className="bg-[#60999b] text-white px-4 py-3 flex items-center justify-between mt-2">
          <h3 className="font-semibold text-sm">{title === 'Agent' ? 'Statement of Admin' : 'Agent Ledger'}</h3>
          <Wrench size={14} className="text-white/70" />
        </div>
        
        <div className="overflow-x-auto min-h-[200px]">
          <table className="w-full text-sm text-left text-slate-200">
            <thead className="text-xs text-slate-200 uppercase bg-[#00ff88]/5/50 border-b border-[#00ff88]/20">
              {title === 'Agent' ? (
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold w-1/2">Description</th>
                  <th className="px-4 py-3 font-semibold">Cr</th>
                  <th className="px-4 py-3 font-semibold">Dbt</th>
                  <th className="px-4 py-3 font-semibold">Com+</th>
                  <th className="px-4 py-3 font-semibold">Com-</th>
                  <th className="px-4 py-3 font-semibold">Balance</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-4 py-3 font-semibold">DATE/TIME</th>
                  <th className="px-4 py-3 font-semibold text-center">ENTRY</th>
                  <th className="px-4 py-3 font-semibold">DEBIT</th>
                  <th className="px-4 py-3 font-semibold">CREDIT</th>
                  <th className="px-4 py-3 font-semibold">Balance</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-[#00ff88]/20">
              {title === 'Agent' ? (
                <tr className="border-b border-[#00ff88]/20 hover:bg-[#020503]/50 transition-colors">
                  <td className="px-4 py-3">Thu, 04 Jun 2026 21:03:18</td>
                  <td className="px-4 py-3">Opening Balance By System to Admin</td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">1000</td>
                  <td className="px-4 py-3">0</td>
                  <td className="px-4 py-3">0</td>
                  <td className="px-4 py-3">0</td>
                  <td className="px-4 py-3 font-bold">1000</td>
                </tr>
              ) : (
                mockLedgers.map((l, i) => (
                  <tr key={i} className="hover:bg-[#020503]/50 transition-colors">
                    <td className="px-4 py-3">{l.date}</td>
                    <td className="px-4 py-3 font-medium text-center">{l.entry}</td>
                    <td className="px-4 py-3 text-rose-500 font-medium">{l.debit}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">{l.credit}</td>
                    <td className="px-4 py-3 font-bold">{l.balance}</td>
                    <td className="px-4 py-3 text-slate-400 italic">{l.note}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
