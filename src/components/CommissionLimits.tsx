import React, { useState } from 'react';

export default function CommissionLimits() {
  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white uppercase">CLIENTS</h2>
        <div className="text-sm font-medium text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-300">/</span>
          <span className="text-white">Commission & Limits</span>
        </div>
      </div>

      <div className="space-y-6">
        <ClientSection title="Stockist" />
        <ClientSection title="Agent" />
        <ClientSection title="All Users" />
      </div>
    </div>
  );
}

function ClientSection({ title }: { title: string }) {
  return (
    <div className="bg-[#05100a] border text-left border-[#00ff88]/20 rounded-lg shadow-sm overflow-hidden flex flex-col">
      <div className="bg-[#60999b] text-white px-4 py-3">
        <h3 className="font-semibold">{title}</h3>
      </div>
      
      <div className="p-4 border-b border-[#00ff88]/20 bg-[#020503]/50">
        <input
          type="text"
          placeholder={`Search ${title}`}
          className="border border-[#00ff88]/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#00ff88]/30/20 focus:border-[#00ff88] w-full md:w-64 bg-[#05100a]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-center text-slate-200">
          <thead className="text-xs text-slate-200 font-semibold bg-[#020503] border-b border-[#00ff88]/20">
            <tr>
              <th rowSpan={2} className="px-4 py-3 text-left w-1/5 border-r border-[#00ff88]/20">
                Client<br />Name
              </th>
              <th colSpan={2} className="px-4 py-2 border-b border-r border-[#00ff88]/20">Client Commission</th>
              <th colSpan={2} className="px-4 py-2 border-b border-r border-[#00ff88]/20">Client Limit</th>
              <th rowSpan={2} className="px-4 py-3 w-1/6">Action</th>
            </tr>
            <tr>
              <th className="px-4 py-2 border-r border-[#00ff88]/20">Match<br />Comm.</th>
              <th className="px-4 py-2 border-r border-[#00ff88]/20">Ssn<br />Comm.</th>
              <th className="px-4 py-2 border-r border-[#00ff88]/20">Current Limit</th>
              <th className="px-4 py-2 border-r border-[#00ff88]/20">Down Balance</th>
            </tr>
          </thead>
          <tbody>
            <tr className="hover:bg-[#020503] border-b border-[#00ff88]/20 transition-colors">
              <td className="px-4 py-3 text-left font-medium border-r border-[#00ff88]/20">mock_user1</td>
              <td className="px-4 py-3 border-r border-[#00ff88]/20">
                <input type="number" defaultValue={2} className="w-16 border border-[#00ff88]/30 rounded px-2 py-1 text-center font-medium bg-[#020503]" />
              </td>
              <td className="px-4 py-3 border-r border-[#00ff88]/20">
                <input type="number" defaultValue={3} className="w-16 border border-[#00ff88]/30 rounded px-2 py-1 text-center font-medium bg-[#020503]" />
              </td>
              <td className="px-4 py-3 border-r border-[#00ff88]/20">50000</td>
              <td className="px-4 py-3 border-r border-[#00ff88]/20">20000</td>
              <td className="px-4 py-3">
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded font-medium text-xs shadow-sm transition-colors uppercase tracking-wide">
                  Update
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
