import React, { useState, useMemo } from 'react';
import { Search, Download, Share2 } from 'lucide-react';
import { exportToCSV } from '../lib/exportUtils';
import DateRangeFilter from './DateRangeFilter';

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
  const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
            setMatches([]);
          }
        } else {
          setMatches([]);
        }
      } catch (err) {
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  const filteredData = useMemo(() => {
    return matches.filter(d => {
      const searchMatch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        d.sport.toLowerCase().includes(searchTerm.toLowerCase());

      let dateMatch = true;
      if (dateRange.start || dateRange.end) {
        const matchDate = new Date(d.date);
        if (isNaN(matchDate.getTime())) {
          dateMatch = false;
        } else {
          const normalizeDate = (dt: Date) => {
            const temp = new Date(dt);
            temp.setHours(0, 0, 0, 0);
            return temp.getTime();
          };
          
          const mTime = normalizeDate(matchDate);
          const startT = dateRange.start ? normalizeDate(dateRange.start) : -Infinity;
          const endT = dateRange.end ? normalizeDate(dateRange.end) : Infinity;
          
          dateMatch = mTime >= startT && mTime <= endT;
        }
      }

      return searchMatch && dateMatch;
    });
  }, [matches, searchTerm, dateRange]);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

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

      <div className="bg-[#05100a] text-left border border-\(--primary\)/20 rounded-lg shadow-sm flex flex-col mt-4 pt-0 relative z-0 min-w-0 w-full overflow-hidden">
        <div className="bg-[#60999b] text-white px-4 py-3 flex items-center justify-between rounded-t-lg">
          <h3 className="font-semibold">{subTitle}</h3>
        </div>
        
        <div className="p-4 border-b border-\(--primary\)/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#020503]/50 min-w-0">
          <div className="flex space-x-2 shrink-0 items-center">
            <DateRangeFilter onRangeSelect={(s, e) => setDateRange({ start: s, end: e })} />
            <button 
              onClick={() => exportToCSV(filteredData, 'Completed_Matches')}
              className="flex items-center gap-1 bg-[#05100a] border border-\(--primary\)/30 text-\(--primary\) hover:bg-\(--primary\)/10 px-4 py-1.5 rounded text-sm font-medium shadow-sm transition-colors"
            >
              <Download size={16} /> CSV
            </button>
          </div>
          <div className="relative flex items-center w-full sm:w-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search matches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border border-\(--primary\)/30 rounded px-3 py-1.5 pl-9 text-sm focus:outline-none focus:ring-1 focus:ring-\(--primary\)/30 focus:border-\(--primary\) w-full sm:w-64 bg-[#05100a] text-slate-200"
            />
          </div>
        </div>

        <div className="overflow-x-auto min-h-75 w-full">
          <table className="w-full text-sm text-left text-slate-200">
            <thead className="text-xs text-slate-200 bg-[#020503] border-b border-\(--primary\)/20">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-300">Match ID</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Title</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Sport</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Date</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Winner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-\(--primary\)/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 bg-[#05100a] border-b border-\(--primary\)/20">
                    Loading matches...
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 bg-[#05100a] border-b border-\(--primary\)/20">
                    No completed matches found
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr 
                    key={row.id} 
                    className="hover:bg-[#020503]/50 transition-colors cursor-pointer"
                    onClick={() => onViewReport?.(row)}
                  >
                    <td className="px-4 py-3 font-medium text-slate-400">{row.id}</td>
                    <td className="px-4 py-3 text-\(--primary\) font-medium">{row.title}</td>
                    <td className="px-4 py-3">{row.sport}</td>
                    <td className="px-4 py-3">{row.date}</td>
                    <td className="px-4 py-3 text-white font-bold">{row.winner}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-\(--primary\)/20 flex flex-col sm:flex-row sm:items-center justify-between text-sm text-slate-400 bg-[#05100a] rounded-b-lg">
          <div>
            Showing {filteredData.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} entries
          </div>
          <div className="flex mt-3 sm:mt-0 items-center border border-\(--primary\)/20 rounded divide-x divide-\(--primary\)/20 bg-[#05100a]">
            <button 
              className="px-3 py-1.5 hover:bg-[#020503] disabled:opacity-50 text-slate-400" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            >
              Previous
            </button>
            <span className="px-3 py-1.5 bg-[#020503] text-slate-300 font-medium cursor-default">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              className="px-3 py-1.5 hover:bg-[#020503] disabled:opacity-50 text-slate-400" 
              disabled={currentPage === totalPages || filteredData.length === 0}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
