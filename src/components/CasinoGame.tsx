import React, { useState, useEffect } from "react";
import {
  ChevronRight,
  RefreshCcw,
  Lock,
  DollarSign,
  Wallet,
  History,
  AlertCircle,
  X,
  Loader2,
  Ban,
} from "lucide-react";
import { useMarketStatus } from "../hooks/useMarketStatus";
import TeenPattiT20 from "./games/TeenPattiT20";
import HeadAndTail from "./games/HeadAndTail";
import BaccaratSqueeze from "./games/BaccaratSqueeze";
import AviatorGame from "./games/AviatorGame";

interface OddsRow {
  name: string;
  amount?: string;
  back1?: string;
  back1Suspended?: boolean;
  back2?: string;
  back2Suspended?: boolean;
}

interface BetRecord {
  id: string;
  selection: string;
  amount: number;
  odds: string;
  status: "won" | "lost";
  profit: number;
  time: string;
}

const Lucky7Slot = ({
  balance,
  onPlay,
  onDeductBet
}: {
  balance: number;
  onPlay: (
    amount: number,
    profit: number,
    win: boolean,
    details: string,
  ) => void;
  onDeductBet?: (amount: number) => Promise<void>;
}) => {
  const SYMBOLS = ["7", "🍒", "🔔", "BAR", "💎", "🍉"];
  const [reels, setReels] = useState(["7", "7", "7"]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [betAmount, setBetAmount] = useState(100);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const spin = () => {
    if (isSpinning) return;
    if (betAmount > balance) {
      alert("Insufficient balance");
      return;
    }
    
    if (onDeductBet) onDeductBet(-betAmount).catch(console.error);
    
    setIsSpinning(true);
    setLastWin(null);

    const spinInterval = setInterval(() => {
      setReels([
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
      ]);
    }, 80);

    setTimeout(() => {
      clearInterval(spinInterval);

      const userWins = Math.random() < 0.49;
      let r1: string, r2: string, r3: string;

      if (userWins) {
        const rand = Math.random();
        if (rand < 0.05) {
          // 5% chance of 3 of a kind for a win
          r1 = r2 = r3 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        } else {
          // 95% chance of pair for a win
          r1 = r2 = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
          const otherSymbols = SYMBOLS.filter((s) => s !== r1);
          r3 = otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
        }
        const arr = [r1, r2, r3].sort(() => 0.5 - Math.random());
        r1 = arr[0];
        r2 = arr[1];
        r3 = arr[2];
      } else {
        const rand = Math.random();
        if (rand < 0.3) {
          // 30% chance of a single cherry for a loss (0.5x)
          r1 = "🍒";
          const otherSymbols = SYMBOLS.filter((s) => s !== "🍒");
          const shuffled = [...otherSymbols].sort(() => 0.5 - Math.random());
          r2 = shuffled[0];
          r3 = shuffled[1];
        } else {
          // 70% chance of nothing (0x)
          const noCherry = SYMBOLS.filter((s) => s !== "🍒");
          const shuffled = [...noCherry].sort(() => 0.5 - Math.random());
          r1 = shuffled[0];
          r2 = shuffled[1];
          r3 = shuffled[2];
        }
        const arr = [r1, r2, r3].sort(() => 0.5 - Math.random());
        r1 = arr[0];
        r2 = arr[1];
        r3 = arr[2];
      }

      setReels([r1, r2, r3]);

      let multiplier = 0;
      if (r1 === r2 && r2 === r3) {
        if (r1 === "7") multiplier = 50;
        else if (r1 === "💎") multiplier = 20;
        else if (r1 === "BAR") multiplier = 10;
        else multiplier = 5;
      } else if (r1 === r2 || r2 === r3 || r1 === r3) {
        multiplier = 1.5; // Pair
      } else if (r1 === "🍒" || r2 === "🍒" || r3 === "🍒") {
        multiplier = 0.5; // Single cherry
      }

      const netProfit = betAmount * multiplier; // Changed to gross because we deducted bet
      if (multiplier > 0) setLastWin(betAmount * multiplier);

      onPlay(
        betAmount,
        netProfit,
        multiplier > 0,
        `Slot Spin [${r1} ${r2} ${r3}]`,
      );
      setIsSpinning(false);
    }, 2000);
  };

  return (
    <div className="relative w-full max-w-xl mx-auto flex flex-col items-center justify-center py-10 px-4 md:px-0 bg-linear-to-b from-yellow-50 to-amber-100 rounded-3xl border border-amber-200 shadow-[inset_0_0_100px_rgba(251,191,36,0.2)]">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-yellow-300/20 via-transparent to-transparent pointer-events-none"></div>

      {/* Machine Container */}
      <div className="relative bg-linear-to-b from-red-600 via-red-700 to-red-900 rounded-[3rem] p-4 md:p-8 shadow-2xl border-x-12 border-b-16 border-t-8 border-red-950 w-full z-10">
        {/* Lever (Visible on md) */}
        <div className="hidden md:block absolute top-[40%] -right-10 w-8 h-32 z-[-1]">
          <div className="w-8 h-12 bg-linear-to-r from-gray-400 to-gray-600 rounded-r-lg border-y-2 border-r-2 border-gray-700 shadow-[10px_0_15px_rgba(0,0,0,0.5)]"></div>
          <div
            className={`absolute top-2 left-3 w-4 h-32 bg-linear-to-r from-slate-300 to-slate-400 rounded-full transition-transform duration-500 origin-bottom shadow-lg ${isSpinning ? "rotate-60 translate-y-12" : "rotate-0"}`}
          ></div>
          <div
            className={`absolute -top-4 w-12 h-12 -ml-2 bg-linear-to-tr from-rose-500 to-red-600 rounded-full shadow-[inset_-4px_-4px_10px_rgba(0,0,0,0.5),4px_4px_10px_rgba(0,0,0,0.5)] transition-transform duration-500 origin-bottom ${isSpinning ? "rotate-60 translate-y-32.5 translate-x-22.5" : ""}`}
          ></div>
        </div>

        {/* Top Marquee */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 border-[6px] border-amber-500 rounded-2xl px-8 py-3 shadow-[0_0_20px_rgba(245,158,11,0.6)] z-20 whitespace-nowrap">
          <div className="absolute inset-0 flex items-center justify-around px-2">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              ></div>
            ))}
          </div>
          <h2 className="relative text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-linear-to-b from-yellow-200 via-amber-400 to-amber-600 tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] filter">
            BIG WIN
          </h2>
        </div>

        {/* Reels Area */}
        <div className="bg-slate-950 p-4 md:p-6 rounded-4xl flex gap-2 md:gap-4 mt-8 md:mt-4 shadow-[inset_0_0_40px_rgba(0,0,0,1)] border-4 border-red-950 relative overflow-hidden">
          {/* Machine bulbs inside border */}
          <div className="absolute inset-1 border-[3px] border-dotted border-amber-500/50 rounded-3xl pointer-events-none"></div>

          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="flex-1 aspect-3/4 bg-linear-to-b from-slate-200 via-white to-slate-200 rounded-xl shadow-[inset_0_8px_16px_rgba(0,0,0,0.4)] flex items-center justify-center relative overflow-hidden border border-[#00ff88]/30"
            >
              <div className="absolute inset-x-0 top-1/2 h-px bg-black/10"></div>
              <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/40 pointer-events-none"></div>

              <div
                className={`transform transition-transform ${isSpinning ? "scale-110 blur-[1px]" : "scale-100"} text-5xl md:text-7xl`}
              >
                {reels[i] === "7" ? (
                  <span className="font-black text-transparent bg-clip-text bg-linear-to-b from-amber-300 via-yellow-500 to-amber-700 drop-shadow-[0_4px_4px_rgba(0,0,0,0.4)] filter">
                    7
                  </span>
                ) : (
                  <span>{reels[i]}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="mt-8 bg-slate-900 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center border-[3px] border-red-950 gap-4 shadow-inner">
          <div className="flex flex-col items-center md:items-start w-full md:w-auto">
            <div className="text-amber-500 text-[10px] font-black uppercase tracking-widest mb-1 bg-slate-950 px-3 py-1 rounded-full border border-amber-500/30">
              Stake Amount
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              {[10, 50, 100, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setBetAmount(amt)}
                  disabled={isSpinning}
                  className={`px-3 py-2 rounded-lg font-bold text-sm md:text-base border-2 transition-all ${
                    betAmount === amt
                      ? "bg-linear-to-b from-amber-400 to-amber-600 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(245,158,11,0.6)]"
                      : "bg-slate-800 border-slate-700 text-amber-500 hover:bg-slate-700 disabled:opacity-50"
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
            {lastWin !== null && lastWin > 0 && (
              <div className="bg-emerald-950 border border-emerald-500 px-4 py-2 rounded-xl text-center shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse">
                <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
                  WINNER
                </div>
                <div className="text-emerald-400 font-black text-xl">
                  ₹{lastWin}
                </div>
              </div>
            )}

            <button
              onClick={spin}
              disabled={isSpinning}
              className="flex-1 md:flex-none relative group"
            >
              <div
                className={`absolute inset-0 bg-linear-to-b from-emerald-500 to-emerald-700 rounded-full blur-[2px] opacity-70 group-hover:opacity-100 transition-opacity ${isSpinning ? "hidden" : ""}`}
              ></div>
              <div
                className={`relative bg-linear-to-b from-emerald-400 to-emerald-600 border-y-[3px] border-emerald-300 text-slate-950 font-black text-2xl px-10 py-4 rounded-full shadow-[0_8px_0_1px_rgba(6,95,70,1)] active:shadow-[0_0px_0_1px_rgba(6,95,70,1)] active:translate-y-2 transition-all disabled:opacity-50 disabled:translate-y-2 disabled:shadow-[0_0px_0_1px_rgba(6,95,70,1)] flex items-center justify-center gap-2 uppercase tracking-wide cursor-pointer`}
              >
                {isSpinning ? "Spinning..." : "SPIN"}
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CasinoGame({
  gameId,
  gameName,
  onBack,
}: {
  gameId: string;
  gameName: string;
  onBack: () => void;
}) {
  const { status, loading } = useMarketStatus();

  // Determine game configuration based on gameId
  let oddsData: OddsRow[] = [];
  let showCardsArea = true;
  let cardSlots: { label: string; count: number }[] = [];

  switch (gameId) {
    case "lucky7":
      oddsData = [
        { name: "7Up", amount: "0.00", back1: "1.96", back2: "1.96" },
        { name: "7Down", amount: "0.00", back1: "1.96", back2: "1.96" },
      ];
      showCardsArea = false;
      break;
    case "dragontiger":
      oddsData = [
        { name: "Dragon", amount: "0.00", back1: "1.96" },
        { name: "Tiger", amount: "0.00", back1: "1.96" },
        { name: "Tie", amount: "0.00", back1: "10" },
      ];
      cardSlots = [
        { label: "Dragon", count: 1 },
        { label: "Tiger", count: 1 },
      ];
      break;
    case "32cards":
      oddsData = [
        { name: "Player 8", amount: "0.00", back1: "6.00" },
        { name: "Player 9", amount: "0.00", back1: "4.00" },
        { name: "Player 10", amount: "0.00", back1: "3.00" },
        { name: "Player 11", amount: "0.00", back1: "2.00" },
      ];
      cardSlots = [
        { label: "8", count: 2 },
        { label: "9", count: 2 },
        { label: "10", count: 2 },
        { label: "11", count: 2 },
      ];
      break;
    case "teenpattit20":
      oddsData = [
        { name: "Player A", amount: "0.00", back1: "1.96" },
        { name: "Player B", amount: "0.00", back1: "1.96" },
      ];
      cardSlots = [
        { label: "PLAYER A", count: 3 },
        { label: "PLAYER B", count: 3 },
      ];
      break;

    case "baccarat":
      oddsData = [
        { name: "Player", amount: "0.00", back1: "2.00" },
        { name: "Banker", amount: "0.00", back1: "1.95" },
        { name: "Tie", amount: "0.00", back1: "8.00" },
      ];
      cardSlots = [
        { label: "Player", count: 2 },
        { label: "Banker", count: 2 },
      ];
      break;
    default:
      oddsData = [
        { name: "Option A", amount: "0.00", back1: "1.96" },
        { name: "Option B", amount: "0.00", back1: "1.96" },
      ];
  }

  const [isMessagesExpanded, setIsMessagesExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    import('firebase/auth').then(({ getAuth }) => {
      const auth = getAuth();
      if (!auth.currentUser) return;
      import('firebase/firestore').then(({ getFirestore, doc, onSnapshot, collection, query, where, orderBy }) => {
        const db = getFirestore();
        const unsub = onSnapshot(doc(db, 'users', auth.currentUser!.uid), (docSn) => {
          if (docSn.exists()) {
             setBalance(Number(docSn.data()?.balance || 0));
          }
        });
        
        let unsubBets = () => {};
        if (gameId !== "aviator") {
          const q = query(
            collection(db, `users/${auth.currentUser!.uid}/bets`),
            where("gameId", "==", gameId)
          );
          unsubBets = onSnapshot(q, (snapshot) => {
            const rawBets: any[] = [];
            snapshot.forEach(doc => rawBets.push({ id: doc.id, ...doc.data() }));
            
            rawBets.sort((a, b) => {
              const t1 = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
              const t2 = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
              return t2 - t1;
            });

            const bets: BetRecord[] = rawBets.map(data => ({
              id: data.id,
              selection: data.selection,
              amount: data.amount,
              odds: data.odds || (data.status === 'won' ? 'WIN' : 'LOSE'),
              status: data.status,
              profit: data.profit,
              time: data.time || new Date().toLocaleTimeString()
            }));
            
            setBetHistory(bets);
          });
        }
        
        return () => { unsub(); unsubBets(); };
      });
    });
  }, [gameId]);

  const updateBalanceDB = async (amount: number) => {
    try {
      const { getAuth } = await import('firebase/auth');
      const { getFirestore, doc, updateDoc, increment } = await import('firebase/firestore');
      const auth = getAuth();
      if (!auth.currentUser) return;
      const db = getFirestore();
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        balance: increment(amount)
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Betting states
  const [selectedBet, setSelectedBet] = useState<{
    selection: string;
    odds: string;
  } | null>(null);
  const [betAmount, setBetAmount] = useState("100");
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betHistory, setBetHistory] = useState<BetRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Cards state
  const [revealedCards, setRevealedCards] = useState<{
    [slotIndex: number]: string[];
  }>({});
  const suits = ["♠", "♥", "♦", "♣"];
  const values = [
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
    "A",
  ];

  const getRandomCard = () => {
    return `${values[Math.floor(Math.random() * values.length)]}${suits[Math.floor(Math.random() * suits.length)]}`;
  };

  const handleSlotResult = async (
    amount: number,
    profit: number,
    isWin: boolean,
    details: string,
  ) => {
    await updateBalanceDB(profit);
    const newBet: BetRecord = {
      id: Math.random().toString(36).substr(2, 9),
      selection: details,
      amount: amount,
      odds: isWin ? "WIN" : "LOSE",
      status: isWin ? "won" : "lost",
      profit: profit,
      time: new Date().toLocaleTimeString(),
    };
    
    setBetHistory((prev) => [newBet, ...prev]);

    try {
      const { getAuth } = await import('firebase/auth');
      const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
      const auth = getAuth();
      if (auth.currentUser) {
        const db = getFirestore();
        await addDoc(collection(db, `users/${auth.currentUser.uid}/bets`), {
          ...newBet,
          gameId: gameId,
          createdAt: serverTimestamp()
        });
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handlePlaceBet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBet) return;

    const amountNum = parseFloat(betAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;
    if (amountNum > balance) {
      alert("Insufficient balance");
      return;
    }

    setIsPlacingBet(true);
    setRevealedCards({}); // Clear cards while placing bet
    
    // Deduct bet immediately
    updateBalanceDB(-amountNum).catch(console.error);

    // Simulate API call for bet result
    setTimeout(async () => {
      const isWin = Math.random() < 0.49;
      const oddsNum = parseFloat(selectedBet.odds);
      
      if (isWin) {
         // Return original bet + profit
         await updateBalanceDB(amountNum * oddsNum);
      }

      const profit = isWin ? amountNum * (oddsNum - 1) : -amountNum;

      const newBet: BetRecord = {
        id: Math.random().toString(36).substr(2, 9),
        selection: selectedBet.selection,
        amount: amountNum,
        odds: selectedBet.odds,
        status: isWin ? "won" : "lost",
        profit: profit,
        time: new Date().toLocaleTimeString(),
      };

      setBetHistory((prev) => [newBet, ...prev]);

      try {
        const { getAuth } = await import('firebase/auth');
        const { getFirestore, collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        const auth = getAuth();
        if (auth.currentUser) {
          const db = getFirestore();
          await addDoc(collection(db, `users/${auth.currentUser.uid}/bets`), {
            ...newBet,
            gameId: gameId,
            createdAt: serverTimestamp()
          });
        }
      } catch(e) {
        console.error(e);
      }

      // Reveal new cards
      const newRevealed: { [slotIndex: number]: string[] } = {};
      cardSlots.forEach((slot, i) => {
        newRevealed[i] = Array.from({ length: slot.count }).map(() =>
          getRandomCard(),
        );
      });
      setRevealedCards(newRevealed);

      setIsPlacingBet(false);
      setSelectedBet(null);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-125">
        <Loader2 className="w-8 h-8 animate-spin text-[#00ff88]" />
      </div>
    );
  }

  if (!status.liveCasino) {
    return (
      <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-6 font-sans pb-16 relative">
        <button
          onClick={onBack}
          className="absolute top-6 right-6 lg:top-10 lg:right-10 z-50 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex flex-col items-center justify-center p-12 bg-[#05100a] border border-red-500/20 rounded-2xl text-center space-y-4">
          <Ban className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold text-white">Live Casino is Currently Suspended</h2>
          <p className="text-slate-400">This market has been blocked by the administrator. Please check back later.</p>
        </div>
      </div>
    );
  }

  if (gameId === "aviator") {
    return (
      <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-6 font-sans text-sm pb-16 relative">
        <button
          onClick={onBack}
          className="absolute top-6 right-6 lg:top-10 lg:right-10 z-50 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
        
        {/* Top Bar with Balance */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#05100a] p-4 rounded-xl shadow-sm border border-[#00ff88]/20">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {gameName}
            </h2>
            <div className="text-sm text-slate-400 mt-1 flex items-center space-x-2 font-medium">
              <span className="hover:text-slate-200 cursor-pointer transition-colors">
                Dashboard
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span
                onClick={onBack}
                className="hover:text-slate-200 cursor-pointer transition-colors"
              >
                Live Casino
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-indigo-500">{gameName}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#020503] px-4 py-2 rounded-lg border border-slate-700 shadow-sm cursor-default">
            <Wallet className="w-5 h-5 text-indigo-500" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Balance
              </span>
              <span className="text-lg font-bold text-white leading-none">
                ₹
                {balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        <AviatorGame 
          balance={balance} 
          onResult={(profit) => { updateBalanceDB(profit).catch(console.error); setBalance(prev => prev + profit); }} 
        />
      </div>
    );
  }

  const totalPages = Math.ceil(betHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedBets = betHistory.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-6 font-sans text-sm pb-16">
      {/* Top Bar with Balance */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#05100a] p-4 rounded-xl shadow-sm border border-[#00ff88]/20">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {gameName}
          </h2>
          <div className="text-sm text-slate-400 mt-1 flex items-center space-x-2 font-medium">
            <span className="hover:text-slate-200 cursor-pointer transition-colors">
              Dashboard
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span
              onClick={onBack}
              className="hover:text-slate-200 cursor-pointer transition-colors"
            >
              Live Casino
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
            <span className="text-indigo-500">{gameName}</span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#020503] px-4 py-2 rounded-lg border border-slate-700 shadow-sm cursor-default">
          <Wallet className="w-5 h-5 text-indigo-500" />
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Balance
            </span>
            <span className="text-lg font-bold text-white leading-none">
              ₹
              {balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Alert Banner / Ticker */}
      <div className="bg-linear-to-r from-[#00ff88]/10 to-[#020503] border border-[#00ff88]/20 rounded-xl px-4 py-3 flex items-center shadow-sm text-slate-200 overflow-hidden mb-6">
        <div className="bg-[#00ff88]/20 p-1.5 rounded mr-3 shrink-0 border border-[#00ff88]/30">
          <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse block shadow-[0_0_8px_rgba(0,255,136,1)]"></span>
        </div>
        <div className="flex-1 min-w-0 overflow-hidden relative h-6">
            <div className="absolute left-0 top-0 whitespace-nowrap text-sm font-medium animate-[marquee_25s_linear_infinite] font-exo flex items-center gap-8 text-[#00ff88]">
              <span>🏏 <span className="font-bold text-white">Somerset</span> <span className="text-[#f0b429]">145/3 (14.3 ov)</span> vs <span className="font-bold text-white">Glamorgan</span></span>
              <span className="text-[#00ff88]/50 font-bold">•</span>
              <span>🏏 <span className="font-bold text-white">India</span> <span className="text-[#f0b429]">210/4 (20.0 ov)</span> vs <span className="font-bold text-white">Australia</span> <span className="text-[#f0b429]">185/8 (20.0 ov)</span></span>
              <span className="text-[#00ff88]/50 font-bold">•</span>
              <span>🏏 <span className="font-bold text-white">CSK</span> <span className="text-[#f0b429]">165/2 (15.0 ov)</span> vs <span className="font-bold text-white">MI</span></span>
              <span className="text-[#00ff88]/50 font-bold">•</span>
              <span>⚽ <span className="font-bold text-white">Real Madrid</span> <span className="text-[#f0b429]">2 - 1</span> <span className="font-bold text-white">Barcelona</span></span>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in duration-300">
        {/* Left Column - Game Area (Takes up 2 cols on xl) */}
        <div className="xl:col-span-2 space-y-6">
          {gameId === "lucky7" ? (
            <Lucky7Slot balance={balance} onPlay={handleSlotResult} onDeductBet={updateBalanceDB} />
          ) : gameId === "teenpattit20" ? (
            <TeenPattiT20
              balance={balance}
              onPlay={handleSlotResult}
              onDeductBet={updateBalanceDB}
              gameName={gameName}
            />
          ) : gameId === "headandtail" ? (
            <HeadAndTail
              balance={balance}
              onPlay={handleSlotResult}
              onDeductBet={updateBalanceDB}
              gameName={gameName}
            />
          ) : gameId === "baccarat" ? (
            <BaccaratSqueeze
              balance={balance}
              onPlay={handleSlotResult}
              onDeductBet={updateBalanceDB}
              gameName={gameName}
            />
          ) : (
            <>
              {/* Main Game Stream */}
              <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-xl relative">
                <div className="flex flex-col lg:flex-row h-auto xl:h-112.5">
                  {/* Cards overlay side */}
                  {showCardsArea && (
                    <div className="w-full lg:w-72 bg-slate-800/80 border-b lg:border-b-0 lg:border-r border-slate-700 p-5 shrink-0 flex flex-col gap-5 overflow-y-auto backdrop-blur-md z-10 relative">
                      <h3 className="text-white text-xs font-bold uppercase tracking-widest border-b border-white/10 pb-2 mb-2">
                        Live Cards
                      </h3>
                      {cardSlots.map((slot, i) => (
                        <div
                          key={i}
                          className="flex flex-col gap-2 bg-black/40 p-3 rounded-lg border border-white/5"
                        >
                          <span className="text-indigo-400 text-[11px] font-bold uppercase tracking-widest">
                            {slot.label}
                          </span>
                          <div className="flex gap-2">
                            {Array.from({ length: slot.count }).map((_, j) => {
                              const card = revealedCards[i]
                                ? revealedCards[i][j]
                                : "?";
                              const isRed =
                                card.includes("♥") || card.includes("♦");
                              return (
                                <div
                                  key={j}
                                  className="w-10 h-14 bg-linear-to-br from-slate-100 to-slate-200 rounded flex items-center justify-center shrink-0 shadow-lg border border-[#00ff88]/30"
                                >
                                  <div className="w-8 h-12 rounded-xs border border-[#00ff88]/20/50 bg-[#05100a] flex items-center justify-center">
                                    <span
                                      className={`text-[14px] font-bold ${card === "?" ? "text-slate-300" : isRed ? "text-red-500" : "text-white"}`}
                                    >
                                      {card}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Video Stream Area */}
                  <div className="flex-1 relative bg-black group min-h-75 flex items-center justify-center overflow-hidden">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-10000 hover:scale-105"
                      style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1596838132731-3301c3fd4317?w=1200&q=80')`,
                      }}
                    ></div>
                    <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80"></div>

                    <div className="absolute bottom-6 left-6 z-10 flex flex-col items-start">
                      <h3 className="text-white text-xl font-bold font-serif mb-1 tracking-wide">
                        {gameName} Casino
                      </h3>
                      <p className="text-slate-300 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Dealer Active • Place your bets
                      </p>
                    </div>

                    {/* LIVE Badge */}
                    <div className="absolute top-4 right-4 bg-rose-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg uppercase tracking-widest animate-pulse flex items-center gap-1.5 z-20">
                      <span className="w-1.5 h-1.5 bg-[#05100a] rounded-full"></span>
                      LIVE
                    </div>
                  </div>
                </div>
              </div>

              {/* Odds Table */}
              <div className="bg-[#05100a] rounded-xl shadow-sm border border-[#00ff88]/20 overflow-hidden">
                {/* Section Header */}
                <div className="bg-[#020503] px-5 py-4 border-b border-[#00ff88]/20 flex items-center justify-between">
                  <h3 className="font-bold text-white">Match Odds</h3>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-[#00ff88]/5 text-slate-400 border-b border-[#00ff88]/20 text-[11px] font-bold uppercase tracking-wider">
                        <th className="px-5 py-3">Selection</th>
                        <th className="px-5 py-3 w-32 border-l border-[#00ff88]/20 text-center">
                          Amount
                        </th>
                        <th className="px-5 py-3 text-center w-32 bg-indigo-50 border-l border-indigo-100 text-indigo-700">
                          Back
                        </th>
                        {oddsData[0].back2 && (
                          <th className="px-5 py-3 text-center w-32 bg-indigo-50 border-l border-indigo-100 text-indigo-700">
                            Back
                          </th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#00ff88]/20">
                      {oddsData.map((row, idx) => (
                        <tr
                          key={idx}
                          className="hover:bg-[#020503] transition-colors"
                        >
                          <td className="px-5 py-4 font-bold text-white">
                            {row.name}
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-400 text-center">
                            {row.amount}
                          </td>

                          <td className="p-2 border-l border-[#00ff88]/20">
                            {row.back1Suspended ? (
                              <div className="w-full h-12 bg-[#00ff88]/5 rounded flex items-center justify-center">
                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                                  <Lock className="w-3 h-3" /> Suspended
                                </span>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setSelectedBet({
                                    selection: row.name,
                                    odds: row.back1 || "1.96",
                                  })
                                }
                                className="w-full h-12 bg-[#72bbef] hover:bg-[#5aa8df] rounded shadow-sm transition-all focus:ring-2 focus:ring-offset-1 focus:ring-[#72bbef] flex flex-col items-center justify-center font-bold text-slate-900"
                              >
                                {row.back1}
                              </button>
                            )}
                          </td>

                          {row.back2 !== undefined && (
                            <td className="p-2 border-l border-[#00ff88]/20">
                              {row.back2Suspended ? (
                                <div className="w-full h-12 bg-[#00ff88]/5 rounded flex items-center justify-center">
                                  <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Suspended
                                  </span>
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    setSelectedBet({
                                      selection: row.name,
                                      odds: row.back2 || "1.96",
                                    })
                                  }
                                  className="w-full h-12 bg-[#72bbef] hover:bg-[#5aa8df] rounded shadow-sm transition-all focus:ring-2 focus:ring-offset-1 focus:ring-[#72bbef] flex flex-col items-center justify-center font-bold text-slate-900"
                                >
                                  {row.back2}
                                </button>
                              )}
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Column - Betting Area (Takes up 1 col on xl) */}
        <div className="space-y-6">
          {/* Bet Slip (Inline) */}
          {selectedBet &&
          gameId !== "lucky7" &&
          gameId !== "teenpattit20" &&
          gameId !== "headandtail" &&
          gameId !== "baccarat" ? (
            <div className="bg-[#05100a] rounded-xl shadow-lg border-2 border-indigo-500 overflow-hidden transform transition-all animate-in slide-in-from-right-4">
              <div className="bg-indigo-600 px-4 py-3 flex items-center justify-between text-white">
                <h3 className="font-bold flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Place Bet
                </h3>
                <button
                  onClick={() => setSelectedBet(null)}
                  className="hover:bg-indigo-500 p-1 rounded-full text-white/80 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePlaceBet} className="p-5 space-y-4">
                <div className="bg-[#020503] p-3 rounded-lg border border-[#00ff88]/20">
                  <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-1">
                    Selection
                  </p>
                  <p className="font-bold text-white">
                    {selectedBet.selection}
                  </p>
                </div>

                <div className="flex justify-between items-center bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
                  <span className="text-sm font-semibold text-indigo-700">
                    Odds
                  </span>
                  <span className="text-lg font-bold text-indigo-700">
                    {selectedBet.odds}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Stake Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    min="1"
                    className="w-full p-3 bg-[#05100a] border border-[#00ff88]/30 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none text-lg font-bold"
                    placeholder="Enter amount"
                    disabled={isPlacingBet}
                  />
                </div>

                {/* Quick amounts */}
                <div className="grid grid-cols-4 gap-2">
                  {[100, 500, 1000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setBetAmount(amt.toString())}
                      className="py-1.5 bg-[#00ff88]/5 hover:bg-[#00ff88]/20 text-slate-200 font-semibold rounded text-xs transition-colors"
                      disabled={isPlacingBet}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#00ff88]/20 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Possible Return:</span>
                    <span className="font-bold text-emerald-600">
                      ₹
                      {betAmount && !isNaN(parseFloat(betAmount))
                        ? (
                            parseFloat(betAmount) * parseFloat(selectedBet.odds)
                          ).toFixed(2)
                        : "0.00"}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    isPlacingBet || !betAmount || isNaN(parseFloat(betAmount))
                  }
                  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                >
                  {isPlacingBet ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Confirm Bet"
                  )}
                </button>
              </form>
            </div>
          ) : null}

          {/* Matched Bets History */}
          <div className="bg-[#05100a] rounded-xl shadow-sm border border-[#00ff88]/20 overflow-hidden flex flex-col min-h-75">
            <div className="px-5 py-4 bg-[#020503] border-b border-[#00ff88]/20 flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <History className="w-4 h-4 text-slate-400" />
                Matched Bets ({betHistory.length})
              </h3>
              <button
                onClick={handleRefresh}
                className="hover:bg-[#00ff88]/20 text-slate-400 p-1.5 rounded-md transition-colors group"
              >
                <RefreshCcw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`}
                />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              {betHistory.length > 0 ? (
                <>
                  <div className="divide-y divide-[#00ff88]/20">
                    {paginatedBets.map((bet) => (
                      <div
                        key={bet.id}
                        className="p-4 hover:bg-[#020503] transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold text-white">
                              {bet.selection}
                            </span>
                            <span className="text-slate-400 text-xs ml-2">
                              @{bet.odds}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {bet.time}
                          </span>
                        </div>
                        <div className="flex justify-between items-end mt-3">
                          <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Stake
                            </span>
                            <span className="font-bold text-slate-200">
                              ₹{bet.amount.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                              Result
                            </span>
                            <span
                              className={`font-bold ${bet.profit > 0 ? "text-emerald-500" : "text-rose-500"}`}
                            >
                              {bet.profit > 0 ? "+" : ""}
                              {bet.profit.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between p-4 border-t border-[#00ff88]/20 bg-[#020503]">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-xs font-semibold rounded bg-[#00ff88]/10 text-[#00ff88] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="text-xs text-slate-400 font-medium">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-xs font-semibold rounded bg-[#00ff88]/10 text-[#00ff88] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-[#020503]/50">
                  <div className="w-12 h-12 bg-[#00ff88]/5 rounded-full flex items-center justify-center mb-3">
                    <History className="w-5 h-5 text-slate-400" />
                  </div>
                  <span className="text-slate-400 text-sm font-medium">
                    No bets placed yet
                  </span>
                  <span className="text-slate-400 text-xs mt-1">
                    Select an odds button to start playing
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
