import React, { useState, useEffect, useRef } from "react";
import { Plane, Volume2, VolumeX } from "lucide-react";
import { getAuth } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, onSnapshot } from "firebase/firestore";
import { soundManager } from "./AviatorSounds";

interface LivePlayer {
   id: string;
   name: string;
   bet: number;
   cashoutMultiplier: number | null; 
   cashedOut: boolean;
   profit: number | null;
}

const generatePlayerName = () => {
    const fn = ["Aarav", "Vihaan", "Aditya", "Arjun", "Rohan", "Priya", "Ananya", "Diya", "Isha", "Neha", "Kavya", "Rahul", "Amit", "Raj", "Vikram", "Sneha", "Kriti", "Pooja", "Riya"];
    const ln = ["K.", "S.", "M.", "T.", "R.", "P.", "B.", "V.", "D.", "J.", "G.", "C."];
    return fn[Math.floor(Math.random() * fn.length)] + " " + ln[Math.floor(Math.random() * ln.length)];
};

const getTargetMultiplier = () => {
   const rand = Math.random();
   if (rand < 0.5) return 1.01 + Math.random() * 0.49; 
   if (rand < 0.8) return 1.51 + Math.random() * 0.99; 
   if (rand < 0.95) return 2.51 + Math.random() * 2.49; 
   return 5.01 + Math.random() * 15.0; 
};

// Bet Panel Component
const BetPanel = ({ 
  id, balance, gameState, multiplier, countdown, 
  onPlaceBet, onCashOut, onResult 
}: any) => {
  const [betAmount, setBetAmount] = useState("10");
  const [autoCashout, setAutoCashout] = useState("2.00");
  const [autoCashoutEnabled, setAutoCashoutEnabled] = useState(false);
  const [autoBetEnabled, setAutoBetEnabled] = useState(false);
  
  const [activeBetAmount, setActiveBetAmount] = useState(0); 
  const [cashedOutAmount, setCashedOutAmount] = useState<number | null>(null);

  const adjustBet = (val: number) => {
      let current = Number(betAmount) || 0;
      current += val;
      if (current < 10) current = 10;
      setBetAmount(String(current));
  };
  
  const placeBet = () => {
      const bet = Number(betAmount) || 0;
      if (bet > balance) {
        alert("Insufficient balance");
        return;
      }
      setActiveBetAmount(bet);
      setCashedOutAmount(null);
      onPlaceBet(bet);
  };

   const cashOut = () => {
      if (gameState === 'flying' && activeBetAmount > 0) {
        let rawPayout = activeBetAmount * multiplier;
        let profit = rawPayout - activeBetAmount;
        let adminFee = profit > 0 ? profit * 0.04 : 0;
        let payout = rawPayout - adminFee;
        setCashedOutAmount(payout);
        onCashOut(activeBetAmount, multiplier, payout);
        setActiveBetAmount(0);
      }
  };

  // Reset when crashed
  useEffect(() => {
     if (gameState === 'crashed') {
         if (activeBetAmount > 0) {
            // Lost
            onCashOut(activeBetAmount, 0, 0); // 0 means lost
            setActiveBetAmount(0);
         }
     } else if (gameState === 'waiting' && countdown === 10) {
         setCashedOutAmount(null);
         if (autoBetEnabled && activeBetAmount === 0 && Number(betAmount) <= balance) {
             placeBet();
         }
     }
  }, [gameState, countdown, autoBetEnabled]);

  // Auto cashout
  useEffect(() => {
     if (gameState === 'flying' && activeBetAmount > 0 && autoCashoutEnabled && multiplier >= Number(autoCashout)) {
         cashOut();
     }
  }, [multiplier, gameState, autoCashoutEnabled, activeBetAmount, autoCashout]);

  return (
      <div className="bg-[#1e2329] p-3 rounded-2xl flex flex-col sm:flex-row gap-3 border border-slate-700 w-full relative">
         <div className="flex flex-col gap-2 flex-1">
             <div className="flex justify-between px-2 text-xs font-bold text-slate-400">
                <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                  <input type="checkbox" checked={autoBetEnabled} onChange={(e) => setAutoBetEnabled(e.target.checked)} className="accent-[#28a745]" /> Auto Bet
                </label>
                <label className="flex items-center gap-1 cursor-pointer hover:text-white">
                  <input type="checkbox" checked={autoCashoutEnabled} onChange={(e) => setAutoCashoutEnabled(e.target.checked)} className="accent-[#28a745]" /> Auto Cashout
                </label>
             </div>
             
             {autoCashoutEnabled && (
                 <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-xs px-2">Cashout at</span>
                    <input type="number" value={autoCashout} onChange={(e) => setAutoCashout(e.target.value)} className="w-16 bg-transparent text-white font-bold text-sm outline-none text-right" step="0.1" />
                    <span className="text-white text-xs px-1">x</span>
                 </div>
             )}

             <div className="flex items-center gap-2">
                 <div className="flex-1 bg-black/40 border border-slate-700 rounded-xl p-1 flex items-center justify-between">
                     <button onClick={() => adjustBet(-10)} className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 font-bold">-</button>
                     <input type="number" value={betAmount} onChange={(e) => setBetAmount(e.target.value)} className="w-full bg-transparent text-center text-white font-black text-lg outline-none" />
                     <button onClick={() => adjustBet(10)} className="w-6 h-6 rounded-full bg-slate-700 text-white flex items-center justify-center hover:bg-slate-600 font-bold">+</button>
                 </div>
             </div>
             <div className="grid grid-cols-4 gap-1">
                 {[10, 50, 100, 500].map((v) => (
                    <button key={v} onClick={() => setBetAmount(String(v))} className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold py-1 rounded-full border border-slate-700 transition-colors">{v}</button>
                 ))}
             </div>
         </div>

         <div className="w-full sm:w-1/3 flex">
            {gameState === 'flying' && activeBetAmount > 0 ? (
               <button onClick={cashOut} className="w-full bg-[#d68a18] hover:bg-[#e09828] text-white rounded-xl shadow-[0_0_15px_rgba(214,138,24,0.4)] flex flex-col justify-center items-center font-black transition-all h-full min-h-15">
                  <span className="text-sm tracking-wider uppercase">Cash Out</span>
                  <span className="text-xl">₹{(activeBetAmount * multiplier).toFixed(2)}</span>
               </button>
            ) : gameState === 'waiting' && activeBetAmount > 0 ? (
               <button onClick={() => { setActiveBetAmount(0); onPlaceBet(-activeBetAmount); }} className="w-full bg-[#cb3030] hover:bg-[#e03838] text-white rounded-xl flex justify-center items-center font-black transition-all shadow-[0_0_15px_rgba(203,48,48,0.4)] h-full min-h-15">
                  <div className="flex flex-col items-center">
                      <span className="text-xs uppercase tracking-wider">Cancel</span>
                      <span className="text-lg">₹{activeBetAmount}</span>
                  </div>
               </button>
            ) : (
               <button onClick={placeBet} disabled={gameState !== 'waiting' || countdown <= 3} className={`w-full rounded-xl flex justify-center items-center font-black transition-all h-full min-h-15 ${gameState === 'waiting' && countdown > 3 ? 'bg-[#28a745] hover:bg-[#34c759] text-white shadow-[0_0_15px_rgba(40,167,69,0.4)]' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}>
                  <span className="text-lg uppercase tracking-wider">Bet</span>
               </button>
            )}
         </div>
         
         {cashedOutAmount && gameState === 'flying' && activeBetAmount === 0 && (
             <div className="absolute -top-3 inset-x-0 mx-auto w-max bg-[#28a745] text-white text-[10px] font-bold px-3 py-1 rounded-full animate-bounce shadow-lg">
                 Cashed Out ₹{cashedOutAmount.toFixed(2)}!
             </div>
         )}
      </div>
  );
};

export default function AviatorGame({ balance, onResult }: { balance: number, onResult?: (amount: number) => void }) {
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [crashPoint, setCrashPoint] = useState(2.50);
  const [countdown, setCountdown] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const [myBetsHistory, setMyBetsHistory] = useState<{ id?: string, date: string, amount: number, multiplier?: number, payout?: number, status: 'won' | 'lost', userName?: string}[]>([]);
  const [allBets, setAllBets] = useState<{ id?: string, date: string, amount: number, multiplier?: number, payout?: number, status: 'won' | 'lost', userName?: string}[]>([]);
  
  const hasInitializedSound = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // We don't need activeBetAmount, betAmount, etc. here because they are managed inside BetPanel 
  // Wait, if the bets need to send updates to the history, BetPanel calls onPlaceBet and onCashOut.
  const handlePlaceBet = (amount: number) => {
     handleInteraction();
     if (onResult) onResult(-amount);
  };

  const handleCashOut = (amount: number, mult: number, payout: number) => {
     if (mult > 0) {
        soundManager.playCashout(true);
        if (onResult) onResult(payout);
        const betData = { date: new Date().toLocaleTimeString(), amount, multiplier: mult, payout, status: 'won' };
        saveBetToFirestore(betData);
     } else {
        const betData = { date: new Date().toLocaleTimeString(), amount, status: 'lost' };
        saveBetToFirestore(betData);
     }
  };

  useEffect(() => {
    let unsubMyBets = () => {};
    let unsubAllBets = () => {};
    
    const fn = async () => {
      try {
        const { getAuth } = await import("firebase/auth");
        const { getFirestore, collection, query, where, onSnapshot } = await import("firebase/firestore");
        const auth = getAuth();
        if (!auth.currentUser) return;
        const db = getFirestore();
        
        // My Bets
        const qMyBets = query(
          collection(db, `users/${auth.currentUser.uid}/bets`),
          where("gameId", "==", "aviator")
        );
        unsubMyBets = onSnapshot(qMyBets, (snapshot) => {
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

        // All Bets globally
        const qAllBets = query(
          collection(db, `aviator_bets`)
        );
        unsubAllBets = onSnapshot(qAllBets, (snapshot) => {
          const bets: any[] = [];
          snapshot.forEach(doc => {
            bets.push({ id: doc.id, ...doc.data() });
          });
          bets.sort((a, b) => {
            const t1 = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
            const t2 = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
            return t2 - t1;
          });
          setAllBets(bets.slice(0, 50)); // keep distinct max rows
        });

      } catch (e) {
        console.error(e);
      }
    };
    fn();
    return () => {
       unsubMyBets();
       unsubAllBets();
    };
  }, []);

  const handleInteraction = () => {
      if (!hasInitializedSound.current) {
          hasInitializedSound.current = true;
          soundManager.init();
      }
  };

  const toggleSound = () => {
      soundManager.toggle();
      setSoundEnabled(soundManager.enabled);
  };

  const saveBetToFirestore = async (betData: any) => {
    try {
      const { getAuth } = await import("firebase/auth");
      const { getFirestore, collection, addDoc, serverTimestamp } = await import("firebase/firestore");
      const auth = getAuth();
      if (!auth.currentUser) return;
      const db = getFirestore();
      
      const payload = {
        ...betData,
        gameId: 'aviator',
        userId: auth.currentUser.uid,
        userName: auth.currentUser.email?.split('@')[0] || 'User',
        createdAt: serverTimestamp()
      };
      
      await addDoc(collection(db, `users/${auth.currentUser.uid}/bets`), payload);
      await addDoc(collection(db, `aviator_bets`), payload);
    } catch (e) {
      console.error("Failed to save bet", e);
    }
  };

  // ---------------------------------
  // Draw Canvas Animation
  // ---------------------------------
  useEffect(() => {
     const canvas = canvasRef.current;
     if (!canvas) return;
     const ctx = canvas.getContext('2d');
     if (!ctx) return;
     
     let animationId: number;
     const render = () => {
         const w = canvas.width;
         const h = canvas.height;
         ctx.clearRect(0, 0, w, h);
         
         const timeFactor = Math.min(1, Math.max(0, (multiplier - 1) / 4)); // max visual spread at 5x
         
         ctx.beginPath();
         ctx.moveTo(0, h);
         
         // bezier curve
         const endX = w * 0.1 + (w * 0.8 * timeFactor);
         const endY = h * 0.9 - (h * 0.8 * timeFactor);
         
         const cp1x = endX * 0.5;
         const cp1y = h;
         const cp2x = endX * 0.8;
         const cp2y = endY;
         
         if (gameState === 'waiting') {
             // no curve
         } else {
             ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
             
             ctx.lineWidth = 4;
             ctx.strokeStyle = gameState === 'crashed' ? '#e11d48' : '#e11d48'; // red curve always
             ctx.stroke();
             
             // fill under curve
             ctx.lineTo(endX, h);
             ctx.lineTo(0, h);
             ctx.fillStyle = gameState === 'crashed' ? 'rgba(225, 29, 72, 0)' : 'rgba(225, 29, 72, 0.2)';
             ctx.fill();
         }
         
         animationId = requestAnimationFrame(render);
     };
     render();
     
     return () => cancelAnimationFrame(animationId);
  }, [multiplier, gameState]);

  const [crashHistory, setCrashHistory] = useState<{ m: string, c: string }[]>([]);

  useEffect(() => {
    if (gameState === 'waiting') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            startFlying();
            return 0;
          }
          if (prev <= 4) {
             soundManager.playTick();
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'crashed') {
      soundManager.stopEngine();
      soundManager.playCrash();
      
      setCrashHistory(curr => {
         const isGreen = crashPoint >= 1.5;
         return [{
            m: `${crashPoint.toFixed(2)}x`,
            c: isGreen ? "text-[#28a745] border-[#28a745]/30 bg-[#28a745]/10" : "text-rose-500 border-rose-500/30 bg-rose-500/10"
         }, ...curr].slice(0, 15);
      });
      
      const timer = setTimeout(() => {
        setGameState('waiting');
        setCountdown(10);
        setCrashPoint(generateCrashPoint());
        setMultiplier(1.0);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [gameState, crashPoint]);

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
    soundManager.startEngine();
  };

  useEffect(() => {
    if (gameState === 'flying') {
      const interval = setInterval(() => {
        setMultiplier((prev) => {
            const next = prev + 0.01 + (prev * 0.005);
            soundManager.rampEngine(next);
            return next;
        });
      }, 50);
      return () => clearInterval(interval);
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'flying') {
      // Check User constraints
      if (multiplier >= crashPoint) {
        setGameState('crashed');
        setMultiplier(crashPoint);
      }
    }
  }, [multiplier, gameState, crashPoint]);

  return (
    <div className="w-full space-y-4 max-w-5xl mx-auto pb-8 font-sans" onClick={handleInteraction}>
      {/* Main Display Area */}
      <div className="bg-[#0b1016] h-87.5 sm:h-112.5 md:h-125 rounded-2xl border border-slate-700/50 relative overflow-hidden flex flex-col justify-end shadow-inner">
        {/* Sound toggle button */}
        <button 
           onClick={(e) => { e.stopPropagation(); toggleSound(); }} 
           className="absolute top-4 right-4 z-50 bg-slate-800/80 p-2 rounded-full border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5 opacity-50" />}
        </button>

        {/* Starry background effect */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute top-10 left-[10%] w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-[30%] left-[25%] w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-[15%] left-[80%] w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-[60%] left-[70%] w-0.5 h-0.5 bg-white rounded-full"></div>
          <div className="absolute top-[40%] left-[40%] w-1 h-1 bg-white rounded-full"></div>
        </div>

        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" width={800} height={400} />

        {/* Center Multiplier */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 flex-col">
          {gameState === 'crashed' && (
             <div className="absolute top-1/4 text-rose-500 font-bold text-lg animate-pulse drop-shadow-[0_0_10px_rgba(244,63,94,0.5)] z-50 whitespace-nowrap bg-black/60 px-4 py-2 rounded-lg border border-rose-500/50 uppercase tracking-widest text-center mt-4">
               Flew Away!<br/><span className="text-sm tracking-normal">({multiplier.toFixed(2)}x)</span>
             </div>
          )}
          {gameState === 'waiting' && (
            <div className="absolute top-1/4 flex flex-col items-center w-full max-w-sm px-6 z-50">
              <div className={`text-sm uppercase tracking-[0.2em] font-bold px-6 py-2 rounded-full border shadow-xl transition-colors duration-300 ${countdown <= 3 ? 'text-rose-500 bg-rose-500/10 border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.3)] animate-pulse' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_rgba(52,211,153,0.1)]'}`}>
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
             <div className={`text-[60px] sm:text-[80px] md:text-[100px] font-black drop-shadow-[0_0_30px_rgba(40,167,69,0.5)] font-mono tracking-tighter mix-blend-screen leading-none transition-colors ${gameState === 'crashed' ? 'text-rose-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.5)]' : 'text-[#28a745]'}`}>
               {multiplier.toFixed(2)}x
             </div>
             {gameState !== 'waiting' && <Plane className={`w-10 h-10 sm:w-16 sm:h-16 absolute -top-4 -right-8 sm:-top-4 sm:-right-16 filter transition-all ${gameState === 'crashed' ? 'text-rose-500 fill-rose-500 translate-y-16 translate-x-8 -rotate-12 opacity-0 drop-shadow-[0_0_15px_rgba(244,63,94,0.6)] duration-500' : 'text-[#e11d48] fill-[#e11d48] drop-shadow-[0_0_15px_rgba(225,29,72,0.6)] rotate-[-30deg] animate-pulse duration-50'}`} />}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-25 bg-linear-to-t from-[#e11d48]/5 to-transparent border-t border-[#e11d48]/20"></div>
      </div>

      {/* Dual Bet Panels */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <BetPanel id={1} balance={balance} gameState={gameState} multiplier={multiplier} countdown={countdown} onPlaceBet={handlePlaceBet} onCashOut={handleCashOut} onResult={onResult} />
          <BetPanel id={2} balance={balance} gameState={gameState} multiplier={multiplier} countdown={countdown} onPlaceBet={handlePlaceBet} onCashOut={handleCashOut} onResult={onResult} />
      </div>

      {/* History Bar */}
      {crashHistory.length > 0 && (
        <div className="flex gap-3 overflow-x-auto py-1 px-1 custom-scrollbar">
          {crashHistory.map((h, i) => (
            <div
              key={i}
              className={`px-4 py-1.5 rounded-full text-sm font-bold border ${h.c} shrink-0`}
            >
              {h.m}
            </div>
          ))}
        </div>
      )}

      {/* Bottom Data Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mt-4">
        
        {/* ALL BETS Section (Real Data) */}
        <div className="bg-[#1e2329] rounded-xl border border-slate-700/50 shadow-lg flex flex-col h-100">
          <div className="p-3 border-b border-slate-700/50 bg-[#1e2329] rounded-t-xl flex justify-between items-center">
             <h3 className="text-slate-300 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-[#28a745] animate-pulse"></span>
                 All Bets ({allBets.length})
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
             <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#1e2329] sticky top-0 z-10 text-slate-500">
                  <tr>
                    <th className="py-2 px-3 font-semibold w-1/3">User</th>
                    <th className="py-2 px-3 font-semibold">Bet</th>
                    <th className="py-2 px-3 font-semibold">X</th>
                    <th className="py-2 px-3 font-semibold text-right w-1/3">Cash out</th>
                  </tr>
                </thead>
                <tbody>
                 {allBets.length === 0 ? (
                    <tr><td colSpan={4} className="text-slate-500 text-xs text-center py-4 font-medium italic">Waiting for players to join...</td></tr>
                 ) : (
                    allBets.map((p, i) => (
                      <tr
                        key={p.id || i}
                        className={`border-b border-slate-700/20 last:border-0 transition-colors ${
                           p.status === 'won' 
                              ? 'bg-[#28a745]/10' 
                              : p.status === 'lost'  
                                 ? 'bg-rose-900/10 opacity-70' 
                                 : 'hover:bg-slate-800'
                        }`}
                      >
                         <td className={`py-2 px-3 font-semibold ${p.status === 'won' ? 'text-white' : p.status === 'lost' ? 'text-rose-400' : 'text-slate-300'}`}>{p.userName || 'User'}</td>
                         <td className="py-2 px-3 font-bold text-slate-300">{p.amount}</td>
                         <td className="py-2 px-3">
                           {p.status === 'won' && p.multiplier ? (
                              <span className="text-[#28a745] font-bold bg-[#28a745]/10 px-1.5 py-0.5 rounded-full">{p.multiplier?.toFixed(2)}x</span>
                           ) : (
                              <span className="text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full text-[10px]">Crashed</span>
                           )}
                         </td>
                         <td className="py-2 px-3 text-right">
                           {p.status === 'won' && p.payout ? (
                              <span className="text-white font-bold">{p.payout.toFixed(2)}</span>
                           ) : (
                              <span className="text-slate-500">-</span>
                           )}
                         </td>
                      </tr>
                    ))
                 )}
                </tbody>
             </table>
          </div>
        </div>

        {/* My Bets History Column */}
        <div className="bg-[#1e2329] rounded-xl border border-slate-700/50 shadow-lg flex flex-col h-100">
          <div className="p-3 border-b border-slate-700/50 bg-[#1e2329] rounded-t-xl flex justify-between items-center">
             <h3 className="text-slate-300 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                 My Bets
             </h3>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
             <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="bg-[#1e2329] sticky top-0 z-10 text-slate-500">
                  <tr>
                    <th className="py-2 px-3 font-semibold">Date</th>
                    <th className="py-2 px-3 font-semibold">Bet</th>
                    <th className="py-2 px-3 font-semibold">X</th>
                    <th className="py-2 px-3 font-semibold text-right">Cash out</th>
                  </tr>
                </thead>
                <tbody>
                 {myBetsHistory.length === 0 ? (
                    <tr><td colSpan={4} className="text-slate-500 text-xs text-center py-4 font-medium italic">No bets placed yet.</td></tr>
                 ) : (
                    myBetsHistory.map((bet, idx) => (
                      <tr key={idx} className={`border-b border-slate-700/20 last:border-0 transition-colors ${bet.status === 'won' ? 'bg-[#28a745]/10' : 'bg-slate-800'}`}>
                         <td className="py-2 px-3 text-slate-400">{bet.date}</td>
                         <td className="py-2 px-3 font-bold text-slate-300">{bet.amount}</td>
                         <td className="py-2 px-3">
                           {bet.status === 'won' ? (
                              <span className="text-[#28a745] font-bold bg-[#28a745]/10 px-1.5 py-0.5 rounded-full">{bet.multiplier?.toFixed(2)}x</span>
                           ) : (
                              <span className="text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-full text-[10px]">Crashed</span>
                           )}
                         </td>
                         <td className="py-2 px-3 text-right text-white font-bold">
                           {bet.status === 'won' && bet.payout ? bet.payout.toFixed(2) : '-'}
                         </td>
                      </tr>
                    ))
                 )}
                </tbody>
             </table>
          </div>
        </div>
      </div>
    </div>
  );
}
