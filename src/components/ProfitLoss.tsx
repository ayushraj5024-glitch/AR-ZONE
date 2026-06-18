import React, { useState } from 'react';
import { Wrench, Download, Share2 } from 'lucide-react';
import { exportToCSV, shareToWhatsApp } from '../lib/exportUtils';

export default function ProfitLoss() {
  const [tags, setTags] = useState(['Cricket', 'Football']);
  const [isSearching, setIsSearching] = useState(false);

  const reportData: any[] = [];

  const handleExport = () => {
    exportToCSV(reportData, 'Profit_Loss_Report');
  };

  const handleShare = () => {
    shareToWhatsApp(`Profit & Loss Statement\nTotal: ₹0.00\nDate: ${new Date().toLocaleDateString()}`);
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
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 bg-[#05100a] p-3 rounded border border-\(--primary\)/20">
          <div className="flex-1 flex items-center border border-\(--primary\)/30 rounded px-2 py-1.5 focus-within:border-\(--primary\) bg-[#05100a] flex-wrap gap-1 min-w-0 w-full">
            {tags.map((tag) => (
              <span key={tag} className="bg-[#60999b] text-white text-xs px-2 py-1 rounded flex items-center">
                <span onClick={() => removeTag(tag)} className="mr-1 opacity-70 cursor-pointer hover:opacity-100">×</span>{tag}
              </span>
            ))}
            <input type="text" className="bg-transparent outline-none flex-1 min-w-12.5 text-sm ml-1" placeholder={tags.length === 0 ? "Add sport..." : ""} />
            {tags.length > 0 && <span onClick={() => setTags([])} className="text-slate-400 text-xs ml-auto cursor-pointer hover:text-slate-200 shrink-0">×</span>}
          </div>
          <div className="flex items-center justify-between border border-\(--primary\)/30 rounded bg-[#05100a] min-w-0 w-full md:w-auto">
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

        <div className="bg-[#05100a] border text-left border-\(--primary\)/20 rounded-lg shadow-sm flex flex-col min-w-0 overflow-hidden">
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
            <div className="flex justify-between items-center bg-[#05100a] p-3 border border-\(--primary\)/20 rounded flex-wrap gap-2">
              <span className="text-sm font-medium text-slate-200">All Time Total</span>
              <span className="text-sm font-medium text-white sm:pr-32 pr-4">0.00</span>
            </div>
          </div>
        </div>

        <div className="bg-[#05100a] border text-left border-\(--primary\)/20 rounded-lg shadow-sm flex flex-col min-w-0 overflow-hidden">
          <div className="bg-[#60999b] text-white px-4 py-2 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Earning Report</h3>
            <Wrench size={14} className="text-white/70" />
          </div>
          
          <div className="overflow-x-auto w-full">
            <table className="w-full text-sm text-left text-slate-200 min-w-175">
              <thead className="text-xs text-slate-300 bg-[#020503] font-semibold border-b border-\(--primary\)/20">
                <tr>
                  <th className="px-4 py-3">DATE/TIME</th>
                  <th className="px-4 py-3">Match Id</th>
                  <th className="px-4 py-3">Match Title</th>
                  <th className="px-4 py-3 border-l border-\(--primary\)/20">Match Earnings</th>
                  <th className="px-4 py-3 border-l border-\(--primary\)/20">Commision Earnings</th>
                  <th className="px-4 py-3 border-l border-\(--primary\)/20">Total Earnings</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#05100a]">
                  <td colSpan={3} className="px-4 py-3 text-right font-semibold text-sm">All Page Total</td>
                  <td className="px-4 py-3 border-l border-\(--primary\)/20">0.00</td>
                  <td className="px-4 py-3 border-l border-\(--primary\)/20">0.00</td>
                  <td className="px-4 py-3 border-l border-\(--primary\)/20">0.00</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
