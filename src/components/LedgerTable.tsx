import React, { useState, useEffect } from 'react';
import { Wrench, Loader2, Download, Share2 } from 'lucide-react';
import { exportToCSV, shareToWhatsApp } from '../lib/exportUtils';
import DateRangeFilter from './DateRangeFilter';
import { getFirestore, collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

interface LedgerTableProps {
  title: string;
  breadcrumb: string;
}

export default function LedgerTable({ title, breadcrumb }: LedgerTableProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const q = query(collection(db, 'statements'), orderBy('date', 'desc'), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const smts: any[] = [];
      snapshot.forEach((doc) => {
        smts.push({ id: doc.id, ...doc.data() });
      });
      setLedgerData(smts);
      setLoading(false);
    }, (err) => {
      console.error(err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSearch = () => {
    setIsSearching(true);
    setTimeout(() => setIsSearching(false), 500);
  };

  const handleExport = () => {
    exportToCSV(ledgerData, 'Ledger_Report');
  };

  const handleShare = () => {
    shareToWhatsApp(`Ledger Report\nDate: ${new Date().toLocaleDateString()}`);
  };

  return (
    <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white uppercase">{title}</h2>
        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span className="text-white">{breadcrumb}</span>
        </div>
      </div>

      <div className="bg-[#05100a] border text-left border-(--primary)/20 rounded-lg shadow-sm overflow-hidden flex flex-col">
        {title === 'Agent' ? (
          <div className="p-4 bg-[#020503]/50 border-b border-(--primary)/20 flex items-center space-x-4">
            <DateRangeFilter onRangeSelect={(s: Date, e: Date) => console.log(s, e)} />
            <button onClick={handleSearch} disabled={isSearching} className="bg-[#60999b] hover:bg-[#4d7a7c] text-white px-4 py-1.5 rounded text-sm font-medium transition-colors min-w-20 flex justify-center items-center">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        ) : (
          <div className="p-4 bg-[#020503]/50 border-b border-(--primary)/20 flex items-center space-x-4">
             <div className="relative">
              <input type="text" placeholder="Search..." className="border border-(--primary)/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-(--primary) bg-[#05100a] w-48 text-slate-300" />
             </div>
             <DateRangeFilter onRangeSelect={(s: Date, e: Date) => console.log(s, e)} />
            <button onClick={handleSearch} disabled={isSearching} className="bg-[#60999b] hover:bg-[#4d7a7c] text-white px-4 py-1.5 rounded text-sm font-medium transition-colors min-w-20 flex justify-center items-center">
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
            </button>
          </div>
        )}

        <div className="bg-[#60999b] text-white px-4 py-3 flex items-center justify-between mt-2">
          <h3 className="font-semibold text-sm">{title === 'Agent' ? 'Statement of Admin' : 'Agent Ledger'}</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => window.print()} title="Download PDF" className="flex items-center gap-1 bg-[#4d7a7c] hover:bg-[#3d6163] px-2 py-1 rounded text-xs transition-colors">
              PDF
            </button>
            <button onClick={handleExport} title="Export CSV" className="flex items-center gap-1 bg-[#4d7a7c] hover:bg-[#3d6163] px-2 py-1 rounded text-xs transition-colors">
              <Download size={14} /> CSV
            </button>
            <button onClick={handleShare} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs transition-colors">
              <Share2 size={14} /> WhatsApp
            </button>
            <Wrench size={14} className="text-white/70 ml-2" />
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-50">
          <table className="w-full text-sm text-left text-slate-200">
            <thead className="text-xs text-slate-200 uppercase bg-(--primary)/5/50 border-b border-(--primary)/20">
              {title === 'Agent' ? (
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold w-1/2">Description</th>
                  <th className="px-4 py-3 font-semibold">Cr</th>
                  <th className="px-4 py-3 font-semibold">Dbt</th>
                  <th className="px-4 py-3 font-semibold">Com+</th>
                  <th className="px-4 py-3 font-semibold">Com-</th>
                  <th className="px-4 py-3 font-semibold">Balance</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-4 py-3 font-semibold">DATE/TIME</th>
                  <th className="px-4 py-3 font-semibold text-center">ENTRY</th>
                  <th className="px-4 py-3 font-semibold">DEBIT</th>
                  <th className="px-4 py-3 font-semibold">CREDIT</th>
                  <th className="px-4 py-3 font-semibold">Balance</th>
                  <th className="px-4 py-3 font-semibold">Note</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-(--primary)/20">
              {loading ? (
                <tr>
                  <td colSpan={title === 'Agent' ? 7 : 6} className="px-4 py-8 text-center text-slate-500">
                    Loading records...
                  </td>
                </tr>
              ) : ledgerData.length === 0 ? (
                <tr>
                  <td colSpan={title === 'Agent' ? 7 : 6} className="px-4 py-8 text-center text-slate-500">
                    No records found in current ledger.
                  </td>
                </tr>
              ) : (
                ledgerData.map((stmt) => (
                  <tr key={stmt.id} className="hover:bg-[#020503]/50">
                    <td className="px-4 py-3 whitespace-nowrap">{stmt.date}</td>
                    <td className="px-4 py-3 text-white font-medium">{stmt.event}</td>
                    {title === 'Agent' ? (
                       <>
                        <td className="px-4 py-3">{stmt.winLoss && Number(stmt.winLoss) > 0 ? stmt.winLoss : 0}</td>
                        <td className="px-4 py-3">{stmt.winLoss && Number(stmt.winLoss) < 0 ? Math.abs(Number(stmt.winLoss)) : 0}</td>
                        <td className="px-4 py-3">0</td>
                        <td className="px-4 py-3">0</td>
                        <td className="px-4 py-3 font-medium">{stmt.balance}</td>
                       </>
                    ) : (
                       <>
                        <td className="px-4 py-3 text-[#ff3355]">{stmt.type === 'subtract' || Number(stmt.winLoss) < 0 ? stmt.winLoss : 0}</td>
                        <td className="px-4 py-3 text-[#00ff88]">{stmt.type === 'add' || Number(stmt.winLoss) > 0 ? stmt.winLoss : 0}</td>
                        <td className="px-4 py-3 font-medium">{stmt.balance}</td>
                        <td className="px-4 py-3">{stmt.type || 'Bet'}</td>
                       </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
