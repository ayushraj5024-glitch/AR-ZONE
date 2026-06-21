import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Coins, History } from "lucide-react";

interface HeadAndTailProps {
  balance: number;
  onPlay: (
    amount: number,
    profit: number,
    win: boolean,
    details: string,
  ) => void | Promise<void>;
  onDeductBet?: (amount: number) => Promise<void>;
  gameName?: string;
}

export default function HeadAndTail({
  balance,
  onPlay,
  onDeductBet,
  gameName = "Head & Tail",
}: HeadAndTailProps) {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [stage, setStage] = useState<'BETTING' | 'FLIPPING' | 'RESULT'>('BETTING');
  const [timeLeft, setTimeLeft] = useState(15);
  const [result, setResult] = useState<"HEAD" | "TAIL" | null>(null);
  const [history, setHistory] = useState<("H" | "T")[]>([]);
  const [round, setRound] = useState(1);
  
  // The user's active bet for the current round
  const [currentBet, setCurrentBet] = useState<{side: 'HEAD' | 'TAIL', amount: number} | null>(null);

  const chips = [50, 100, 200, 500, 1000];

  // Timer interval for BETTING stage
  useEffect(() => {
    if (stage !== 'BETTING') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleStageFlipping();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage]);

  const handleStageFlipping = () => {
    setStage('FLIPPING');
    
    // Simulate finding outcome
    const isHead = Math.random() < 0.5;
    const outcome = isHead ? "HEAD" : "TAIL";

    // Wait slightly to let FLIPPING animation play
    setTimeout(() => {
        setResult(outcome);
        setStage('RESULT');
        setHistory((prev) => [outcome.charAt(0) as "H" | "T", ...prev].slice(0, 10),);
    }, 2000); // 2 second flip animation
  };

  // Payout effect
  useEffect(() => {
     if (stage === 'RESULT' && result) {
        if (currentBet) {
             const userWins = currentBet.side === result;
             if (userWins) {
                onPlay(currentBet.amount, currentBet.amount * 1.94, true, `Bet on ${currentBet.side}`);
             } else {
                onPlay(currentBet.amount, 0, false, `Bet on ${currentBet.side}`);
             }
        }
        // Next round
        setTimeout(() => {
           setRound(r => r + 1);
           setStage('BETTING');
           setTimeLeft(15);
           setResult(null);
           setCurrentBet(null);
        }, 5000); // 5 sec to view result
     }
  }, [stage, result, currentBet]);

  const placeBet = (side: "HEAD" | "TAIL") => {
    if (stage !== 'BETTING' || timeLeft <= 3) return;
    if (currentBet) return;
    if (betAmount > balance) {
      alert("Insufficient balance.");
      return;
    }

    if (onDeductBet) onDeductBet(-betAmount).catch(console.error);
    setCurrentBet({ side, amount: betAmount });
  };

  return (
    <div className="w-full bg-[#020617] border border-blue-500/20 rounded-2xl overflow-hidden font-sans relative shadow-[0_0_50px_rgba(30,58,138,0.2)] text-white">
      
       {/* Top Header - Live Casino Feel */}
       <div className="bg-[#02040a] border-b border-blue-500/10 px-6 py-4 flex justify-between items-center relative overflow-hidden backdrop-blur-md">
         <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
         <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${stage === 'BETTING' && timeLeft <= 3 ? 'bg-rose-500' : 'bg-blue-500'}`}></span>
            <h1 className="text-white font-bold tracking-wider uppercase text-sm">{gameName} Live</h1>
         </div>
         <div className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded text-xs font-bold tracking-widest border border-blue-500/20 shadow-inner">
           ROUND #{round.toString().padStart(4, '0')}
         </div>
       </div>

      <div className="flex flex-col md:flex-row min-h-90">
        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#0f2347] via-[#051025] to-[#02040a] border-r border-blue-500/10">
          
          {/* Status Overlay */}
          <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full flex flex-col items-center pointer-events-none">
               {stage === 'BETTING' && (
                  <>
                     <div className={`font-black text-6xl transition-colors duration-500 ${timeLeft <= 3 ? 'text-rose-500 drop-shadow-[0_0_20px_rgba(244,63,94,0.8)] animate-pulse' : 'text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]'}`}>
                        {timeLeft}
                     </div>
                     <div className={`text-sm uppercase tracking-[0.3em] mt-3 font-bold bg-[#02040a]/80 backdrop-blur-md px-6 py-1.5 rounded-full border transition-colors shadow-lg ${timeLeft <= 3 ? 'text-rose-400 border-rose-500/30' : 'text-blue-400 border-blue-500/30'}`}>
                        {timeLeft <= 3 ? "Betting Closed" : "Place Your Bets"}
                     </div>
                  </>
               )}
               {stage === 'FLIPPING' && (
                  <div className="text-amber-400 font-black text-xl uppercase tracking-[0.2em] bg-[#02050a]/80 px-6 py-3 rounded-xl border border-amber-400/30 animate-pulse">
                     Flipping...
                  </div>
               )}
               {stage === 'RESULT' && result && (
                  <div className="text-white font-black text-3xl uppercase tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                     {result} Wins!
                  </div>
               )}
          </div>

          {/* Coin Container */}
          <div className="relative w-40 h-40 mt-12 perspective-1000 mb-6">
            <motion.div
              className={`w-full h-full rounded-full preserve-3d flex items-center justify-center font-bold text-5xl shadow-2xl ${
                result === "HEAD"
                  ? "bg-linear-to-br from-amber-300 to-amber-500 text-amber-950 border-4 border-amber-200 shadow-[0_0_40px_rgba(251,191,36,0.4)]"
                  : result === "TAIL"
                    ? "bg-linear-to-br from-slate-200 to-slate-400 text-slate-800 border-4 border-slate-100 shadow-[0_0_40px_rgba(148,163,184,0.4)]"
                    : "bg-linear-to-br from-blue-400 to-blue-600 text-blue-950 border-4 border-blue-300 shadow-[0_0_40px_rgba(59,130,246,0.4)]"
              }`}
              animate={{
                rotateY: stage === 'FLIPPING'
                  ? [0, 360, 720, 1080, 1440, 1800]
                  : result === "TAIL"
                    ? 180
                    : 0,
                scale: stage === 'FLIPPING' ? [1, 1.3, 1] : 1,
              }}
              transition={{
                duration: stage === 'FLIPPING' ? 2 : 0.4,
                ease: "easeInOut",
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front face (HEAD) */}
              <div
                className="absolute w-full h-full rounded-full flex items-center justify-center bg-linear-to-br from-amber-300 to-amber-500 border-[6px] border-amber-200 text-amber-950 backface-hidden shadow-inner"
                style={{ backfaceVisibility: "hidden" }}
              >
                H
              </div>
              {/* Back face (TAIL) */}
              <div
                className="absolute w-full h-full rounded-full flex items-center justify-center bg-linear-to-br from-slate-200 to-slate-400 border-[6px] border-slate-100 text-slate-800 backface-hidden shadow-inner"
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                }}
              >
                T
              </div>
            </motion.div>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full md:w-80 bg-[#02050a] p-6 flex flex-col">
          <div>
            <div className="flex items-center gap-2 text-slate-500 mb-6 font-bold text-xs uppercase tracking-wider">
              <History size={16} className="text-blue-500" />
              <span>History</span>
              <div className="flex gap-1 ml-auto">
                {history.slice(0, 6).map((h, i) => (
                  <div
                    key={i}
                    className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-black ${h === "H" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-slate-300/20 text-slate-300 border border-slate-300/30"}`}
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-6 space-y-3">
              <div className="flex gap-3">
                 <button
                    onClick={() => placeBet('HEAD')}
                    disabled={stage !== 'BETTING' || currentBet !== null || (stage === 'BETTING' && timeLeft <= 3)}
                    className={`flex-1 group relative p-4 rounded-xl border transition-all duration-300 ${
                       (stage !== 'BETTING' && !currentBet) || (stage === 'BETTING' && timeLeft <= 3 && !currentBet) ? 'opacity-50 cursor-not-allowed bg-[#010206] border-slate-800 grayscale' : 
                       currentBet?.side === 'TAIL' ? 'opacity-50 cursor-not-allowed bg-slate-900/50 border-slate-800' :
                       'bg-linear-to-b from-amber-900/30 to-amber-900/10 border-amber-500/40 hover:border-amber-400 hover:from-amber-800/40 shadow-[0_0_20px_rgba(245,158,11,0.1)] hover:shadow-[0_0_25px_rgba(245,158,11,0.3)]'
                    }`}
                 >
                     {currentBet?.side === 'HEAD' && (
                         <div className="absolute inset-0 border-2 border-blue-400 rounded-xl z-20 pointer-events-none shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                     )}
                     <div className="flex flex-col items-center justify-center">
                         <span className="w-12 h-12 bg-linear-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center font-black text-amber-950 text-xl border-2 border-amber-200 mb-2 shadow-[0_0_20px_rgba(245,158,11,0.6)]">H</span>
                         <span className="font-bold text-sm tracking-wider uppercase text-amber-200">HEAD</span>
                         <span className="text-[10px] text-amber-400/80 font-mono mt-1 bg-amber-950/50 px-2 py-0.5 rounded">1.9x</span>
                     </div>
                 </button>

                 <button
                    onClick={() => placeBet('TAIL')}
                    disabled={stage !== 'BETTING' || currentBet !== null || (stage === 'BETTING' && timeLeft <= 3)}
                    className={`flex-1 group relative p-4 rounded-xl border transition-all duration-300 ${
                       (stage !== 'BETTING' && !currentBet) || (stage === 'BETTING' && timeLeft <= 3 && !currentBet) ? 'opacity-50 cursor-not-allowed bg-[#010206] border-slate-800 grayscale' : 
                       currentBet?.side === 'HEAD' ? 'opacity-50 cursor-not-allowed bg-slate-900/50 border-slate-800' :
                       'bg-linear-to-b from-slate-700/30 to-slate-700/10 border-slate-500/40 hover:border-slate-400 hover:from-slate-600/40 shadow-[0_0_20px_rgba(148,163,184,0.1)] hover:shadow-[0_0_25px_rgba(148,163,184,0.3)]'
                    }`}
                 >
                     {currentBet?.side === 'TAIL' && (
                         <div className="absolute inset-0 border-2 border-blue-400 rounded-xl z-20 pointer-events-none shadow-[0_0_20px_rgba(59,130,246,0.5)]"></div>
                     )}
                     <div className="flex flex-col items-center justify-center">
                         <span className="w-12 h-12 bg-linear-to-br from-slate-300 to-slate-500 rounded-full flex items-center justify-center font-black text-slate-900 text-xl border-2 border-slate-200 mb-2 shadow-[0_0_20px_rgba(203,213,225,0.6)]">T</span>
                         <span className="font-bold text-sm tracking-wider uppercase text-slate-200">TAIL</span>
                         <span className="text-[10px] text-slate-400/80 font-mono mt-1 bg-slate-900/80 px-2 py-0.5 rounded">1.9x</span>
                     </div>
                 </button>
              </div>
            </div>

           <div className="flex flex-col gap-3 mt-auto">
              <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-500 px-1 font-bold">
                 <span>Select Stake</span>
                 <span className={`${stage === 'BETTING' && timeLeft <= 3 && !currentBet ? 'text-rose-500/50' : 'text-blue-400'} font-mono`}>₹{betAmount}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                 {chips.map(chip => (
                   <button
                     key={chip}
                     onClick={() => setBetAmount(chip)}
                     disabled={stage !== 'BETTING' || currentBet !== null || (stage === 'BETTING' && timeLeft <= 3)}
                     className={`flex-1 min-w-12.5 py-2 rounded font-bold text-xs transition-all border disabled:opacity-30 disabled:grayscale ${
                       betAmount === chip 
                         ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                         : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800'
                     }`}
                   >
                     {chip >= 1000 ? `${chip/1000}k` : chip}
                   </button>
                 ))}
              </div>
           </div>
           
           {/* Current Bet Show */}
           <div className="mt-4 pt-4 border-t border-slate-800/50">
               {currentBet ? (
                   <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-lg text-center">
                      <div className="text-[10px] uppercase text-blue-400/70 font-bold mb-1">Active Bet</div>
                      <div className="text-blue-400 font-black">₹{currentBet.amount} ON {currentBet.side}</div>
                   </div>
               ) : (
                   <div className="bg-slate-900/50 border border-slate-800/50 p-3 rounded-lg text-center">
                      <div className="text-[10px] uppercase text-slate-500 font-bold">No Active Bet</div>
                   </div>
               )}
           </div>

          </div>
        </div>
      </div>
    </div>
  );
}
