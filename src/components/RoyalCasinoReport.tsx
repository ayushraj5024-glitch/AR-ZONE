import React, { useState } from 'react';

export default function RoyalCasinoReport() {
  const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSearched, setIsSearched] = useState(false);

  const mockData = [
    { title: 'Roulette - Table 1', date: '09-06-2026 14:32:10', declared: 'Yes', profitLoss: 4500.00 },
    { title: 'Baccarat Pro - Table 3', date: '09-06-2026 13:15:45', declared: 'Yes', profitLoss: -1200.50 },
    { title: 'Blackjack VIP - Table 5', date: '09-06-2026 12:45:00', declared: 'Yes', profitLoss: 8900.25 },
    { title: 'Dragon Tiger - Main', date: '09-06-2026 11:30:20', declared: 'Yes', profitLoss: -500.00 },
    { title: 'Andar Bahar', date: '09-06-2026 10:15:00', declared: 'Yes', profitLoss: 1250.75 },
    { title: 'Teen Patti 20-20', date: '09-06-2026 09:00:30', declared: 'Yes', profitLoss: 300.00 },
    { title: 'Speed Roulette', date: '08-06-2026 23:45:10', declared: 'Yes', profitLoss: -2100.00 },
    { title: 'Casino Holdem', date: '08-06-2026 22:30:00', declared: 'Yes', profitLoss: 15400.00 },
    { title: 'Crazy Time', date: '08-06-2026 21:15:45', declared: 'Yes', profitLoss: -800.25 },
    { title: 'Lightning Roulette', date: '08-06-2026 20:00:00', declared: 'Yes', profitLoss: 420.00 },
    { title: 'Super Sic Bo', date: '08-06-2026 19:10:00', declared: 'Yes', profitLoss: -150.00 },
    { title: 'Mega Ball', date: '08-06-2026 18:05:00', declared: 'Yes', profitLoss: 3200.50 },
  ];

  const handleSearch = () => {
    setIsSearched(true);
  };

  const total = isSearched ? mockData.reduce((acc, curr) => acc + curr.profitLoss, 0) : 0;

  return (
    <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-4">
      {/* Alert Banner / Ticker */}
      <div className="bg-[#60999b] text-white flex items-center justify-between shadow-sm overflow-hidden mb-6 h-10 text-sm">
        <div className="flex-1 overflow-hidden relative h-full flex items-center px-4 font-bold tracking-wide">
            <div className="absolute whitespace-nowrap animate-[marquee_25s_linear_infinite] flex items-center gap-8 text-white">
              <span>Fancy has been Suspend for Matchname:- Oman v Kuwait,FancyName:- Over/Under 8.5 Goals, Reason:-Wrong Market</span>
              <span className="text-white/50 font-bold">•</span>
              <span>Match Suspended:- India v Australia (T20 World Cup), Reason:- Rain Delay</span>
              <span className="text-white/50 font-bold">•</span>
              <span>Market Closed:- Somerset v Glamorgan, Market:- Match Odds</span>
            </div>
        </div>
        <button className="bg-[#ef4444] hover:bg-[#dc2626] text-white font-semibold h-full px-6 transition-colors shrink-0">
          All Message
        </button>
      </div>

      {/* Header & Breadcrumbs */}
      <div>
        <h2 className="text-[28px] font-normal text-slate-200">Live Casino Daily Report</h2>
        <div className="text-[13px] text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">Report</span>
        </div>
      </div>

      {/* Filters and Total */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6 border-t border-[#00ff88]/20 pt-4">
        <div className="flex items-center gap-2">
          <input 
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border border-[#00ff88]/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00ff88] bg-[#05100a] text-slate-300 scheme-dark [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer"
          />
          <input 
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border border-[#00ff88]/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-[#00ff88] bg-[#05100a] text-slate-300 scheme-dark [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 cursor-pointer"
          />
          <button onClick={handleSearch} className="bg-[#60999b] hover:bg-[#50888a] text-white px-4 py-1.5 rounded text-sm font-medium transition-colors">
            Search
          </button>
        </div>
        
        <div className="text-base font-bold text-slate-200">
          Total:- <span className={total >= 0 ? "text-[#00ff88]" : "text-red-500"}>{total.toFixed(2)}</span>
        </div>
      </div>

      {/* Data Table */}
      <div className="mt-4 bg-[#05100a] border border-[#00ff88]/20 rounded-md overflow-hidden shadow-sm">
        <div className="bg-[#60999b] text-white px-4 py-2 font-semibold text-sm">
          All Report
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-[#020503] text-sm border-b border-[#00ff88]/20">
              <tr>
                <th className="px-4 py-3 font-semibold text-slate-300">Title</th>
                <th className="px-4 py-3 font-semibold text-slate-300">DATE</th>
                <th className="px-4 py-3 font-semibold text-slate-300">Declared</th>
                <th className="px-4 py-3 font-semibold text-slate-300 text-right">Profit / Loss</th>
              </tr>
            </thead>
            <tbody>
              {!isSearched ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 border-b border-[#00ff88]/20">
                    No data available in table
                  </td>
                </tr>
              ) : mockData.length > 0 ? (
                mockData.map((row, idx) => (
                  <tr key={idx} className="border-b border-[#00ff88]/10 hover:bg-[#020503]">
                    <td className="px-4 py-3 text-slate-300">{row.title}</td>
                    <td className="px-4 py-3 text-slate-400">{row.date}</td>
                    <td className="px-4 py-3 text-slate-300">{row.declared}</td>
                    <td className={`px-4 py-3 text-right font-medium ${row.profitLoss >= 0 ? "text-[#00ff88]" : "text-red-500"}`}>
                      {row.profitLoss.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400 border-b border-[#00ff88]/20">
                    No matching records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
