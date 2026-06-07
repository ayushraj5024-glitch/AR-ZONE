import React from 'react';
import { Wrench } from 'lucide-react';

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
  return (
    <div className="bg-[#05100a] border text-left border-[#00ff88]/20 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="bg-[#60999b] text-white px-4 py-3 flex items-center justify-between">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Wrench size={14} className="text-white/70" />
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
            {hasTotal ? (
              <tr>
                <td className="px-4 py-3 font-semibold border-r border-[#00ff88]/20">Total</td>
                <td className="px-4 py-3">0.0</td>
              </tr>
            ) : (
              <tr className="hover:bg-[#020503] transition-colors">
                <td className="px-4 py-3 font-medium text-white border-r border-[#00ff88]/20">demouser</td>
                <td className="px-4 py-3 text-rose-500 font-semibold">-500.00</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
