import React, { useState, useEffect } from 'react';
import { AlertCircle, TrendingUp, TrendingDown, RefreshCw, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export default function RiskManagement() {
  const [liabilities, setLiabilities] = useState({
    indAusA: -45000,
    indAusB: 12000,
    indAusVol: 245000,
    cskMiA: 8500,
    cskMiB: -18200,
    cskMiVol: 112000
  });

  useEffect(() => {
    // Simulate real-time bet inflows changing exposure
    const interval = setInterval(() => {
      setLiabilities(prev => ({
        indAusA: prev.indAusA + (Math.random() > 0.5 ? 100 : -200),
        indAusB: prev.indAusB + (Math.random() > 0.5 ? 50 : -50),
        indAusVol: prev.indAusVol + Math.floor(Math.random() * 500),
        cskMiA: prev.cskMiA + (Math.random() > 0.5 ? 100 : -100),
        cskMiB: prev.cskMiB + (Math.random() > 0.5 ? 150 : -250),
        cskMiVol: prev.cskMiVol + Math.floor(Math.random() * 300)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const totalLiability = Math.min(0, liabilities.indAusA) + Math.min(0, liabilities.indAusB) + Math.min(0, liabilities.cskMiA) + Math.min(0, liabilities.cskMiB);
  const totalExposure = Math.abs(liabilities.indAusA) + Math.abs(liabilities.indAusB) + Math.abs(liabilities.cskMiA) + Math.abs(liabilities.cskMiB);

  return (
    <div className="p-4 lg:p-8 w-full max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-orbitron text-slate-200 tracking-wider flex items-center gap-2">
            Risk & Liability 
            <span className="relative flex h-3 w-3 ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </h2>
          <div className="flex items-center text-xs text-slate-500 mt-1 uppercase tracking-widest font-exo font-bold">
            <span className="text-slate-400">ADMIN BOOK</span>
            <span className="mx-2">/</span>
            <span className="text-[--primary]">Live Exposure</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          key={totalLiability}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-[#05100a] border border-[--primary]/20 rounded-lg p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-red-500/5 pulse-bg"></div>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Total Net Liability</h3>
          <p className="text-3xl font-orbitron font-bold text-red-500 relative z-10 transition-colors">
            ₹ {totalLiability.toLocaleString()}
          </p>
        </motion.div>
        
        <motion.div 
          key={totalExposure}
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className="bg-[#05100a] border border-[--primary]/20 rounded-lg p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
        >
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 relative z-10">Total Gross Exposure</h3>
          <p className="text-3xl font-orbitron font-bold text-yellow-400 relative z-10 transition-colors">
            ₹ {totalExposure.toLocaleString()}
          </p>
        </motion.div>

        <div className="bg-[#05100a] border border-[--primary]/20 rounded-lg p-6 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2">Active Markets</h3>
          <p className="text-3xl font-orbitron font-bold text-[--primary]">2</p>
        </div>
      </div>

      <div className="bg-[#05100a] border border-[--primary]/20 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-[--primary]/20 bg-[#030a06] flex justify-between items-center">
          <h3 className="font-orbitron font-bold text-slate-300">Match Book Liabilities</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-[#020503] text-slate-400 border-b border-[--primary]/20">
              <tr>
                <th className="px-4 py-3">Match</th>
                <th className="px-4 py-3">Market</th>
                <th className="px-4 py-3 text-right">Team A P&L</th>
                <th className="px-4 py-3 text-right">Team B P&L</th>
                <th className="px-4 py-3 text-right">Total Volume</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[--primary]/10 hover:bg-[#020503]/50">
                <td className="px-4 py-3 font-medium text-slate-200">IND vs AUS</td>
                <td className="px-4 py-3 text-slate-400">Match Odds</td>
                <td className={`px-4 py-3 text-right font-bold transition-all duration-300 ${liabilities.indAusA < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {liabilities.indAusA > 0 ? '+' : ''}₹ {liabilities.indAusA.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-right font-bold transition-all duration-300 ${liabilities.indAusB < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {liabilities.indAusB > 0 ? '+' : ''}₹ {liabilities.indAusB.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-slate-300 font-mono">₹ {liabilities.indAusVol.toLocaleString()}</td>
              </tr>
              <tr className="border-b border-[--primary]/10 hover:bg-[#020503]/50">
                <td className="px-4 py-3 font-medium text-slate-200">CSK vs MI</td>
                <td className="px-4 py-3 text-slate-400">Match Odds</td>
                <td className={`px-4 py-3 text-right font-bold transition-all duration-300 ${liabilities.cskMiA < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {liabilities.cskMiA > 0 ? '+' : ''}₹ {liabilities.cskMiA.toLocaleString()}
                </td>
                <td className={`px-4 py-3 text-right font-bold transition-all duration-300 ${liabilities.cskMiB < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {liabilities.cskMiB > 0 ? '+' : ''}₹ {liabilities.cskMiB.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-slate-300 font-mono">₹ {liabilities.cskMiVol.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
