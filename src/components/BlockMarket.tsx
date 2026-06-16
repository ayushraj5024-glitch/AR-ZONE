import React from 'react';
import { ArrowUpDown, Loader2 } from 'lucide-react';
import { useMarketStatus, MarketStatus } from '../hooks/useMarketStatus';

export default function BlockMarket() {
  const { status, loading, updateStatus } = useMarketStatus();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-100">
        <Loader2 className="w-8 h-8 animate-spin text-[#00ff88]" />
      </div>
    );
  }

  const sports = [
    { id: 1, betfairId: 1, name: 'Soccer', isOn: status.soccer, key: 'soccer' as keyof MarketStatus },
    { id: 2, betfairId: 2, name: 'Tennis', isOn: status.tennis, key: 'tennis' as keyof MarketStatus },
    { id: 3, betfairId: 4, name: 'Cricket', isOn: status.cricket, key: 'cricket' as keyof MarketStatus },
    { id: 4, betfairId: 0, name: 'Live Casino', isOn: status.liveCasino, key: 'liveCasino' as keyof MarketStatus },
    { id: 5, betfairId: 7, name: 'Int. Casino', isOn: status.intCasino, key: 'intCasino' as keyof MarketStatus },
  ];

  const toggleStatus = (key: keyof MarketStatus, currentStatus: boolean) => {
    updateStatus(key, !currentStatus);
  };

  return (
    <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-6">
      {/* Header & Breadcrumbs */}
      <div>
        <h2 className="text-[28px] font-normal text-slate-200">Block Sports</h2>
        <div className="text-[13px] text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-500">/</span>
          <span className="text-[#60999b]">Sports List</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[#05100a] border border-[#00ff88]/20 rounded-md overflow-hidden shadow-sm">
        <div className="bg-[#60999b] text-white px-4 py-3 font-semibold text-sm">
          List
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#020503] text-sm border-b border-[#00ff88]/20">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-300">
                  <div className="flex items-center space-x-1 cursor-pointer hover:text-[#00ff88]">
                    <span>So.</span>
                    <ArrowUpDown size={14} className="opacity-50" />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-300">
                  <div className="flex items-center space-x-1 cursor-pointer hover:text-[#00ff88]">
                    <span>BetfairId</span>
                    <ArrowUpDown size={14} className="opacity-50" />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-300">
                  <div className="flex items-center space-x-1 cursor-pointer hover:text-[#00ff88]">
                    <span>Name</span>
                    <ArrowUpDown size={14} className="opacity-50" />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-300">
                  <div className="flex items-center space-x-1 cursor-pointer hover:text-[#00ff88]">
                    <span>Status</span>
                    <ArrowUpDown size={14} className="opacity-50" />
                  </div>
                </th>
                <th className="px-4 py-3 font-semibold text-slate-300">
                  <div className="flex items-center space-x-1 cursor-pointer hover:text-[#00ff88]">
                    <span>Action</span>
                    <ArrowUpDown size={14} className="opacity-50" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sports.map((sport) => (
                <tr key={sport.id} className="border-b border-[#00ff88]/10 hover:bg-[#020503]">
                  <td className="px-4 py-3 text-slate-300">{sport.id}</td>
                  <td className="px-4 py-3 text-slate-300">{sport.betfairId}</td>
                  <td className="px-4 py-3 text-[#1e90ff] hover:text-[#3399ff] cursor-pointer">
                    {sport.name}
                  </td>
                  <td className={`px-4 py-3 font-medium ${sport.isOn ? 'text-green-500' : 'text-red-500'}`}>
                    {sport.name} is {sport.isOn ? 'ON' : 'OFF'}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleStatus(sport.key, sport.isOn)}
                      className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${sport.isOn ? 'bg-[#00ff88]' : 'bg-gray-600'}`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${sport.isOn ? 'translate-x-5.5' : 'translate-x-1'}`}
                        style={{ transform: sport.isOn ? 'translateX(22px)' : 'translateX(4px)' }}
                      />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
