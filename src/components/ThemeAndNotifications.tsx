import React, { useState } from 'react';
import { Bell, Palette } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export default function ThemeAndNotifications() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const colors = ['#00ff88', '#00aaff', '#ff00aa', '#ffaa00', '#aa00ff'];

  const changeTheme = (color: string) => {
    document.documentElement.style.setProperty('--primary', color);
    localStorage.setItem('arzone_theme', color);
    setThemeOpen(false);
  };

  return (
    <div className="flex items-center gap-3 md:gap-5 mr-3 md:mr-6">
      {/* Theme Picker */}
      <div className="relative">
        <button 
          onClick={() => { setThemeOpen(!themeOpen); setNotificationsOpen(false); }}
          className="relative p-2 text-slate-300 hover:text-\(--primary\) transition-colors rounded-full hover:bg-\(--primary\)/10"
        >
          <Palette size={20} />
        </button>
        <AnimatePresence>
          {themeOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-12 mt-2 w-48 bg-[#05100a] border border-\(--primary\)/30 rounded-lg shadow-xl z-50 p-3"
            >
              <div className="text-xs font-bold text-slate-400 mb-3 tracking-widest uppercase">Select Theme</div>
              <div className="flex gap-2 flex-wrap">
                {colors.map(c => (
                  <button 
                    key={c}
                    onClick={() => changeTheme(c)}
                    className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition-transform"
                    style={{ backgroundColor: c, borderColor: localStorage.getItem('arzone_theme') === c ? '#fff' : 'transparent' }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button 
          onClick={() => { setNotificationsOpen(!notificationsOpen); setThemeOpen(false); }}
          className="relative p-2 text-slate-300 hover:text-\(--primary\) transition-colors rounded-full hover:bg-\(--primary\)/10"
        >
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
        </button>
        
        <AnimatePresence>
          {notificationsOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
              className="absolute right-0 top-12 mt-2 w-72 md:w-80 bg-[#05100a] border border-\(--primary\)/30 rounded-lg shadow-xl z-50 overflow-hidden"
            >
              <div className="bg-\(--primary\)/10 px-4 py-3 border-b border-\(--primary\)/20 flex justify-between items-center">
                <span className="text-sm font-bold text-\(--primary\)">Notifications</span>
                <span className="text-xs text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded font-bold border border-rose-500/20">2 New</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <div className="px-4 py-3 border-b border-\(--primary\)/10 hover:bg-[#020503] cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                    <div>
                      <div className="text-sm font-bold text-slate-200">High Value Bet Alert</div>
                      <div className="text-xs text-slate-400 mt-1">User ****42 placed a bet of ₹10,000 on TeenPatti.</div>
                      <div className="text-[10px] text-slate-500 mt-2 tracking-wider">Just now</div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 hover:bg-[#020503] cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#f0b429] mt-1.5 shadow-[0_0_8px_rgba(240,180,41,0.8)]" />
                    <div>
                      <div className="text-sm font-bold text-slate-200">Market Suspended</div>
                      <div className="text-xs text-slate-400 mt-1">AUS vs ENG match betting has been temporarily suspended.</div>
                      <div className="text-[10px] text-slate-500 mt-2 tracking-wider">5 mins ago</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
