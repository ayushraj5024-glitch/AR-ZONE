import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { Search } from 'lucide-react';

export default function RoyalCasinoReport() {
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSearched, setIsSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);

  useEffect(() => {
    if (!isSearched) return;
    const fetchReport = async () => {
      setLoading(true);
      try {
         const db = getFirestore();
         const usersSnap = await getDocs(collection(db, 'users'));
         const gameStats: Record<string, { title: string, date: string, declared: string, profitLoss: number }> = {};
         
         for (const userDoc of usersSnap.docs) {
           const betsSnap = await getDocs(collection(db, `users/${userDoc.id}/bets`));
           betsSnap.forEach(betDoc => {
             const betData = betDoc.data();
             const gameId = betData.gameId || 'Unknown Casino Game';
             
             let profitLoss = 0;
             if (betData.profit !== undefined) {
               profitLoss = Number(betData.profit);
             } else if (betData.payout !== undefined) {
               profitLoss = Number(betData.payout) - Number(betData.amount);
             } else {
               profitLoss = -Number(betData.amount);
             }
             
             // In casino report, if users profit > 0, admin loss is < 0 (house edge)
             // But usually report shows total P/L of bets (like Total House Profit / Loss from bets, so we'll show -profitLoss to represent Admin earnings)
             const adminEarnings = -profitLoss;
             
             if (!gameStats[gameId]) {
               gameStats[gameId] = {
                 title: gameId.charAt(0).toUpperCase() + gameId.slice(1),
                 date: new Date().toLocaleDateString(),
                 declared: 'Yes',
                 profitLoss: 0
               };
             }
             gameStats[gameId].profitLoss += adminEarnings;
           });
         }
         
         setReportData(Object.values(gameStats));
      } catch (e) {
        console.error("Error fetching report", e);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [isSearched]);

  const handleSearch = () => {
    setIsSearched(true);
  };

  const total = isSearched ? reportData.reduce((acc, curr) => acc + curr.profitLoss, 0) : 0;

  return (
    <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-4">
      {/* Alert Banner / Ticker */}
      <div className="bg-[#60999b] text-white flex items-center justify-between shadow-sm overflow-hidden mb-6 h-10 text-sm">
        <div className="flex-1 min-w-0 overflow-hidden relative h-full flex items-center px-4 font-bold tracking-wide">
            <div className="absolute top-0 left-0 h-full whitespace-nowrap animate-[marquee_25s_linear_infinite] flex items-center gap-8 text-white">
              <span>Fancy has been Suspend for Matchname:- Oman v Kuwait,FancyName:- Over/Under 8.5 Goals, Reason:-Wrong Market</span>
              <span className="text-white/50 font-bold">•</span>
              <span>Match Suspended:- India v Australia (T20 World Cup), Reason:- Rain Delay</span>
              <span className="text-white/50 font-bold">•</span>
              <span>Market Closed:- Somerset v Glamorgan, Market:- Match Odds</span>
            </div>
        </div>
        <button className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold h-full px-6 transition-colors shrink-0">
          All Message
        </button>
      </div>

      {/* Header & Breadcrumbs */}
      <div>
        <h2 className="text-[28px] font-normal text-slate-200">Live Casino Daily Report</h2>
        <div className="text-[13px] text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">Report</span>
        </div>
      </div>

      {/* Filters and Total */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-6 border-t border-[#00ff88]/20 pt-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input 
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="border border-[#00ff88]/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00ff88] bg-[#05100a] text-slate-300 scheme-dark hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer"
            />
            <span className="text-slate-500 font-medium">to</span>
            <input 
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="border border-[#00ff88]/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00ff88] bg-[#05100a] text-slate-300 scheme-dark hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer"
            />
          </div>
          <button onClick={handleSearch} className="bg-[#60999b] hover:bg-[#50888a] text-white px-5 py-1.5 rounded text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-sm">
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
        
        <div className="text-base font-bold text-slate-200 bg-[#05100a] border border-[#00ff88]/30 px-4 py-1.5 rounded-md">
          Total:- <span className={total >= 0 ? "text-[#00ff88]" : "text-red-500"}>{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-4 bg-[#05100a] border border-[#00ff88]/20 rounded-md overflow-hidden shadow-sm">
        <div className="bg-[#60999b] text-white px-4 py-2 font-semibold text-sm">
          All Report
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#020503] text-sm border-b border-[#00ff88]/20">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-300">Title</th>
                <th className="px-4 py-3 font-semibold text-slate-300">DATE</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Declared</th>
                <th className="px-4 py-3 font-semibold text-slate-300 text-right">Profit / Loss</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 border-b border-[#00ff88]/20">
                    Loading report...
                  </td>
                </tr>
              ) : !isSearched ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 border-b border-[#00ff88]/20">
                    No data available in table
                  </td>
                </tr>
              ) : reportData.length > 0 ? (
                reportData.map((row, idx) => (
                  <tr key={idx} className="border-b border-[#00ff88]/10 hover:bg-[#020503]">
                    <td className="px-4 py-3 text-slate-300">{row.title}</td>
                    <td className="px-4 py-3 text-slate-400">{row.date}</td>
                    <td className="px-4 py-3 text-slate-300">{row.declared}</td>
                    <td className={`px-4 py-3 text-right font-medium ${row.profitLoss >= 0 ? "text-[#00ff88]" : "text-red-500"}`}>
                      {row.profitLoss.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 border-b border-[#00ff88]/20">
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
