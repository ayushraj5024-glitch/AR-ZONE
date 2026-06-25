import React from 'react';
import { motion } from 'motion/react';

const PATH = [
  [7, 2], [7, 3], [7, 4], [7, 5], [7, 6],
  [6, 7], [5, 7], [4, 7], [3, 7], [2, 7], [1, 7],
  [1, 8], [1, 9],
  [2, 9], [3, 9], [4, 9], [5, 9], [6, 9],
  [7, 10], [7, 11], [7, 12], [7, 13], [7, 14], [7, 15],
  [8, 15], [9, 15],
  [9, 14], [9, 13], [9, 12], [9, 11], [9, 10],
  [10, 9], [11, 9], [12, 9], [13, 9], [14, 9], [15, 9],
  [15, 8], [15, 7],
  [14, 7], [13, 7], [12, 7], [11, 7], [10, 7],
  [9, 6], [9, 5], [9, 4], [9, 3], [9, 2], [9, 1],
  [8, 1], [7, 1]
];

const HOME_PATHS = {
  red: [[8, 2], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7]],
  green: [[2, 8], [3, 8], [4, 8], [5, 8], [6, 8], [7, 8]],
  yellow: [[8, 14], [8, 13], [8, 12], [8, 11], [8, 10], [8, 9]],
  blue: [[14, 8], [13, 8], [12, 8], [11, 8], [10, 8], [9, 8]]
};

const BASE_POSITIONS = {
  red: [[3, 3], [3, 5], [5, 3], [5, 5]], 
  green: [[3, 11], [3, 13], [5, 11], [5, 13]],
  yellow: [[11, 11], [11, 13], [13, 11], [13, 13]],
  blue: [[11, 3], [11, 5], [13, 3], [13, 5]]
};

export type PieceState = {
  id: string;
  color: 'red' | 'green' | 'yellow' | 'blue';
  position: number;
};

export default function LudoGrid({ pieces, onPieceClick }: { pieces?: PieceState[], onPieceClick?: (piece: PieceState) => void }) {
  
  const getPieceCoordinates = (piece: PieceState) => {
    if (piece.position === -1) {
      const idx = parseInt(piece.id.substring(1)) - 1;
      return BASE_POSITIONS[piece.color][idx];
    } else if (piece.position >= 0 && piece.position <= 50) {
      const offsets = { red: 0, green: 13, yellow: 26, blue: 39 };
      const absPos = (piece.position + offsets[piece.color]) % 52;
      return PATH[absPos];
    } else if (piece.position >= 51 && piece.position <= 56) {
      return HOME_PATHS[piece.color][piece.position - 51];
    }
    return [1,1];
  };

  const getPieceColorClass = (color: string) => {
     switch(color) {
       case 'red': return 'bg-[#cc2b2b] border-[#5e0a0a]';
       case 'green': return 'bg-[#2d9e47] border-[#084518]';
       case 'yellow': return 'bg-[#e2a818] border-[#8a5d00]';
       case 'blue': return 'bg-[#2267c7] border-[#052657]';
       default: return 'bg-gray-500 border-gray-900';
     }
  };

  return (
    <div 
      className="w-full aspect-square bg-[#ececec] rounded-xl border-8 border-[#0c1f36] p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden" 
      style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gridTemplateRows: 'repeat(15, 1fr)', gap: '0px' }}
    >
      {/* Background for Paths */}
      <div className="col-start-1 col-end-16 row-start-1 row-end-16 bg-white" style={{ gridArea: '1 / 1 / 16 / 16' }}></div>

      {/* Red Base */}
      <div className="bg-[#cc2b2b] rounded-lg relative flex items-center justify-center border-4 border-[#a61c1c]" style={{ gridArea: '1 / 1 / 7 / 7' }}>
         <div className="w-[70%] h-[70%] bg-[#ececec] rounded-xl flex items-center justify-center p-3 shadow-inner">
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-3">
               <div className="bg-[#cc2b2b] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#a61c1c]"></div>
               <div className="bg-[#cc2b2b] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#a61c1c]"></div>
               <div className="bg-[#cc2b2b] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#a61c1c]"></div>
               <div className="bg-[#cc2b2b] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#a61c1c]"></div>
            </div>
         </div>
      </div>

      {/* Green Base */}
      <div className="bg-[#2d9e47] rounded-lg relative flex items-center justify-center border-4 border-[#1b7331]" style={{ gridArea: '1 / 10 / 7 / 16' }}>
         <div className="w-[70%] h-[70%] bg-[#ececec] rounded-xl flex items-center justify-center p-3 shadow-inner">
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-3">
               <div className="bg-[#2d9e47] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#1b7331]"></div>
               <div className="bg-[#2d9e47] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#1b7331]"></div>
               <div className="bg-[#2d9e47] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#1b7331]"></div>
               <div className="bg-[#2d9e47] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#1b7331]"></div>
            </div>
         </div>
      </div>

      {/* Blue Base */}
      <div className="bg-[#2267c7] rounded-lg relative flex items-center justify-center border-4 border-[#144487]" style={{ gridArea: '10 / 1 / 16 / 7' }}>
         <div className="w-[70%] h-[70%] bg-[#ececec] rounded-xl flex items-center justify-center p-3 shadow-inner">
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-3">
               <div className="bg-[#2267c7] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#144487]"></div>
               <div className="bg-[#2267c7] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#144487]"></div>
               <div className="bg-[#2267c7] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#144487]"></div>
               <div className="bg-[#2267c7] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#144487]"></div>
            </div>
         </div>
      </div>

      {/* Yellow Base */}
      <div className="bg-[#e2a818] rounded-lg relative flex items-center justify-center border-4 border-[#bc8a10]" style={{ gridArea: '10 / 10 / 16 / 16' }}>
         <div className="w-[70%] h-[70%] bg-[#ececec] rounded-xl flex items-center justify-center p-3 shadow-inner">
            <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-3">
               <div className="bg-[#e2a818] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#bc8a10]"></div>
               <div className="bg-[#e2a818] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#bc8a10]"></div>
               <div className="bg-[#e2a818] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#bc8a10]"></div>
               <div className="bg-[#e2a818] rounded-full shadow-[inset_0_-4px_8px_rgba(0,0,0,0.4),0_4px_6px_rgba(0,0,0,0.5)] border border-[#bc8a10]"></div>
            </div>
         </div>
      </div>

      {/* Path Layout White Background Fill */}
      <div className="bg-white border border-black/20" style={{ gridArea: '1 / 7 / 7 / 10' }}></div>
      <div className="bg-white border border-black/20" style={{ gridArea: '10 / 7 / 16 / 10' }}></div>
      <div className="bg-white border border-black/20" style={{ gridArea: '7 / 1 / 10 / 7' }}></div>
      <div className="bg-white border border-black/20" style={{ gridArea: '7 / 10 / 10 / 16' }}></div>

      {/* Safe Zones / Path Coloring */}
      {/* Red Home Run */}
      <div className="bg-[#cc2b2b] border border-black/20" style={{ gridArea: '8 / 2 / 9 / 7' }}></div>
      <div className="bg-[#cc2b2b] border border-black/20 flex items-center justify-center text-white" style={{ gridArea: '7 / 2 / 8 / 3' }}>★</div>
      
      {/* Green Home Run */}
      <div className="bg-[#2d9e47] border border-black/20" style={{ gridArea: '2 / 8 / 7 / 9' }}></div>
      <div className="bg-[#2d9e47] border border-black/20 flex items-center justify-center text-white" style={{ gridArea: '2 / 9 / 3 / 10' }}>★</div>
      
      {/* Blue Home Run */}
      <div className="bg-[#2267c7] border border-black/20" style={{ gridArea: '10 / 8 / 15 / 9' }}></div>
      <div className="bg-[#2267c7] border border-black/20 flex items-center justify-center text-white" style={{ gridArea: '14 / 7 / 15 / 8' }}>★</div>
      
      {/* Yellow Home Run */}
      <div className="bg-[#e2a818] border border-black/20" style={{ gridArea: '8 / 10 / 9 / 15' }}></div>
      <div className="bg-[#e2a818] border border-black/20 flex items-center justify-center text-white" style={{ gridArea: '9 / 14 / 10 / 15' }}>★</div>

      {/* 2nd Safe spots */}
      <div className="bg-[#d8f0e0] border border-black/20 text-[#2d9e47] font-bold text-xl flex items-center justify-center" style={{ gridArea: '3 / 7 / 4 / 8' }}>★</div>
      <div className="bg-[#f8d7d7] border border-black/20 text-[#cc2b2b] font-bold text-xl flex items-center justify-center" style={{ gridArea: '9 / 3 / 10 / 4' }}>★</div>
      <div className="bg-[#dce5f8] border border-black/20 text-[#2267c7] font-bold text-xl flex items-center justify-center" style={{ gridArea: '13 / 9 / 14 / 10' }}>★</div>
      <div className="bg-[#fbf4d8] border border-black/20 text-[#e2a818] font-bold text-xl flex items-center justify-center" style={{ gridArea: '7 / 13 / 8 / 14' }}>★</div>


      {/* Grid Lines Overlay */}
      <div className="grid grid-cols-6 grid-rows-3 gap-0 pointer-events-none" style={{ gridArea: '7 / 1 / 10 / 7' }}>
         {[...Array(18)].map((_, i) => <div key={`hl-${i}`} className="border-[0.5px] border-slate-400/50"></div>)}
      </div>
      <div className="grid grid-cols-6 grid-rows-3 gap-0 pointer-events-none" style={{ gridArea: '7 / 10 / 10 / 16' }}>
         {[...Array(18)].map((_, i) => <div key={`hr-${i}`} className="border-[0.5px] border-slate-400/50"></div>)}
      </div>
      <div className="grid grid-cols-3 grid-rows-6 gap-0 pointer-events-none" style={{ gridArea: '1 / 7 / 7 / 10' }}>
         {[...Array(18)].map((_, i) => <div key={`vt-${i}`} className="border-[0.5px] border-slate-400/50"></div>)}
      </div>
      <div className="grid grid-cols-3 grid-rows-6 gap-0 pointer-events-none" style={{ gridArea: '10 / 7 / 16 / 10' }}>
         {[...Array(18)].map((_, i) => <div key={`vb-${i}`} className="border-[0.5px] border-slate-400/50"></div>)}
      </div>

      {/* Center Home Triangle */}
      <div className="relative border border-black/20 overflow-hidden" style={{ gridArea: '7 / 7 / 10 / 10' }}>
         <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <polygon points="0,0 50,50 0,100" fill="#cc2b2b" />
            <polygon points="0,0 100,0 50,50" fill="#2d9e47" />
            <polygon points="100,0 100,100 50,50" fill="#e2a818" />
            <polygon points="0,100 100,100 50,50" fill="#2267c7" />
            <line x1="0" y1="0" x2="100" y2="100" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
            <line x1="0" y1="100" x2="100" y2="0" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
         </svg>
      </div>

      {/* Render Pieces */}
      {pieces && pieces.map(piece => {
        const [row, col] = getPieceCoordinates(piece);
        return (
          <motion.div 
            key={piece.id}
            layout
            transition={{ type: "spring", stiffness: 300, damping: 25, mass: 1 }}
            onClick={(e: React.MouseEvent) => {
               e.stopPropagation();
               if(onPieceClick) onPieceClick(piece);
            }}
            className={`w-6 h-6 rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.6),inset_0_-2px_4px_rgba(0,0,0,0.4)] absolute transform -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer border-2 hover:scale-110 ${getPieceColorClass(piece.color)}`}
            style={{
               left: `calc(${col - 0.5} * (100% / 15))`,
               top: `calc(${row - 0.5} * (100% / 15))`
            }}
          >
             <div className="absolute inset-0.5 rounded-full border border-white/30"></div>
          </motion.div>
        );
      })}
    </div>
  );
}
