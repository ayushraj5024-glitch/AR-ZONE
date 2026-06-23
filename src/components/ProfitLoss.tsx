import React, { useState, useEffect } from 'react';
import { Wrench, Download, Share2 } from 'lucide-react';
import { exportToCSV, shareToWhatsApp } from '../lib/exportUtils';
import { getFirestore, collectionGroup, onSnapshot, query } from 'firebase/firestore';

export default function ProfitLoss() {
  const [tags, setTags] = useState(['Cricket', 'Football']);
  const [isSearching, setIsSearching] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onSnapshot(query(collectionGroup(db, 'bets')), (snapshot) => {
      const statsMap: Record<string, any> = {};

      snapshot.forEach(doc => {
        const bet = doc.data();
        const gameId = bet.gameId || bet.gameName || bet.matchName || 'Unknown Game';
        
        if (!statsMap[gameId]) {
          statsMap[gameId] = {
            id: gameId,
            matchId: gameId,
            title: gameId,
            matchEarnings: 0,
            date: bet.createdAt?.toDate ? bet.createdAt.toDate().toLocaleString() : new Date().toLocaleString()
          };
        }
        
        const stake = Number(bet.amount || bet.stake || 0);
        const status = (bet.status || '').toLowerCase();
        
        if (status === 'won') {
           let profit = Number(bet.profit || bet.payout || stake);
           if (profit === stake) profit = stake; 
           if (bet.payout && typeof bet.payout === 'number') {
              profit = bet.payout - stake;
           } else if (bet.multiplier && typeof bet.multiplier === 'number') {
              profit = stake * bet.multiplier - stake;
           }
           statsMap[gameId].matchEarnings -= profit;
        } else if (status === 'lost') {
           statsMap[gameId].matchEarnings += stake;
        }
      });
      
      setReportData(Object.values(statsMap).sort((a: any, b: any) => b.matchEarnings - a.matchEarnings));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalEarnings = reportData.reduce((acc, curr) => acc + curr.matchEarnings, 0);

  const handleExport = () => {
    exportToCSV(reportData, 'Profit_Loss_Report');
  };

  const handleShare = () => {
    shareToWhatsApp(`Profit & Loss Statement\nTotal: ₹${totalEarnings.toFixed(2)}\nDate: ${new Date().toLocaleDateString()}`);
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 500);
  };

  return (
    <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">Profit & Loss</h2>
        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span className="text-white">Profit & Loss</span>
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 bg-[#05100a] p-3 rounded border border-[#00ff88]/20">
          <div className="flex-1 flex items-center border border-[#00ff88]/30 rounded px-2 py-1.5 focus-within:border-[#00ff88] bg-[#05100a] flex-wrap gap-1 min-w-0 w-full">
            {tags.map((tag) => (
              <span key={tag} className="bg-[#60999b] text-white text-xs px-2 py-1 rounded flex items-center">
                <span onClick={() => removeTag(tag)} className="mr-1 opacity-70 cursor-pointer hover:opacity-100">×</span>{tag}
              </span>
            ))}
            <input type="text" className="bg-transparent outline-none flex-1 min-w-12.5 text-sm ml-1" placeholder={tags.length === 0 ? "Add sport..." : ""} />
            {tags.length > 0 && <span onClick={() => setTags([])} className="text-slate-400 text-xs ml-auto cursor-pointer hover:text-slate-200 shrink-0">×</span>}
          </div>
          <div className="flex items-center justify-between border border-[#00ff88]/30 rounded bg-[#05100a] min-w-0 w-full md:w-auto">
            <input type="text" className="bg-transparent px-3 py-1.5 text-sm w-full md:w-32 border-none outline-none min-w-0" placeholder="2026-06-04" />
            <div className="flex items-center shrink-0">
              <span className="px-2 text-slate-400">📅</span>
              <span className="px-2 text-slate-400">-</span>
              <span className="px-2 text-slate-400">▼</span>
            </div>
          </div>
          <button onClick={handleSearch} className="bg-[#60999b] hover:bg-[#4d7a7c] text-white px-6 py-1.5 rounded text-sm font-medium transition-colors w-full md:w-24 shrink-0 mt-2 md:mt-0">
            {isSearching ? '...' : 'Search'}
          </button>
        </div>

        <div className="bg-[#05100a] border text-left border-[#00ff88]/20 rounded-lg shadow-sm flex flex-col min-w-0 overflow-hidden">
          <div className="bg-[#60999b] text-white px-4 py-2 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Summary</h3>
            <div className="flex gap-2">
              <button onClick={handleExport} className="flex items-center gap-1 bg-[#4d7a7c] hover:bg-[#3d6163] px-2 py-1 rounded text-xs transition-colors">
                <Download size={14} /> Export
              </button>
              <button onClick={handleShare} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs transition-colors">
                <Share2 size={14} /> WhatsApp
              </button>
            </div>
          </div>
          <div className="p-4 bg-[#020503]/50">
            <div className="flex justify-between items-center bg-[#05100a] p-3 border border-[#00ff88]/20 rounded flex-wrap gap-2">
              <span className="text-sm font-medium text-slate-200">All Time Total</span>
              <span className={`text-sm font-bold sm:pr-32 pr-4 ${totalEarnings < 0 ? 'text-[#ff3355]' : 'text-[#00ff88]'}`}>
                {totalEarnings > 0 ? '+' : ''}{totalEarnings.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-[#05100a] border text-left border-[#00ff88]/20 rounded-lg shadow-sm flex flex-col min-w-0 overflow-hidden">
          <div className="bg-[#60999b] text-white px-4 py-2 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Earning Report</h3>
            <Wrench size={14} className="text-white/70" />
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left text-slate-200 min-w-175">
              <thead className="text-xs text-slate-300 bg-[#020503] font-semibold border-b border-[#00ff88]/20">
                <tr>
                  <th className="px-4 py-3">DATE/TIME</th>
                  <th className="px-4 py-3">Match Id</th>
                  <th className="px-4 py-3">Match Title</th>
                  <th className="px-4 py-3 border-l border-[#00ff88]/20 text-right">Match Earnings</th>
                  <th className="px-4 py-3 border-l border-[#00ff88]/20 text-right">Commision Earnings</th>
                  <th className="px-4 py-3 border-l border-[#00ff88]/20 text-right">Total Earnings</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">Loading report...</td>
                  </tr>
                ) : reportData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No data found.</td>
                  </tr>
                ) : (
                  reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-[#020503] transition-colors border-b border-[#00ff88]/10">
                      <td className="px-4 py-3">{row.date}</td>
                      <td className="px-4 py-3">{row.matchId}</td>
                      <td className="px-4 py-3">{row.title}</td>
                      <td className={`px-4 py-3 border-l border-[#00ff88]/20 text-right ${row.matchEarnings < 0 ? 'text-[#ff3355]' : 'text-[#00ff88]'}`}>
                        {row.matchEarnings > 0 ? '+' : ''}{row.matchEarnings.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 border-l border-[#00ff88]/20 text-right">0.00</td>
                      <td className={`px-4 py-3 border-l border-[#00ff88]/20 text-right font-bold ${row.matchEarnings < 0 ? 'text-[#ff3355]' : 'text-[#00ff88]'}`}>
                        {row.matchEarnings > 0 ? '+' : ''}{row.matchEarnings.toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
                <tr className="bg-[#05100a]">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-sm">All Page Total</td>
                  <td className={`px-4 py-3 border-l border-[#00ff88]/20 text-right font-bold ${totalEarnings < 0 ? 'text-[#ff3355]' : 'text-[#00ff88]'}`}>
                     {totalEarnings > 0 ? '+' : ''}{totalEarnings.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 border-l border-[#00ff88]/20 text-right text-slate-300">0.00</td>
                  <td className={`px-4 py-3 border-l border-[#00ff88]/20 text-right font-bold ${totalEarnings < 0 ? 'text-[#ff3355]' : 'text-[#00ff88]'}`}>
                     {totalEarnings > 0 ? '+' : ''}{totalEarnings.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
