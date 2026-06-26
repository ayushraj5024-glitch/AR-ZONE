import React, { useEffect, useRef, useState } from 'react';
import { Shield, LogOut, AlertTriangle, ChevronRight, Activity, Download, Bell, Plus, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, collection, getDocs, query, orderBy, limit, setDoc } from 'firebase/firestore';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import ThemeAndNotifications from './ThemeAndNotifications';
import Background from './Background';

// Custom CSS added locally within component for specific complex effects
const FlashingValue = ({ value, displayValue, className }: { value: string | number, displayValue?: string | number, className?: string }) => {
  const [flashColor, setFlashColor] = useState<'green' | 'red' | null>(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (prevValue.current !== value) {
      // Simulate real-time up/down
      const isUp = Number(value) >= Number(prevValue.current);
      setFlashColor(isUp ? 'green' : 'red');
      prevValue.current = value;
      const timer = setTimeout(() => setFlashColor(null), 1000);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <motion.div
      initial={false}
      animate={
        flashColor === 'green' ? { color: '#00ff88', textShadow: '0 0 10px #00ff88' } :
        flashColor === 'red' ? { color: '#ff3355', textShadow: '0 0 10px #ff3355' } :
        { color: 'inherit', textShadow: 'none' }
      }
      transition={{ duration: 0.5 }}
      className={className}
    >
      {displayValue !== undefined ? displayValue : value}
    </motion.div>
  );
};

const DashboardStyles = `
  .font-orbitron { font-family: 'Orbitron', sans-serif; }
  .font-exo { font-family: 'Exo 2', sans-serif; }
  
  .crt-scanlines {
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
    background-size: 100% 2px, 3px 100%;
    pointer-events: none;
  }
  
  .corner-brackets::before, .corner-brackets::after {
    content: ''; position: absolute; pointer-events: none;
  }
  .bracket-tl { top: 0; left: 0; border-top: 2px solid var(--gold); border-left: 2px solid var(--gold); width: 20px; height: 20px; }
  .bracket-tr { top: 0; right: 0; border-top: 2px solid var(--gold); border-right: 2px solid var(--gold); width: 20px; height: 20px; }
  .bracket-bl { bottom: 0; left: 0; border-bottom: 2px solid var(--gold); border-left: 2px solid var(--gold); width: 20px; height: 20px; }
  .bracket-br { bottom: 0; right: 0; border-bottom: 2px solid var(--gold); border-right: 2px solid var(--gold); width: 20px; height: 20px; }

  @keyframes fadeUp {
    0% { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeUp {
    animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    opacity: 0;
  }
  
  .live-stat-card {
    border-bottom: 2px solid rgba(0, 255, 136, 0.5);
    box-shadow: 0 4px 15px rgba(0, 255, 136, 0.05);
  }

  @keyframes marquee {
    0% { transform: translateX(100vw); }
    100% { transform: translateX(-100%); }
  }
`;

export default function Dashboard({ onMenuClick, onLogout, onNavigate, userRole = 'client' }: { onMenuClick?: () => void, onLogout?: () => void, onNavigate?: (view: any) => void, userRole?: 'admin' | 'client' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State variables for dynamic values
  const [sessionTime, setSessionTime] = useState(14 * 60 + 32); // 14:32 in seconds
  const [bgType, setBgType] = useState<string>(() => {
    return localStorage.getItem('arzone_bg_type') || 'particles';
  });

  // Sync background selection from Firestore so local dropdown state stays perfectly updated
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
      console.warn("Error listening to global background settings:", error);
    });
    return () => unsubscribe();
  }, []);

  const handleBgChange = async (type: string) => {
    setBgType(type);
    localStorage.setItem('arzone_bg_type', type);
    window.dispatchEvent(new CustomEvent('bgTypeChanged', { detail: type }));
    
    // Save to Firestore globally so all clients and screens update in real-time
    try {
      const db = getFirestore();
      await setDoc(doc(db, 'settings', 'background'), { bgType: type }, { merge: true });
    } catch (err) {
      console.error("Failed to update global background in Firestore:", err);
    }
  };

  // Parse time
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const [adminData, setAdminData] = useState<any>({ balance: 1000, mComm: '3', sComm: '3', share: '50.0%' });
  const [realStats, setRealStats] = useState({ totalUsers: 247, activeUsers: 247, suspended: 16, transactions: 1859 });
  const [companyContact, setCompanyContact] = useState("SC211607");
  const [marqueeMatches, setMarqueeMatches] = useState<any[]>([]);
  const [marqueeApiError, setMarqueeApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLiveScores = async () => {
      try {
        const res = await fetch('/api/live-matches');
        const data = await res.json();
        
        if (data.success === false) {
           setMarqueeApiError(data.error || "Failed to load live matches.");
           // Fallback to static if needed, but we keep the current marqueeMatches
        } else if (data.matches && data.matches.length > 0) {
           const active = data.matches.filter((m: any) => m.t1s || m.t2s || m.ms === 'live');
           setMarqueeMatches(active.length > 0 ? active.slice(0, 5) : data.matches.slice(0, 5));
           setMarqueeApiError(null);
        }
      } catch (e) {}
    };
    fetchLiveScores();
    // Do not poll aggressively because we have free API limits
    const interval = setInterval(fetchLiveScores, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let unsub: any = null;
    const fetchData = async () => {
      try {
        const auth = getAuth();
        if (!auth.currentUser) return;
        
        const db = getFirestore();
        
        // Listen to admin data
        unsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), (docSn) => {
          if (docSn.exists()) {
            setAdminData((prev: any) => ({...prev, ...docSn.data()}));
            setCompanyContact(docSn.id.substring(0, 8).toUpperCase());
          } else {
             if (auth.currentUser?.email === 'ayushraj5024@gmail.com') {
               setAdminData((prev: any) => ({...prev, role: 'admin'}));
               setCompanyContact('AYUSH502');
             }
          }
        });

        // Get users stats
        const usersSnap = await getDocs(collection(db, 'users'));
        let active = 0;
        let susp = 0;
        let tx = 0;
        
        for (const u of usersSnap.docs) {
          const data = u.data();
          if (data.status === 'active') active++;
          if (data.status === 'suspended') susp++;
          
          // Count statements as transactions
          try {
            const stmts = await getDocs(collection(db, `users/${u.id}/statements`));
            tx += stmts.size;
          } catch(e) {}
          try {
             const bets = await getDocs(collection(db, `users/${u.id}/bets`));
             tx += bets.size;
          } catch(e) {}
        }
        
        setRealStats({ totalUsers: usersSnap.size, activeUsers: active, suspended: susp, transactions: tx });
        
      } catch(e) {
        console.error("Dashboard fetch error", e);
      }
    };
    fetchData();
    return () => { if (unsub) unsub(); }
  }, []);

  useEffect(() => {
    // Session timer
    const timerInterval = setInterval(() => {
      setSessionTime(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, []);

  // Listen for bgType changes from other sources
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'arzone_bg_type') {
        setBgType(e.newValue || 'particles');
      }
    };
    
    const handleLocalChange = (e: any) => {
      setBgType(e.detail || 'particles');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bgTypeChanged', handleLocalChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bgTypeChanged', handleLocalChange);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-screen text-slate-200 font-exo relative overflow-y-auto overflow-x-hidden custom-scrollbar" style={{ '--gold': '#f0b429', '--gold2': '#ffda6a', '--green': 'var(--primary)', '--green2': '#00cc6a', '--blue': '#00aaff', '--red': '#ff3355' } as React.CSSProperties}>
      <style>{DashboardStyles}</style>

      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Corner brackets */}
        <div className="fixed inset-4 z-10 pointer-events-none">
           <div className="absolute bracket-tl"></div>
           <div className="absolute bracket-tr"></div>
           <div className="absolute bracket-bl"></div>
           <div className="absolute bracket-br"></div>
        </div>
      </div>

      <div className="relative z-20 flex flex-col min-h-full">
        {/* Navbar */}
        <nav className="sticky top-0 z-30 px-6 py-3 border-b border-[#00ff88]/30 bg-[#05100a]/90 backdrop-blur-[20px] flex items-center justify-between shadow-[0_4px_30px_rgba(0,255,136,0.1)]">
           <div className="flex items-center gap-4">
             <button onClick={onMenuClick} className="md:hidden text-[#00ff88] hover:text-white transition-colors">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
             </button>
             <span className="ar-zone-logo text-3xl pb-1 tracking-normal">AR ZONE</span>
           </div>

           <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00ff88]/40 bg-[#00ff88]/5 text-[#00ff88] text-sm font-bold shadow-[0_0_15px_rgba(0,255,136,0.15)]">
             <Shield size={16} />
             <span>HIGH SECURITY</span>
           </div>

           <div className="flex items-center gap-3 sm:gap-6">
             <div className="hidden lg:flex items-center gap-2 text-slate-300 text-sm font-medium">
               <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_rgba(0,255,136,1)]"></span>
               SYSTEM ONLINE
             </div>
             {userRole === 'admin' && (
               <div className="flex items-center gap-1.5 text-xs font-bold border border-[#f0b429]/40 bg-[#05100a] hover:border-[#f0b429] px-2 py-1.5 rounded relative transition-colors shadow-[0_0_10px_rgba(240,180,41,0.05)] cursor-pointer">
                 <span className="text-[#f0b429] hidden xs:inline tracking-wider font-orbitron uppercase text-[10px]">BG:</span>
                 <select 
                   value={bgType} 
                   onChange={(e) => handleBgChange(e.target.value)}
                   className="bg-transparent text-[#f0b429] outline-none cursor-pointer font-bold font-orbitron text-xs pr-1"
                   title="Change Background Style Globally"
                 >
                   <option value="particles" className="bg-[#05100a] text-slate-200">⭐ Particles</option>
                   <option value="matrix" className="bg-[#05100a] text-[#00ff88]">📟 Matrix</option>
                   <option value="cybergrid" className="bg-[#05100a] text-[#00aaff]">🌐 Cyber Grid 3D</option>
                   <option value="hyperdrive" className="bg-[#05100a] text-[#ffda6a]">🚀 Hyperdrive</option>
                   <option value="nebula" className="bg-[#05100a] text-rose-400">🌌 Nebula Storm</option>
                   <option value="none" className="bg-[#05100a] text-slate-400">❌ Off</option>
                 </select>
               </div>
             )}
             <ThemeAndNotifications />
             <button onClick={onLogout} className="group flex items-center gap-2 px-4 py-2 rounded border border-slate-700 hover:border-[#ff3355] text-white hover:text-[#ff3355] font-exo font-semibold text-sm transition-all shadow-sm">
               <span className="hidden sm:inline">SIGN OUT</span>
               <LogOut size={16} className="group-hover:text-[#ff3355] transition-colors" />
             </button>
           </div>
        </nav>

        {/* Alert Marquee */}
        <div className="bg-[#00ff88]/5 border-b border-[#00ff88]/20 overflow-hidden flex items-center relative h-10 shadow-[inset_0_0_20px_rgba(0,255,136,0.02)] sm:hidden md:flex">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-[#05100a] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-[#05100a] to-transparent z-10 pointer-events-none"></div>
          
          <div className="whitespace-nowrap text-[#00ff88] text-sm font-exo flex items-center gap-8 pl-4" style={{ animation: 'marquee 25s linear infinite' }}>
             <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,1)] animate-pulse"></span>
             {marqueeApiError && (
               <>
                 <span className="text-rose-400 font-bold">⚠️ API Limit Reached (Free Tier)</span>
                 <span className="text-[#00ff88]/50 font-bold">•</span>
               </>
             )}
             {marqueeMatches.length > 0 ? marqueeMatches.map((m: any, idx: number) => (
               <React.Fragment key={m.id || idx}>
                 <span>
                    {m.matchType === 'football' ? '⚽' : '🏏'} <span className="font-bold text-white">{m.t1 || 'Team 1'}</span> <span className="text-[#f0b429]">{m.t1s || ''}</span> vs <span className="font-bold text-white">{m.t2 || 'Team 2'}</span> <span className="text-[#f0b429]">{m.t2s || ''}</span>
                 </span>
                 <span className="text-[#00ff88]/50 font-bold">•</span>
               </React.Fragment>
             )) : (
               <>
                 <span>🏏 <span className="font-bold text-white">Fetching Live...</span></span>
                 <span className="text-[#00ff88]/50 font-bold">•</span>
               </>
             )}
             <span className="w-20 inline-block"></span>
          </div>

          <div className="absolute right-4 flex items-center gap-3 z-20">
            <button onClick={() => onNavigate?.('live_matches')} className="text-xs font-bold text-[#00ff88] border border-[#00ff88]/50 bg-[#05100a] px-3 py-1 rounded hover:bg-[#00ff88]/20 transition-colors whitespace-nowrap">
              LIVE VIEW
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-6 md:p-8 lg:p-10 max-w-7xl mx-auto w-full">
           
           {/* Header */}
           <div className="mb-8 animate-fadeUp" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-4 mb-1">
                <h1 className="ar-zone-logo text-4xl md:text-5xl pb-1">Home</h1>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-[#00ff88]/50 bg-[#00ff88]/10 ml-2">
                   <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_rgba(0,255,136,1)]"></span>
                   <span className="text-xs font-orbitron text-[#00ff88] font-bold tracking-wider">LIVE</span>
                </div>
              </div>
              <div className="text-slate-400 font-exo text-sm tracking-[0.2em] uppercase font-semibold">
                 {adminData.role === 'admin' ? 'Admin Dashboard' : 'Client Dashboard'} <span className="mx-2 text-slate-600">·</span> {adminData.role === 'admin' ? 'System Control Panel' : 'User Control Panel'}
              </div>
           </div>

           {/* Security Status Bar */}
           <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(0,255,136,0.1)] rounded-xl p-4 mb-8 flex flex-wrap max-md:flex-col items-center justify-between gap-4 backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.2s' }}>
             <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
               <div className="flex items-center gap-2 text-[#00ff88] font-orbitron font-bold text-sm mr-4 tracking-wider">
                  ⬡ SECURITY
               </div>
               
               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></span>
                  <span className="text-slate-300 text-xs font-exo uppercase tracking-wider">SSL <span className="text-[#00ff88]">Encrypted</span></span>
               </div>
               <div className="hidden sm:block w-px h-4 bg-slate-700/50"></div>

               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></span>
                  <span className="text-slate-300 text-xs font-exo uppercase tracking-wider">2FA <span className="text-[#00ff88]">Active</span></span>
               </div>
               <div className="hidden sm:block w-px h-4 bg-slate-700/50"></div>

               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></span>
                  <span className="text-slate-300 text-xs font-exo uppercase tracking-wider">Firewall <span className="text-[#00ff88]">ON</span></span>
               </div>
               <div className="hidden sm:block w-px h-4 bg-slate-700/50"></div>

               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f0b429]"></span>
                  <span className="text-slate-300 text-xs font-exo uppercase tracking-wider">Rate <span className="text-[#f0b429]">Limited</span></span>
               </div>
               <div className="hidden sm:block w-px h-4 bg-slate-700/50"></div>

               <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]"></span>
                  <span className="text-slate-300 text-xs font-exo uppercase tracking-wider">Session <span className="text-[#00ff88]">Secure</span></span>
               </div>
             </div>

             <div className="text-slate-400 font-exo text-sm font-semibold tracking-wider ml-auto">
                Session: <span className="text-[#f0b429] font-orbitron text-base">{formatTime(sessionTime)}</span>
             </div>
           </div>

           {/* Info Cards Grid */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              
              {/* Row 1 */}
              <div className={`bg-(--card-bg) border rounded-[14px] p-6 hover:-translate-y-0.75 transition-all backdrop-blur-md animate-fadeUp ${adminData.role === 'admin' ? 'border-(--gold) hover:shadow-[0_0_20px_rgba(240,180,41,0.15)] hover:border-[#f0b429]/40' : 'border-[#00ff88] hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40'}`} style={{ animationDelay: '0.3s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">My Username</h3>
                 <div className={`font-orbitron text-3xl font-bold tracking-wider mb-2 ${adminData.role === 'admin' ? 'text-(--gold)' : 'text-[#00ff88]'}`}>
                    {adminData.name ? adminData.name.toUpperCase() : (adminData.role?.toUpperCase() || 'CLIENT')}
                 </div>
                 <div className="text-slate-300 text-sm font-exo mb-3">{adminData.role === 'admin' ? 'System Level Access' : 'Client Access'}</div>
                 <div className={`inline-block px-2.5 py-1 rounded border text-xs font-bold font-exo tracking-widest ${adminData.role === 'admin' ? 'border-(--gold)/40 bg-(--gold)/10 text-(--gold)' : 'border-[#00ff88]/40 bg-[#00ff88]/10 text-[#00ff88]'}`}>
                    {adminData.role === 'admin' ? 'MASTER' : 'USER'}
                 </div>
              </div>

              <div className="bg-(--card-bg) border border-(--card-border) rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-0.75 transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.4s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">My Level</h3>
                 <div className="text-white font-bobbaluna text-3xl tracking-wider mb-2 leading-tight mt-1">
                    {adminData.role === 'admin' ? 'SYSTEM ADMIN' : adminData.role ? adminData.role.toUpperCase() : 'CLIENT'}
                 </div>
                 <div className={`inline-block px-2.5 py-1 rounded border text-xs font-bold font-exo tracking-widest mt-1 ${adminData.role === 'admin' ? 'border-(--green)/40 bg-(--green)/10 text-(--green)' : 'border-(--blue)/40 bg-(--blue)/10 text-(--blue)'}`}>
                    {adminData.role === 'admin' ? 'TOP TIER' : 'STANDARD'}
                 </div>
              </div>

              <div className="bg-(--card-bg) border border-(--card-border) rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-0.75 transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.5s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">My Fix Limit</h3>
                 <FlashingValue value={adminData.balance} displayValue={Number(adminData.balance).toLocaleString()} className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2" />
                 <div className="text-(--green) text-sm font-exo mt-3">Active Limit</div>
              </div>

              <div className="bg-(--card-bg) border border-(--card-border) rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-0.75 transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.6s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">Company Contact</h3>
                 <div className="text-white font-orbitron text-2xl font-bold tracking-wider mb-3 mt-1">{companyContact}</div>
                 <div className="inline-block px-2.5 py-1 rounded border border-(--green)/40 bg-(--green)/10 text-(--green) text-xs font-bold font-exo tracking-widest mt-1">VERIFIED</div>
              </div>

              {/* Row 2 */}
              <div className="bg-(--card-bg) border border-(--card-border) rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-0.75 transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.7s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3 leading-relaxed">Maximum My<br/>Share</h3>
                 <FlashingValue value={parseFloat(adminData.myShare || adminData.share || '50')} displayValue={adminData.myShare || adminData.share || '50.0%'} className="text-white font-orbitron text-3xl font-bold tracking-wider mb-4" />
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-(--blue) to-(--green)" style={{ width: adminData.myShare || adminData.share || '50%' }}></div>
                 </div>
              </div>

              <div className="bg-(--card-bg) border border-(--card-border) rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-0.75 transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.7s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3 leading-relaxed">Minimum Company<br/>Share</h3>
                 <FlashingValue value={parseFloat(adminData.maxShare || adminData.mShare || adminData.share || '50')} displayValue={adminData.maxShare || adminData.mShare || adminData.share || '50%'} className="text-white font-orbitron text-3xl font-bold tracking-wider mb-4" />
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-(--gold) shadow-[0_0_10px_var(--gold)]" style={{ width: adminData.maxShare || adminData.mShare || adminData.share || '50%' }}></div>
                 </div>
              </div>

              <div className="bg-(--card-bg) border border-(--card-border) rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-0.75 transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.7s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-4 leading-relaxed">Match<br/>Commission</h3>
                 <FlashingValue value={adminData.mcomm || adminData.mComm || '3'} className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2" />
                 <div className="text-(--green) text-sm font-exo mt-3">Per Transaction</div>
              </div>

              <div className="bg-(--card-bg) border border-(--card-border) rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-0.75 transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.7s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-4 leading-relaxed">Session<br/>Commission</h3>
                 <FlashingValue value={adminData.scomm || adminData.sComm || '3'} className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2" />
                 <div className="text-(--green) text-sm font-exo mt-3">Per Session</div>
              </div>
           </div>

           {/* Charts Section */}
           {adminData.role !== 'client' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fadeUp" style={{ animationDelay: '0.8s' }}>
               <div className="bg-(--card-bg) border border-(--card-border) rounded-[14px] p-6 backdrop-blur-md">
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-6 flex justify-between">
                   <span>Weekly Profit/Loss (₹)</span>
                   <span className="text-[#00ff88] text-xs">Last 7 Days</span>
                 </h3>
                 <div className="h-62.5 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <AreaChart data={[
                       { name: 'Mon', pnl: 4000 },
                       { name: 'Tue', pnl: 3000 },
                       { name: 'Wed', pnl: -2000 },
                       { name: 'Thu', pnl: 2780 },
                       { name: 'Fri', pnl: 1890 },
                       { name: 'Sat', pnl: 2390 },
                       { name: 'Sun', pnl: 3490 },
                     ]}>
                       <defs>
                         <linearGradient id="colorPnl" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                         </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                       <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: number | string) => `₹${value}`} />
                       <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ backgroundColor: '#05100a', borderColor: 'var(--primary)', color: '#fff', borderRadius: '8px' }} />
                       <Area type="monotone" dataKey="pnl" stroke="var(--primary)" fillOpacity={1} fill="url(#colorPnl)" strokeWidth={3} activeDot={{ r: 6, fill: 'var(--primary)', stroke: '#05100a', strokeWidth: 2 }} />
                     </AreaChart>
                   </ResponsiveContainer>
                 </div>
               </div>

               <div className="bg-(--card-bg) border border-(--card-border) rounded-[14px] p-6 backdrop-blur-md">
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-6 flex justify-between">
                   <span>Active Clients vs Suspended</span>
                   <span className="text-[#f0b429] text-xs">Overview</span>
                 </h3>
                 <div className="h-62.5 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={[
                       { name: 'Stockists', active: 40, suspended: 4 },
                       { name: 'Agents', active: 120, suspended: 15 },
                       { name: 'Clients', active: 850, suspended: 45 },
                     ]}>
                       <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                       <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                       <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                       <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#05100a', borderColor: 'var(--primary)', color: '#fff' }} />
                       <Bar dataKey="active" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                       <Bar dataKey="suspended" fill="#ff3355" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               </div>
             </div>
           )}

           {/* Live Stats Row */}
           {adminData.role !== 'client' && (
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeUp" style={{ animationDelay: '0.8s' }}>
              
              <div className="bg-(--card-bg) border-x border-t border-(--card-border) live-stat-card rounded-t-[14px] rounded-b-sm p-6 hover:shadow-[0_0_25px_rgba(0,255,136,0.2)] hover:-translate-y-0.5 transition-all backdrop-blur-md">
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">Active Sessions</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2">{realStats.activeUsers.toLocaleString()}</div>
                 <div className="text-(--green) text-sm font-exo font-semibold flex items-center gap-1">↑ Live Connected</div>
              </div>

              <div className="bg-(--card-bg) border-x border-t border-(--card-border) live-stat-card rounded-t-[14px] rounded-b-sm p-6 hover:shadow-[0_0_25px_rgba(0,255,136,0.2)] hover:-translate-y-0.5 transition-all backdrop-blur-md">
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">Today's Transactions</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2">{realStats.transactions.toLocaleString()}</div>
                 <div className="text-(--green) text-sm font-exo font-semibold flex items-center gap-1">↑ Processed</div>
              </div>

              <div className="bg-(--card-bg) border-x border-t border-[rgba(255,51,85,0.3)] border-b-2 border-b-(--red) shadow-[0_4px_15px_rgba(255,51,85,0.1)] rounded-t-[14px] rounded-b-sm p-6 hover:shadow-[0_0_25px_rgba(255,51,85,0.2)] hover:-translate-y-0.5 transition-all backdrop-blur-md">
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">Blocked Attempts</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2">{realStats.suspended.toLocaleString()}</div>
                 <div className="text-(--red) text-sm font-exo font-semibold flex items-center gap-1">
                   <AlertTriangle size={14} className="mb-0.5" />
                   Monitored
                 </div>
              </div>

              <div className="bg-(--card-bg) border-x border-t border-(--card-border) live-stat-card rounded-t-[14px] rounded-b-sm p-6 hover:shadow-[0_0_25px_rgba(0,255,136,0.2)] hover:-translate-y-0.5 transition-all backdrop-blur-md">
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">Uptime</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2">99.9%</div>
                 <div className="text-(--green) text-sm font-exo font-semibold flex items-center gap-1">↑ Stable</div>
              </div>

           </div>
           )}
            {/* Recent Activity & Network Tree */}
            {adminData.role !== 'client' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 mb-8 animate-fadeUp" style={{ animationDelay: '0.9s' }}>
                <div className="lg:col-span-2 bg-(--card-bg) border border-(--card-border) rounded-[14px] p-6 backdrop-blur-md flex flex-col h-80">
                  <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-4 flex items-center justify-between">
                    <span><Activity size={14} className="inline mr-2 text-[#00ff88]" /> Live Activity Feed</span>
                  </h3>
                  <div className="flex-1 overflow-y-auto pr-2 space-y-4 scrollbar-thin">
                    {[
                      { time: 'Just now', msg: 'Super Admin updated match commission to 3', type: 'system' },
                      { time: '2 min ago', msg: 'New Agent "JohnXYZ" created by Stockist SC211607', type: 'user' },
                      { time: '15 min ago', msg: 'Limit increased by ₹50,000 for Client ABC', type: 'finance' },
                      { time: '1 hr ago', msg: 'Match ID 82743 settled. Royal Casino.', type: 'casino' },
                      { time: '2 hrs ago', msg: 'New Stockist "MK_TRADER" joined network.', type: 'user' },
                    ].map((act, i) => (
                      <div key={i} className="flex gap-3 items-start p-3 rounded-lg border border-slate-800/50 bg-[#05100a]/50 hover:bg-[#00ff88]/5 transition-colors">
                        <div className={`w-2 h-2 mt-1.5 rounded-full ${act.type === 'system' ? 'bg-(--gold)' : act.type === 'finance' ? 'bg-[#00ff88]' : 'bg-[#ff3355]'}`}></div>
                        <div>
                          <div className="text-sm text-slate-300 font-exo">{act.msg}</div>
                          <div className="text-[10px] text-slate-500 mt-1 uppercase font-bold tracking-widest">{act.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-(--card-bg) border border-(--card-border) rounded-[14px] p-6 backdrop-blur-md flex flex-col h-80">
                  <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-4 flex items-center justify-between">
                    <span><Users size={14} className="inline mr-2 text-(--gold)" /> Network Tree Overview</span>
                  </h3>
                  <div className="flex-1 relative overflow-y-auto overflow-x-hidden scrollbar-thin">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-[#00ff88]/10 via-transparent to-transparent opacity-50 pointer-events-none"></div>
                    <div className="flex flex-col items-center gap-2 text-center w-full max-w-50 z-10 mx-auto py-2">
                      <motion.div whileHover={{ scale: 1.05 }} className="px-4 py-2 border border-(--gold)/50 bg-(--gold)/10 text-(--gold) rounded shadow-[0_0_15px_rgba(240,180,41,0.2)] text-xs font-bold w-full truncate cursor-pointer hover:bg-(--gold)/20 transition-colors">Super Admin</motion.div>
                      <div className="w-px h-4 bg-slate-700"></div>
                      <motion.div whileHover={{ scale: 1.05 }} className="px-4 py-2 border border-[#00ff88]/50 bg-[#00ff88]/10 text-[#00ff88] rounded text-xs font-bold w-full truncate cursor-pointer hover:bg-[#00ff88]/20 transition-colors">Master</motion.div>
                      <div className="w-px h-4 bg-slate-700"></div>
                      <motion.div whileHover={{ scale: 1.05 }} className="px-4 py-2 border border-slate-600 bg-slate-800/50 text-white rounded text-xs font-bold w-full truncate cursor-pointer hover:bg-slate-700 transition-colors">Stockist</motion.div>
                      <div className="w-px h-4 bg-slate-700"></div>
                      <div className="flex gap-2 w-full">
                        <motion.div whileHover={{ scale: 1.05 }} className="px-2 py-1 border border-slate-600 bg-slate-800/50 text-slate-300 rounded text-[10px] font-bold flex-1 cursor-pointer hover:bg-slate-700 transition-colors">Agent</motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} className="px-2 py-1 border border-slate-600 bg-slate-800/50 text-slate-300 rounded text-[10px] font-bold flex-1 cursor-pointer hover:bg-slate-700 transition-colors">Agent</motion.div>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-2 hover:text-[#00ff88] cursor-pointer transition-colors">View Full Hierarchy →</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* Footer */}
        <footer className="mt-auto px-6 py-4 border-t border-(--green)/40 bg-[#05100a]/95 backdrop-blur flex flex-wrap max-md:flex-col items-center justify-between gap-4 z-20">
           <div className="text-slate-400 text-xs font-exo font-medium tracking-wider">
             <span className="ar-zone-logo text-lg">AR ZONE</span> <span className="mx-2 text-[#00ff88]/30">|</span> Powered By <span className="text-(--gold) font-bold">AR Gaming</span> <span className="mx-2 text-[#00ff88]/30">|</span> Copyright © 2021–2026
           </div>
           
           <div className="flex items-center gap-4">
              <span className="text-slate-400 text-xs font-exo font-medium tracking-wider">{adminData.role === 'admin' ? 'Admin Panel v2.0.0' : 'Client Portal v2.0.0'}</span>
              <div className="px-3 py-1 rounded bg-(--green)/10 border border-(--green)/30 text-(--green) text-[10px] font-bold font-exo tracking-widest uppercase">
                SECURE BUILD
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}
