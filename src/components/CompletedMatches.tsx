import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface CompletedMatchesProps {
  title: string;
  subTitle: string;
  breadcrumb: string;
  hideActions?: boolean;
  hideCreate?: boolean;
  onViewReport?: (match: Match) => void;
}

interface Match {
  id: string;
  pid: string;
  title: string;
  sport: string;
  date: string;
  winner?: string;
  t1s?: string;
  t2s?: string;
  t1?: string;
  t2?: string;
  status?: string;
}

export default function CompletedMatches({ title, subTitle, breadcrumb, onViewReport }: CompletedMatchesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data fallback
  const mockCompletedMatches: Match[] = [
    { id: '1000100', pid: 'pid1', title: 'India v Australia', sport: 'CRICKET', date: '11 Jun 2026', winner: 'India', t1s: '210/4 (20.0)', t2s: '185/8 (20.0)', t1: 'India', t2: 'Australia', status: 'Match Ended' },
    { id: '1000101', pid: 'pid2', title: 'Chennai Super Kings v Mumbai Indians', sport: 'CRICKET', date: '12 Jun 2026', winner: 'Chennai Super Kings', t1s: '165/2 (15.0)', t2s: '164/8 (20.0)', t1: 'CSK', t2: 'MI', status: 'Match Ended' },
    { id: '1000102', pid: 'pid3', title: 'Real Madrid vs Barcelona', sport: 'SOCCER', date: '12 Jun 2026', winner: 'Real Madrid', status: 'Match Ended' },
    { id: '1000103', pid: 'pid4', title: 'Yorkshire v Lancashire', sport: 'CRICKET', date: '13 Jun 2026', winner: 'Yorkshire', t1s: '145/3 (14.3)', t2s: '144/10 (19.2)', t1: 'Yorkshire', t2: 'Lancashire', status: 'Match Ended' },
  ];

  React.useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('/api/live-matches');
        const data = await response.json();
        
        if (data.success && data.matches && data.matches.length > 0) {
          const apiMatches = data.matches.map((m: any) => ({
            id: m.id || String(Math.floor(Math.random() * 1000000)),
            pid: m.series_id || (m.id ? m.id.split('-')[0] : String(Math.floor(Math.random() * 1000000))),
            title: m.name || m.title || (m.t1 && m.t2 ? `${m.t1} vs ${m.t2}` : 'Unknown Match'),
            sport: 'CRICKET',
            date: m.dateTimeGMT ? new Date(m.dateTimeGMT + "Z").toLocaleString() : (m.date || 'Completed'),
            winner: m.status?.includes('won') ? m.status : 'Check Score',
            status: m.status,
            t1s: m.t1s,
            t2s: m.t2s,
            t1: m.t1,
            t2: m.t2,
            ms: m.ms
          }));
          
          // Filter for matches that seem completed
          const completedFromApi = apiMatches.filter((m: any) => {
            let isPast = false;
            if (m.date) {
              const matchDate = new Date(m.date);
              if (!isNaN(matchDate.getTime())) {
                const todayDate = new Date();
                isPast = new Date(matchDate).setHours(0, 0, 0, 0) < new Date(todayDate).setHours(0, 0, 0, 0);
              }
            }

            const isStatusCompleted = m.ms === 'result' ||
              m.status?.toLowerCase().includes('won') || 
              m.status?.toLowerCase().includes('ended') || 
              m.status?.toLowerCase().includes('result') ||
              m.status?.toLowerCase().includes('abandoned') ||
              m.status?.toLowerCase().includes('stumps') ||
              m.status?.toLowerCase().includes('complete') ||
              m.title?.toLowerCase().includes(' won ');

            return isPast || isStatusCompleted;
          });

          if (completedFromApi.length > 0) {
            setMatches(completedFromApi);
          } else {
            setMatches(mockCompletedMatches);
          }
        } else {
          setMatches(mockCompletedMatches);
        }
      } catch (err) {
        setMatches(mockCompletedMatches);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const filteredData = matches.filter(d => 
    d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.sport.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span className="text-white">{breadcrumb}</span>
        </div>
      </div>

      <div className="bg-[#05100a] text-left border border-[#00ff88]/20 rounded-lg shadow-sm flex flex-col mt-4 pt-0 relative z-0 min-w-0 w-full overflow-hidden">
        <div className="bg-[#60999b] text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
          <h3 className="font-semibold">{subTitle}</h3>
        </div>
        
        <div className="p-4 border-b border-[#00ff88]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#020503]/50 min-w-0">
          <div className="flex space-x-2 shrink-0">
            <button className="bg-[#05100a] border border-[#00ff88]/30 text-slate-300 hover:bg-[#020503] px-4 py-1.5 rounded text-sm font-medium shadow-sm transition-colors">
              CSV
            </button>
          </div>
          <div className="relative flex items-center w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-[#00ff88]/30 rounded px-3 py-1.5 pl-9 text-sm focus:outline-none focus:ring-1 focus:ring-[#00ff88]/30 focus:border-[#00ff88] w-full sm:w-64 bg-[#05100a] text-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-75 w-full">
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
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 bg-[#05100a] border-b border-[#00ff88]/20">
                    Loading matches...
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 bg-[#05100a] border-b border-[#00ff88]/20">
                    No completed matches found
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-[#020503]/50 transition-colors cursor-pointer"
                    onClick={() => onViewReport?.(row)}
                  >
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
