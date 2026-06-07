import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Coins, History } from "lucide-react";

interface HeadAndTailProps {
  balance: number;
  onPlay: (
    amount: number,
    profit: number,
    win: boolean,
    details: string,
  ) => void;
  gameName?: string;
}

export default function HeadAndTail({
  balance,
  onPlay,
  gameName = "Head & Tail",
}: HeadAndTailProps) {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [selectedSide, setSelectedSide] = useState<"HEAD" | "TAIL">("HEAD");
  const [isFlipping, setIsFlipping] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [result, setResult] = useState<"HEAD" | "TAIL" | null>(null);
  const [history, setHistory] = useState<("H" | "T")[]>([]);

  const chips = [50, 100, 200, 500];

  const handleBet = () => {
    if (isFlipping || isWaiting) return;
    if (betAmount > balance) {
      alert("Insufficient balance.");
      return;
    }

    setIsWaiting(true);
    setCountdown(5);
    setResult(null);

    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    setTimeout(() => {
      setIsWaiting(false);
      setIsFlipping(true);

      // Simulate coin flip
      setTimeout(() => {
        // User wins 49.5% of the time
        const userWins = Math.random() < 0.495;

        const winningSide = userWins
          ? selectedSide
          : selectedSide === "HEAD"
            ? "TAIL"
            : "HEAD";

        // Update result state
        setResult(winningSide);
        setHistory((prev) =>
          [winningSide.charAt(0) as "H" | "T", ...prev].slice(0, 10),
        );

        setTimeout(() => {
          if (userWins) {
            onPlay(betAmount, betAmount * 1.9, true, `Bet on ${selectedSide}`);
          } else {
            onPlay(betAmount, -betAmount, false, `Bet on ${selectedSide}`);
          }
          setIsFlipping(false);
        }, 1000);
      }, 2000);
    }, 5000);
  };

  return (
    <div className="bg-[#0f172a] rounded-xl overflow-hidden border border-slate-700 shadow-xl font-sans relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <Coins size={200} />
      </div>

      <div className="flex flex-col md:flex-row h-full">
        {/* Game Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative min-h-[300px]">
          <h2 className="absolute top-4 left-4 text-lg font-bold text-slate-200 tracking-wider">
            {gameName}
          </h2>

          {/* Coin Container */}
          <div className="relative w-32 h-32 perspective-1000 mb-6">
            <motion.div
              className={`w-full h-full rounded-full preserve-3d flex items-center justify-center font-bold text-3xl shadow-2xl ${
                result === "HEAD"
                  ? "bg-amber-400 text-amber-900 border-4 border-amber-200"
                  : result === "TAIL"
                    ? "bg-slate-300 text-slate-800 border-4 border-slate-100"
                    : "bg-amber-500 text-amber-900 border-4 border-amber-300"
              }`}
              animate={{
                rotateY: isFlipping
                  ? [0, 360, 720, 1080, 1440]
                  : result === "TAIL"
                    ? 180
                    : 0,
                scale: isFlipping ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: isFlipping ? 2 : 0.5,
                ease: "easeInOut",
              }}
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Front face (HEAD) */}
              <div
                className="absolute w-full h-full rounded-full flex items-center justify-center bg-amber-400 border-4 border-amber-200 text-amber-900 backface-hidden"
                style={{ backfaceVisibility: "hidden" }}
              >
                H
              </div>
              {/* Back face (TAIL) */}
              <div
                className="absolute w-full h-full rounded-full flex items-center justify-center bg-slate-300 border-4 border-slate-100 text-slate-800 backface-hidden"
                style={{
                  transform: "rotateY(180deg)",
                  backfaceVisibility: "hidden",
                }}
              >
                T
              </div>
            </motion.div>
          </div>

          <div className="text-center h-8">
            <AnimatePresence>
              {isWaiting && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-lg font-bold text-slate-300"
                >
                  Bets accepted, flipping in {countdown}s...
                </motion.div>
              )}
              {result && !isFlipping && !isWaiting && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-2xl font-bold ${result === selectedSide ? "text-green-400" : "text-red-400"}`}
                >
                  {result === selectedSide ? "YOU WON!" : "YOU LOST!"}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-full md:w-72 bg-slate-800 p-4 flex flex-col justify-between border-l border-slate-700 z-10">
          <div>
            <div className="flex items-center gap-2 text-slate-400 mb-4 font-medium text-sm">
              <History size={16} />
              <span>Last Results</span>
              <div className="flex gap-1 ml-auto">
                {history.map((h, i) => (
                  <div
                    key={i}
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${h === "H" ? "bg-amber-500 text-amber-950" : "bg-slate-300 text-slate-900"}`}
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <label className="text-slate-400 font-medium text-xs block">
                1. Select Outcome
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["HEAD", "TAIL"].map((side) => (
                  <button
                    key={side}
                    onClick={() => setSelectedSide(side as "HEAD" | "TAIL")}
                    disabled={isFlipping || isWaiting}
                    className={`py-2 rounded-lg font-bold text-sm transition-all ${
                      selectedSide === side
                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {side}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 space-y-2">
              <label className="text-slate-400 font-medium text-xs block min-w-[200px]">
                2. Enter Stake amount
              </label>
              <input
                type="number"
                value={betAmount || ""}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                disabled={isFlipping || isWaiting}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono text-sm"
              />
              <div className="grid grid-cols-4 gap-2">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setBetAmount(chip)}
                    disabled={isFlipping || isWaiting}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 py-1.5 rounded font-medium text-xs transition-colors"
                  >
                    +{chip}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4 p-3 bg-slate-900/50 rounded-lg">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Potential Return</span>
                <span className="text-emerald-400 font-medium">
                  ₹ {(betAmount * 1.9).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleBet}
            disabled={isFlipping || isWaiting || betAmount <= 0}
            className={`w-full py-3 rounded-lg font-bold tracking-wide uppercase text-sm transition-all ${
              isFlipping || isWaiting || betAmount <= 0
                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-500 to-emerald-400 text-emerald-950 hover:from-emerald-400 hover:to-emerald-300 shadow-lg shadow-emerald-500/20"
            }`}
          >
            {isWaiting ? "Bets Locked..." : isFlipping ? "Flipping..." : "Place Bet"}
          </button>
        </div>
      </div>
    </div>
  );
}
