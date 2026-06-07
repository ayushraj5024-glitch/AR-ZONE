import React, { useState } from 'react';

interface TeenPattiProps {
  balance: number;
  gameName?: string;
  onPlay: (amount: number, profit: number, win: boolean, details: string) => void;
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
      <div className="w-8 h-12 bg-[#2E3192] border border-[#1E1B4B] rounded-sm flex items-center justify-center">
         <span className="text-[#6366F1] font-bold text-sm">?</span>
      </div>
    );
  }
  const isRed = suit === 'hearts' || suit === 'diamonds';
  return (
    <div className="w-8 h-12 bg-white rounded-sm border border-slate-200 shadow-sm flex flex-col items-center justify-center">
       <span className={`text-[10px] font-bold leading-none ${isRed ? 'text-red-600' : 'text-slate-900'}`}>{value}</span>
       <span className={`text-[12px] leading-none mt-0.5 ${isRed ? 'text-red-600' : 'text-slate-900'}`}>{suit ? suits[suit] : ''}</span>
    </div>
  );
};

export default function TeenPattiT20({ balance, onPlay, gameName = "Teen Patti T20" }: TeenPattiProps) {
  const [betAmount, setBetAmount] = useState<number>(50);
  const [selectedPlayer, setSelectedPlayer] = useState<'A' | 'B'>('A');
  const [round, setRound] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [revealedCards, setRevealedCards] = useState<{A: any[], B: any[]} | null>(null);

  const chips = [50, 100, 200, 500];

  const handleBet = () => {
    if (isProcessing || isWaiting) return;
    if (betAmount > balance) {
      alert('Insufficient balance.');
      return;
    }
    
    setIsWaiting(true);
    setCountdown(5);
    // Clear previous round's cards when starting a new bet
    setRevealedCards(null);
    
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

    // User wins 49% of the time, dealer wins 51%
    const userWins = Math.random() < 0.49;
    
    let cardsA, cardsB;
    if (selectedPlayer === 'A') {
        cardsA = userWins ? winningHand : losingHand;
        cardsB = userWins ? losingHand : winningHand;
    } else {
        cardsB = userWins ? winningHand : losingHand;
        cardsA = userWins ? losingHand : winningHand;
    }
    
    let count = 5;
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    // Waiting to simulate dealer dealing and 5 sec delay, then show cards
    setTimeout(() => {
        setIsWaiting(false);
        setIsProcessing(true);
        setRevealedCards({ A: cardsA, B: cardsB });
        
        setTimeout(() => {
           if (userWins) {
              onPlay(betAmount, betAmount * 1.9, true, `Bet on Player ${selectedPlayer}`);
           } else {
              onPlay(betAmount, -betAmount, false, `Bet on Player ${selectedPlayer}`);
           }
           
           setTimeout(() => {
              // We do NOT hide the cards here. We just end processing so user can bet again.
              setRound(prev => prev + 1);
              setIsProcessing(false);
           }, 2000);
        }, 1500);
    }, 5000);
  };

  return (
    <div className="w-full max-w-[500px] mx-auto bg-[#0A2613] rounded-3xl font-sans relative shadow-2xl text-white pb-6">
       
       {/* Top Header */}
       <div className="flex justify-between items-center px-6 pt-6 pb-6">
         <h1 className="text-[#DAA520] font-sans text-xl font-medium tracking-wide">{gameName}</h1>
         <div className="bg-[#184526] text-[#4ADE80] px-4 py-1.5 rounded-full text-sm font-medium">
           Round {round}
         </div>
       </div>

       {/* Players Area */}
       <div className="flex justify-between px-6 gap-4">
         
         {/* Player A Container */}
         <div 
            onClick={() => !isProcessing && !isWaiting && setSelectedPlayer('A')}
            className={`relative flex-1 bg-[#10361C] border cursor-pointer transition-all rounded-xl p-4 pt-5 pb-5 ${selectedPlayer === 'A' ? 'border-[#DAA520]' : 'border-[#184526]'}`}
         >
            {selectedPlayer === 'A' && (
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#DAA520] text-[#0A2613] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tight whitespace-nowrap">
                  Selected
               </div>
            )}
            
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center text-white text-lg font-bold">A</div>
               <div className="flex flex-col">
                 <span className="text-white font-medium text-sm">Player A</span>
               </div>
            </div>
            
            <div className="flex gap-2 justify-center">
               {revealedCards ? (
                  revealedCards.A.map((card, i) => <Card key={i} value={card.value} suit={card.suit as any} />)
               ) : (
                  [1,2,3].map(i => <Card key={i} faceDown />)
               )}
            </div>
         </div>

         {/* Player B Container */}
         <div 
            onClick={() => !isProcessing && !isWaiting && setSelectedPlayer('B')}
            className={`relative flex-1 bg-[#10361C] border cursor-pointer transition-all rounded-xl p-4 pt-5 pb-5 ${selectedPlayer === 'B' ? 'border-[#DAA520]' : 'border-[#184526]'}`}
         >
            {selectedPlayer === 'B' && (
               <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#DAA520] text-[#0A2613] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tight whitespace-nowrap">
                  Selected
               </div>
            )}

            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-[#9D174D] rounded-full flex items-center justify-center text-white text-lg font-bold">B</div>
               <div className="flex flex-col">
                 <span className="text-white font-medium text-sm">Player B</span>
               </div>
            </div>
            
            <div className="flex gap-2 justify-center">
               {revealedCards ? (
                  revealedCards.B.map((card, i) => <Card key={i} value={card.value} suit={card.suit as any} />)
               ) : (
                  [1,2,3].map(i => <Card key={i} faceDown />)
               )}
            </div>
         </div>

       </div>

       {/* Bet Amount Input Area */}
       <div className="mx-6 mt-6 bg-[#0E2C17] rounded-xl p-5 border border-[#153D22]">
          <div className="flex justify-between items-center mb-4">
             <span className="text-[#4ADE80] text-xs tracking-wider uppercase">Your Bet Amount</span>
             <span className="bg-[#2E2812] text-[#DAA520] text-xs px-2 py-1 rounded">Min ₹50</span>
          </div>
          
          <div className="flex items-center gap-3 mb-4">
             <button 
               onClick={() => setBetAmount(Math.max(50, betAmount - 50))}
               disabled={isProcessing || isWaiting}
               className="w-10 h-10 bg-[#10361C] border border-[#184526] rounded-md flex items-center justify-center text-xl text-white disabled:opacity-50"
             >
               -
             </button>
             <div className="flex-1 h-10 bg-[#302D32] rounded-md flex items-center justify-center text-white font-medium text-lg border border-[#1E1B4B]">
                {betAmount}
             </div>
             <button 
               onClick={() => setBetAmount(betAmount + 50)}
               disabled={isProcessing || isWaiting}
               className="w-10 h-10 bg-[#10361C] border border-[#184526] rounded-md flex items-center justify-center text-xl text-white disabled:opacity-50"
             >
               +
             </button>
          </div>

          <div className="flex gap-2">
             {chips.map(chip => (
               <button
                 key={chip}
                 onClick={() => setBetAmount(chip)}
                 disabled={isProcessing || isWaiting}
                 className={`flex-1 py-2 rounded-md font-medium text-sm transition-all border disabled:opacity-50 ${
                   betAmount === chip ? 'bg-[#184526] border-[#4ADE80] text-white' : 'bg-[#10361C] border-[#184526] text-white'
                 }`}
               >
                 ₹{chip}
               </button>
             ))}
          </div>
       </div>

       {/* Action Buttons */}
       <div className="mx-6 mt-6">
          <button
             onClick={handleBet}
             disabled={isProcessing || isWaiting}
             className="w-full bg-[#DAA520] hover:bg-[#B8860B] border border-[#FFD700] text-[#0A2613] py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 shadow-lg"
          >
             {isWaiting ? `Simulating Round in ${countdown}s...` : isProcessing ? 'Revealing...' : `Place Bet on Player ${selectedPlayer}`}
          </button>
       </div>

    </div>
  );
}
