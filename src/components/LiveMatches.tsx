import React, { useState } from 'react';
import { Ban, Loader2 } from 'lucide-react';
import { useMarketStatus } from '../hooks/useMarketStatus';

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
  const [localLoading, setLocalLoading] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const { status, loading: marketLoading } = useMarketStatus();

  // Initial Mock data based on the full list provided
  const initialMockMatches: Match[] = [
    {
      id: '10000306',
      pid: '10000696',
      title: 'Somerset v Glamorgan',
      sport: 'CRICKET',
      date: '14 Jun 2026 11:30 PM',
      liveReportUrl: 'https://ss.365bsf.live/liveGameAnalysis/4/35661353',
      status: 'Live',
      t1s: '185/4 (18.2)',
      t2s: ''
    },
    {
      id: '10000307',
      pid: '10000697',
      title: 'Eagle Thane Strikers v Arcs Andheri',
      sport: 'CRICKET',
      date: '14 Jun 2026 02:00 PM',
      liveReportUrl: 'true',
      status: 'Inplay',
      t1s: '142/6 (20.0)',
      t2s: '89/3 (12.1)'
    },
    {
      id: '10000308',
      pid: '10000698',
      title: 'England v New Zealand',
      sport: 'CRICKET',
      date: '16 Jun 2026 03:30 PM',
      status: 'Upcoming'
    },
    {
      id: '10000309',
      pid: '10000699',
      title: 'Alcaraz, C v Djokovic, N',
      sport: 'TENNIS',
      date: '14 Jun 2026 06:30 PM',
      liveReportUrl: 'true',
      status: 'Live'
    },
    {
      id: '10000310',
      pid: '10000700',
      title: 'Swiatek, I v Sabalenka, A',
      sport: 'TENNIS',
      date: '15 Jun 2026 07:00 PM',
      status: 'Upcoming'
    },
    {
      id: '10000311',
      pid: '10000701',
      title: 'Real Madrid v Barcelona',
      sport: 'SOCCER',
      date: '14 Jun 2026 11:00 PM',
      liveReportUrl: 'true',
      status: 'Inplay'
    },
    {
      id: '10000312',
      pid: '10000702',
      title: 'Manchester City v Arsenal',
      sport: 'SOCCER',
      date: '16 Jun 2026 09:30 AM',
      status: 'Upcoming'
    }
  ];

  // Fetch from the backend proxy
  React.useEffect(() => {
    const fetchLiveMatches = async () => {
      setLocalLoading(true);
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
              liveReportUrl: m.matchStarted || m.ms === "live" || m.status?.toLowerCase() === "live" ? 'true' : undefined,
              status: m.status || m.ms,
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
        setLocalLoading(false);
      }
    };
    
    fetchLiveMatches();
  }, []);

  // In a real app we'd filter based on state - assuming 'liveReportUrl' field implies 'inplay' for mockup purposes, or parse date.
  // We'll mock it so that matches with liveReportUrl are "Inplay" and others "Upcoming".
  const filteredMatches = matches
    .filter(m => m.sport.toLowerCase() === sportType)
    .filter(m => {
      let isToday = false;
      let isPast = false;
      let isFuture = false;

      if (m.date) {
        const matchDate = new Date(m.date);
        if (!isNaN(matchDate.getTime())) {
          const todayDate = new Date();
          // We set both to midnight to compare days accurately
          const matchDateMidnight = new Date(matchDate).setHours(0, 0, 0, 0);
          const todayDateMidnight = new Date(todayDate).setHours(0, 0, 0, 0);

          isToday = matchDateMidnight === todayDateMidnight;
          isPast = matchDateMidnight < todayDateMidnight;
          isFuture = matchDateMidnight > todayDateMidnight;
        } else {
          // Fallback if date is unparseable (e.g. 'Update Pending') -> consider it future for now
          isFuture = true;
        }
      }

      const isCompleted = m.status?.toLowerCase().includes('ended') || m.status?.toLowerCase().includes('complete') || m.status?.toLowerCase().includes('result') || m.status?.toLowerCase().includes('won') || m.status?.toLowerCase().includes('stumps') || m.status?.toLowerCase().includes('abandoned') || m.title?.toLowerCase().includes(' won ');
      
      const isLive = m.status?.toLowerCase() === 'live' || m.status?.toLowerCase() === 'inplay' || m.status?.toLowerCase().includes('started');
      
      // A match is actually completed if it meets the string condition OR if it was played strictly on a past day
      const isActuallyCompleted = isCompleted || isPast;

      if (matchType === 'inplay') {
        // Show in "Inplay" if it's TODAY and not completed
        // OR if it's explicitly Live/Inplay from status and not completed
        return (isToday || isLive || m.liveReportUrl) && !isActuallyCompleted;
      } else {
        // Show in "Upcoming" if it's FUTURE and not completed
        // OR if it's today but not marked as Live/Inplay (but we can simplify: if it's not today/live and not completed)
        return isFuture || (!isToday && !isLive && !isActuallyCompleted);
      }
    });

  const isCurrentMarketBlocked = !status[sportType];


  return (
    <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-6">
      {/* Title & Breadcrumbs */}
      <div>
        <h2 className="text-2xl font-semibold text-white">Matches</h2>
        <div className="text-sm text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-400">/</span>
          <span className="text-slate-200 font-medium">Matches</span>
        </div>
      </div>

      <div className="bg-[#05100a] rounded-xl border border-\(--primary\)/20 shadow-sm overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#62a2a3] px-4 py-3 border-b border-\(--primary\)/20 flex justify-between items-center">
          <h3 className="font-semibold text-white">All Matches</h3>
          {apiError && (
             <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded font-medium border border-red-500/30">
               ⚠️ {apiError} (Showing Mock Data)
             </span>
          )}
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
          <div className="overflow-x-auto border border-\(--primary\)/20 rounded mt-4">
            {marketLoading ? (
              <div className="flex flex-col gap-2 p-4">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-12 w-full bg-\(--primary\)/5 animate-pulse rounded border border-\(--primary\)/10"></div>
                ))}
              </div>
            ) : isCurrentMarketBlocked ? (
              <div className="flex flex-col items-center justify-center p-12 bg-[#05100a] text-center space-y-4">
                <Ban className="w-16 h-16 text-red-500" />
                <h2 className="text-2xl font-bold text-white tracking-wide">
                  {sportType.charAt(0).toUpperCase() + sportType.slice(1)} Market is Suspended
                </h2>
                <p className="text-slate-400">
                  This market has been blocked by the administrator. Matches are not available right now.
                </p>
              </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-[#020503] text-slate-300 text-xs uppercase border-b border-\(--primary\)/20">
                  <tr>
                    <th className="px-4 py-3 font-semibold border-r border-\(--primary\)/20">ID</th>
                    <th className="px-4 py-3 font-semibold border-r border-\(--primary\)/20">PID</th>
                    <th className="px-4 py-3 font-semibold border-r border-\(--primary\)/20">Title</th>
                    <th className="px-4 py-3 font-semibold border-r border-\(--primary\)/20">Sport</th>
                    <th className="px-4 py-3 font-semibold border-r border-\(--primary\)/20">DATE</th>
                    <th className="px-4 py-3 font-semibold text-center">Profit / Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-\(--primary\)/20">
                  {localLoading ? (
                    <>
                      {[1,2,3,4,5].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td className="px-4 py-3"><div className="h-4 bg-\(--primary\)/10 rounded w-16"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-\(--primary\)/10 rounded w-16"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-\(--primary\)/10 rounded w-48"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-\(--primary\)/10 rounded w-20"></div></td>
                          <td className="px-4 py-3"><div className="h-4 bg-\(--primary\)/10 rounded w-24"></div></td>
                          <td className="px-4 py-3"><div className="h-8 bg-\(--primary\)/10 rounded w-full"></div></td>
                        </tr>
                      ))}
                    </>
                  ) : filteredMatches.length > 0 ? (
                    filteredMatches.map((match, idx) => (
                      <tr key={idx} className="hover:bg-[#020503]/50 transition-colors">
                        <td className="px-4 py-3 text-slate-300 border-r border-\(--primary\)/20 text-xs">{match.id}</td>
                        <td className="px-4 py-3 text-slate-300 border-r border-\(--primary\)/20 text-xs">{match.pid}</td>
                        <td className="px-4 py-3 font-medium text-\(--primary\) hover:text-blue-700 cursor-pointer border-r border-\(--primary\)/20">
                          {match.title}
                        </td>
                        <td className="px-4 py-3 text-slate-300 border-r border-\(--primary\)/20">{match.sport}</td>
                        <td className="px-4 py-3 text-slate-300 flex items-center space-x-1 border-r border-\(--primary\)/20">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          <span>{match.date}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {matchType === 'inplay' && (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
