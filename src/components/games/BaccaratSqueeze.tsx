import React, { useState, useEffect } from "react";
import { Plane } from "lucide-react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";

export default function AviatorGame({ balance, onResult }: { balance: number, onResult?: (amount: number) => void }) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [betAmount, setBetAmount] = useState("100");
  const [autoCashout, setAutoCashout] = useState("2.00");
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false);
  
  const [activeBetAmount, setActiveBetAmount] = useState(0); 
  const [cashedOutAmount, setCashedOutAmount] = useState<number | null>(null);
  const [crashPoint, setCrashPoint] = useState(2.50);
  const [countdown, setCountdown] = useState(10);
  
  const [myBetsHistory, setMyBetsHistory] = useState<{ id?: string, date: string, amount: number, multiplier?: number, payout?: number, status: 'won' | 'lost'}[]>([]);

  useEffect(() => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) return;
      const db = getFirestore();
      const q = query(
        collection(db, `users/${auth.currentUser.uid}/bets`),
        where("gameId", "==", "aviator")
      );
      const unsub = onSnapshot(q, (snapshot) => {
        const bets: any[] = [];
        snapshot.forEach(doc => {
          bets.push({ id: doc.id, ...doc.data() });
        });
        bets.sort((a, b) => {
          const t1 = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const t2 = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return t2 - t1;
        });
        setMyBetsHistory(bets);
      });
      return () => unsub();
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveBetToFirestore = async (betData: any) => {
    try {
      const auth = getAuth();
      if (!auth.currentUser) return;
      const db = getFirestore();
      await addDoc(collection(db, `users/${auth.currentUser.uid}/bets`), {
        ...betData,
        gameId: 'aviator',
        createdAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Failed to save bet", e);
    }
  };

  const adjustBet = (type: string) => {
    let current = Number(betAmount) || 0;
    if (type === "+50") current += 50;
    else if (type === "+100") current += 100;
    else if (type === "+500") current += 500;
    else if (type === "x2") current *= 2;
    else if (type === "1/2") current = Math.max(1, Math.floor(current / 2));
    
    setBetAmount(String(current));
  };

  const placeBet = () => {
      const bet = Number(betAmount) || 0;
      if (gameState !== 'waiting' || countdown <= 3) {
        alert("Wait for the next round to place a bet");
        return;
      }
      if (activeBetAmount > 0) {
        return; // already bet
      }
      if (bet > balance) {
        alert("Insufficient balance");
        return;
      }
      if (onResult) {
        onResult(-bet);
      }
      setActiveBetAmount(bet);
      setCashedOutAmount(null);
  };

  const cashOut = () => {
      if (gameState === 'flying' && activeBetAmount > 0) {
        let rawPayout = activeBetAmount * multiplier;
        let profit = rawPayout - activeBetAmount;
        let adminFee = profit > 0 ? profit * 0.04 : 0;
        let payout = rawPayout - adminFee;
        setCashedOutAmount(payout);
        if (onResult) {
          onResult(payout);
        }
        const betData = { 
          date: new Date().toLocaleTimeString(), 
          amount: activeBetAmount, 
          multiplier: multiplier, 
          payout: payout, 
          status: 'won' 
        };
        setMyBetsHistory(curr => [betData as any, ...curr]);
        saveBetToFirestore(betData);
        setActiveBetAmount(0);
      }
  };

  useEffect(() => {
    if (gameState === 'waiting') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            startFlying();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'crashed') {
      const timer = setTimeout(() => {
        setGameState('waiting');
        setCountdown(10);
        setCrashPoint(generateCrashPoint());
        setMultiplier(1.0);
        setCashedOutAmount(null);
        setActiveBetAmount(0);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const generateCrashPoint = () => {
      const rand = Math.random();
      let crash = 1.0;
      if (rand < 0.30) {
        crash = 1.00 + (Math.random() * 0.20);
      } else if (rand < 0.54) {
        crash = 1.21 + (Math.random() * 0.29);
      } else if (rand < 0.72) {
        crash = 1.51 + (Math.random() * 0.49);
      } else if (rand < 0.85) {
        crash = 2.01 + (Math.random() * 0.99);
      } else if (rand < 0.93) {
        crash = 3.01 + (Math.random() * 1.99);
      } else if (rand < 0.97) {
        crash = 5.01 + (Math.random() * 4.99);
      } else if (rand < 0.99) {
        crash = 10.01 + (Math.random() * 39.99);
      } else {
        crash = 50.00 + (Math.random() * 950.00);
      }
      return parseFloat(crash.toFixed(2));
  };

  const startFlying = () => {
    setGameState('flying');
    setMultiplier(1.0);
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
           const betData = { 
             date: new Date().toLocaleTimeString(), 
             amount: activeBetAmount, 
             status: 'lost' 
           };
           setMyBetsHistory(curr => [betData as any, ...curr]);
           saveBetToFirestore(betData);
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
        const betData = { 
          date: new Date().toLocaleTimeString(), 
          amount: activeBetAmount, 
          multiplier: Number(autoCashout), 
          payout: payout, 
          status: 'won' 
        };
        setMyBetsHistory(curr => [betData as any, ...curr]);
        saveBetToFirestore(betData);
        setActiveBetAmount(0);
      }
    }
  }, [multiplier, gameState, crashPoint, activeBetAmount, autoCashout, autoCashoutEnabled, onResult]);

  return (
    <div className="w-full space-y-4 max-w-5xl mx-auto pb-8 font-sans">
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
          {gameState === 'waiting' && (
            <div className="absolute top-1/4 flex flex-col items-center w-full max-w-sm px-6 z-50">
              <div className={`text-sm uppercase tracking-[0.2em] font-bold px-6 py-2 rounded-full border shadow-xl transition-colors duration-300 ${countdown <= 3 ? 'text-rose-500 bg-rose-500/10 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-[pulse_1s_ease-in-out_infinite]' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.1)]'}`}>
                 {countdown <= 3 ? 'BETS CLOSED' : 'WAITING FOR NEXT ROUND'}
              </div>
              
              <div className="w-full mt-6 bg-slate-900/80 rounded-full h-2 overflow-hidden border border-slate-700/50 backdrop-blur-sm">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${countdown <= 3 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.8)]' : 'bg-emerald-500 shadow-[0_0_15px_rgba(52,211,153,0.8)]'}`}
                  style={{ width: `${(countdown / 10) * 100}%` }}
                ></div>
              </div>
              <div className={`mt-3 font-mono text-xl md:text-2xl font-black tracking-widest drop-shadow-md ${countdown <= 3 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                00:{countdown.toString().padStart(2, '0')}
              </div>
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        {/* YOUR BET Column */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-700/50 lg:col-span-4 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-xs">Bet Amount</span>
              <span className="text-emerald-400 font-mono text-xs font-bold">₹ {balance.toFixed(2)} Bal</span>
            </div>
            
            <div className="bg-[#0b1016] border border-slate-700 focus-within:border-emerald-500/50 rounded-xl p-2 mb-4 shadow-inner transition-colors flex items-center">
              <span className="text-slate-500 font-bold px-2">₹</span>
              <input
                type="text"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-transparent text-center text-white font-black text-xl sm:text-2xl outline-none"
              />
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {["+50", "+100", "+500", "x2", "½"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => adjustBet(btn === "½" ? "1/2" : btn)}
                  className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 text-slate-300 font-bold py-2 rounded-lg text-[10px] sm:text-xs transition-all shadow-sm active:scale-95"
                >
                  {btn}
                </button>
              ))}
            </div>
            
            <div className="flex items-center justify-between gap-4 mb-4 bg-slate-800/30 p-3 rounded-xl border border-slate-700/30">
              <div className="flex flex-col">
                <span className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider mb-1">Auto Cashout</span>
                <button 
                  onClick={() => setAutoCashoutEnabled(!autoCashoutEnabled)}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoCashoutEnabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${autoCashoutEnabled ? 'translate-x-4.5' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className={`flex items-center border rounded-lg p-1.5 shadow-inner w-24 transition-colors ${autoCashoutEnabled ? 'bg-[#0b1016] border-emerald-500/50' : 'bg-slate-900 border-slate-700 opacity-50'}`}>
                <input
                  type="text"
                  value={autoCashout}
                  onChange={(e) => setAutoCashout(e.target.value)}
                  disabled={!autoCashoutEnabled}
                  className="w-full bg-transparent text-center font-bold text-sm outline-none text-white"
                />
                <span className="text-slate-500 text-xs font-bold pr-1">x</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => {
              if (gameState === 'waiting') {
                placeBet();
              } else if (gameState === 'flying' && activeBetAmount > 0) {
                cashOut();
              }
            }}
            disabled={(gameState === 'waiting' && countdown <= 3 && activeBetAmount === 0) || (gameState === 'flying' && activeBetAmount === 0) || gameState === 'crashed'}
            className={`w-full py-3 md:py-4 border-2 rounded-xl font-black tracking-widest text-sm md:text-base transition-all shadow-xl active:scale-[0.98]
              ${gameState === 'flying' && activeBetAmount > 0
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)]' 
                : (gameState === 'waiting' && countdown <= 3 && activeBetAmount === 0)
                ? 'bg-rose-600 border-rose-500 text-white cursor-not-allowed shadow-[0_0_20px_rgba(225,29,72,0.4)]'
                : ((gameState === 'flying' || gameState === 'crashed') && activeBetAmount === 0)
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed hidden-glow'
                : 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 border-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)]'
              }`}
          >
            {gameState === 'flying' && activeBetAmount > 0 
              ? `CASH OUT ₹${(activeBetAmount * multiplier).toFixed(2)}` 
              : gameState === 'waiting'
              ? (activeBetAmount > 0 ? `WAITING FOR NEXT ROUND...` : countdown <= 3 ? 'BETS CLOSED' : `BET ₹${betAmount}`)
              : 'WAITING...'}
          </button>
        </div>

        {/* My Bets History Column (Moved up) */}
        <div className="bg-slate-900/80 backdrop-blur-md p-4 sm:p-6 rounded-2xl border border-slate-700/50 lg:col-span-8 shadow-[0_8px_30px_rgb(0,0,0,0.4)] flex flex-col h-full relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-1 bg-gradient-to-l from-emerald-500/50 to-transparent"></div>
          <h3 className="text-slate-400 font-bold uppercase tracking-widest mb-3 sm:mb-4 text-xs flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            My Bets History
          </h3>
          {myBetsHistory.length === 0 ? (
            <div className="flex-1 flex items-center justify-center py-6 text-slate-500 text-sm font-medium border border-slate-700/30 rounded-lg border-dashed">
              No bets placed yet.
            </div>
          ) : (
            <div className="overflow-y-auto overflow-x-auto custom-scrollbar h-35">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-700/50">
                    <th className="pb-2 px-3 font-semibold text-slate-400 text-xs">Date</th>
                    <th className="pb-2 px-3 font-semibold text-slate-400 text-xs text-center">Multiplier</th>
                    <th className="pb-2 px-3 font-semibold text-slate-400 text-xs text-right">Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {myBetsHistory.map((bet, idx) => (
                    <tr key={idx} className="border-b border-slate-700/20 last:border-0 hover:bg-[#212b3a]/50 transition-colors">
                      <td className="py-2 px-3 text-slate-300 text-xs">{bet.date}</td>
                      <td className="py-2 px-3 text-center">
                        {bet.status === 'won' ? (
                          <span className="text-[#00ff88] bg-[#00ff88]/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-[#00ff88]/20">{bet.multiplier?.toFixed(2)}x</span>
                        ) : (
                          <span className="text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full text-[10px] font-bold border border-rose-500/20">Crashed</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-right">
                        {bet.status === 'won' ? (
                           <span className="text-[#00ff88] font-bold text-xs">+₹{bet.payout?.toFixed(2)}</span>
                         ) : (
                           <span className="text-rose-500 font-bold text-xs">-₹{bet.amount.toFixed(2)}</span>
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

      {/* LIVE PLAYERS Section (Moved down) */}
      <div className="bg-[#18212e] p-4 sm:p-5 rounded-xl border border-slate-700/50 shadow-lg mt-6!">
        <h3 className="text-slate-400 font-bold uppercase tracking-widest mb-3 text-xs sm:text-sm">
          Live Players
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 px-2">
          {players.map((p, i) => (
            <div
              key={i}
              className="flex justify-between items-center py-2 px-3 bg-[#212b3a]/50 border border-slate-700/30 rounded-lg hover:bg-[#212b3a] transition-colors"
            >
              <div className="text-slate-300 text-xs sm:text-sm font-medium truncate">
                {p.name}
              </div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-yellow-500 font-bold text-xs sm:text-sm">
                  ₹{p.bet}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
