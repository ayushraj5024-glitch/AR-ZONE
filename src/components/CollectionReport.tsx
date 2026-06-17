import React from 'react';
import { Wrench, Download, Share2 } from 'lucide-react';
import { exportToCSV, shareToWhatsApp } from '../lib/exportUtils';

export default function CollectionReport() {
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
        <ReportCard title="PAYMENT RECEIVING FROM (Lena Hai)" />
        <ReportCard title="PAYMENT PAID TO (Dena Hai)" />
        <ReportCard title="PAYMENT Clear (Clear Hai)" hasTotal />
      </div>
    </div>
  );
}

function ReportCard({ title, hasTotal = false }: { title: string, hasTotal?: boolean }) {
  const dummyData = [{ client: hasTotal ? 'Total' : 'demouser', balance: hasTotal ? 0.0 : -500.0 }];

  const handleExport = () => {
    exportToCSV(dummyData, `Collection_Report_${title}`);
  };

  const handleShare = () => {
    shareToWhatsApp(`Collection Report - ${title}\nClient: ${dummyData[0].client}, Balance: ${dummyData[0].balance}`);
  };

  return (
    <div className="bg-[#05100a] border text-left border-\(--primary\)/20 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="bg-[#60999b] text-white px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex items-center gap-2">
          <button onClick={handleExport} className="flex items-center gap-1 bg-[#4d7a7c] hover:bg-[#3d6163] px-2 py-1 rounded text-xs transition-colors">
            <Download size={14} />
          </button>
          <button onClick={handleShare} className="flex items-center gap-1 bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs transition-colors">
            <Share2 size={14} />
          </button>
          <Wrench size={14} className="text-white/70 ml-1" />
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-200">
          <thead className="text-sm text-slate-300 font-semibold bg-[#05100a] border-b border-\(--primary\)/20">
            <tr>
              <th className="px-4 py-3 border-r border-\(--primary\)/20">Client</th>
              <th className="px-4 py-3">Balance</th>
            </tr>
          </thead>
          <tbody>
            {hasTotal ? (
              <tr>
                <td className="px-4 py-3 font-semibold border-r border-\(--primary\)/20">Total</td>
                <td className="px-4 py-3">0.0</td>
              </tr>
            ) : (
              <tr className="hover:bg-[#020503] transition-colors">
                <td className="px-4 py-3 font-medium text-white border-r border-\(--primary\)/20">demouser</td>
                <td className="px-4 py-3 text-rose-500 font-semibold">-500.00</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
