import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface CompletedMatchesProps {
  title: string;
  subTitle: string;
  breadcrumb: string;
  hideActions?: boolean;
  hideCreate?: boolean;
}

interface Match {
  id: string;
  title: string;
  sport: string;
  date: string;
  winner: string;
}

export default function CompletedMatches({ title, subTitle, breadcrumb }: CompletedMatchesProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const [mockData] = useState<Match[]>([
    { id: '1000100', title: 'India v Australia', sport: 'CRICKET', date: '01 Jun 2026', winner: 'India' },
    { id: '1000101', title: 'Chennai Super Kings v Mumbai Indians', sport: 'CRICKET', date: '02 Jun 2026', winner: 'Chennai Super Kings' },
    { id: '1000102', title: 'Real Madrid vs Barcelona', sport: 'SOCCER', date: '02 Jun 2026', winner: 'Real Madrid' },
    { id: '1000103', title: 'Somerset v Glamorgan', sport: 'CRICKET', date: '03 Jun 2026', winner: 'Somerset' },
    { id: '1000104', title: 'Rafael Nadal vs Novak Djokovic', sport: 'TENNIS', date: '04 Jun 2026', winner: 'Rafael Nadal' },
  ]);

  const filteredData = mockData.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.sport.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span className="text-white">{breadcrumb}</span>
        </div>
      </div>

      <div className="bg-[#05100a] border text-left border-[#00ff88]/20 rounded-lg shadow-sm flex flex-col mt-4 pt-0 relative z-0">
        <div className="bg-[#60999b] text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
          <h3 className="font-semibold">{subTitle}</h3>
        </div>
        
        <div className="p-4 border-b border-[#00ff88]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#020503]/50">
          <div className="flex space-x-2">
            <button className="bg-[#05100a] border border-[#00ff88]/30 text-slate-300 hover:bg-[#020503] px-4 py-1.5 rounded text-sm font-medium shadow-sm transition-colors">
              CSV
            </button>
          </div>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-[#00ff88]/30 rounded px-3 py-1.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/30/20 focus:border-[#00ff88] w-full sm:w-64 bg-[#05100a] text-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-75">
          <table className="w-full text-sm text-left text-slate-200">
            <thead className="text-xs text-slate-200 bg-[#020503] border-b border-[#00ff88]/20">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-300">Match ID</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Title</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Sport</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#00ff88]/20">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 bg-[#05100a] border-b border-[#00ff88]/20">
                    No completed matches found
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="hover:bg-[#020503]/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-400">{row.id}</td>
                    <td className="px-4 py-3 text-[#00ff88] font-medium">{row.title}</td>
                    <td className="px-4 py-3">{row.sport}</td>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3 text-white font-bold">{row.winner}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-[#00ff88]/20 flex flex-col sm:flex-row sm:items-center justify-between text-sm text-slate-400 bg-[#05100a] rounded-b-lg">
          <div>
            Showing 1 to {filteredData.length} of entries {filteredData.length}
          </div>
          <div className="flex mt-3 sm:mt-0 items-center border border-[#00ff88]/20 rounded divide-x divide-[#00ff88]/20 bg-[#05100a]">
            <button className="px-3 py-1.5 hover:bg-[#020503] disabled:opacity-50 text-slate-400" disabled>Previous</button>
            <button className="px-3 py-1.5 bg-[#00ff88]/10 text-[#00ff88] font-medium cursor-default">1</button>
            <button className="px-3 py-1.5 hover:bg-[#020503] disabled:opacity-50 text-slate-400" disabled>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
