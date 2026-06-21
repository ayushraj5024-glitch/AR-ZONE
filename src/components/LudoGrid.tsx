import React from 'react';

export default function LudoGrid({ onWin }: { onWin: () => void }) {
  return (
    <div 
      className="w-full aspect-square bg-[#ececec] rounded-xl border-8 border-[#0c1f36] p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden cursor-pointer" 
      onClick={onWin}
      title="Click board to simulate win"
      style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gridTemplateRows: 'repeat(15, 1fr)', gap: '0px' }}
    >
      
      {/* Background for Paths (White) */}
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
         {/* Simple Crown Icon */}
         <div className="absolute opacity-20 w-[60%] h-[60%] pointer-events-none text-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"></path></svg>
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
         <div className="absolute opacity-20 w-[60%] h-[60%] pointer-events-none text-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"></path></svg>
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
         <div className="absolute opacity-20 w-[60%] h-[60%] pointer-events-none text-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"></path></svg>
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
         <div className="absolute opacity-20 w-[60%] h-[60%] pointer-events-none text-white flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5m14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z"></path></svg>
         </div>
      </div>

      {/* Safe Zones / Path Coloring */}
      {/* Red Run */}
      <div className="bg-[#cc2b2b] border border-black/20" style={{ gridArea: '8 / 2 / 9 / 7' }}></div>
      <div className="bg-[#cc2b2b] border border-black/20 flex items-center justify-center text-white" style={{ gridArea: '7 / 2 / 8 / 3' }}>★</div>
      
      {/* Green Run */}
      <div className="bg-[#2d9e47] border border-black/20" style={{ gridArea: '2 / 8 / 7 / 9' }}></div>
      <div className="bg-[#2d9e47] border border-black/20 flex items-center justify-center text-white" style={{ gridArea: '2 / 13 / 3 / 14' }}>★</div>
      
      {/* Blue Run */}
      <div className="bg-[#2267c7] border border-black/20" style={{ gridArea: '10 / 8 / 15 / 9' }}></div>
      <div className="bg-[#2267c7] border border-black/20 flex items-center justify-center text-white" style={{ gridArea: '14 / 3 / 15 / 4' }}>★</div>
      
      {/* Yellow Run */}
      <div className="bg-[#e2a818] border border-black/20" style={{ gridArea: '8 / 10 / 9 / 15' }}></div>
      <div className="bg-[#e2a818] border border-black/20 flex items-center justify-center text-white" style={{ gridArea: '9 / 14 / 10 / 15' }}>★</div>

      {/* Safe spots */}
      <div className="border border-black/20 text-[#2d9e47] font-bold text-xl flex items-center justify-center" style={{ gridArea: '3 / 9 / 4 / 10' }}>★</div>
      <div className="border border-black/20 text-[#cc2b2b] font-bold text-xl flex items-center justify-center" style={{ gridArea: '9 / 3 / 10 / 4' }}>★</div>
      <div className="border border-black/20 text-[#e2a818] font-bold text-xl flex items-center justify-center" style={{ gridArea: '7 / 13 / 8 / 14' }}>★</div>
      <div className="border border-black/20 text-[#2267c7] font-bold text-xl flex items-center justify-center" style={{ gridArea: '13 / 7 / 14 / 8' }}>★</div>


      {/* Grid Lines Overlay - to draw all the 1x1 boxes */}
      {/* Middle horizontal left */}
      <div className="grid grid-cols-6 grid-rows-3 gap-0 pointer-events-none" style={{ gridArea: '7 / 1 / 10 / 7' }}>
         {[...Array(18)].map((_, i) => <div key={`hl-${i}`} className="border-[0.5px] border-slate-400/50"></div>)}
      </div>
      {/* Middle horizontal right */}
      <div className="grid grid-cols-6 grid-rows-3 gap-0 pointer-events-none" style={{ gridArea: '7 / 10 / 10 / 16' }}>
         {[...Array(18)].map((_, i) => <div key={`hr-${i}`} className="border-[0.5px] border-slate-400/50"></div>)}
      </div>
      {/* Middle vertical top */}
      <div className="grid grid-cols-3 grid-rows-6 gap-0 pointer-events-none" style={{ gridArea: '1 / 7 / 7 / 10' }}>
         {[...Array(18)].map((_, i) => <div key={`vt-${i}`} className="border-[0.5px] border-slate-400/50"></div>)}
      </div>
      {/* Middle vertical bottom */}
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

    </div>
  );
}
