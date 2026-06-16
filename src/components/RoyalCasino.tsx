import React from 'react';
import { Ban, Loader2 } from 'lucide-react';
import { useMarketStatus } from '../hooks/useMarketStatus';

interface RoyalCasinoProps {
  onOpenReport: () => void;
}

export default function RoyalCasino({ onOpenReport }: RoyalCasinoProps) {
  const { status, loading } = useMarketStatus();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-125">
        <Loader2 className="w-8 h-8 animate-spin text-[#00ff88]" />
      </div>
    );
  }

  if (!status.intCasino) {
    return (
      <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-6 font-sans pb-16">
        <div className="flex flex-col items-center justify-center p-12 bg-[#05100a] border border-red-500/20 rounded-2xl text-center space-y-4">
          <Ban className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold text-white">Int. Casino is Currently Suspended</h2>
          <p className="text-slate-400">This market has been blocked by the administrator. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-4">
      {/* Alert Banner / Ticker */}
      <div className="bg-[#60999b] text-white flex items-center justify-between shadow-sm overflow-hidden mb-6 h-10 text-sm">
        <div className="flex-1 min-w-0 overflow-hidden relative h-full flex items-center px-4 font-bold tracking-wide">
            <div className="absolute top-0 left-0 h-full whitespace-nowrap animate-[marquee_25s_linear_infinite] flex items-center gap-8 text-white">
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
        <h2 className="text-[28px] font-normal text-slate-200">Royal Casino</h2>
        <div className="text-[13px] text-slate-400 mt-1 flex items-center space-x-2">
          <span>Dashboard</span>
          <span className="text-slate-500">/</span>
          <span className="text-[#60999b]">Royal Casino</span>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-700/50 pt-4">
        <button 
          onClick={onOpenReport}
          className="bg-[#60999b] hover:bg-[#50888a] text-white py-2 px-4 rounded shadow-sm text-center font-medium transition-colors w-full sm:w-75"
        >
          Royal Casino Daily PL
        </button>
      </div>
    </div>
  );
}
