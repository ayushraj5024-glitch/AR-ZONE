import React, { useState, useEffect } from "react";
import { Plane } from "lucide-react";

export default function AviatorGame({ balance, onResult }: { balance: number, onResult?: (amount: number) => void }) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [betAmount, setBetAmount] = useState("100");
  const [autoCashout, setAutoCashout] = useState("2.00");
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false);
  
  const [activeBetAmount, setActiveBetAmount] = useState(0); 
  const [cashedOutAmount, setCashedOutAmount] = useState<number | null>(null);
  const [crashPoint, setCrashPoint] = useState(2.50);
  
  const [myBetsHistory, setMyBetsHistory] = useState<{ date: string, amount: number, multiplier?: number, payout?: number, status: 'won' | 'lost'}[]>([]);

  const adjustBet = (type: string) => {
    let current = Number(betAmount) || 0;
    if (type === "+50") current += 50;
    else if (type === "+100") current += 100;
    else if (type === "+500") current += 500;
    else if (type === "x2") current *= 2;
    else if (type === "1/2") current = Math.max(1, Math.floor(current / 2));
    
    setBetAmount(String(current));
  };

  const history = [
    { m: "2.14x", c: "text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10" },
    { m: "1.03x", c: "text-rose-500 border-rose-500/30 bg-rose-500/10" },
    { m: "5.67x", c: "text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10" },
    { m: "1.88x", c: "text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10" },
    { m: "1.22x", c: "text-rose-500 border-rose-500/30 bg-rose-500/10" },
  ];

  const players = [
    { name: "Arjun K", bet: 100 },
    { name: "Priya S", bet: 200 },
    { name: "Rahul M", bet: 500 },
    { name: "Sneha T", bet: 50 },
    { name: "Dev R", bet: 300 },
    { name: "Anita P", bet: 150 },
    { name: "Karan B", bet: 400 },
    { name: "Meera V", bet: 250 },
  ];

  useEffect(() => {
    if (gameState === 'flying') {
      const interval = setInterval(() => {
        setMultiplier((prev) => prev + 0.01 + (prev * 0.005));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'flying') {
      if (multiplier >= crashPoint) {
        setGameState('crashed');
        setMultiplier(crashPoint);
        if (activeBetAmount > 0) {
           setMyBetsHistory(curr => [{ 
             date: new Date().toLocaleTimeString(), 
             amount: activeBetAmount, 
             status: 'lost' 
           }, ...curr]);
           setActiveBetAmount(0);
        }
      } else if (autoCashoutEnabled && activeBetAmount > 0 && multiplier >= Number(autoCashout)) {
        let rawPayout = activeBetAmount * Number(autoCashout);
        let profit = rawPayout - activeBetAmount;
        let adminFee = profit > 0 ? profit * 0.04 : 0;
        let payout = rawPayout - adminFee;
        setCashedOutAmount(payout);
        if (onResult) {
          onResult(payout);
        }
        setMyBetsHistory(curr => [{ 
          date: new Date().toLocaleTimeString(), 
          amount: activeBetAmount, 
          multiplier: Number(autoCashout), 
          payout: payout, 
          status: 'won' 
        }, ...curr]);
        setActiveBetAmount(0);
      }
    }
  }, [multiplier, gameState, crashPoint, activeBetAmount, autoCashout, autoCashoutEnabled, onResult]);

  return (
    <div className="w-full space-y-4 max-w-5xl mx-auto pb-8 font-sans">
      {/* Header */}
      <div className="bg-[#18212e] px-4 py-2 sm:px-6 sm:py-3 rounded-2xl border border-slate-700/50 flex justify-between items-center shadow-lg">
        <div className="text-xl sm:text-2xl font-black italic tracking-widest uppercase flex items-center">
          <span className="text-white">AVIA</span>
          <span className="text-rose-500">TOR</span>
        </div>
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="text-slate-400 text-[10px] sm:text-xs font-medium text-right leading-tight">
            Round<br />#5143
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 font-bold px-4 py-1.5 sm:px-6 sm:py-2 rounded-full text-sm sm:text-base shadow-[0_0_15px_rgba(234,179,8,0.15)] flex items-center gap-2">
            ₹ {balance.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Main Display Area */}
      <div className="bg-[#0b1016] h-50 sm:h-70 md:h-80 rounded-2xl border border-slate-700/50 relative overflow-hidden flex flex-col justify-end shadow-inner">
        {/* Starry background effect */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 left-[10%] w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-[30%] left-[25%] w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-[15%] left-[80%] w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-[60%] left-[70%] w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-[40%] left-[40%] w-1 h-1 bg-white rounded-full"></div>
        </div>

        {/* Clouds overlay */}
        <div className="absolute right-[5%] top-[15%] flex gap-[-10px] opacity-20">
          <div className="w-16 h-16 bg-slate-400 rounded-full blur-sm"></div>
          <div className="w-20 h-20 bg-slate-400 rounded-full -ml-8 mt-2 blur-sm"></div>
          <div className="w-16 h-16 bg-slate-400 rounded-full -ml-10 -mt-2 blur-sm"></div>
        </div>

        <div className="absolute left-[30%] top-[25%] flex gap-[-10px] opacity-10">
          <div className="w-24 h-24 bg-slate-400 rounded-full blur-md"></div>
          <div className="w-20 h-20 bg-slate-400 rounded-full -ml-8 mt-4 blur-md"></div>
        </div>

        {/* Center Multiplier */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 flex-col">
          {cashedOutAmount && gameState === 'flying' && activeBetAmount === 0 && (
             <div className="absolute top-1/4 bg-[#00ff88]/20 border border-[#00ff88]/50 text-[#00ff88] px-4 py-2 rounded-full font-bold animate-bounce shadow-[0_0_15px_rgba(0,255,136,0.3)] z-50 text-center flex flex-col items-center">
               <span>You Cashed Out: ₹{cashedOutAmount.toFixed(2)}</span>
               <span className="text-[10px] text-[#00ff88]/80 font-normal mt-0.5 whitespace-nowrap">Includes 4% admin fee on profit</span>
             </div>
          )}
          {gameState === 'crashed' && (
             <div className="absolute top-1/4 text-rose-500 font-bold text-lg animate-pulse drop-shadow-[0_0_10px_rgba(244,63,94,0.5)] z-50 whitespace-nowrap bg-black/60 px-4 py-2 rounded-lg border border-rose-500/50 uppercase tracking-widest text-center mt-4">
               Flew Away!<br/><span className="text-sm tracking-normal">({multiplier.toFixed(2)}x)</span>
             </div>
          )}
          <div className="relative flex items-center justify-center">
             <div className={`text-[60px] sm:text-[80px] md:text-[100px] font-black drop-shadow-[0_0_30px_rgba(0,255,136,0.5)] font-mono tracking-tighter mix-blend-screen leading-none transition-colors ${gameState === 'crashed' ? 'text-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.5)]' : 'text-[#00ff88]'}`}>
               {multiplier.toFixed(2)}x
             </div>
            {/* Plane Icon near the multiplier */}
             <Plane className={`w-10 h-10 sm:w-16 sm:h-16 absolute -top-4 -right-8 sm:-top-4 sm:-right-16 filter transition-all ${gameState === 'crashed' ? 'text-rose-500 fill-rose-500 translate-y-16 translate-x-8 rotate-[-10deg] opacity-0 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)] duration-500' : 'text-[#00ff88] fill-[#00ff88] drop-shadow-[0_0_15px_rgba(0,255,136,0.6)] rotate-[-30deg] animate-[pulse_1s_ease-in-out_infinite] duration-50'}`} />
          </div>
        </div>

        {/* Grid lines or curve (Optional, doing simple bottom line instead for style) */}
        <div className="absolute bottom-0 left-0 right-0 h-25 bg-linear-to-t from-[#00ff88]/5 to-transparent border-t border-[#00ff88]/10"></div>
      </div>

      {/* History Bar */}
      <div className="flex gap-3 overflow-x-auto py-1 px-1 custom-scrollbar">
        {history.map((h, i) => (
          <div
            key={i}
            className={`px-4 py-1.5 rounded-full text-sm font-bold border ${h.c} shrink-0`}
          >
            {h.m}
          </div>
        ))}
      </div>

      {/* Controls Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4">
        {/* YOUR BET Column */}
        <div className="bg-[#18212e] p-2 sm:p-4 rounded-xl border border-slate-700/50 lg:col-span-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="bg-[#212b3a] border border-slate-600 rounded-lg p-1.5 mb-2 shadow-inner">
              <input
                type="text"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-transparent text-center text-white font-bold text-base sm:text-lg outline-none"
              />
            </div>

            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {["+50", "+100", "+500", "x2"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => adjustBet(btn)}
                  className="bg-[#212b3a] border border-slate-600 hover:border-slate-400 text-white font-bold py-1.5 rounded-md text-[10px] sm:text-xs transition-colors shadow-sm"
                >
                  {btn}
                </button>
              ))}
            </div>
            
            <div className="mb-2 flex gap-1.5">
              <button 
                onClick={() => adjustBet("1/2")}
                className="bg-[#212b3a] border border-slate-600 hover:border-slate-400 text-white font-bold w-10 sm:w-12 py-1 rounded-md text-[10px] sm:text-xs transition-colors shadow-sm"
              >
                ½
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <button 
                onClick={() => setAutoCashoutEnabled(!autoCashoutEnabled)}
                className={`text-[9px] sm:text-[10px] items-center flex font-semibold text-left leading-tight w-12 sm:w-14 uppercase transition-colors ${autoCashoutEnabled ? 'text-[#00ff88]' : 'text-slate-400'}`}
              >
                Auto cash {autoCashoutEnabled ? 'ON' : 'OFF'}
              </button>
              <div className={`flex-1 border rounded-lg p-1 shadow-inner max-w-20 transition-colors ${autoCashoutEnabled ? 'bg-[#212b3a] border-[#00ff88]/50' : 'bg-[#1a212d] border-slate-700'}`}>
                <input
                  type="text"
                  value={autoCashout}
                  onChange={(e) => setAutoCashout(e.target.value)}
                  disabled={!autoCashoutEnabled}
                  className={`w-full bg-transparent text-center font-bold text-sm outline-none transition-colors ${autoCashoutEnabled ? 'text-white' : 'text-slate-500'}`}
                />
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              if (gameState === 'waiting' || gameState === 'crashed') {
                const bet = Number(betAmount) || 0;
                if (bet > balance) {
                  alert("Insufficient balance");
                  return;
                }
                if (onResult) {
                  onResult(-bet);
                }
                setGameState('flying');
                setMultiplier(1.0);
                setActiveBetAmount(bet);
                setCashedOutAmount(null);
                
                // RTP Crash Distribution
                const rand = Math.random();
                let crash = 1.0;
                if (rand < 0.30) {
                  // 30% chance: 1.00x – 1.20x
                  crash = 1.00 + (Math.random() * 0.20);
                } else if (rand < 0.54) {
                  // 24% chance: 1.21x – 1.50x
                  crash = 1.21 + (Math.random() * 0.29);
                } else if (rand < 0.72) {
                  // 18% chance: 1.51x – 2.00x
                  crash = 1.51 + (Math.random() * 0.49);
                } else if (rand < 0.92) {
                  // 20% chance: 2.01x – 5.00x
                  crash = 2.01 + (Math.random() * 2.99);
                } else if (rand < 0.97) {
                  // 5% chance: 5.01x – 10.00x
                  crash = 5.01 + (Math.random() * 4.99);
                } else {
                  // 3% chance: 10.00x+ (Capped at 30x for playability)
                  crash = 10.01 + (Math.random() * 19.99);
                }
                
                setCrashPoint(Number(crash.toFixed(2)));
              } else if (gameState === 'flying' && activeBetAmount > 0) {
                let rawPayout = activeBetAmount * multiplier;
                let profit = rawPayout - activeBetAmount;
                let adminFee = profit > 0 ? profit * 0.04 : 0;
                let payout = rawPayout - adminFee;
                setCashedOutAmount(payout);
                if (onResult) {
                  onResult(payout);
                }
                setMyBetsHistory(curr => [{ 
                  date: new Date().toLocaleTimeString(), 
                  amount: activeBetAmount, 
                  multiplier: multiplier, 
                  payout: payout, 
                  status: 'won' 
                }, ...curr]);
                setActiveBetAmount(0);
              }
            }}
            disabled={gameState === 'flying' && activeBetAmount === 0}
            className={`w-full py-2.5 border-2 rounded-lg font-black tracking-widest text-sm transition-all shadow-md active:scale-[0.98]
              ${gameState === 'flying' && activeBetAmount > 0
                ? 'bg-orange-500 text-white border-orange-400 hover:bg-orange-600' 
                : gameState === 'flying' && activeBetAmount === 0
                ? 'bg-[#212b3a] text-slate-500 border-slate-700 cursor-not-allowed'
                : 'bg-[#00ff88] text-[#05100a] border-[#00ff88] hover:bg-[#00cc6a] hover:border-[#00cc6a]'
              }`}
          >
            {gameState === 'flying' && activeBetAmount > 0 
              ? `CASH OUT ₹${(activeBetAmount * multiplier).toFixed(2)}` 
              : gameState === 'flying' && activeBetAmount === 0
              ? 'WAITING...'
              : 'BET'}
          </button>
        </div>

        {/* LIVE PLAYERS Column */}
        <div className="bg-[#18212e] p-2 sm:p-4 rounded-xl border border-slate-700/50 lg:col-span-7 shadow-lg">
          <h3 className="text-slate-400 font-bold uppercase tracking-widest mb-2 sm:mb-3 text-[10px] sm:text-xs">
            Live Players
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 h-35 overflow-y-auto pr-2 custom-scrollbar">
            {players.map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-1.5 sm:py-2 border-b border-slate-700/50"
              >
                <div className="text-slate-300 text-xs sm:text-sm font-medium w-3/5 truncate">
                  {p.name}
                </div>
                <div className="flex items-center gap-4 justify-end w-2/5">
                  <span className="text-yellow-500 font-bold text-xs sm:text-sm">
                    ₹{p.bet}
                  </span>
                  <span className="text-slate-500 font-bold text-xs sm:text-sm">...</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* My Bets History Section */}
      <div className="bg-[#18212e] p-4 sm:p-5 rounded-xl border border-slate-700/50 shadow-lg mt-6!">
        <h3 className="text-slate-400 font-bold uppercase tracking-widest mb-3 text-xs sm:text-sm">
          My Bets History
        </h3>
        {myBetsHistory.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-sm font-medium border border-slate-700/30 rounded-lg border-dashed">
            No bets placed yet.
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="pb-3 px-4 font-semibold text-slate-400">Date</th>
                  <th className="pb-3 px-4 font-semibold text-slate-400">Bet Amount</th>
                  <th className="pb-3 px-4 font-semibold text-slate-400 text-center">Multiplier</th>
                  <th className="pb-3 px-4 font-semibold text-slate-400 text-right">Payout</th>
                </tr>
              </thead>
              <tbody>
                {myBetsHistory.map((bet, idx) => (
                  <tr key={idx} className="border-b border-slate-700/20 last:border-0 hover:bg-[#212b3a]/50 transition-colors">
                    <td className="py-3 px-4 text-slate-300 text-xs">{bet.date}</td>
                    <td className="py-3 px-4 text-white font-medium">₹{bet.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      {bet.status === 'won' ? (
                        <span className="text-[#00ff88] bg-[#00ff88]/10 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border border-[#00ff88]/20">{bet.multiplier?.toFixed(2)}x</span>
                      ) : (
                        <span className="text-rose-500 bg-rose-500/10 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border border-rose-500/20">Crashed</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {bet.status === 'won' ? (
                         <span className="text-[#00ff88] font-bold">+₹{bet.payout?.toFixed(2)}</span>
                       ) : (
                         <span className="text-rose-500 font-bold">-₹{bet.amount.toFixed(2)}</span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
