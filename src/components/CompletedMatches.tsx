import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, Calendar, ChevronDown, Check, Activity, AlertCircle } from 'lucide-react';

type SportType = 'cricket' | 'tennis' | 'soccer';

interface CompletedMatch {
  id: string;
  pid: string;
  title: string;
  sport: string;
  date: string;
  declared: string;
  wonBy: string;
  profitLoss: number;
}

export default function CompletedMatches() {
  const [sportType, setSportType] = useState<SportType>('cricket');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState('Last 30 Days');
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsDatePickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const dateRanges = [
    'Today', 'Yesterday', 'Last 7 Days', 'This Week', 'Last Week', 
    'Last 30 Days', 'This Month', 'Last Month', 'Custom Range'
  ];

  // Mock data
  const matches: CompletedMatch[] = [
    {
      id: '10000305',
      pid: '10000695',
      title: 'Mock Match 1 v Mock Match 2',
      sport: 'CRICKET',
      date: '03 Jun 10:30 AM',
      declared: 'Yes',
      wonBy: 'Mock Match 1',
      profitLoss: 1540.50
    },
    {
      id: '10000304',
      pid: '10000694',
      title: 'Mock Match 3 v Mock Match 4',
      sport: 'CRICKET',
      date: '02 Jun 02:00 PM',
      declared: 'Yes',
      wonBy: 'Mock Match 4',
      profitLoss: -500.00
    }
  ];

  const filteredMatches = matches.filter(m => m.sport.toLowerCase() === sportType);

  return (
    <div className="p-4 lg:p-8 max-w-[1400px] mx-auto space-y-6 font-sans text-sm pb-16">
      {/* Alert Banner / Ticker */}
      <div className="bg-gradient-to-r from-[#00ff88]/10 to-[#020503] border border-[#00ff88]/20 rounded-xl px-4 py-3 flex items-center shadow-sm text-slate-200 overflow-hidden mb-6">
        <div className="bg-[#00ff88]/20 p-1.5 rounded mr-3 flex-shrink-0 border border-[#00ff88]/30">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse block shadow-[0_0_8px_rgba(0,255,136,1)]"></span>
        </div>
        <div className="flex-1 overflow-hidden relative h-6">
            <div className="absolute whitespace-nowrap text-sm font-medium animate-[marquee_25s_linear_infinite] font-exo flex items-center gap-8 text-[#00ff88]">
              <span>🏏 <span className="font-bold text-white">Somerset</span> <span className="text-[#f0b429]">145/3 (14.3 ov)</span> vs <span className="font-bold text-white">Glamorgan</span></span>
              <span className="text-[#00ff88]/50 font-bold">•</span>
              <span>🏏 <span className="font-bold text-white">India</span> <span className="text-[#f0b429]">210/4 (20.0 ov)</span> vs <span className="font-bold text-white">Australia</span> <span className="text-[#f0b429]">185/8 (20.0 ov)</span></span>
              <span className="text-[#00ff88]/50 font-bold">•</span>
              <span>🏏 <span className="font-bold text-white">CSK</span> <span className="text-[#f0b429]">165/2 (15.0 ov)</span> vs <span className="font-bold text-white">MI</span></span>
              <span className="text-[#00ff88]/50 font-bold">•</span>
              <span>⚽ <span className="font-bold text-white">Real Madrid</span> <span className="text-[#f0b429]">2 - 1</span> <span className="font-bold text-white">Barcelona</span></span>
            </div>
        </div>
      </div>

      {/* Header & Breadcrumbs */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-emerald-500" />
          Matches
        </h2>
        <div className="text-sm text-slate-400 mt-2 flex items-center space-x-2 font-medium">
          <span className="hover:text-slate-200 cursor-pointer transition-colors">Dashboard</span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-emerald-600">Matches</span>
        </div>
      </div>

      <div className="bg-[#05100a] rounded-2xl border border-[#00ff88]/20 shadow-sm overflow-hidden animate-in fade-in duration-300">
        
        {/* Date Picker Section */}
        <div className="p-4 border-b border-[#00ff88]/20 bg-[#020503]/50">
          <div className="relative inline-block" ref={datePickerRef}>
            <button 
              onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
              className="flex items-center justify-between w-64 px-4 py-2 bg-[#05100a] border border-[#00ff88]/30 rounded-lg shadow-sm hover:border-[#00ff88]/50 focus:outline-none focus:ring-2 focus:ring-[#00ff88]/30/20 text-slate-200 font-medium transition-all"
            >
               <span className="flex items-center gap-2">
                 <Calendar className="w-4 h-4 text-slate-400" />
                 {selectedDateRange}
               </span>
               <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDatePickerOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Date Range Dropdown */}
            {isDatePickerOpen && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-[#05100a] rounded-xl shadow-xl border border-[#00ff88]/20 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                <div className="max-h-64 overflow-y-auto py-2 custom-scrollbar">
                  {dateRanges.map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setSelectedDateRange(range);
                        if (range !== 'Custom Range') setIsDatePickerOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center justify-between ${
                        selectedDateRange === range 
                          ? 'bg-[#00ff88]/10 text-blue-700 font-semibold' 
                          : 'text-slate-200 hover:bg-[#020503]'
                      }`}
                    >
                      {range}
                      {selectedDateRange === range && <Check className="w-4 h-4 text-[#00ff88]" />}
                    </button>
                  ))}
                </div>
                
                {selectedDateRange === 'Custom Range' && (
                  <div className="p-4 border-t border-[#00ff88]/20 bg-[#020503]">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">From</label>
                        <input type="date" className="w-full text-sm px-2 py-1.5 border border-[#00ff88]/30 rounded shadow-sm focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]/30 outline-none" defaultValue="2026-05-07" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">To</label>
                        <input type="date" className="w-full text-sm px-2 py-1.5 border border-[#00ff88]/30 rounded shadow-sm focus:border-[#00ff88] focus:ring-1 focus:ring-[#00ff88]/30 outline-none" defaultValue="2026-06-05" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button className="flex-1 bg-[#00ff88]/20 hover:bg-[#00ff88]/30 text-white font-semibold py-1.5 rounded transition-colors text-sm shadow-sm" onClick={() => setIsDatePickerOpen(false)}>Apply</button>
                       <button className="flex-1 bg-[#05100a] border border-[#00ff88]/30 hover:bg-[#020503] text-slate-200 font-semibold py-1.5 rounded transition-colors text-sm shadow-sm">Clear</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Header Bar */}
        <div className="bg-[#60999b] px-5 py-3.5 border-b border-[#00ff88]/20">
          <h3 className="font-semibold text-white">All Matches</h3>
        </div>

        <div className="p-5 space-y-5">
          {/* Sport Tabs */}
          <div className="flex gap-3">
            <button
              onClick={() => setSportType('cricket')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                sportType === 'cricket' 
                  ? 'bg-[#60999b] text-white shadow-md shadow-[#60999b]/20 scale-[1.01]' 
                  : 'bg-[#00ff88]/5 text-slate-300 hover:bg-[#00ff88]/20'
              }`}
            >
              Cricket
            </button>
            <button
              onClick={() => setSportType('tennis')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                sportType === 'tennis' 
                  ? 'bg-[#60999b] text-white shadow-md shadow-[#60999b]/20 scale-[1.01]' 
                  : 'bg-[#00ff88]/5 text-slate-300 hover:bg-[#00ff88]/20'
              }`}
            >
              Tennis
            </button>
            <button
              onClick={() => setSportType('soccer')}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                sportType === 'soccer' 
                  ? 'bg-[#60999b] text-white shadow-md shadow-[#60999b]/20 scale-[1.01]' 
                  : 'bg-[#00ff88]/5 text-slate-300 hover:bg-[#00ff88]/20'
              }`}
            >
              Soccer
            </button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto border border-[#00ff88]/20 rounded-xl shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#020503]/80 text-slate-300 text-xs uppercase tracking-wider border-b border-[#00ff88]/20">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-slate-200">ID</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-200">PID</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-200">Title</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-200">Sport</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-200">DATE</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-200 text-center">Declared</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-200">Won By</th>
                  <th className="px-5 py-3.5 font-semibold text-slate-200 text-right space-x-1">
                    <span>Profit</span> <span className="text-slate-400">/</span> <span>Loss</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00ff88]/20 bg-[#05100a]">
                {filteredMatches.length > 0 ? (
                  filteredMatches.map((match, idx) => (
                    <tr key={idx} className="hover:bg-[#020503] transition-colors group">
                      <td className="px-5 py-4 font-medium text-slate-300">{match.id}</td>
                      <td className="px-5 py-4 text-slate-400">{match.pid}</td>
                      <td className="px-5 py-4 font-semibold text-white">{match.title}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-[#00ff88]/5 text-slate-300">
                           {match.sport}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-300 font-medium whitespace-nowrap">{match.date}</td>
                      <td className="px-5 py-4 text-center">
                         <span className="inline-flex items-center justify-center bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest">
                           {match.declared}
                         </span>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#00ff88]">{match.wonBy}</td>
                      <td className={`px-5 py-4 font-bold text-right ${match.profitLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {match.profitLoss >= 0 ? '+' : ''}{match.profitLoss.toFixed(2)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-400 bg-[#020503]/50">
                       <div className="flex flex-col items-center justify-center space-y-2">
                         <div className="w-12 h-12 rounded-full bg-[#00ff88]/5 flex items-center justify-center">
                           <Activity className="w-6 h-6 text-slate-300" />
                         </div>
                         <p>No completed matches found for the selected criteria.</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
