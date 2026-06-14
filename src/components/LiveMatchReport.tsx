import React, { useState, useEffect, useRef } from 'react';
import { RefreshCcw, Monitor, TrendingUp, AlertCircle, ChevronRight, Activity, ShieldCheck, ChevronDown, Plus, TrendingDown } from 'lucide-react';

interface LiveMatchReportProps {
  matchData?: any;
  onNavigateBack?: () => void;
  onGoToDashboard?: () => void;
}

export default function LiveMatchReport({ matchData, onNavigateBack, onGoToDashboard }: LiveMatchReportProps) {
  const [activeTab, setActiveTab] = useState<'match' | 'fancy'>('match');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    import('firebase/auth').then(({ getAuth }) => {
      const auth = getAuth();
      if (!auth.currentUser) return;
      import('firebase/firestore').then(({ getFirestore, doc, onSnapshot }) => {
        const db = getFirestore();
        const unsub = onSnapshot(doc(db, 'users', auth.currentUser!.uid), (docSn) => {
          if (docSn.exists()) {
             setBalance(Number(docSn.data()?.balance || 0));
          }
        });
        return () => unsub();
      });
    });
  }, []);

  const updateBalanceDB = async (amount: number) => {
    try {
      const { getAuth } = await import('firebase/auth');
      const { getFirestore, doc, updateDoc, increment } = await import('firebase/firestore');
      const auth = getAuth();
      if (!auth.currentUser) return;
      const db = getFirestore();
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        balance: increment(amount)
      });
    } catch (e) {
      console.error(e);
    }
  };

  const [selectedBet, setSelectedBet] = useState<{selection: string, odds: string, type: 'back'|'lay'} | null>(null);
  const [betAmount, setBetAmount] = useState('100');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betHistory, setBetHistory] = useState<any[]>([]);

  const matchTitle = matchData?.title || 'Team 1 vs Team 2';
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
  
  const parseScore = (scoreStr: string) => {
    if (!scoreStr || scoreStr === "0/0 (0.0)") return { run: "0", wkt: "0", over: "0.0", raw: "" };
    
    let run = "0";
    let wkt = "0";
    let over = "0.0";

    const runWktMatch = scoreStr.match(/(\d+)[\/\-](\d+|all out)/i);
    if (runWktMatch) {
        run = runWktMatch[1];
        wkt = runWktMatch[2].toLowerCase() === 'all out' ? '10' : runWktMatch[2];
    } else {
        const justRuns = scoreStr.match(/(\d+)/);
        if (justRuns) run = justRuns[1];
    }

    const ovMatch = scoreStr.match(/\(([^)]+)\)/);
    if (ovMatch) {
       const ovNum = ovMatch[1].match(/[\d.]+/);
       if (ovNum) over = ovNum[0];
    } else {
        const ovFallback = scoreStr.match(/([\d.]+)\s*(?:ov|overs)/i);
        if (ovFallback) over = ovFallback[1];
    }

    // if we couldn't parse runs at all, just use the string as raw
    if (run === "0" && !scoreStr.includes("0")) {
        return { run: "0", wkt: "0", over: "0.0", raw: scoreStr };
    }

    return { run, wkt, over, raw: "" };
  };

  const initialT1 = parseScore(team1ScoreFull);
  const initialT2 = parseScore(team2ScoreFull);

  const team2Abbr = team2.substring(0, 3).toUpperCase();

  const [t1Summary, setT1Summary] = useState(initialT1);
  const [t2Summary, setT2Summary] = useState(initialT2);
  const [recentBalls, setRecentBalls] = useState<string[]>(['.', '1', '1', '2', '4', 'W']);
  const [marketOdds, setMarketOdds] = useState([
    { runner: team1, lagai: "1.92", khai: "1.94", position: "0.0", changeStatus: "" },
    { runner: team2, lagai: "2.04", khai: "2.06", position: "0.0", changeStatus: "" }
  ]);
  const [fancySessions, setFancySessions] = useState([
    { session: `10 over run ${team2Abbr}`, no: 88, rate1: 1.10, yes: 88, rate2: 0.90, posNo: 0.00, posYes: 0.00 },
    { session: `15 over run ${team2Abbr}`, no: 133, rate1: 1.00, yes: 135, rate2: 1.00, posNo: 0.00, posYes: 0.00 },
    { session: `20 over run ${team2Abbr}`, no: 181, rate1: 1.00, yes: 183, rate2: 1.00, posNo: 0.00, posYes: 0.00 },
    { session: `Fall of 1st wkt ${team2Abbr}`, no: 24, rate1: 1.10, yes: 24, rate2: 0.90, posNo: 0.00, posYes: 0.00 },
    { session: `Total Run`, no: 177, rate1: 1.10, yes: 178, rate2: 0.90, posNo: 0.00, posYes: 0.00 }
  ]);
  const [lastEvent, setLastEvent] = useState<string>("Match in play");

  useEffect(() => {
    setT1Summary(parseScore(matchData?.t1s || "0/0 (0.0)"));
    setT2Summary(parseScore(matchData?.t2s || "0/0 (0.0)"));
  }, [matchData?.t1s, matchData?.t2s]);

  useEffect(() => {
    if (!matchData?.id) return;
    
    // Don't poll the API if this is a mock match (mock match IDs are 10000306, etc.)
    if (matchData.id.startsWith('10000') || String(matchData.pid).startsWith('10000')) {
        return;
    }
    
    // Periodically fetch live score to keep the report fully real-time
    const fetchRealTimeScore = async () => {
      try {
        const res = await fetch('/api/live-matches');
        const data = await res.json();
        if (data.success !== false && data.matches) {
          // Find our match
          const m = data.matches.find((img: any) => {
             if (img.id === matchData.id) return true;
             const generatedTitle = img.name || img.title || (img.t1 && img.t2 ? `${img.t1} vs ${img.t2}` : '');
             return generatedTitle === matchData.title || img.name === matchData.title;
          });
          
          if (m) {
             const t1Text = m.t1s || m.t1Score || (m.status?.includes(m.t1) ? m.status : "0/0 (0.0)");
             const t2Text = m.t2s || m.t2Score || "0/0 (0.0)";
             setT1Summary(parseScore(t1Text));
             setT2Summary(parseScore(t2Text));
             
             if (m.status) {
                 setLastEvent(m.status);
             }
          }
        }
      } catch (err) {
        // Just quietly suppress network errors (like 'Failed to fetch') if dev server restarts
      }
    };
    
    // Call once immediately, then setInterval
    fetchRealTimeScore();
    const interval = setInterval(fetchRealTimeScore, 8000); // 8 seconds
    return () => clearInterval(interval);
  }, [matchData?.id, matchData?.title]);

  useEffect(() => {
    const isLive = matchData?.status?.toLowerCase() === 'live' || matchData?.status?.toLowerCase() === 'inplay' || matchData?.liveReportUrl || true;
    if (!isLive) return;

    const intervalId = setInterval(() => {
      // We only simulate subtle odds fluctuation to keep the UI active
      // since the real API doesn't provide real ball-by-ball updates or odds here
      
      const outcomes = ['.', '1', '1', '2', '2', '4', '4', '6', 'W', 'Wd', '.'];
      const nextBall = outcomes[Math.floor(Math.random() * outcomes.length)];
      setRecentBalls(prev => [...prev.slice(-5), nextBall]);
      
      // Fluctuate match odds
      setMarketOdds(prevOdds => prevOdds.map(odd => {
         const isVolatile = Math.random() > 0.4; // more volatile
         if (isVolatile) {
           const change = (Math.random() * 0.1 - 0.05);
           const newLagai = Math.max(1.01, parseFloat(odd.lagai) + change);
           const newKhai = newLagai + 0.02; // Khai slightly higher
           return { ...odd, lagai: newLagai.toFixed(2), khai: newKhai.toFixed(2), changeStatus: change > 0 ? 'up' : 'down' };
         }
         return { ...odd, changeStatus: '' };
      }));

      // Fluctuate fancy sessions
      setFancySessions(prevSessions => prevSessions.map(session => {
         if (Math.random() > 0.4) {
             const diff = Math.floor(Math.random() * 3) - 1;
             const rateDiff = (Math.random() * 0.1 - 0.05);
             return {
                 ...session,
                 no: session.no ? Math.max(1, session.no + diff) : session.no,
                 yes: session.yes ? Math.max(1, session.yes + diff) : session.yes,
                 rate1: session.rate1 ? Math.max(0.5, session.rate1 + rateDiff) : 1.0,
                 rate2: session.rate2 ? Math.max(0.5, session.rate2 + rateDiff) : 1.0,
             };
         }
         return session;
      }));

    }, 3000); // update every 3 seconds for active betting look

    return () => clearInterval(intervalId);
  }, [matchData]);

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
    
    setTimeout(async () => {
      const isWin = Math.random() < 0.49;
      const oddsNum = parseFloat(selectedBet.odds);
      const profit = isWin ? amountNum * (oddsNum - 1) : -amountNum;
      
      await updateBalanceDB(profit);
      
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

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 font-sans text-sm pb-16">
      
      {/* Alert Banner / Ticker */}
      <div className="bg-linear-to-r from-[#00ff88]/10 to-[#020503] border border-[#00ff88]/20 rounded-xl px-4 py-3 flex items-center shadow-sm text-slate-200 overflow-hidden mb-6">
        <div className="bg-[#00ff88]/20 p-1.5 rounded mr-3 shrink-0 border border-[#00ff88]/30">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse block shadow-[0_0_8px_rgba(0,255,136,1)]"></span>
        </div>
        <div className="flex-1 overflow-hidden relative h-6">
            <div className="absolute whitespace-nowrap text-sm font-medium animate-[marquee_25s_linear_infinite] font-mono flex items-center gap-8 text-[#00ff88]">
              {matchData ? (
                <>
                   <span>🏏 <span className="font-bold text-white">{team1}</span> <span className="text-[#f0b429]">{t1Summary.raw || `${t1Summary.run}/${t1Summary.wkt}`}</span> vs <span className="font-bold text-white">{team2}</span> <span className="text-[#f0b429]">{t2Summary.raw || `${t2Summary.run}/${t2Summary.wkt}`}</span></span>
                   <span className="text-[#00ff88]/50 font-bold">•</span>
                   <span>Status: {lastEvent}</span>
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
          <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Activity className="w-7 h-7 text-emerald-500 animate-pulse" />
            Live Exchange Report
          </h2>
          <div className="text-sm text-slate-400 mt-2 flex items-center space-x-2 font-medium">
            <button onClick={onGoToDashboard} className="hover:text-slate-200 transition-colors">Dashboard</button>
            <ChevronRight className="w-4 h-4 text-slate-500" />
            <button onClick={onNavigateBack} className="hover:text-slate-200 transition-colors">Matches</button>
            <ChevronRight className="w-4 h-4 text-slate-500" />
            <span className="text-emerald-500 truncate max-w-50 sm:max-w-xs">{matchTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#05100a]/80 backdrop-blur-sm px-6 py-3 rounded-xl border border-[#00ff88]/20 shadow-sm mt-4 sm:mt-0">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Net Exposure</span>
            <span className="text-xl font-bold text-white leading-none">₹{balance.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left/Main Content Column */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Professional Live Score & Tracker Card */}
          <div className="bg-linear-to-br from-slate-900 to-[#020503] rounded-2xl shadow-xl overflow-hidden border border-[#00ff88]/30 relative">
            <div className="absolute top-0 inset-x-0 h-1 bg-linear-to-r from-transparent via-[#00ff88] to-transparent opacity-50"></div>
            
            <div className="p-6 md:p-8 flex flex-col items-center">
              <div className="flex w-full items-center justify-between z-10">
                {/* Team 1 */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col items-center md:items-start">
                    <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Batting
                    </span>
                    <h3 className="text-white text-2xl md:text-3xl font-extrabold tracking-tight">{team1}</h3>
                    <div className="mt-2 text-emerald-400 font-mono text-3xl md:text-4xl font-bold drop-shadow-md">
                      {t1Summary.raw ? t1Summary.raw : (
                        <>{t1Summary.run}<span className="text-emerald-500/70 text-2xl">/{t1Summary.wkt}</span></>
                      )}
                    </div>
                    {!t1Summary.raw && (
                      <div className="mt-1 text-slate-400 text-sm font-semibold max-w-max bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
                        Overs: <span className="text-slate-200">{t1Summary.over}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* VS Center */}
                <div className="flex flex-col items-center justify-center shrink-0 w-24">
                  <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-slate-700 bg-slate-800/50 mb-2 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                    <span className="text-slate-400 font-bold italic text-sm">VS</span>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 font-bold tracking-widest uppercase text-[10px] animate-pulse flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Live
                  </div>
                </div>

                {/* Team 2 */}
                <div className="flex-1 text-center md:text-right">
                  <div className="flex flex-col items-center md:items-end">
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-1">
                      Bowling
                    </span>
                    <h3 className="text-slate-300 text-2xl md:text-3xl font-bold tracking-tight">{team2}</h3>
                    <div className="mt-2 text-slate-500 font-mono text-3xl md:text-4xl font-bold opacity-60">
                      {t2Summary.raw ? t2Summary.raw : (
                         <>{t2Summary.run}<span className="text-slate-600 text-2xl">/{t2Summary.wkt}</span></>
                      )}
                    </div>
                    {!t2Summary.raw && (
                      <div className="mt-1 text-slate-500 text-sm font-semibold max-w-max bg-slate-800/20 px-3 py-1 rounded-full border border-slate-800/50">
                        Yet to Bat
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ball Tracker Banner */}
            <div className="bg-[#05100a] px-6 py-4 border-t border-[#00ff88]/20 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wider shrink-0">Recent Balls:</span>
                <div className="flex gap-2 font-mono">
                  {recentBalls.map((ball, i) => (
                    <span key={i} className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shadow-sm transition-all duration-300 ${
                      ball === 'W' || ball === 'Wd' ? 'bg-rose-500 text-white shadow-[0_0_8px_rgba(243,24,96,0.4)]' : 
                      ball === '4' || ball === '6' ? 'bg-indigo-500 text-white shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 
                      ball === '.' ? 'bg-slate-700 text-slate-300' :
                      'bg-slate-800 text-white border border-slate-600'
                    }`}>
                      {ball}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-slate-300 font-medium text-sm flex items-center gap-2">
                 <RefreshCcw className="w-4 h-4 text-[#00ff88] animate-spin-slow" />
                 Match Info: <span className="font-bold text-white">{lastEvent}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
            <button 
              onClick={() => setActiveTab('match')}
              className={`px-6 py-3 rounded-lg font-bold text-sm tracking-wide transition-all ${activeTab === 'match' ? 'bg-[#00ff88] text-slate-900 shadow-[0_0_15px_rgba(0,255,136,0.3)]' : 'bg-[#05100a] text-slate-400 hover:bg-[#00ff88]/10 border border-[#00ff88]/20'}`}
            >
              Match Odds
            </button>
            <button 
              onClick={() => setActiveTab('fancy')}
              className={`px-6 py-3 rounded-lg font-bold text-sm tracking-wide transition-all ${activeTab === 'fancy' ? 'bg-[#00ff88] text-slate-900 shadow-[0_0_15px_rgba(0,255,136,0.3)]' : 'bg-[#05100a] text-slate-400 hover:bg-[#00ff88]/10 border border-[#00ff88]/20'}`}
            >
              Fancy Markets
            </button>
          </div>

          {/* Match Odds Market Section */}
          {activeTab === 'match' && (
            <div className="bg-[#020503] border border-[#00ff88]/20 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-900 px-5 py-4 border-b border-[#00ff88]/20 flex justify-between items-center">
                <h4 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                   <TrendingUp className="w-4 h-4 text-[#00ff88]" /> Main Book
                </h4>
                <div className="flex space-x-2">
                   <span className="text-[10px] font-bold text-slate-400 bg-slate-800 px-2 py-1 rounded">Rule: Normal</span>
                </div>
              </div>
              
              <div className="w-full">
                <div className="grid grid-cols-12 bg-[#05100a] border-b border-[#00ff88]/20 text-xs font-bold text-slate-400 uppercase tracking-wider p-2">
                   <div className="col-span-6 px-3 py-2">Runner</div>
                   <div className="col-span-3 text-center px-1 py-2 text-cyan-300 bg-cyan-500/10 rounded-l">Back</div>
                   <div className="col-span-3 text-center px-1 py-2 text-rose-300 bg-rose-500/10 rounded-r">Lay</div>
                </div>
                
                <div className="divide-y divide-[#00ff88]/10">
                  {marketOdds.map((r, idx) => (
                    <div key={idx} className="grid grid-cols-12 hover:bg-slate-900/50 transition-colors p-2 items-center">
                      <div className="col-span-6 px-3 py-3">
                         <div className="font-extrabold text-white text-[15px]">{r.runner}</div>
                         <div className="text-xs font-semibold mt-1">
                            {parseInt(r.position) >= 0 ? 
                               <span className="text-emerald-500">+০.০০</span> : 
                               <span className="text-rose-500">-০.০০</span>
                            }
                         </div>
                      </div>
                      
                      <div className="col-span-3 p-1">
                        <div 
                           onClick={() => setSelectedBet({selection: r.runner, odds: r.lagai, type: 'back'})}
                           className={`h-11 rounded font-bold text-base flex flex-col items-center justify-center cursor-pointer transition-all ${r.changeStatus === 'up' ? 'bg-cyan-300 scale-105 shadow-md text-slate-900' : 'bg-[#72bbed] hover:bg-[#62aadd] text-slate-900'}`}
                        >
                           {r.lagai}
                           <span className="text-[9px] opacity-70">100K</span>
                        </div>
                      </div>

                      <div className="col-span-3 p-1">
                        <div 
                           onClick={() => setSelectedBet({selection: r.runner, odds: r.khai, type: 'lay'})}
                           className={`h-11 rounded font-bold text-base flex flex-col items-center justify-center cursor-pointer transition-all ${r.changeStatus === 'down' ? 'bg-rose-300 scale-105 shadow-md text-slate-900' : 'bg-[#faa9ba] hover:bg-[#e998a9] text-slate-900'}`}
                        >
                           {r.khai}
                           <span className="text-[9px] opacity-70">150K</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Fancy Market Section */}
          {activeTab === 'fancy' && (
            <div className="bg-[#020503] border border-[#00ff88]/20 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-900 px-5 py-4 border-b border-[#00ff88]/20 flex justify-between items-center">
                <h4 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                   <ShieldCheck className="w-4 h-4 text-[#00ff88]" /> Session Runs
                </h4>
              </div>
              
              <div className="w-full">
                 <div className="grid grid-cols-12 bg-[#05100a] border-b border-[#00ff88]/20 text-xs font-bold text-slate-400 uppercase tracking-wider p-2">
                   <div className="col-span-6 px-3 py-2">Session</div>
                   <div className="col-span-3 text-center px-1 py-2 text-rose-300 bg-rose-500/10 rounded-l">No</div>
                   <div className="col-span-3 text-center px-1 py-2 text-cyan-300 bg-cyan-500/10 rounded-r">Yes</div>
                </div>

                <div className="divide-y divide-[#00ff88]/10">
                  {fancySessions.map((s, idx) => (
                    <div key={idx} className="grid grid-cols-12 hover:bg-slate-900/50 transition-colors p-2 items-center">
                      <div className="col-span-6 px-3 py-2">
                         <div className="font-bold text-slate-200 text-sm leading-tight">{s.session}</div>
                         <div className="text-[10px] text-slate-500 font-semibold mt-1">Book: <span className="text-emerald-500 inline-block min-w-4 text-center">{s.posYes}</span> / <span className="text-rose-500 inline-block min-w-4 text-center">{s.posNo}</span></div>
                      </div>
                      
                      <div className="col-span-3 p-1">
                        {s.no ? (
                          <div 
                             onClick={() => setSelectedBet({selection: s.session, odds: (s.rate1 || 1.0).toString(), type: 'lay'})}
                             className={`h-11 rounded font-bold text-base flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#faa9ba] hover:bg-[#e998a9] text-slate-900`}
                          >
                             {s.no}
                             <span className="text-[9px] opacity-80">{s.rate1?.toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="h-11 flex items-center justify-center text-slate-600 bg-slate-900 rounded font-bold uppercase text-[10px] tracking-widest">Suspended</div>
                        )}
                      </div>

                      <div className="col-span-3 p-1">
                        {s.yes ? (
                          <div 
                             onClick={() => setSelectedBet({selection: s.session, odds: (s.rate2 || 1.0).toString(), type: 'back'})}
                             className={`h-11 rounded font-bold text-base flex flex-col items-center justify-center cursor-pointer transition-colors bg-[#72bbed] hover:bg-[#62aadd] text-slate-900`}
                          >
                             {s.yes}
                             <span className="text-[9px] opacity-80">{s.rate2?.toFixed(2)}</span>
                          </div>
                        ) : (
                          <div className="h-11 flex items-center justify-center text-slate-600 bg-slate-900 rounded font-bold uppercase text-[10px] tracking-widest">Suspended</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar (Bet Slip & Open Bets) */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* Bet Slip component */}
          {selectedBet ? (
             <div className="bg-[#05100a] rounded-xl shadow-xl border border-[#00ff88]/50 overflow-hidden transform transition-all animate-in zoom-in-95">
               <div className={`px-5 py-3.5 flex items-center justify-between text-slate-900 font-extrabold ${selectedBet.type === 'back' ? 'bg-[#72bbed]' : 'bg-[#faa9ba]'}`}>
                 <h3 className="flex items-center gap-2 uppercase tracking-wide text-sm">
                   {selectedBet.type === 'back' ? 'BACK (YES)' : 'LAY (NO)'} SLIP
                 </h3>
                 <button onClick={() => setSelectedBet(null)} className="hover:bg-black/10 p-1.5 rounded-full transition-colors text-slate-900">
                   <ChevronRight className="w-4 h-4" />
                 </button>
               </div>
               
               <form onSubmit={handlePlaceBet} className="p-5 space-y-5 bg-[#020503]">
                  <div>
                    <h4 className="font-extrabold text-white text-lg mb-1">{selectedBet.selection}</h4>
                    <p className="text-xs text-slate-400 capitalize">{activeTab} Market</p>
                  </div>
                  
                  <div className="flex gap-4">
                     <div className="flex-1">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Odds</label>
                        <div className={`p-3 rounded-lg border font-bold text-lg text-center ${selectedBet.type === 'back' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                           {selectedBet.odds}
                        </div>
                     </div>
                     <div className="flex-2">
                        <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">Stake (₹)</label>
                        <input 
                           type="number" 
                           value={betAmount}
                           onChange={(e: any) => setBetAmount(e.target.value)}
                           min="1"
                           className="w-full p-3 bg-slate-900 border border-[#00ff88]/30 rounded-lg focus:ring-1 focus:ring-[#00ff88] focus:border-[#00ff88] transition-shadow outline-none text-lg font-bold text-white text-center"
                           placeholder="0.00"
                           disabled={isPlacingBet}
                        />
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                     {[100, 500, 1000, 5000].map(amt => (
                       <button 
                         key={amt}
                         type="button"
                         onClick={() => setBetAmount(amt.toString())}
                         className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded shadow-sm text-xs transition-colors"
                         disabled={isPlacingBet}
                       >
                         {amt}
                       </button>
                     ))}
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 flex justify-between items-center text-sm">
                     <span className="text-slate-400 font-medium tracking-wide">Liability / Return:</span>
                     <span className="font-extrabold text-emerald-500 text-base">
                        ₹{betAmount && !isNaN(parseFloat(betAmount)) 
                           ? (parseFloat(betAmount) * (activeTab === 'match' ? parseFloat(selectedBet.odds) - 1 : parseFloat(selectedBet.odds))).toFixed(2) 
                           : '0.00'}
                     </span>
                  </div>

                  <button 
                    type="submit"
                    disabled={isPlacingBet || !betAmount || isNaN(parseFloat(betAmount))}
                    className="w-full py-3.5 bg-linear-to-r from-[#00ff88] to-emerald-400 hover:to-emerald-500 text-slate-900 font-extrabold text-sm uppercase tracking-widest rounded-lg transition-all shadow-[0_0_15px_rgba(0,255,136,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlacingBet ? 'Processing...' : 'Place Bet'}
                  </button>
               </form>
             </div>
          ) : null}

          {/* Open Bets / Matched list */}
          <div className="bg-[#020503] rounded-xl shadow-sm border border-[#00ff88]/20 flex flex-col h-125">
             <div className="bg-slate-900 px-5 py-3.5 border-b border-[#00ff88]/20 flex justify-between items-center">
               <h4 className="font-bold text-white uppercase tracking-wider text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#00ff88]" /> Matched Bets
               </h4>
               <span className="text-xs font-bold bg-[#00ff88]/20 text-[#00ff88] px-2 py-0.5 rounded-full">{betHistory.length}</span>
             </div>
             
             <div className="flex-1 overflow-y-auto p-0 custom-scrollbar">
                {betHistory.length > 0 ? (
                  <div className="divide-y divide-[#00ff88]/10">
                    {betHistory.map((bet: any) => (
                      <div key={bet.id} className="p-4 hover:bg-slate-900/50 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-white text-sm pb-1 border-b border-slate-800 w-full flex justify-between items-center">
                            {bet.selection}
                            <span className="text-[9px] text-slate-500 font-mono font-medium">{bet.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                           <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded shadow-sm ${bet.type === 'back' ? 'bg-[#72bbed] text-slate-900' : 'bg-[#faa9ba] text-slate-900'}`}>{bet.type === 'back' ? 'BACK' : 'LAY'}</span>
                           <span className="text-slate-300 font-bold text-sm">@{bet.odds}</span>
                        </div>
                        <div className="flex justify-between items-end mt-3 bg-slate-900 p-2 rounded border border-slate-800 text-xs">
                          <div className="flex gap-4">
                             <div><span className="text-slate-500 font-semibold mr-1">Stake:</span><span className="text-slate-200 font-bold">₹{bet.amount.toFixed(2)}</span></div>
                          </div>
                          <div>
                             <span className="text-slate-500 font-semibold mr-1">Rtn:</span>
                             <span className={`font-black ${bet.profit > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                               {bet.profit > 0 ? '+' : ''}{bet.profit.toFixed(2)}
                             </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-8">
                    <Monitor className="w-12 h-12 text-slate-700 mb-4" />
                    <span className="text-slate-400 font-semibold text-sm">No Open Bets</span>
                    <span className="text-slate-500 text-xs mt-1">Place a bet to see it here.</span>
                  </div>
                )}
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}
