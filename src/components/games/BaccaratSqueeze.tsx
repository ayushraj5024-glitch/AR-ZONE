import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { History, Info, AlertCircle, Coins } from "lucide-react";

interface BaccaratSqueezeProps {
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

type BetType = "PLAYER" | "BANKER" | "TIE";

interface CardItem {
  id: string;
  suit: "hearts" | "diamonds" | "clubs" | "spades";
  value: string;
  numValue: number;
}

const SUITS = ["hearts", "diamonds", "clubs", "spades"] as const;
const VALUES = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

function getCardValue(val: string): number {
  if (["J", "Q", "K", "10"].includes(val)) return 0;
  if (val === "A") return 1;
  return parseInt(val);
}

function generateRandomCard(): CardItem {
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const value = VALUES[Math.floor(Math.random() * VALUES.length)];
  return {
    id: Math.random().toString(36).substring(2, 9),
    suit,
    value,
    numValue: getCardValue(value),
  };
}

const PlayingCard = ({
  card,
  revealed,
  squeezing,
}: {
  card: CardItem | null;
  revealed: boolean;
  squeezing: boolean;
}) => {
  if (!card) {
    return (
      <div className="w-16 h-24 md:w-24 md:h-36 rounded-lg border-2 border-dashed border-white/10 bg-black/20 flex items-center justify-center"></div>
    );
  }

  const isRed = card.suit === "hearts" || card.suit === "diamonds";
  const suitSymbol = {
    hearts: "♥",
    diamonds: "♦",
    clubs: "♣",
    spades: "♠",
  }[card.suit];

  return (
    <div className="relative w-16 h-24 md:w-24 md:h-36 perspective-1000">
      <motion.div
        className="w-full h-full absolute top-0 left-0"
        initial={{ rotateY: 180, scale: 0.8, opacity: 0 }}
        animate={{
          rotateY: revealed ? 0 : 180,
          scale: squeezing ? 1.05 : 1,
          opacity: 1,
        }}
        transition={{
          rotateY: { duration: squeezing ? 3 : 0.6, ease: "easeInOut" },
          scale: { duration: 0.5, repeat: Infinity, repeatType: "reverse" as const },
          opacity: { duration: 0.3 },
        }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Card Back */}
        <div
          className="absolute w-full h-full rounded-lg bg-linear-to-br from-red-800 to-red-950 border-2 border-red-400/30 flex items-center justify-center overflow-hidden shadow-xl"
          style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
        >
          <div className="w-[80%] h-[80%] rounded border border-red-500/20 bg-[url('https://www.transparenttextures.com/patterns/argyle.png')] opacity-30"></div>
          <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent"></div>
        </div>

        {/* Card Front */}
        <div
          className="absolute w-full h-full rounded-lg bg-white border border-slate-200 shadow-xl flex flex-col justify-between p-1.5 md:p-2"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div
            className={`text-xs md:text-lg font-bold leading-none ${isRed ? "text-red-600" : "text-slate-900"}`}
          >
            <div>{card.value}</div>
            <div className="text-[10px] md:text-sm -mt-0.5 md:-mt-1">
              {suitSymbol}
            </div>
          </div>

          <div
            className={`absolute inset-0 flex items-center justify-center text-3xl md:text-5xl opacity-20 ${isRed ? "text-red-600" : "text-slate-900"}`}
          >
            {suitSymbol}
          </div>

          <div
            className={`text-xs md:text-lg font-bold leading-none text-right rotate-180 ${isRed ? "text-red-600" : "text-slate-900"}`}
          >
            <div>{card.value}</div>
            <div className="text-[10px] md:text-sm -mt-0.5 md:-mt-1">
              {suitSymbol}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default function BaccaratSqueeze({
  balance,
  onPlay,
  onDeductBet,
  gameName = "Baccarat Squeeze",
}: BaccaratSqueezeProps) {
  const [betAmount, setBetAmount] = useState<number>(100);
  const [selectedBet, setSelectedBet] = useState<BetType | null>(null);

  const [gameState, setGameState] = useState<
    "BETTING" | "DEALING" | "SQUEEZING" | "RESULT"
  >("BETTING");
  const [countdown, setCountdown] = useState(15);
  
  // The user's active bet for the current round
  const [currentBet, setCurrentBet] = useState<{type: BetType, amount: number} | null>(null);

  const [playerCards, setPlayerCards] = useState<CardItem[]>([]);
  const [bankerCards, setBankerCards] = useState<CardItem[]>([]);

  const [playerScore, setPlayerScore] = useState(0);
  const [bankerScore, setBankerScore] = useState(0);
  const [winnerStr, setWinnerStr] = useState<"P" | "B" | "T" | null>(null);
  const [round, setRound] = useState(1);

  const [history, setHistory] = useState<("P" | "B" | "T")[]>([]);

  const chips = [50, 100, 500, 1000, 5000];

  const calculateScore = (cards: CardItem[]) => {
    return cards.reduce((acc, card) => acc + card.numValue, 0) % 10;
  };

  // Timer interval for BETTING stage
  useEffect(() => {
    if (gameState !== 'BETTING') return;
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleStageDealing();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [gameState]);

  const handleStageDealing = () => {
    setGameState("DEALING");
    
    // Initial Deal (2 cards each)
    setTimeout(() => {
      const p1 = generateRandomCard();
      const b1 = generateRandomCard();
      const p2 = generateRandomCard();
      const b2 = generateRandomCard();

      setPlayerCards([p1, p2]);
      setBankerCards([b1, b2]);

      setTimeout(() => {
        setGameState("SQUEEZING");

        const currentPScore = (p1.numValue + p2.numValue) % 10;
        const currentBScore = (b1.numValue + b2.numValue) % 10;

        // Simulate Third Card Logic and Squeeze Result
        setTimeout(() => {
        let finalPCards = [p1, p2];
        let finalBCards = [b1, b2];
        let finalPScore = currentPScore;
        let finalBScore = currentBScore;

        let p3Value = -1;

        if (currentPScore < 8 && currentBScore < 8) {
          if (currentPScore <= 5) {
            const p3 = generateRandomCard();
            finalPCards.push(p3);
            p3Value = p3.numValue;
            finalPScore = (finalPScore + p3.numValue) % 10;
          }

          let bankerDraws = false;
          if (p3Value === -1) {
            // Player stood
            if (currentBScore <= 5) bankerDraws = true;
          } else {
            // Player drew
            if (currentBScore <= 2) bankerDraws = true;
            else if (currentBScore === 3 && p3Value !== 8) bankerDraws = true;
            else if (currentBScore === 4 && p3Value >= 2 && p3Value <= 7) bankerDraws = true;
            else if (currentBScore === 5 && p3Value >= 4 && p3Value <= 7) bankerDraws = true;
            else if (currentBScore === 6 && (p3Value === 6 || p3Value === 7)) bankerDraws = true;
          }

          if (bankerDraws) {
            const b3 = generateRandomCard();
            finalBCards.push(b3);
            finalBScore = (finalBScore + b3.numValue) % 10;
          }
        }

        setPlayerCards(finalPCards);
        setBankerCards(finalBCards);
        setPlayerScore(finalPScore);
        setBankerScore(finalBScore);

        let winner: "P" | "B" | "T" = "T";
        if (finalPScore > finalBScore) winner = "P";
        else if (finalBScore > finalPScore) winner = "B";

        setHistory((prev) => [winner, ...prev].slice(0, 24));
        setWinnerStr(winner);
        setGameState("RESULT");
        
      }, 4000); // 4 seconds of squeezing
      }, 2000); // 2 seconds dealing time
    }, 1000);
  };

  // Payout effect
  useEffect(() => {
     if (gameState === 'RESULT' && winnerStr) {
        if (currentBet) {
          let isWin = false;
          let isPush = false;
          let multiplier = 0;

          if (currentBet.type === "PLAYER" && winnerStr === "P") {
            isWin = true;
            multiplier = 2;
          } else if (currentBet.type === "BANKER" && winnerStr === "B") {
            isWin = true;
            multiplier = 1.97;
          } else if (currentBet.type === "TIE" && winnerStr === "T") {
            isWin = true;
            multiplier = 9;
          } else if ((currentBet.type === "PLAYER" || currentBet.type === "BANKER") && winnerStr === "T") {
            isPush = true;
          }

          if (isWin) {
            onPlay(
              currentBet.amount,
              currentBet.amount * multiplier,
              true,
              `Won on ${currentBet.type}`,
            );
          } else if (isPush) {
            onPlay(
              currentBet.amount,
              currentBet.amount,
              true,
              `Push on ${currentBet.type} (Tie)`,
            );
          } else {
            onPlay(currentBet.amount, 0, false, `Lost on ${currentBet.type}`);
          }
        }

        // Next round
        setTimeout(() => {
           setRound(r => r + 1);
           setGameState('BETTING');
           setCountdown(15);
           setPlayerCards([]);
           setBankerCards([]);
           setPlayerScore(0);
           setBankerScore(0);
           setWinnerStr(null);
           setCurrentBet(null);
           setSelectedBet(null);
        }, 5000); // 5 sec to view result
     }
  }, [gameState, winnerStr, currentBet]);

  const placeBet = (betType: BetType = selectedBet!) => {
    if (gameState !== "BETTING" || countdown <= 3) return;
    if (currentBet) return;
    if (!betType) {
      alert("Please select a bet (Player, Banker, or Tie)");
      return;
    }
    if (betAmount > balance) {
      alert("Insufficient balance");
      return;
    }

    if (onDeductBet) onDeductBet(-betAmount).catch(console.error);
    setSelectedBet(betType);
    setCurrentBet({ type: betType, amount: betAmount });
  };

  return (
    <div className="bg-[#0b1016] rounded-xl border border-yellow-900/40 shadow-2xl relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#0f171e] mix-blend-multiply opacity-50"></div>
        <div className="absolute top-0 right-0 w-200 h-200 bg-linear-to-br from-yellow-500/5 to-transparent rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-150 h-150 bg-linear-to-tr from-red-900/10 to-transparent rounded-full blur-[100px] pointer-events-none transform -translate-x-1/4 translate-y-1/4"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-yellow-600/50 to-transparent"></div>
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-137.5">
        {/* Main Table Area */}
        <div className="flex-1 flex flex-col p-4 md:p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linear-to-b from-yellow-600 to-yellow-800 flex items-center justify-center shadow-lg shadow-yellow-900/50 border border-yellow-400">
                <div className="w-8 h-8 rounded-full border border-yellow-800 flex items-center justify-center text-xs font-serif font-black text-white">
                  B
                </div>
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold bg-linear-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent uppercase tracking-widest">
                  {gameName}
                </h2>
                <div className="text-xs text-yellow-500/60 uppercase tracking-widest font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  Live Dealer Table
                </div>
              </div>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-lg px-4 py-2 flex gap-4 backdrop-blur-md">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Player
                </div>
                <div className="text-blue-400 font-bold">
                  {history.filter((h) => h === "P").length}
                </div>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Banker
                </div>
                <div className="text-red-400 font-bold">
                  {history.filter((h) => h === "B").length}
                </div>
              </div>
              <div className="w-px bg-white/10"></div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Tie
                </div>
                <div className="text-green-400 font-bold">
                  {history.filter((h) => h === "T").length}
                </div>
              </div>
            </div>
          </div>

          {/* Cards Area */}
          <div className="flex-1 flex flex-col justify-center items-center gap-8 md:gap-12 py-8 relative">
            {/* Center Status */}
            <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-yellow-500/20 shadow-2xl z-20"
                >
                  <span className={`uppercase tracking-widest font-bold text-sm md:text-base pulse-text transition-colors duration-300 ${gameState === 'BETTING' && countdown <= 3 ? 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]' : 'text-yellow-400'}`}>
                    {gameState === "BETTING" 
                      ? countdown <= 3 ? `Bets Closed` : `Place Bets (${countdown}s)`
                      : gameState === "DEALING"
                      ? "No More Bets"
                      : gameState === "SQUEEZING"
                        ? "Squeezing Cards..."
                        : "Result"}
                  </span>
                </motion.div>
            </AnimatePresence>

            <div className="flex justify-between w-full max-w-2xl px-4 md:px-0">
              {/* Player Side */}
              <div className="flex flex-col items-center">
                <div className="flex gap-2 relative">
                  <PlayingCard
                    card={playerCards[0]}
                    revealed={gameState === "SQUEEZING" || gameState === "RESULT"}
                    squeezing={gameState === "SQUEEZING" && !playerCards[2]}
                  />
                  <PlayingCard
                    card={playerCards[1]}
                    revealed={gameState === "SQUEEZING" || gameState === "RESULT"}
                    squeezing={gameState === "SQUEEZING" && !playerCards[2]}
                  />
                  {playerCards[2] && (
                    <div className="absolute -right-16 md:-right-24 top-0 -rotate-90 origin-bottom-left z-10">
                      <PlayingCard
                        card={playerCards[2]}
                        revealed={gameState === "SQUEEZING" || gameState === "RESULT"}
                        squeezing={gameState === "SQUEEZING"}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-6 flex flex-col items-center">
                  <div className="bg-blue-600/20 text-blue-400 font-bold px-4 py-1 rounded-full text-sm tracking-widest uppercase border border-blue-500/30 mb-2">
                    Player
                  </div>
                  <AnimatePresence>
                    {gameState === "RESULT" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-black text-white"
                      >
                        {playerScore}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Banker Side */}
              <div className="flex flex-col items-center">
                <div className="flex gap-2 relative">
                  <PlayingCard
                    card={bankerCards[0]}
                    revealed={gameState === "SQUEEZING" || gameState === "RESULT"}
                    squeezing={gameState === "SQUEEZING" && !bankerCards[2]}
                  />
                  <PlayingCard
                    card={bankerCards[1]}
                    revealed={gameState === "SQUEEZING" || gameState === "RESULT"}
                    squeezing={gameState === "SQUEEZING" && !bankerCards[2]}
                  />
                  {bankerCards[2] && (
                    <div className="absolute -left-16 md:-left-24 top-0 rotate-90 origin-bottom-right z-10">
                      <PlayingCard
                        card={bankerCards[2]}
                        revealed={gameState === "SQUEEZING" || gameState === "RESULT"}
                        squeezing={gameState === "SQUEEZING"}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-6 flex flex-col items-center">
                  <div className="bg-red-600/20 text-red-500 font-bold px-4 py-1 rounded-full text-sm tracking-widest uppercase border border-red-500/30 mb-2">
                    Banker
                  </div>
                  <AnimatePresence>
                    {gameState === "RESULT" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-3xl font-black text-white"
                      >
                        {bankerScore}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <style
            dangerouslySetInnerHTML={{
              __html: `
            .pulse-text { animation: pulseAlpha 1.5s infinite; }
            @keyframes pulseAlpha { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
          `,
            }}
          />
        </div>

        {/* Controls Panel */}
        <div className="w-full lg:w-85 bg-black/40 backdrop-blur-xl border-l border-white/5 p-5 flex flex-col h-full z-10">
          <div className="mb-6 flex-1">
            <div className="text-yellow-500/80 uppercase tracking-widest text-xs font-bold mb-3 flex items-center justify-between">
              Betting Area
              <Info size={14} className="text-yellow-600/50" />
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setSelectedBet("PLAYER")}
                disabled={gameState !== "BETTING" || currentBet !== null || (gameState === "BETTING" && countdown <= 3)}
                className={`relative w-full overflow-hidden rounded-xl py-4 flex flex-col items-center transition-all ${
                  (gameState !== "BETTING" && !currentBet) || (gameState === "BETTING" && countdown <= 3 && !currentBet) ? 'grayscale opacity-50 cursor-not-allowed' : ''
                } ${
                  selectedBet === "PLAYER"
                    ? "bg-blue-600 border border-blue-400 shadow-[0_0_20px_rgba(37,99,235,0.4)] z-10 scale-[1.02]"
                    : "bg-blue-950/30 border border-blue-500/20 hover:bg-blue-900/40 text-slate-400"
                }`}
              >
                {selectedBet === "PLAYER" && (
                  <div className="absolute inset-0 bg-linear-to-t from-blue-700/50 to-transparent" />
                )}
                <span
                  className={`relative z-10 font-bold tracking-widest uppercase text-sm ${selectedBet === "PLAYER" ? "text-white" : "text-blue-400"}`}
                >
                  Player
                </span>
                <span
                  className={`relative z-10 text-[10px] mt-1 ${selectedBet === "PLAYER" ? "text-blue-100" : "text-slate-500"}`}
                >
                  1:1
                </span>
              </button>

              <button
                onClick={() => setSelectedBet("TIE")}
                disabled={gameState !== "BETTING" || currentBet !== null || (gameState === "BETTING" && countdown <= 3)}
                className={`relative w-full overflow-hidden rounded-xl py-3 flex flex-col items-center transition-all ${
                  (gameState !== "BETTING" && !currentBet) || (gameState === "BETTING" && countdown <= 3 && !currentBet) ? 'grayscale opacity-50 cursor-not-allowed' : ''
                } ${
                  selectedBet === "TIE"
                    ? "bg-green-600 border border-green-400 shadow-[0_0_20px_rgba(22,163,74,0.4)] z-10 scale-[1.02]"
                    : "bg-green-950/30 border border-green-500/20 hover:bg-green-900/40 text-slate-400"
                }`}
              >
                {selectedBet === "TIE" && (
                  <div className="absolute inset-0 bg-linear-to-t from-green-700/50 to-transparent" />
                )}
                <span
                  className={`relative z-10 font-bold tracking-widest uppercase text-sm ${selectedBet === "TIE" ? "text-white" : "text-green-400"}`}
                >
                  Tie
                </span>
                <span
                  className={`relative z-10 text-[10px] mt-1 ${selectedBet === "TIE" ? "text-green-100" : "text-slate-500"}`}
                >
                  8:1
                </span>
              </button>

              <button
                onClick={() => setSelectedBet("BANKER")}
                disabled={gameState !== "BETTING" || currentBet !== null || (gameState === "BETTING" && countdown <= 3)}
                className={`relative w-full overflow-hidden rounded-xl py-4 flex flex-col items-center transition-all ${
                  (gameState !== "BETTING" && !currentBet) || (gameState === "BETTING" && countdown <= 3 && !currentBet) ? 'grayscale opacity-50 cursor-not-allowed' : ''
                } ${
                  selectedBet === "BANKER"
                    ? "bg-red-600 border border-red-400 shadow-[0_0_20px_rgba(220,38,38,0.4)] z-10 scale-[1.02]"
                    : "bg-red-950/30 border border-red-500/20 hover:bg-red-900/40 text-slate-400"
                }`}
              >
                {selectedBet === "BANKER" && (
                  <div className="absolute inset-0 bg-linear-to-t from-red-700/50 to-transparent" />
                )}
                <span
                  className={`relative z-10 font-bold tracking-widest uppercase text-sm ${selectedBet === "BANKER" ? "text-white" : "text-red-500"}`}
                >
                  Banker
                </span>
                <span
                  className={`relative z-10 text-[10px] mt-1 ${selectedBet === "BANKER" ? "text-red-100" : "text-slate-500"}`}
                >
                  0.95:1
                </span>
              </button>
            </div>
          </div>

          <div className="mb-6">
            <div className="text-yellow-500/80 uppercase tracking-widest text-xs font-bold mb-3">
              Stake Amount
            </div>
            <div className="bg-black/60 border border-white/5 rounded-xl p-3">
              <input
                type="number"
                value={betAmount || ""}
                onChange={(e) => setBetAmount(parseInt(e.target.value) || 0)}
                disabled={gameState !== "BETTING" || currentBet !== null || (gameState === "BETTING" && countdown <= 3)}
                className="w-full bg-transparent text-white font-mono text-xl focus:outline-none mb-3 text-center"
                placeholder="0.00"
              />
              <div className="grid grid-cols-5 gap-1.5">
                {chips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setBetAmount(chip)}
                    disabled={gameState !== "BETTING" || currentBet !== null || (gameState === "BETTING" && countdown <= 3)}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${betAmount === chip ? "bg-yellow-500 text-yellow-950 shadow-md shadow-yellow-500/20" : "bg-white/5 text-slate-300 hover:bg-white/10"}`}
                  >
                    {chip >= 1000 ? `${chip / 1000}k` : chip}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => placeBet()}
            disabled={gameState !== "BETTING" || !selectedBet || betAmount <= 0 || currentBet !== null || (gameState === "BETTING" && countdown <= 3)}
            className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase text-sm transition-all relative overflow-hidden ${
              gameState !== "BETTING" || !selectedBet || betAmount <= 0 || currentBet !== null || (gameState === "BETTING" && countdown <= 3)
                ? "bg-white/5 text-white/30 cursor-not-allowed border border-white/5"
                : "bg-linear-to-r from-yellow-600 via-yellow-500 to-yellow-600 text-yellow-950 shadow-[0_0_30px_rgba(234,179,8,0.3)] hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] border border-yellow-400"
            }`}
          >
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay pointer-events-none"></div>
            <span className={`relative z-10 ${gameState === "BETTING" && countdown <= 3 && !currentBet ? 'text-red-400' : ''}`}>
              {currentBet ? `Bet Placed on ${currentBet.type}` : gameState === "BETTING" && countdown <= 3
                ? "Betting Closed"
                : gameState === "BETTING"
                ? "Place Bet"
                : "Game in Progress"}
            </span>
          </button>

          {/* Roadmap / History (Mini Bead Plate) */}
          <div className="mt-6 w-full pt-4 border-t border-white/10">
            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex justify-between">
              <span>Recent Hands</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {history.length === 0 && (
                <div className="text-xs text-slate-600 italic">
                  No history yet
                </div>
              )}
              {history.map((h, i) => (
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={i}
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold shadow-sm ${
                    h === "P"
                      ? "bg-blue-500 text-blue-100"
                      : h === "B"
                        ? "bg-red-500 text-red-100"
                        : "bg-green-500 text-green-100"
                  }`}
                >
                  {h}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
