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
    <div className="flex flex-col h-full bg-[#1b4332] min-h-[calc(100vh-64px)]">
      {/* Header */}
      <div className="bg-[#1f2937] px-4 py-3 border-b border-gray-700">
        <h2 className="text-white font-medium text-lg">Home</h2>
      </div>

      <div className="p-4 lg:p-6 space-y-6">
        <div>
          <h3 className="text-white text-sm mb-2">Show Casino Results</h3>
          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search....."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full bg-[#1a3828] border border-gray-600 rounded pl-9 pr-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500 placeholder-gray-400"
              />
            </div>
            <button
              onClick={handleSearch}
              className="bg-[#0dcaf0] hover:bg-[#0bacce] text-black px-4 py-1.5 rounded text-sm font-medium transition-colors"
            >
              Search
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
    </div>
  );
}
