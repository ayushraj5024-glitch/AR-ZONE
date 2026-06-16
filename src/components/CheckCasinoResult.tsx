import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

interface SearchResult {
  id: string;
  clientName: string;
  matchName: string;
  betType: string;
  betAmount: number;
  result: 'Win' | 'Loss';
  totalProfitLoss: number;
  date: string;
}

export default function CheckCasinoResult() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearched, setIsSearched] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const usersSnap = await getDocs(collection(db, 'users'));
        let allBets: SearchResult[] = [];
        
        for (const userDoc of usersSnap.docs) {
           const userData = userDoc.data();
           const clientName = userData.name || userData.email || userDoc.id;
           
           const betsSnap = await getDocs(collection(db, `users/${userDoc.id}/bets`));
           betsSnap.forEach(betDoc => {
             const betData = betDoc.data();
              let profitLoss = 0;
              let isWin = false;
              
              if (betData.profit !== undefined) {
                profitLoss = Number(betData.profit);
                isWin = profitLoss > 0;
              } else if (betData.payout !== undefined) {
                profitLoss = Number(betData.payout) - Number(betData.amount);
                isWin = true; // if payout is set in aviator, it's a win
              } else {
                profitLoss = -Number(betData.amount); // lost bet
                isWin = false;
              }
              
              allBets.push({
                id: betDoc.id,
                clientName: clientName,
                matchName: betData.gameId || 'Casino Game',
                betType: betData.selection || (betData.multiplier ? `x${betData.multiplier}` : 'Auto'),
                betAmount: Number(betData.amount) || 0,
                result: isWin ? 'Win' : 'Loss',
                totalProfitLoss: profitLoss,
                date: betData.time || betData.date || new Date().toLocaleString()
              });
           });
        }
        
        // Sort by date descending (rough approximation if time string is used, better to use createdAt if available but time is string)
        allBets.reverse();
        setResults(allBets);
      } catch (e) {
        console.error("Error fetching casino results:", e);
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, []);

  const handleSearch = () => {
    setIsSearched(true);
  };

  const filteredResults = results.filter(
    (item) => 
      item.matchName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.betType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          Check Casino Result
        </h2>
        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
          <span>Home</span>
          <span className="text-slate-300">/</span>
          <span className="text-white">Check Casino Result</span>
        </div>
      </div>

      <div className="bg-[#05100a] border border-[#00ff88]/20 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-end gap-4 mb-2">
          <div className="relative w-full max-w-sm">
            <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Search Records</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Match, Client or Bet Type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-9 pr-4 py-2 bg-[rgba(5,16,10,0.5)] border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 focus:border-[#00ff88] text-white text-sm transition-all"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="w-full sm:w-auto px-6 py-2 bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 hover:bg-[#00ff88] hover:text-[#020503] font-bold text-sm rounded shadow-sm transition-all"
          >
            Show Result
          </button>
        </div>
      </div>

      {isSearched && (
          <div className="bg-[#1f2937] rounded-md overflow-hidden border border-gray-700 shadow-xl mt-6">
            <div className="bg-[#374151] px-4 py-2 border-b border-gray-600">
              <h3 className="text-white font-medium text-sm">Results for "{searchTerm}"</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-[#111827] text-gray-300 text-xs uppercase border-b border-gray-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date / Time</th>
                    <th className="px-4 py-3 font-semibold">Client</th>
                    <th className="px-4 py-3 font-semibold">Match / Game</th>
                    <th className="px-4 py-3 font-semibold">Bet Type</th>
                    <th className="px-4 py-3 font-semibold text-right">Bet Amount</th>
                    <th className="px-4 py-3 font-semibold text-center">Result</th>
                    <th className="px-4 py-3 font-semibold text-right">Total P/L</th>
                  </tr>
                </thead>
                <tbody className="text-gray-300 divide-y divide-gray-700/50">
                  {loading ? (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-500">Loading results...</td></tr>
                  ) : filteredResults.length > 0 ? (
                    filteredResults.map((result) => (
                      <tr key={result.id} className="hover:bg-[#374151]/50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">{result.date}</td>
                        <td className="px-4 py-3 font-medium text-white">{result.clientName}</td>
                        <td className="px-4 py-3 capitalize">{result.matchName}</td>
                        <td className="px-4 py-3">{result.betType}</td>
                        <td className="px-4 py-3 text-right">{result.betAmount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            result.result === 'Win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                          }`}>
                            {result.result}
                          </span>
                        </td>
                        <td className={`px-4 py-3 text-right font-bold ${
                          result.totalProfitLoss >= 0 ? 'text-[#00ff88]' : 'text-red-400'
                        }`}>
                          {result.totalProfitLoss > 0 ? '+' : ''}{result.totalProfitLoss.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                        No results found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
  );
}
