import React, { useState, useEffect } from 'react';

interface TeenPattiProps {
  balance: number;
  gameName?: string;
  onPlay: (amount: number, profit: number, win: boolean, details: string) => void | Promise<void>;
  onDeductBet?: (amount: number) => Promise<void>;
}

const suits = {
  clubs: '♣',
  diamonds: '♦',
  hearts: '♥',
  spades: '♠'
};

const getCardValue = (val: string) => {
   if (val === 'A') return 14;
   if (val === 'K') return 13;
   if (val === 'Q') return 12;
   if (val === 'J') return 11;
   return parseInt(val);
};

const generateDeck = () => {
    const _suits = ['clubs', 'diamonds', 'hearts', 'spades'];
    const _values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    const deck = [];
    for (const s of _suits) {
        for (const v of _values) {
            deck.push({ value: v, suit: s });
        }
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
};

const evaluateHand = (hand: any[]) => {
   const values = hand.map(c => getCardValue(c.value)).sort((a, b) => b - a);
   const suitList = hand.map(c => c.suit);
   const isFlush = suitList[0] === suitList[1] && suitList[1] === suitList[2];
   let isStraight = false;
   let sortedValues = [...values];
   if (values[0] === values[1] + 1 && values[1] === values[2] + 1) isStraight = true;
   else if (values[0] === 14 && values[1] === 3 && values[2] === 2) { isStraight = true; sortedValues = [14, 3, 2]; }
   const isTrail = values[0] === values[1] && values[1] === values[2];
   const isPair = values[0] === values[1] || values[1] === values[2];
   let pairValue = 0; let kicker = 0;
   if (isPair) {
       if (values[0] === values[1]) { pairValue = values[0]; kicker = values[2]; }
       else { pairValue = values[1]; kicker = values[0]; }
   }
   let typeScore = 0;
   if (isTrail) typeScore = 5;
   else if (isStraight && isFlush) typeScore = 4;
   else if (isStraight) typeScore = 3;
   else if (isFlush) typeScore = 2;
   else if (isPair) typeScore = 1;

   if (isPair) return typeScore * 1000000 + pairValue * 10000 + kicker * 100;
   return typeScore * 1000000 + sortedValues[0] * 10000 + sortedValues[1] * 100 + sortedValues[2];
};

interface CardProps {
  value?: string;
  suit?: 'clubs' | 'diamonds' | 'hearts' | 'spades';
  faceDown?: boolean;
}

const Card: React.FC<CardProps> = ({ value, suit, faceDown }) => {
  if (faceDown) {
    return (
      <div className="w-10 h-14 bg-linear-to-br from-[#1E1B4B] to-[#2E3192] border border-[#6366F1]/30 rounded flex items-center justify-center shadow-inner">
         <span className="text-[#6366F1] font-bold text-sm opacity-50">?</span>
      </div>
    );
  }
  const isRed = suit === 'hearts' || suit === 'diamonds';
  return (
    <div className="w-10 h-14 bg-white rounded border border-slate-200 shadow-md flex flex-col items-center justify-center transform hover:-translate-y-1 transition-transform">
       <span className={`text-base font-bold leading-none ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>{value}</span>
       <span className={`text-lg leading-none mt-0.5 ${isRed ? 'text-rose-600' : 'text-slate-900'}`}>{suit ? suits[suit] : ''}</span>
    </div>
  );
};

export default function TeenPattiT20({ balance, onPlay, onDeductBet, gameName = "Teen Patti T20" }: TeenPattiProps) {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [stage, setStage] = useState<'BETTING' | 'DEALING' | 'RESULT'>('BETTING');
  const [timeLeft, setTimeLeft] = useState(15);
  const [round, setRound] = useState(1);
  const [revealedCards, setRevealedCards] = useState<{A: any[], B: any[]} | null>(null);
  
  // The user's active bet for the current round
  const [currentBet, setCurrentBet] = useState<{player: 'A' | 'B', amount: number} | null>(null);
  const [winner, setWinner] = useState<'A' | 'B' | null>(null);

  const chips = [50, 100, 200, 500, 1000];

  // Timer interval for BETTING stage
  useEffect(() => {
    if (stage !== 'BETTING') return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleStageDealing();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [stage]);

  const handleStageDealing = () => {
    setStage('DEALING');
    
    let deck = generateDeck();
    let hand1 = deck.slice(0, 3);
    let hand2 = deck.slice(3, 6);
    let score1 = evaluateHand(hand1);
    let score2 = evaluateHand(hand2);
    
    // ensure score1 != score2
    while(score1 === score2) {
       deck = generateDeck();
       hand1 = deck.slice(0, 3);
       hand2 = deck.slice(3, 6);
       score1 = evaluateHand(hand1);
       score2 = evaluateHand(hand2);
    }
    
    const winningHand = score1 > score2 ? hand1 : hand2;
    const losingHand = score1 > score2 ? hand2 : hand1;

    // Fixed casino win probability logic. If user has a bet, ensure average 51% house edge
    // Right now, hands are just randomly drawn so it's 50/50.
    const isPlayerAWinner = score1 > score2;
    // We already have actual random hands, let's just use them! 
    // Hands are truly random, so odds are symmetric, which is 50/50. But payout is usually ~1.9x so house keeps 5% margin.
    const actualWinner = isPlayerAWinner ? 'A' : 'B';
    const cardsA = hand1;
    const cardsB = hand2;

    // Simulate dealing delay
    setTimeout(() => {
        setRevealedCards({ A: cardsA, B: cardsB });
        setWinner(actualWinner);
        setStage('RESULT');
        
        // Note: we need to access the most current value of currentBet!
        // We'll manage payout via another useEffect that watches stage changes to avoid stale closures.
    }, 2000);
  };

  // Payout effect
  useEffect(() => {
     if (stage === 'RESULT' && winner) {
        if (currentBet) {
             const userWins = currentBet.player === winner;
             if (userWins) {
                // Return original bet + profit (1.9x total return) -> profit = amount * 1.9, win = true
                onPlay(currentBet.amount, currentBet.amount * 1.94, true, `Bet on Player ${currentBet.player}`);
             } else {
                // Lost
                onPlay(currentBet.amount, 0, false, `Bet on Player ${currentBet.player}`);
             }
        }
        // Next round
        setTimeout(() => {
           setRound(r => r + 1);
           setStage('BETTING');
           setTimeLeft(15);
           setRevealedCards(null);
           setCurrentBet(null);
           setWinner(null);
        }, 5000);
     }
  }, [stage]);

  const placeBet = (player: 'A' | 'B') => {
    if (stage !== 'BETTING' || timeLeft <= 3) return;
    if (currentBet) return; // Only one bet per round for simplicity
    if (betAmount > balance) {
      alert('Insufficient balance.');
      return;
    }
    
    if (onDeductBet) onDeductBet(-betAmount).catch(console.error);
    setCurrentBet({ player, amount: betAmount });
  };

  return (
    <div className="w-full bg-[#030705] border border-(--primary)/20 rounded-2xl overflow-hidden font-sans relative shadow-[0_0_40px_rgba(0,255,136,0.1)] text-white">
       
       {/* Top Header - Live Casino Feel */}
       <div className="bg-[#020503] border-b border-(--primary)/10 px-6 py-4 flex justify-between items-center relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-(--primary) to-transparent opacity-50"></div>
         <div className="flex items-center gap-3">
            <span className={`w-2.5 h-2.5 rounded-full animate-pulse ${stage === 'BETTING' && timeLeft <= 3 ? 'bg-rose-500' : 'bg-(--primary)'}`}></span>
            <h1 className="text-white font-bold tracking-wider uppercase text-sm">{gameName}</h1>
         </div>
         <div className="bg-(--primary)/10 text-(--primary) px-3 py-1 rounded text-xs font-bold tracking-widest border border-(--primary)/20 shadow-[0_0_10px_rgba(0,255,136,0.1)]">
           ROUND #{round.toString().padStart(4, '0')}
         </div>
       </div>

       {/* Video/Table Area Placeholder */}
       <div className="relative h-70 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#134624] via-[#0A2613] to-[#020904] p-6 flex flex-col items-center justify-between border-b border-white/5">
           
           {/* Center Status indicator */}
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-full flex flex-col items-center pointer-events-none">
               {stage === 'BETTING' && (
                  <>
                     <div className={`font-black text-7xl transition-colors duration-300 ${timeLeft <= 3 ? 'text-rose-500 drop-shadow-[0_0_25px_rgba(244,63,94,0.8)] animate-pulse' : 'text-(--primary) drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]'}`}>
                        {timeLeft}
                     </div>
                     <div className={`text-sm uppercase tracking-[0.3em] mt-3 font-bold bg-[#020503]/80 backdrop-blur-sm px-6 py-1.5 rounded-full border transition-colors duration-300 shadow-xl ${timeLeft <= 3 ? 'text-rose-500 border-rose-500/30' : 'text-(--primary) border-(--primary)/30'}`}>
                        {timeLeft <= 3 ? "Betting Closed" : "Place Your Bets"}
                     </div>
                  </>
               )}
               {stage === 'DEALING' && (
                  <div className="text-amber-400 font-black text-xl uppercase tracking-[0.2em] bg-[#020503]/80 px-6 py-3 rounded-xl border border-amber-400/30 animate-pulse">
                     No More Bets
                  </div>
               )}
               {stage === 'RESULT' && winner && (
                  <div className="text-white font-black text-3xl uppercase tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                     Player {winner} Wins
                  </div>
               )}
           </div>

           {/* Player Cards Display */}
           <div className="w-full flex justify-between items-center px-4 mt-4 z-0">
               {/* Player A Cards */}
               <div className={`transition-all duration-500 ${winner === 'A' ? 'scale-110 drop-shadow-[0_0_40px_rgba(59,130,246,0.6)] z-20' : winner === 'B' ? 'opacity-40 scale-95' : 'hover:scale-105'}`}>
                   <div className="flex gap-2">
                       {revealedCards ? (
                          revealedCards.A.map((card, i) => <Card key={i} value={card.value} suit={card.suit as any} />)
                       ) : (
                          [1,2,3].map(i => <Card key={i} faceDown />)
                       )}
                   </div>
               </div>
               
               <div className="text-white/10 font-black text-5xl italic tracking-tighter drop-shadow-xl">VS</div>

               {/* Player B Cards */}
               <div className={`transition-all duration-500 ${winner === 'B' ? 'scale-110 drop-shadow-[0_0_40px_rgba(225,29,72,0.6)] z-20' : winner === 'A' ? 'opacity-40 scale-95' : 'hover:scale-105'}`}>
                   <div className="flex gap-2">
                       {revealedCards ? (
                          revealedCards.B.map((card, i) => <Card key={i} value={card.value} suit={card.suit as any} />)
                       ) : (
                          [1,2,3].map(i => <Card key={i} faceDown />)
                       )}
                   </div>
               </div>
           </div>
       </div>

       {/* Betting Controls */}
       <div className="p-6 bg-[#020503] relative border-t border-(--primary)/10">
           {/* Current Bet Status */}
           {currentBet && (
               <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-(--primary) text-slate-900 text-xs font-black uppercase px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(0,255,136,0.4)] whitespace-nowrap z-20">
                  Accepted: ₹{currentBet.amount} on Player {currentBet.player}
               </div>
           )}

           <div className="flex gap-4">
               <button
                  onClick={() => placeBet('A')}
                  disabled={stage !== 'BETTING' || currentBet !== null || (stage === 'BETTING' && timeLeft <= 3)}
                  className={`flex-1 group relative p-5 rounded-xl border transition-all duration-300 ${
                     stage !== 'BETTING' || currentBet !== null || (stage === 'BETTING' && timeLeft <= 3) ? 'opacity-50 cursor-not-allowed bg-[#010302] border-white/5 grayscale' : 
                     'bg-linear-to-br from-blue-900/30 to-blue-900/10 border-blue-500/40 hover:border-blue-400 hover:from-blue-800/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                  }`}
               >
                   {currentBet?.player === 'A' && (
                       <div className="absolute inset-0 border-2 border-(--primary) rounded-xl z-20 pointer-events-none shadow-[0_0_15px_rgba(0,255,136,0.3)]"></div>
                   )}
                   <div className="flex flex-col items-center justify-center">
                       <span className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center font-black text-2xl mb-2 shadow-[0_0_15px_rgba(37,99,235,0.6)] border border-blue-400">A</span>
                       <span className="font-bold text-sm tracking-wider uppercase text-blue-100">Player A</span>
                       <span className="text-xs text-blue-400 font-mono mt-1 bg-blue-950/50 px-2 py-0.5 rounded">1.9x RETURNS</span>
                   </div>
               </button>

               <button
                  onClick={() => placeBet('B')}
                  disabled={stage !== 'BETTING' || currentBet !== null || (stage === 'BETTING' && timeLeft <= 3)}
                  className={`flex-1 group relative p-5 rounded-xl border transition-all duration-300 ${
                     stage !== 'BETTING' || currentBet !== null || (stage === 'BETTING' && timeLeft <= 3) ? 'opacity-50 cursor-not-allowed bg-[#010302] border-white/5 grayscale' : 
                     'bg-linear-to-br from-rose-900/30 to-rose-900/10 border-rose-500/40 hover:border-rose-400 hover:from-rose-800/40 hover:shadow-[0_0_20px_rgba(225,29,72,0.3)]'
                  }`}
               >
                   {currentBet?.player === 'B' && (
                       <div className="absolute inset-0 border-2 border-(--primary) rounded-xl z-20 pointer-events-none shadow-[0_0_15px_rgba(0,255,136,0.3)]"></div>
                   )}
                   <div className="flex flex-col items-center justify-center">
                       <span className="w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center font-black text-2xl mb-2 shadow-[0_0_15px_rgba(225,29,72,0.6)] border border-rose-400">B</span>
                       <span className="font-bold text-sm tracking-wider uppercase text-rose-100">Player B</span>
                       <span className="text-xs text-rose-400 font-mono mt-1 bg-rose-950/50 px-2 py-0.5 rounded">1.9x RETURNS</span>
                   </div>
               </button>
           </div>

           {/* Chips */}
           <div className="mt-6 flex flex-col gap-3">
              <div className="flex justify-between items-center text-xs uppercase tracking-widest text-slate-500 px-2 font-bold">
                 <span>Select Stake</span>
                 <span className="text-(--primary)/70 font-mono">₹{betAmount}</span>
              </div>
              <div className="flex gap-2">
                 {chips.map(chip => (
                   <button
                     key={chip}
                     onClick={() => setBetAmount(chip)}
                     className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all border ${
                       betAmount === chip 
                         ? 'bg-(--primary)/10 border-(--primary) text-(--primary) shadow-[0_0_10px_rgba(0,255,136,0.2)]' 
                         : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-800'
                     }`}
                   >
                     {chip >= 1000 ? `${chip/1000}k` : chip}
                   </button>
                 ))}
              </div>
           </div>
       </div>

    </div>
  );
}
