import React, { useState } from 'react';
import { RefreshCcw, Monitor, TrendingUp, AlertCircle, ChevronRight, Activity, ShieldCheck, ChevronDown, Plus } from 'lucide-react';

const matchOdds = [
  { runner: "Somerset", lagai: "26", khai: "27.50", position: "0.0" },
  { runner: "Glamorgan", lagai: "344", khai: "384.00", position: "0.0" }
];

const pendingSessions = [
  { session: "11 over run GLA", no: 97, rate1: 1.00, yes: 98, rate2: 1.00, posNo: 0.00, posYes: 0.00 },
  { session: "12 over run GLA", no: 106, rate1: 1.00, yes: 107, rate2: 1.00, posNo: 0.00, posYes: 0.00 },
  { session: "Only 11 over run GLA", no: 9, rate1: 1.00, yes: 10, rate2: 1.00, posNo: 0.00, posYes: 0.00 },
  { session: "10 over run GLA", no: 88, rate1: 1.10, yes: 88, rate2: 0.90, posNo: 0.00, posYes: 0.00 },
  { session: "15 over run GLA", no: 133, rate1: 1.00, yes: 135, rate2: 1.00, posNo: 0.00, posYes: 0.00 },
  { session: "1st 4 wkt runs GLA", no: 98, rate1: 1.10, yes: 98, rate2: 0.90, posNo: 0.00, posYes: 0.00 },
  { session: "Fall of 5th wkt GLA", no: 124, rate1: 1.10, yes: 124, rate2: 0.90, posNo: 0.00, posYes: 0.00 },
  { session: "Fall of 6th wkt GLA", no: null, rate1: null, yes: null, rate2: null, posNo: 0.00, posYes: 0.00 },
  { session: "4th wkt pship boundaries GLA", no: 5, rate1: 1.00, yes: 6, rate2: 1.00, posNo: 0.00, posYes: 0.00 },
  { session: "A Tribe run", no: 27, rate1: 1.10, yes: 27, rate2: 0.90, posNo: 0.00, posYes: 0.00 },
  { session: "20 over run GLA.", no: 181, rate1: 1.00, yes: 183, rate2: 1.00, posNo: 0.00, posYes: 0.00 }
];

interface LiveMatchReportProps {
  matchData?: any;
  onNavigateBack?: () => void;
  onGoToDashboard?: () => void;
}

export default function LiveMatchReport({ matchData, onNavigateBack, onGoToDashboard }: LiveMatchReportProps) {
  const [activeTab, setActiveTab] = useState<'match' | 'fancy'>('match');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(false);

  const [balance, setBalance] = useState(10000);
  const [selectedBet, setSelectedBet] = useState<{selection: string, odds: string, type: 'back'|'lay'} | null>(null);
  const [betAmount, setBetAmount] = useState('100');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betHistory, setBetHistory] = useState<any[]>([]);

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBet) return;
    
    const amountNum = parseFloat(betAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    if (amountNum > balance) {
      alert("Insufficient balance");
      return;
    }

    setIsPlacingBet(true);
    
    // Simulate API call for bet result
    setTimeout(() => {
      const isWin = Math.random() < 0.49;
      const oddsNum = parseFloat(selectedBet.odds);
      const profit = isWin ? amountNum * (oddsNum - 1) : -amountNum;
      
      setBalance((prev: number) => prev + profit);
      
      const newBet = {
        id: Math.random().toString(36).substr(2, 9),
        selection: selectedBet.selection,
        amount: amountNum,
        odds: selectedBet.odds,
        status: isWin ? 'won' : 'lost',
        profit: profit,
        time: new Date().toLocaleTimeString(),
        type: selectedBet.type
      };
      
      setBetHistory((prev: any[]) => [newBet, ...prev]);
      setIsPlacingBet(false);
      setSelectedBet(null);
    }, 1500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const matchTitle = matchData?.title || 'Team 1 vs Team 2';
  const displayTitle = matchData?.title;
  let teams = ['Team A', 'Team B'];
  if (matchTitle.includes(' v ')) {
    teams = matchTitle.split(' v ');
  } else if (matchTitle.includes(' vs ')) {
    teams = matchTitle.split(' vs ');
  } else if (matchTitle.includes(',')) {
    teams = matchTitle.split(',');
  }
  const team1 = matchData?.t1 || (teams[0] ? teams[0].trim() : 'Team A');
  const team2 = matchData?.t2 || (teams[1] ? teams[1].trim() : 'Team B');

  const team1ScoreFull = matchData?.t1s || "0/0 (0.0)";
  const team2ScoreFull = matchData?.t2s || "0/0 (0.0)";
  
  // Format score components
  const parseScore = (scoreStr: string) => {
    const match = scoreStr.match(/([\d]+)\/([\d]+).*?\(([\d.]+)\)/);
    if (match) {
        return { run: match[1], wkt: match[2], over: match[3] };
    }
    // simple fallback
    return { run: scoreStr.split('/')[0] || "0", wkt: scoreStr.split('/')[1]?.split(' ')[0] || "0", over: scoreStr.includes('(') ? scoreStr.split('(')[1].replace(')', '') : "0.0" };
  };

  const t1Parsed = parseScore(team1ScoreFull);
  const t2Parsed = parseScore(team2ScoreFull);

  const dynamicMatchOdds = [
    { runner: team1, lagai: "26", khai: "27.50", position: "0.0" },
    { runner: team2, lagai: "344", khai: "384.00", position: "0.0" }
  ];

  const team2Abbr = team2.substring(0, 3).toUpperCase();
  const dynamicPendingSessions = [
    { session: `11 over run ${team2Abbr}`, no: 97, rate1: 1.00, yes: 98, rate2: 1.00, posNo: 0.00, posYes: 0.00 },
    { session: `12 over run ${team2Abbr}`, no: 106, rate1: 1.00, yes: 107, rate2: 1.00, posNo: 0.00, posYes: 0.00 },
    { session: `Only 11 over run ${team2Abbr}`, no: 9, rate1: 1.00, yes: 10, rate2: 1.00, posNo: 0.00, posYes: 0.00 },
    { session: `10 over run ${team2Abbr}`, no: 88, rate1: 1.10, yes: 88, rate2: 0.90, posNo: 0.00, posYes: 0.00 },
    { session: `15 over run ${team2Abbr}`, no: 133, rate1: 1.00, yes: 135, rate2: 1.00, posNo: 0.00, posYes: 0.00 },
    { session: `1st 4 wkt runs ${team2Abbr}`, no: 98, rate1: 1.10, yes: 98, rate2: 0.90, posNo: 0.00, posYes: 0.00 },
    { session: `Fall of 5th wkt ${team2Abbr}`, no: 124, rate1: 1.10, yes: 124, rate2: 0.90, posNo: 0.00, posYes: 0.00 },
    { session: `Fall of 6th wkt ${team2Abbr}`, no: null, rate1: null, yes: null, rate2: null, posNo: 0.00, posYes: 0.00 },
    { session: `4th wkt pship boundaries ${team2Abbr}`, no: 5, rate1: 1.00, yes: 6, rate2: 1.00, posNo: 0.00, posYes: 0.00 },
    { session: `Total Run`, no: 27, rate1: 1.10, yes: 27, rate2: 0.90, posNo: 0.00, posYes: 0.00 },
    { session: `20 over run ${team2Abbr}`, no: 181, rate1: 1.00, yes: 183, rate2: 1.00, posNo: 0.00, posYes: 0.00 }
  ];

  return (
    <div className="p-4 lg:p-8 max-w-350 mx-auto space-y-6 font-sans text-sm pb-16">
      
      {/* Alert Banner / Ticker */}
      <div className="bg-linear-to-r from-[#00ff88]/10 to-[#020503] border border-[#00ff88]/20 rounded-xl px-4 py-3 flex items-center shadow-sm text-slate-200 overflow-hidden mb-6">
        <div className="bg-[#00ff88]/20 p-1.5 rounded mr-3 shrink-0 border border-[#00ff88]/30">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse block shadow-[0_0_8px_rgba(0,255,136,1)]"></span>
        </div>
        <div className="flex-1 overflow-hidden relative h-6">
            <div className="absolute whitespace-nowrap text-sm font-medium animate-[marquee_25s_linear_infinite] font-exo flex items-center gap-8 text-[#00ff88]">
              {matchData ? (
                <>
                   <span>🏏 <span className="font-bold text-white">{team1}</span> <span className="text-[#f0b429]">{team1ScoreFull}</span> vs <span className="font-bold text-white">{team2}</span> <span className="text-[#f0b429]">{team2ScoreFull}</span></span>
                   <span className="text-[#00ff88]/50 font-bold">•</span>
                   <span>Status: {matchData.status || 'Live in play'}</span>
                </>
              ) : (
                <span>Fetching live updates...</span>
              )}
            </div>
        </div>
      </div>

      {/* Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-emerald-500" />
            Live Match Report
          </h2>
          <div className="text-sm text-slate-400 mt-2 flex items-center space-x-2 font-medium">
            <button onClick={onGoToDashboard} className="hover:text-slate-200 transition-colors">Dashboard</button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <button onClick={onNavigateBack} className="hover:text-slate-200 transition-colors">Matches</button>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-emerald-600 truncate max-w-50 sm:max-w-xs">{matchTitle || 'Live Report'}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#05100a] px-5 py-2.5 rounded-lg border border-[#00ff88]/20 shadow-sm mt-4 sm:mt-0">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Balance</span>
            <span className="text-lg font-bold text-white leading-none">₹{balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        
        {/* Left/Main Content Column */}
        <div className="xl:col-span-3 space-y-6">
          
          {/* Main Live Score Card */}
          <div className="bg-linear-to-br from-slate-900 to-slate-800 rounded-2xl shadow-lg relative overflow-hidden border border-slate-700">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
            
            <div className="relative p-6 px-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1 text-center md:text-left z-10 w-full">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Batting</p>
                <h3 className="text-white text-3xl font-bold tracking-tight">{team1}</h3>
                <div className="mt-2 text-emerald-400 font-mono text-2xl font-semibold bg-emerald-500/10 inline-block px-4 py-1 rounded-lg border border-emerald-500/20">
                  {t1Parsed.run}<span className="text-emerald-500/70 text-lg">/{t1Parsed.wkt}</span> <span className="text-slate-400 text-base font-sans">({t1Parsed.over})</span>
                </div>
              </div>
              
              <div className="flex flex-col items-center justify-center shrink-0 w-full md:w-auto">
                <div className="px-5 py-2 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold tracking-widest uppercase text-xs animate-pulse mb-3 flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.2)]">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Live
                </div>
                <div className="text-slate-400 font-bold italic text-sm">VS</div>
              </div>

              <div className="flex-1 text-center md:text-right z-10 w-full">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Bowling</p>
                <h3 className="text-white text-3xl font-bold tracking-tight">{team2}</h3>
                <div className="mt-2 text-rose-400 font-mono text-2xl font-semibold bg-rose-500/10 inline-block px-4 py-1 rounded-lg border border-rose-500/20">
                  {t2Parsed.run}<span className="text-rose-500/70 text-lg">/{t2Parsed.wkt}</span> <span className="text-slate-400 text-base font-sans">({t2Parsed.over})</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-950/50 backdrop-blur-md px-6 py-3 border-t border-slate-700/50 flex justify-between items-center text-slate-300 text-sm">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                <span className="font-medium text-slate-200 shadow-sm px-2 py-0.5 bg-[#00ff88]/100/20 rounded text-xs border border-[#00ff88]/30">Ball Chalu</span>
              </div>
              <button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                className={`flex items-center gap-2 hover:text-white transition-colors p-1.5 rounded-lg ${isRefreshing ? 'text-slate-400 cursor-default' : 'hover:bg-slate-800'}`}
              >
                <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} /> <span className="font-medium">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => setActiveTab('match')}
              className={`p-3 rounded-xl font-semibold text-sm transition-all focus:outline-none ${activeTab === 'match' ? 'bg-[#05100a] text-[#00ff88] shadow-sm border-2 border-[#00ff88]/20' : 'bg-[#00ff88]/5 text-slate-400 hover:bg-[#00ff88]/20 border-2 border-transparent'}`}
            >
              Blk. Match Odds
            </button>
            <button 
              onClick={() => setActiveTab('fancy')}
              className={`p-3 rounded-xl font-semibold text-sm transition-all focus:outline-none ${activeTab === 'fancy' ? 'bg-[#05100a] text-[#00ff88] shadow-sm border-2 border-[#00ff88]/20' : 'bg-[#00ff88]/5 text-slate-400 hover:bg-[#00ff88]/20 border-2 border-transparent'}`}
            >
              Blk. Fancy
            </button>
          </div>

          {/* Match Odds Section */}
          {activeTab === 'match' && (
            <div className="bg-[#05100a] rounded-2xl shadow-sm border border-[#00ff88]/20 overflow-hidden animate-in fade-in duration-300">
              <div className="bg-[#020503] px-5 py-4 border-b border-[#00ff88]/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-indigo-500" />
                  <h4 className="font-bold text-white text-base">Match Odds</h4>
                </div>
                <div className="flex items-center gap-3">
                   <span className="text-xs font-semibold text-slate-400 bg-slate-200/50 px-2 py-1 rounded">Min: 100</span>
                   <span className="text-xs font-semibold text-slate-400 bg-slate-200/50 px-2 py-1 rounded">Max: 200,000</span>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-[#00ff88]/5/50 border-b border-[#00ff88]/20">
                      <th className="px-5 py-3 font-semibold text-slate-300 w-1/3">Runner</th>
                      <th className="px-2 py-3 font-semibold text-center text-[#00ff88] w-1/4">Back (Lagai)</th>
                      <th className="px-2 py-3 font-semibold text-center text-rose-500 w-1/4">Lay (Khai)</th>
                      <th className="px-5 py-3 font-semibold text-slate-300 text-right">Position</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#00ff88]/20">
                    {dynamicMatchOdds.map((r, idx) => (
                      <tr key={idx} className="hover:bg-[#020503] transition-colors">
                        <td className="px-5 py-4 font-bold text-white flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                           {r.runner}
                        </td>
                        <td className="p-2">
                          <div 
                            onClick={() => r.lagai !== "0" && setSelectedBet({selection: r.runner, odds: r.lagai, type: 'back'})}
                            className={`rounded-lg flex items-center justify-center h-12 transition-colors ${r.lagai !== "0" ? 'bg-blue-100 hover:bg-blue-200 cursor-pointer border border-blue-300' : 'bg-[#00ff88]/5/50'}`}
                          >
                            <span className={`font-bold text-base ${r.lagai !== "0" ? 'text-blue-700' : 'text-slate-400'}`}>{r.lagai !== "0" ? r.lagai : '-'}</span>
                          </div>
                        </td>
                        <td className="p-2">
                          <div 
                            onClick={() => r.khai !== "0" && setSelectedBet({selection: r.runner, odds: r.khai, type: 'lay'})}
                            className={`rounded-lg flex items-center justify-center h-12 transition-colors ${r.khai !== "0" ? 'bg-rose-100 hover:bg-rose-200 cursor-pointer border border-rose-300' : 'bg-[#00ff88]/5/50'}`}
                          >
                            <span className={`font-bold text-base ${r.khai !== "0" ? 'text-rose-700' : 'text-slate-400'}`}>{r.khai !== "0" ? r.khai : '-'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-200 text-right">
                          <span className="bg-[#00ff88]/5 px-3 py-1.5 rounded-lg border border-[#00ff88]/20">{r.position}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pending Sessions Section */}
          {activeTab === 'fancy' && (
            <div className="bg-[#05100a] rounded-2xl shadow-sm border border-[#00ff88]/20 overflow-hidden animate-in fade-in duration-300">
              <div className="bg-[#020503] px-5 py-4 border-b border-[#00ff88]/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-500" />
                  <h4 className="font-bold text-white text-base uppercase tracking-tight">Pending Sessions (Fancy)</h4>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-[#00ff88]/5/50 border-b border-[#00ff88]/20">
                    <th className="px-5 py-3 font-semibold text-slate-300 w-1/3">Session Name</th>
                    <th className="px-2 py-3 font-semibold text-center text-rose-500">No (Lay)</th>
                    <th className="px-2 py-3 font-semibold text-center text-slate-400">Rate</th>
                    <th className="px-2 py-3 font-semibold text-center text-[#00ff88]">Yes (Back)</th>
                    <th className="px-2 py-3 font-semibold text-center text-slate-400">Rate</th>
                    <th className="px-4 py-3 font-semibold text-center text-slate-300">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#00ff88]/20">
                  {dynamicPendingSessions.map((s, i) => (
                    <tr key={i} className="hover:bg-[#020503] transition-colors group">
                      <td className="px-5 py-3 font-medium text-slate-200 border-r border-[#00ff88]/20">
                        {s.session}
                        <div className="text-[10px] text-slate-400 mt-0.5">Pos NO: {s.posNo.toFixed(2)} | Pos YES: {s.posYes.toFixed(2)}</div>
                      </td>
                      <td className="p-1.5">
                        <div 
                           onClick={() => s.no && setSelectedBet({selection: s.session, odds: (s.rate1 || 1.0).toString(), type: 'lay'})}
                           className={`h-10 rounded border flex items-center justify-center font-bold text-sm cursor-pointer transition-colors ${s.no ? 'bg-rose-100 border-rose-300 text-rose-700 hover:bg-rose-200' : 'bg-[#020503] border-[#00ff88]/20 text-slate-400'}`}>
                          {s.no || '-'}
                        </div>
                      </td>
                      <td className="p-1.5 border-r border-[#00ff88]/20">
                        <div className="h-10 flex items-center justify-center font-bold text-slate-300">
                          {s.rate1 !== null ? s.rate1.toFixed(2) : '-'}
                        </div>
                      </td>
                      <td className="p-1.5">
                        <div 
                           onClick={() => s.yes && setSelectedBet({selection: s.session, odds: (s.rate2 || 1.0).toString(), type: 'back'})}
                           className={`h-10 rounded border flex items-center justify-center font-bold text-sm cursor-pointer transition-colors ${s.yes ? 'bg-blue-100 border-blue-300 text-blue-700 hover:bg-blue-200' : 'bg-[#020503] border-[#00ff88]/20 text-slate-400'}`}>
                          {s.yes || '-'}
                        </div>
                      </td>
                      <td className="p-1.5 border-r border-[#00ff88]/20">
                        <div className="h-10 flex items-center justify-center font-bold text-slate-300">
                          {s.rate2 !== null ? s.rate2.toFixed(2) : '-'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button className="bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-sm transition-colors uppercase tracking-wider">
                          Position
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          )}

        </div>

        {/* Right Sidebar (Sidebar Widgets) */}
        <div className="xl:col-span-1 space-y-6">
          
          {/* Bet Slip (Inline) */}
          {selectedBet ? (
             <div className="bg-[#05100a] rounded-xl shadow-lg border-2 border-indigo-500 overflow-hidden transform transition-all animate-in slide-in-from-right-4">
               <div className={`px-4 py-3 flex items-center justify-between text-white ${selectedBet.type === 'back' ? 'bg-[#00ff88]/20' : 'bg-rose-500'}`}>
                 <h3 className="font-bold flex items-center gap-2">
                   Place Bet
                 </h3>
                 <button onClick={() => setSelectedBet(null)} className="hover:bg-[#05100a]/20 p-1 rounded-full text-white/80 hover:text-white transition-colors">
                   <ChevronRight className="w-4 h-4" />
                 </button>
               </div>
               
               <form onSubmit={handlePlaceBet} className="p-5 space-y-4">
                  <div className="bg-[#020503] p-3 rounded-lg border border-[#00ff88]/20">
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">Selection</p>
                    <p className="font-bold text-white">{selectedBet.selection}</p>
                  </div>
                  
                  <div className={`flex justify-between items-center p-3 rounded-lg border ${selectedBet.type === 'back' ? 'bg-[#00ff88]/10/50 border-blue-100' : 'bg-rose-50/50 border-rose-100'}`}>
                    <span className={`text-sm font-semibold ${selectedBet.type === 'back' ? 'text-blue-700' : 'text-rose-700'}`}>Odds</span>
                    <span className={`text-lg font-bold ${selectedBet.type === 'back' ? 'text-blue-700' : 'text-rose-700'}`}>{selectedBet.odds}</span>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-200 mb-2">Stake Amount (₹)</label>
                    <input 
                       type="number" 
                       value={betAmount}
                       onChange={(e: any) => setBetAmount(e.target.value)}
                       min="1"
                       className="w-full p-3 bg-[#05100a] border border-[#00ff88]/30 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none text-lg font-bold"
                       placeholder="Enter amount"
                       disabled={isPlacingBet}
                    />
                  </div>
                  
                  {/* Quick amounts */}
                  <div className="grid grid-cols-4 gap-2">
                     {[100, 500, 1000, 5000].map(amt => (
                       <button 
                         key={amt}
                         type="button"
                         onClick={() => setBetAmount(amt.toString())}
                         className="py-1.5 bg-[#00ff88]/5 hover:bg-[#00ff88]/20 text-slate-200 font-semibold rounded text-xs transition-colors"
                         disabled={isPlacingBet}
                       >
                         +{amt}
                       </button>
                     ))}
                  </div>

                  <div className="pt-2 border-t border-[#00ff88]/20 space-y-1">
                     <div className="flex justify-between text-sm">
                       <span className="text-slate-400">Possible Return:</span>
                       <span className="font-bold text-emerald-600">
                          ₹{betAmount && !isNaN(parseFloat(betAmount)) 
                             ? (parseFloat(betAmount) * parseFloat(selectedBet.odds)).toFixed(2) 
                             : '0.00'}
                       </span>
                     </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isPlacingBet || !betAmount || isNaN(parseFloat(betAmount))}
                    className={`w-full py-3.5 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 ${selectedBet.type === 'back' ? 'bg-[#00ff88]/20 hover:bg-[#00ff88]/30' : 'bg-rose-500 hover:bg-rose-600'}`}
                  >
                    {isPlacingBet ? (
                      'Processing...'
                    ) : (
                      'Confirm Bet'
                    )}
                  </button>
               </form>
             </div>
          ) : null}

          <div className="bg-[#05100a] rounded-2xl shadow-sm border border-[#00ff88]/20 overflow-hidden flex flex-col min-h-75">
             <div className="bg-slate-800 px-4 py-3 text-white font-semibold flex justify-between items-center text-sm">
               Matched Bets ({betHistory.length})
             </div>
             <div className="flex-1 overflow-y-auto p-0">
                {betHistory.length > 0 ? (
                  <div className="divide-y divide-[#00ff88]/20">
                    {betHistory.map((bet: any) => (
                      <div key={bet.id} className="p-4 hover:bg-[#020503] transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold text-white">{bet.selection}</span>
                            <span className={`text-xs ml-2 font-bold px-1.5 py-0.5 rounded ${bet.type === 'back' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}`}>{bet.type === 'back' ? 'BACK' : 'LAY'}</span>
                            <span className="text-slate-400 text-xs ml-2">@{bet.odds}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">{bet.time}</span>
                        </div>
                        <div className="flex justify-between items-end mt-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Stake</span>
                            <span className="font-bold text-slate-200">₹{bet.amount.toFixed(2)}</span>
                          </div>
                          
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Result</span>
                            <span className={`font-bold ${bet.profit > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                               {bet.profit > 0 ? '+' : ''}{bet.profit.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#020503]/50">
                    <span className="text-slate-400 text-sm font-medium">No matched bets available.</span>
                  </div>
                )}
             </div>
          </div>

          <div className="bg-[#05100a] rounded-2xl shadow-sm border border-[#00ff88]/20 overflow-hidden">
             <div className="bg-indigo-600 px-4 py-3 text-white font-semibold flex justify-between items-center text-sm">
               Other Active Matches
               <ChevronDown className="w-4 h-4 text-indigo-300" />
             </div>
             <div className="divide-y divide-[#00ff88]/20 max-h-100 overflow-y-auto custom-scrollbar p-5 flex flex-col items-center text-center">
                 <span className="text-slate-400 text-sm font-medium">Please view the Dashboard for other matches.</span>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
