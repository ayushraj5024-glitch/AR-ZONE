import React, { useState } from "react";
import { Gamepad2, ChevronRight, PlayCircle, Star, Ban, Loader2 } from "lucide-react";
import { useMarketStatus } from "../hooks/useMarketStatus";

import imgLucky7 from '../assets/images/lucky7_cover_1780751828906.png';
import imgAviator from '../assets/images/aviator_cover_1780752208276.png';
import imgHeadTail from '../assets/images/head_tail_cover_1780751846165.png';
import imgTeenPatti from '../assets/images/teenpatti_cover_1780751859979.png';
import img32Cards from '../assets/images/cards32_cover_1780751902410.png';
import imgDragonTiger from '../assets/images/dragon_tiger_cover_1780751916527.png';
import imgBaccarat from '../assets/images/baccarat_cover_1780751932017.png';

interface Game {
  id: string;
  title: string;
  image: string;
  provider: string;
}

const games: Game[] = [
  {
    id: "lucky7",
    title: "Lucky 7A",
    provider: "Evolution",
    image: imgLucky7,
  },
  {
    id: "aviator",
    title: "Aviator",
    provider: "Spribe",
    image: imgAviator,
  },
  {
    id: "headandtail",
    title: "Head & Tail",
    provider: "Virtual",
    image: imgHeadTail,
  },
  {
    id: "teenpattit20",
    title: "TeenPatti T20",
    provider: "Ezugi",
    image: imgTeenPatti,
  },
  {
    id: "32cards",
    title: "32 Cards",
    provider: "Ezugi",
    image: img32Cards,
  },
  {
    id: "dragontiger",
    title: "Dragon Tiger Live",
    provider: "Evolution",
    image: imgDragonTiger,
  },
  {
    id: "baccarat",
    title: "Baccarat Squeeze",
    provider: "Evolution",
    image: imgBaccarat,
  },
];

export default function LiveCasino({
  onSelectGame,
}: {
  onSelectGame: (id: string, name: string) => void;
}) {
  const [hoveredGame, setHoveredGame] = useState<string | null>(null);
  const { status, loading } = useMarketStatus();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-125">
        <Loader2 className="w-8 h-8 animate-spin text-[#00ff88]" />
      </div>
    );
  }

  if (!status.liveCasino) {
    return (
      <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-6 font-sans pb-16">
        <div className="flex flex-col items-center justify-center p-12 bg-[#05100a] border border-red-500/20 rounded-2xl text-center space-y-4">
          <Ban className="w-16 h-16 text-red-500" />
          <h2 className="text-2xl font-bold text-white">Live Casino is Currently Suspended</h2>
          <p className="text-slate-400">This market has been blocked by the administrator. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 w-full max-w-400 mx-auto space-y-6 font-sans pb-16">
      {/* Header & Breadcrumbs */}
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-[#00ff88]" />
          Live Casino Games
        </h2>
        <div className="text-sm text-slate-400 mt-2 flex items-center space-x-2 font-medium">
          <span className="hover:text-slate-200 cursor-pointer transition-colors">
            Dashboard
          </span>
          <ChevronRight className="w-4 h-4 text-slate-400" />
          <span className="text-[#00ff88]">Live Casino</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {games.map((game) => (
          <div
            key={game.id}
            onMouseEnter={() => setHoveredGame(game.id)}
            onMouseLeave={() => setHoveredGame(null)}
            className="group relative bg-[#05100a] rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(0,255,136,0.05)] hover:shadow-[0_0_30px_rgba(0,255,136,0.15)] transition-all duration-300 border border-[#00ff88]/20 hover:border-[#00ff88] cursor-pointer animate-in fade-in"
            onClick={() => onSelectGame(game.id, game.title)}
          >
            {/* Image container with gradient overlay */}
            <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-900 border-b border-[#00ff88]/20">
              <img
                src={game.image}
                alt={game.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-100"
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#05100a] via-transparent to-transparent"></div>

              {/* Play button overlay */}
              <div
                className={`absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] transition-all duration-300 ${hoveredGame === game.id ? "opacity-100" : "opacity-0"}`}
              >
                <div className="bg-[#00ff88]/90 text-[#05100a] p-4 rounded-full shadow-[0_0_20px_rgba(0,255,136,0.5)] transform transition-transform duration-300 group-hover:scale-110">
                  <PlayCircle className="w-8 h-8" />
                </div>
              </div>

              {/* Provider Badge */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded border border-white/10 flex items-center gap-1.5 shadow-sm">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-white text-[10px] font-bold tracking-wider uppercase">
                  {game.provider}
                </span>
              </div>
            </div>

            {/* Content block */}
            <div className="p-4 bg-[#05100a]">
              <h3 className="text-lg font-bold text-white tracking-wide">
                {game.title}
              </h3>
              <p className="text-[#00ff88] text-xs font-bold uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                Play Now
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
