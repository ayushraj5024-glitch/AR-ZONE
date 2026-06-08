import React, { useState } from 'react';

type MatchType = 'inplay' | 'upcoming';
type SportType = 'cricket' | 'tennis' | 'soccer';

export interface Match {
  id: string;
  pid: string;
  title: string;
  sport: string;
  date: string;
  liveReportUrl?: string;
  status?: string;
  t1s?: string;
  t2s?: string;
  t1?: string;
  t2?: string;
  team1Img?: string;
  team2Img?: string;
}

interface LiveMatchesProps {
  onViewReport?: (match: Match) => void;
}

export default function LiveMatches({ onViewReport }: LiveMatchesProps) {
  const [matchType, setMatchType] = useState<MatchType>('inplay');
  const [sportType, setSportType] = useState<SportType>('cricket');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Initial Mock data based on the full list provided
  const initialMockMatches: Match[] = [
    {
      id: '10000306',
      pid: '10000696',
      title: 'Somerset v Glamorgan',
      sport: 'CRICKET',
      date: '04 Jun 11:30 PM',
      liveReportUrl: 'https://ss.365bsf.live/liveGameAnalysis/4/35661353',
    },
    {
      id: '10000307',
      pid: '10000697',
      title: 'Eagle Thane Strikers v Arcs Andheri',
      sport: 'CRICKET',
      date: '05 Jun 02:00 PM',
      liveReportUrl: 'true',
    },
    {
      id: '10000308',
      pid: '10000698',
      title: 'England v New Zealand',
      sport: 'CRICKET',
      date: '06 Jun 03:30 PM',
    },
    {
      id: '10000309',
      pid: '10000699',
      title: 'Alcaraz, C v Djokovic, N',
      sport: 'TENNIS',
      date: '04 Jun 06:30 PM',
      liveReportUrl: 'true',
    },
    {
      id: '10000310',
      pid: '10000700',
      title: 'Swiatek, I v Sabalenka, A',
      sport: 'TENNIS',
      date: '05 Jun 07:00 PM',
    },
    {
      id: '10000311',
      pid: '10000701',
      title: 'Real Madrid v Barcelona',
      sport: 'SOCCER',
      date: '04 Jun 11:00 PM',
      liveReportUrl: 'true',
    },
    {
      id: '10000312',
      pid: '10000702',
      title: 'Manchester City v Arsenal',
      sport: 'SOCCER',
      date: '06 Jun 09:30 AM',
    }
  ];

  // Fetch from the backend proxy
  React.useEffect(() => {
    const fetchLiveMatches = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/live-matches');
        const data = await response.json();
        
        if (data.success === false) {
          setApiError(data.error || "Failed to load live matches from API.");
          setMatches(initialMockMatches); // Fallback to mock data
        } else if (data.matches && data.matches.length > 0) {
          // Map real CricAPI data to the Match interface
          const liveMatches = data.matches.map((m: any) => {
            const title = m.name || m.title || (m.t1 && m.t2 ? `${m.t1} vs ${m.t2}` : 'Unknown Match');
            const dt = m.dateTimeGMT ? new Date(m.dateTimeGMT + "Z").toLocaleString() : (m.date || 'Update Pending');
            return {
              id: m.id || String(Math.floor(Math.random() * 1000000)),
              pid: m.series_id || (m.id ? m.id.split('-')[0] : String(Math.floor(Math.random() * 1000000))),
              title: title,
              sport: 'CRICKET',
              date: dt,
              liveReportUrl: m.matchStarted || m.ms === "live" || m.ms === "fixture" ? 'true' : undefined,
              status: m.status,
              t1s: m.t1s || '',
              t2s: m.t2s || '',
              t1: m.t1 || '',
              t2: m.t2 || '',
              team1Img: m.t1img || '',
              team2Img: m.t2img || ''
            };
          });
          setMatches(liveMatches); 
          setApiError(null);
        } else {
          // Backend didn't return any matches, empty list
          setMatches([]);
        }
      } catch (error) {
        setApiError("Network error. Falling back to mock data.");
        setMatches(initialMockMatches);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLiveMatches();
  }, []);

  // In a real app we'd filter based on state - assuming 'liveReportUrl' field implies 'inplay' for mockup purposes, or parse date.
  // We'll mock it so that matches with liveReportUrl are "Inplay" and others "Upcoming".
  const filteredMatches = matches
    .filter(m => m.sport.toLowerCase() === sportType)
    .filter(m => {
      // If we are using real API, we can either trust status or just show all
      if (matchType === 'inplay') {
        return m.liveReportUrl || m.status === 'Live' || m.status?.toLowerCase().includes('started');
      } else {
        return !m.liveReportUrl && m.status !== 'Live' && !m.status?.toLowerCase().includes('started');
      }
    });

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h2 className="text-2xl font-semibold text-white">Matches</h2>
        <div className="text-sm text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-200 font-medium">Matches</span>
        </div>
      </div>

      <div className="bg-[#05100a] rounded-xl border border-[#00ff88]/20 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#62a2a3] px-4 py-3 border-b border-[#00ff88]/20">
          <h3 className="font-semibold text-white">All Matches</h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Top Level Tabs: Match Type */}
          <div className="flex gap-2">
            <button
              onClick={() => setMatchType('inplay')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded transition-colors ${
                matchType === 'inplay' 
                  ? 'bg-[#62a2a3] text-white shadow-sm' 
                  : 'bg-[#62a2a3]/80 text-white/90 hover:bg-[#62a2a3]/90'
              }`}
            >
              Inplay Matches
            </button>
            <button
              onClick={() => setMatchType('upcoming')}
              className={`flex-1 py-2.5 text-sm font-semibold rounded transition-colors ${
                matchType === 'upcoming' 
                  ? 'bg-[#62a2a3] text-white shadow-sm' 
                  : 'bg-[#62a2a3]/80 text-white/90 hover:bg-[#62a2a3]/90'
              }`}
            >
              Upcoming Matches
            </button>
          </div>

          {/* Secondary Tabs: Sport Type */}
          <div className="flex gap-2">
            <button
              onClick={() => setSportType('cricket')}
              className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
                sportType === 'cricket' 
                  ? 'bg-[#62a2a3] text-white shadow-sm' 
                  : 'bg-[#62a2a3]/80 text-white/90 hover:bg-[#62a2a3]/90'
              }`}
            >
              Cricket
            </button>
            <button
              onClick={() => setSportType('tennis')}
              className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
                sportType === 'tennis' 
                  ? 'bg-[#62a2a3] text-white shadow-sm' 
                  : 'bg-[#62a2a3]/80 text-white/90 hover:bg-[#62a2a3]/90'
              }`}
            >
              Tennis
            </button>
            <button
              onClick={() => setSportType('soccer')}
              className={`flex-1 py-2 text-sm font-medium rounded transition-colors ${
                sportType === 'soccer' 
                  ? 'bg-[#62a2a3] text-white shadow-sm' 
                  : 'bg-[#62a2a3]/80 text-white/90 hover:bg-[#62a2a3]/90'
              }`}
            >
              Soccer
            </button>
          </div>

          {/* Data Table */}
          <div className="overflow-x-auto border border-[#00ff88]/20 rounded mt-4">
            <table className="w-full text-sm text-left">
              <thead className="bg-[#020503] text-slate-300 text-xs uppercase border-b border-[#00ff88]/20">
                <tr>
                  <th className="px-4 py-3 font-semibold border-r border-[#00ff88]/20">ID</th>
                  <th className="px-4 py-3 font-semibold border-r border-[#00ff88]/20">PID</th>
                  <th className="px-4 py-3 font-semibold border-r border-[#00ff88]/20">Title</th>
                  <th className="px-4 py-3 font-semibold border-r border-[#00ff88]/20">Sport</th>
                  <th className="px-4 py-3 font-semibold border-r border-[#00ff88]/20">DATE</th>
                  <th className="px-4 py-3 font-semibold text-center">Profit / Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00ff88]/20">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="animate-spin h-6 w-6 text-[#00ff88] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Connecting to Live Score API...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredMatches.length > 0 ? (
                  filteredMatches.map((match, idx) => (
                    <tr key={idx} className="hover:bg-[#020503]/50 transition-colors">
                      <td className="px-4 py-3 text-slate-300 border-r border-[#00ff88]/20 text-xs">{match.id}</td>
                      <td className="px-4 py-3 text-slate-300 border-r border-[#00ff88]/20 text-xs">{match.pid}</td>
                      <td className="px-4 py-3 font-medium text-[#00ff88] hover:text-blue-700 cursor-pointer border-r border-[#00ff88]/20">
                        {match.title}
                      </td>
                      <td className="px-4 py-3 text-slate-300 border-r border-[#00ff88]/20">{match.sport}</td>
                      <td className="px-4 py-3 text-slate-300 flex items-center space-x-1 border-r border-[#00ff88]/20">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>{match.date}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {match.liveReportUrl && (
                          <button
                            onClick={() => onViewReport?.(match)}
                            className="inline-block px-3 py-1.5 bg-[#62a2a3] text-white text-xs font-semibold rounded hover:bg-[#4d8687] transition-colors shadow-sm cursor-pointer border-none"
                          >
                            LiveReport
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                      No matches found.
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
