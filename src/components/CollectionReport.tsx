import React, { useState, useEffect } from 'react';
import { Wrench, Download, Share2 } from 'lucide-react';
import { exportToCSV, shareToWhatsApp } from '../lib/exportUtils';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';

export default function CollectionReport() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setUsers(data);
    });
    return () => unsubscribe();
  }, []);

  const lenaHai = users.filter(u => Number(u.balance || 0) < 0).map(u => ({ client: u.name || u.username, balance: Number(u.balance) }));
  const denaHai = users.filter(u => Number(u.balance || 0) > 0).map(u => ({ client: u.name || u.username, balance: Number(u.balance) }));
  const clearHai = users.filter(u => Number(u.balance || 0) === 0).map(u => ({ client: u.name || u.username, balance: 0 }));

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white uppercase">COLLECTION REPORT</h2>
        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span>Admin</span>
          <span className="text-slate-300">/</span>
          <span className="text-white">Collection Report</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportCard title="PAYMENT RECEIVING FROM (Lena Hai)" data={lenaHai} />
        <ReportCard title="PAYMENT PAID TO (Dena Hai)" data={denaHai} />
        <ReportCard title="PAYMENT Clear (Clear Hai)" data={clearHai} hasTotal />
      </div>
    </div>
  );
}

function ReportCard({ title, data, hasTotal = false }: { title: string, data: any[], hasTotal?: boolean }) {
  const total = data.reduce((acc, curr) => acc + curr.balance, 0);

  const handleExport = () => {
    exportToCSV(data, `Collection_Report_${title}`);
  };

  const handleShare = () => {
    const text = data.map(d => `${d.client}: ${d.balance}`).join('\n');
    shareToWhatsApp(`Collection Report - ${title}\n${text}\nTotal: ${total}`);
  };

  return (
    <div className="bg-[#05100a] border text-left border-[#00ff88]/20 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="bg-[#60999b] text-white px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex items-center gap-2">
          <button onClick={() => window.print()} title="Download PDF" className="flex items-center gap-1 bg-[#4d7a7c] hover:bg-[#3d6163] px-2 py-1 rounded text-xs transition-colors">
            PDF
          </button>
          <button onClick={handleExport} title="Export CSV" className="flex items-center gap-1 bg-[#4d7a7c] hover:bg-[#3d6163] px-2 py-1 rounded text-xs transition-colors">
            <Download size={14} /> CSV
          </button>
          <button onClick={handleShare} title="Share WhatsApp" className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs transition-colors">
            <Share2 size={14} />
          </button>
          <Wrench size={14} className="text-white/70 ml-1" />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-200">
          <thead className="text-sm text-slate-300 font-semibold bg-[#05100a] border-b border-[#00ff88]/20">
            <tr>
              <th className="px-4 py-3 border-r border-[#00ff88]/20">Client</th>
              <th className="px-4 py-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-slate-500">No data found.</td>
              </tr>
            ) : (
              data.map((row, idx) => (
               <tr key={idx} className="hover:bg-[#020503] transition-colors border-b border-[#00ff88]/10 last:border-0">
                 <td className="px-4 py-3 font-medium text-white border-r border-[#00ff88]/20">{row.client}</td>
                 <td className={`px-4 py-3 ${row.balance < 0 ? 'text-[#ff3355]' : 'text-[#00ff88]'}`}>
                    {row.balance > 0 ? '+' : ''}{row.balance.toFixed(2)}
                 </td>
               </tr>
              ))
            )}
            {hasTotal && (
               <tr className="bg-[#020503] border-t border-[#00ff88]/30 font-bold">
                 <td className="px-4 py-3 border-r border-[#00ff88]/20 text-white text-right uppercase">Total</td>
                 <td className={`px-4 py-3 ${total < 0 ? 'text-[#ff3355]' : 'text-[#00ff88]'}`}>
                    {total > 0 ? '+' : ''}{total.toFixed(2)}
                 </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
