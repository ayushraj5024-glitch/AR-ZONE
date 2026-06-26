import React, { useState, useEffect } from 'react';
import { Bell, Palette, Settings2, Activity, Zap, Radio, Check, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { getFirestore, collection, onSnapshot, query, orderBy, limit, Timestamp, doc, setDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'alert' | 'system' | 'info' | 'success';
  timestamp: any;
  read: boolean;
}

export default function ThemeAndNotifications() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const colors = [
    { name: 'Neon Green', hex: '#00ff88', glow: 'rgba(0, 255, 136, 0.4)' },
    { name: 'Azure Core', hex: '#00aaff', glow: 'rgba(0, 170, 255, 0.4)' },
    { name: 'Crimson Pulse', hex: '#ff3355', glow: 'rgba(255, 51, 85, 0.4)' },
    { name: 'Solar Flare', hex: '#f0b429', glow: 'rgba(240, 180, 41, 0.4)' },
    { name: 'Amethyst', hex: '#b966fe', glow: 'rgba(185, 102, 254, 0.4)' }
  ];

  const currentTheme = localStorage.getItem('arzone_theme') || '#00ff88';

  const [bgType, setBgType] = useState<string>(() => {
    return localStorage.getItem('arzone_bg_type') || 'particles';
  });

  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onSnapshot(doc(db, 'settings', 'background'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.bgType) {
          setBgType(data.bgType);
        }
      }
    }, (error) => {
      console.warn("Error listening to global background settings in theme picker:", error);
    });
    return () => unsubscribe();
  }, []);

  const changeBgType = async (type: string) => {
    setBgType(type);
    localStorage.setItem('arzone_bg_type', type);
    window.dispatchEvent(new CustomEvent('bgTypeChanged', { detail: type }));
    try {
      const db = getFirestore();
      await setDoc(doc(db, 'settings', 'background'), { bgType: type }, { merge: true });
    } catch (err) {
      console.error("Failed to update global background in Firestore:", err);
    }
  };

  useEffect(() => {
    const db = getFirestore();
    const auth = getAuth();
    
    // Create query to get real notifications
    // Using a global notifications collection for demo, ordering by timestamp
    const q = query(
      collection(db, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notification[] = [];
      snapshot.forEach((doc) => {
        notifs.push({ id: doc.id, ...doc.data() } as Notification);
      });
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    }, (error) => {
      console.error("Error fetching real notifications:", error);
    });

    return () => unsubscribe();
  }, []);

  const changeTheme = (color: string) => {
    document.documentElement.style.setProperty('--primary', color);
    localStorage.setItem('arzone_theme', color);
    setThemeOpen(false);
  };

  const formatTime = (ts: any) => {
    if (!ts) return '';
    const date = ts instanceof Timestamp ? ts.toDate() : new Date(ts);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000); // in minutes
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    const hours = Math.floor(diff / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'alert': return 'text-purple-400 bg-purple-400/10 border-purple-400/30';
      case 'system': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'success': return 'text-(--primary) bg-(--primary)/10 border-(--primary)/30';
      default: return 'text-amber-400 bg-amber-400/10 border-amber-400/30';
    }
  };

  const getTypeIconColor = (type: string) => {
    switch(type) {
      case 'alert': return 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]';
      case 'system': return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]';
      case 'success': return 'bg-(--primary) shadow-[0_0_8px_var(--primary)]';
      default: return 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]';
    }
  };

  return (
    <div className="flex items-center gap-2 md:gap-4 mr-2 md:mr-6">
      {/* Theme Picker */}
      <div className="relative">
        <button 
          onClick={() => { setThemeOpen(!themeOpen); setNotificationsOpen(false); }}
          className={`relative p-2.5 rounded-xl transition-all duration-300 border backdrop-blur-md flex items-center justify-center
            ${themeOpen 
              ? 'bg-(--primary)/10 text-(--primary) border-(--primary)/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' 
              : 'bg-black/20 text-slate-400 border-white/5 hover:text-(--primary) hover:bg-(--primary)/5 hover:border-(--primary)/20'
            }`}
        >
          <Settings2 size={18} className={themeOpen ? "animate-spin-slow" : ""} />
        </button>
        <AnimatePresence>
          {themeOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-14 sm:mt-2 w-[calc(100vw-16px)] sm:w-80 bg-[#020503]/95 backdrop-blur-xl border border-(--primary)/30 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
            >
              {/* Futuristic corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-(--primary)/50 rounded-tl-xl pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-(--primary)/50 rounded-tr-xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-(--primary)/50 rounded-bl-xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-(--primary)/50 rounded-br-xl pointer-events-none"></div>
              
              <div className="bg-linear-to-r from-(--primary)/20 via-(--primary)/5 to-transparent px-5 py-4 border-b border-(--primary)/20 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 blur-sm mix-blend-screen pointer-events-none">
                  {/* Hexagon pattern representation */}
                  <div className="w-24 h-24 border border-white rounded-full bg-repeating-linear-gradient"></div>
                </div>
                <div className="relative flex items-center gap-2 text-(--primary)">
                  <Palette size={16} />
                  <span className="text-xs font-orbitron font-bold tracking-widest uppercase text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Visual Calibration</span>
                </div>
                <div className="relative text-[10px] text-slate-400 font-exo mt-1 uppercase tracking-widest flex items-center gap-2">
                  <span>System Appearance</span>
                  <div className="h-px bg-(--primary)/50 grow"></div>
                </div>
              </div>
              <div className="p-4 grid grid-cols-1 gap-2.5 bg-[#05100a]/50">
                {colors.map(c => {
                  const isActive = currentTheme === c.hex;
                  return (
                    <button 
                      key={c.hex}
                      onClick={() => changeTheme(c.hex)}
                      className={`relative flex items-center justify-between p-3 border transition-all duration-300 group overflow-hidden pl-4
                        ${isActive 
                          ? 'bg-[#0a1a12] border-(--primary)/50 shadow-[inset_4px_0_0_var(--primary),0_0_15px_rgba(var(--primary-rgb),0.1)] text-white' 
                          : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5 text-slate-400'
                        }`}
                      style={{ borderRadius: '0.5rem', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)' }}
                    >
                      {isActive && (
                        <div className="absolute top-0 right-0 w-16 h-full bg-linear-to-l from-(--primary)/10 to-transparent pointer-events-none"></div>
                      )}
                      <div className="flex items-center gap-3">
                        <div 
                          className={`w-6 h-6 rounded-sm border transition-all group-hover:scale-110 flex items-center justify-center shadow-lg ${isActive ? 'rotate-45' : ''}`}
                          style={{ backgroundColor: isActive ? 'transparent' : c.hex, borderColor: c.hex, boxShadow: isActive ? `0 0 15px ${c.glow}` : 'none' }}
                        >
                          {isActive && <div className="w-3 h-3 bg-(--primary) shadow-[0_0_8px_var(--primary)]" style={{ backgroundColor: c.hex }} />}
                        </div>
                        <span className={`text-[11px] font-exo font-bold tracking-widest uppercase ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-white transition-colors'}`}>{c.name}</span>
                      </div>
                      {isActive ? (
                        <div className="flex items-center gap-2 text-(--primary)">
                          <span className="text-[9px] font-orbitron tracking-widest uppercase opacity-70">Active</span>
                          <Activity size={14} className="animate-pulse" />
                        </div>
                      ) : (
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-slate-400"></div>
                      )}
                    </button>

                  );
                })}
              </div>
              
              {/* Background Effects Section */}
              <div className="bg-linear-to-r from-(--primary)/20 via-(--primary)/5 to-transparent px-5 py-3 border-t border-b border-(--primary)/20 relative overflow-hidden">
                <div className="relative text-[10px] text-slate-400 font-exo uppercase tracking-widest flex items-center gap-2">
                  <span>Background Effects</span>
                  <div className="h-px bg-(--primary)/50 grow"></div>
                </div>
              </div>
              <div className="p-4 grid grid-cols-2 gap-2 bg-[#05100a]/30">
                {[
                  { id: 'particles', name: 'Particles', icon: '⭐' },
                  { id: 'matrix', name: 'Matrix', icon: '📟' },
                  { id: 'cybergrid', name: 'Cyber Grid', icon: '🌐' },
                  { id: 'hyperdrive', name: 'Hyperdrive', icon: '🚀' },
                  { id: 'nebula', name: 'Nebula', icon: '🌌' },
                  { id: 'none', name: 'Off', icon: '❌' }
                ].map(b => {
                  const isActive = bgType === b.id;
                  return (
                    <button
                      key={b.id}
                      onClick={() => changeBgType(b.id)}
                      className={`relative flex items-center gap-2 p-2.5 border transition-all duration-300 group overflow-hidden
                        ${isActive 
                          ? 'bg-[#0a1a12] border-(--primary)/50 shadow-[0_0_10px_rgba(var(--primary-rgb),0.1)] text-white' 
                          : 'bg-black/40 border-white/5 hover:border-white/20 hover:bg-white/5 text-slate-400 hover:text-white'
                        }`}
                      style={{ borderRadius: '0.375rem', clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%)' }}
                    >
                      <span className="text-sm shrink-0">{b.icon}</span>
                      <span className="text-[10px] font-exo font-bold tracking-wider uppercase truncate">{b.name}</span>
                      {isActive && (
                        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-(--primary) shadow-[0_0_6px_var(--primary)]"></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Notifications */}
      <div className="relative">
        <button 
          onClick={() => { setNotificationsOpen(!notificationsOpen); setThemeOpen(false); }}
          className={`relative p-2.5 rounded-xl transition-all duration-300 border backdrop-blur-md flex items-center justify-center
            ${notificationsOpen 
              ? 'bg-(--primary)/10 text-(--primary) border-(--primary)/40 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' 
              : 'bg-black/20 text-slate-400 border-white/5 hover:text-(--primary) hover:bg-(--primary)/5 hover:border-(--primary)/20'
            }`}
        >
          <Bell size={18} className={unreadCount > 0 ? "animate-wiggle" : ""} />
          {unreadCount > 0 && (
            <>
              <span className="absolute top-0 right-0 w-3 h-3 bg-rose-500 rounded-full animate-ping opacity-75"></span>
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-[#05100a] rounded-full"></span>
            </>
          )}
        </button>
        
        <AnimatePresence>
          {notificationsOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed sm:absolute right-2 sm:right-0 top-16 sm:top-14 sm:mt-2 w-[calc(100vw-16px)] sm:w-[320px] md:w-95 bg-[#020503]/95 backdrop-blur-xl border border-(--primary)/30 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
            >
              {/* Futuristic corners */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-(--primary)/50 rounded-tl-xl pointer-events-none"></div>
              <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-(--primary)/50 rounded-tr-xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-(--primary)/50 rounded-bl-xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-(--primary)/50 rounded-br-xl pointer-events-none"></div>

              <div className="bg-linear-to-r from-(--primary)/20 via-(--primary)/5 to-transparent px-5 py-4 border-b border-(--primary)/20 relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 blur-sm mix-blend-screen pointer-events-none">
                  <div className="w-24 h-24 border border-white rounded-full bg-repeating-radial-gradient" style={{ backgroundImage: 'repeating-radial-gradient(circle, transparent, transparent 4px, white 4px, white 5px)' }}></div>
                </div>
                <div className="relative flex justify-between items-center z-10">
                  <div className="flex items-center gap-2">
                    <Radio size={16} className="text-(--primary) animate-pulse" />
                    <span className="text-sm font-orbitron font-bold tracking-widest uppercase text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">Live Comm Feed</span>
                  </div>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-red-500/10 text-red-400 font-exo font-bold px-2 py-1 rounded border border-red-500/30 uppercase tracking-widest shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>
                <div className="relative text-[10px] text-slate-400 font-exo mt-1 uppercase tracking-widest flex items-center gap-2">
                  <span>Network Status</span>
                  <div className="h-px bg-(--primary)/50 grow"></div>
                </div>
              </div>
              <div className="max-h-95 overflow-y-auto scrollbar-thin scrollbar-thumb-(--primary)/20 scrollbar-track-transparent bg-[#05100a]/50">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center h-48 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.05)_0%,transparent_70%)] pointer-events-none"></div>
                    <div className="w-12 h-12 rounded-full border border-(--primary)/30 flex items-center justify-center mb-3 bg-(--primary)/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]">
                      <Check size={20} className="text-(--primary)/70" />
                    </div>
                    <div className="text-sm font-orbitron text-(--primary) font-bold tracking-wider uppercase drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.3)]">System is Optimal</div>
                    <div className="text-xs text-slate-500 mt-1 font-exo tracking-wide">No active alerts on the network.</div>
                  </div>
                ) : (
                  <div className="p-2 space-y-1.5">
                    {notifications.map((notif) => (
                      <div 
                        key={notif.id}
                        className="relative p-3 rounded-lg border border-white/5 hover:border-(--primary)/30 bg-black/40 hover:bg-[#0a1a12] cursor-pointer transition-all duration-300 group overflow-hidden"
                      >
                        {/* Hover scanline effect */}
                        <div className="absolute top-0 right-0 w-16 h-full bg-linear-to-l from-(--primary)/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        
                        {!notif.read && (
                          <div className="absolute left-0 top-0 h-full w-0.5 bg-(--primary) shadow-[0_0_8px_var(--primary)]" />
                        )}
                        <div className="flex items-start gap-3 pl-2 relative z-10">
                          <div className={`mt-1 flex items-center justify-center w-5 h-5 rounded-sm border border-white/10 ${notif.read ? 'opacity-60' : ''}`} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                            <div className={`w-2 h-2 rounded-full ${getTypeIconColor(notif.type)}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-2 mb-1">
                              <div className={`text-sm font-exo font-bold truncate group-hover:text-white transition-colors ${notif.read ? 'text-slate-400' : 'text-slate-200'}`}>
                                {notif.title}
                              </div>
                              <span className="text-[9px] text-(--primary)/70 font-orbitron font-medium whitespace-nowrap bg-(--primary)/5 border border-(--primary)/10 px-1.5 py-0.5 rounded">
                                {formatTime(notif.timestamp)}
                              </span>
                            </div>
                            <div className={`text-xs font-exo leading-relaxed line-clamp-2 pr-2 ${notif.read ? 'text-slate-500' : 'text-slate-300 group-hover:text-slate-200'}`}>
                              {notif.message}
                            </div>
                            <div className="mt-2 flex items-center">
                              <span className={`inline-flex px-1.5 py-0.5 rounded-sm text-[9px] font-orbitron font-bold uppercase tracking-widest border ${getTypeColor(notif.type)}`}>
                                {notif.type}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {notifications.length > 0 && (
                <div className="p-3 border-t border-(--primary)/20 bg-linear-to-b from-transparent to-black/80 text-center">
                  <button className="text-[10px] font-orbitron text-(--primary)/70 font-bold tracking-widest uppercase hover:text-(--primary) hover:drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.5)] transition-all">
                    Acknowledge All
                  </button>
                </div>
              )}

            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

