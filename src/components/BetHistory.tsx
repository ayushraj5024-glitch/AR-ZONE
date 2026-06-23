import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter } from 'lucide-react';
import { getFirestore, collectionGroup, onSnapshot, query, collection, getDocs } from 'firebase/firestore';

export default function BetHistory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [bets, setBets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};
    const fetchBets = async () => {
      try {
        const db = getFirestore();
        
        // Fetch all users to map uid -> name
        const usersSnap = await getDocs(collection(db, 'users'));
        const userMap: Record<string, string> = {};
        usersSnap.forEach(u => { 
          const d = u.data();
          userMap[u.id] = d.name || d.username || d.email?.split('@')[0] || 'User'; 
        });

        const betsQuery = query(
          collectionGroup(db, 'bets')
        );
        
        unsubscribe = onSnapshot(betsQuery, (snapshot) => {
          const fetchedBets = snapshot.docs.map(doc => {
            const data = doc.data();
            let uid = null;
            if (doc.ref.parent.parent) uid = doc.ref.parent.parent.id;
            const resolvedName = data.userName || data.client || (uid && userMap[uid]) || 'Unknown Client';
            return {
              id: doc.id,
              ...data,
              realClientName: resolvedName
            };
          }).sort((a: any, b: any) => {
             const t1 = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
             const t2 = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
             return t2 - t1;
          });
          setBets(fetchedBets);
          setLoading(false);
        });
      } catch (error) {
        console.error("Error fetching bets:", error);
        setLoading(false);
      }
    };

    fetchBets();
    return () => unsubscribe();
  }, []);

  const filteredBets = bets.filter(bet => {
    const searchLower = searchTerm.toLowerCase();
    const userName = (bet.realClientName || '').toLowerCase();
    const gameId = (bet.gameId || bet.gameName || bet.matchName || '').toLowerCase();
    const runner = (bet.runner || '').toLowerCase();
    const status = (bet.status || '').toLowerCase();
    const type = (bet.type || '').toLowerCase();
    return userName.includes(searchLower) || 
           gameId.includes(searchLower) || 
           runner.includes(searchLower) || 
           status.includes(searchLower) ||
           type.includes(searchLower);
  });

  const handleExport = () => {
    // Basic CSV export
    const headers = ['Time', 'Client', 'Game/Match', 'Runner', 'Odds/Multiplier', 'Stake', 'Type', 'Status'];
    const csvContent = [
      headers.join(','),
      ...filteredBets.map(bet => {
        const date = bet.createdAt?.toDate ? bet.createdAt.toDate().toLocaleString() : bet.createdAt || bet.date || '';
        const client = bet.realClientName;
        const game = bet.gameId || bet.gameName || bet.matchName || 'Unknown Game';
        const runner = bet.runner || '-';
        const odds = bet.multiplier || bet.odds || bet.rate || '-';
        const stake = bet.amount || bet.stake || 0;
        const type = bet.type || (game === 'aviator' ? 'Bet' : '-');
        const status = bet.status || 'Pending';
        
        return `"${date}","${client}","${game}","${runner}","${odds}","${stake}","${type}","${status}"`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "bet_history_slips.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-orbitron text-slate-200 tracking-wider">Comprehensive Bet History</h2>
          <div className="flex items-center text-xs text-slate-500 mt-1 uppercase tracking-widest font-exo font-bold">
            <span className="text-slate-400">REPORTS</span>
            <span className="mx-2">/</span>
            <span className="text-[--primary]">All Slips</span>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 text-sm rounded transition-all">
            <Filter size={16} />
            <span>Filter</span>
          </button>
          <button onClick={handleExport} className="flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white font-bold px-4 py-2 text-sm rounded transition-all border border-emerald-500/50">
            <Download size={16} />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="bg-[#05100a] border border-[--primary]/20 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[--primary]/20 flex flex-col sm:flex-row gap-4 items-center justify-between bg-[#030a06]">
          <div className="flex-1 w-full relative">
            <input 
              type="text" 
              placeholder="Search by username, match, or runner..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#020503] border border-[--primary]/20 rounded py-2 px-4 text-sm text-slate-200 focus:outline-none focus:border-[--primary]/50 transition-colors placeholder-slate-600"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[#020503] text-slate-400 border-b border-[--primary]/20">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Match/Game</th>
                <th className="px-4 py-3">Runner / Session</th>
                <th className="px-4 py-3 text-right">Odds / Mult</th>
                <th className="px-4 py-3 text-right">Stake/Amount</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">Loading history...</td>
                </tr>
              ) : filteredBets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-slate-500">No bet history found</td>
                </tr>
              ) : (
                filteredBets.map((bet, idx) => {
                  const date = bet.createdAt?.toDate ? bet.createdAt.toDate().toLocaleString() : bet.createdAt || bet.date;
                  const client = bet.realClientName;
                  const game = bet.gameId || bet.gameName || bet.matchName || 'Unknown Game';
                  const runner = bet.runner || '-';
                  const odds = bet.multiplier || bet.odds || bet.rate || '-';
                  const stake = bet.amount || bet.stake || 0;
                  const type = bet.type || (game === 'aviator' ? 'Bet' : '-');
                  
                  return (
                    <tr key={`${bet.id}-${idx}`} className="border-b border-[--primary]/10 hover:bg-[#020503]/50">
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{date}</td>
                      <td className="px-4 py-3 font-medium text-[--primary]">{client}</td>
                      <td className="px-4 py-3 text-slate-200">{game}</td>
                      <td className="px-4 py-3 text-slate-300">{runner}</td>
                      <td className="px-4 py-3 text-right font-medium">
                         {odds}{typeof odds === 'number' && bet.gameId === 'aviator' ? 'x' : ''}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-200">₹ {stake}</td>
                      <td className="px-4 py-3 text-center">
                         <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs font-bold uppercase tracking-wider">{type}</span>
                      </td>
                      <td className="px-4 py-3">
                         <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                           bet.status === 'won' ? 'bg-emerald-500/20 text-emerald-400' :
                           bet.status === 'lost' ? 'bg-rose-500/20 text-rose-400' :
                           'bg-slate-500/20 text-slate-400'
                         }`}>
                           {bet.status || 'Pending'}
                         </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
