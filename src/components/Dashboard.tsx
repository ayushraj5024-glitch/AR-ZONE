import React, { useEffect, useRef, useState } from 'react';
import { Shield, LogOut, AlertTriangle, ChevronRight } from 'lucide-react';

// Custom CSS added locally within component for specific complex effects
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

export default function Dashboard({ onMenuClick, onLogout, onNavigate }: { onMenuClick?: () => void, onLogout?: () => void, onNavigate?: (view: any) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State variables for dynamic values
  const [sessionTime, setSessionTime] = useState(14 * 60 + 32); // 14:32 in seconds
  const [sessions, setSessions] = useState(247);
  const [transactions, setTransactions] = useState(1843);
  const [blocked, setBlocked] = useState(16);

  // Parse time
  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    // Session timer
    const timerInterval = setInterval(() => {
      setSessionTime(prev => Math.max(0, prev - 1));
    }, 1000);

    // Live Stats Flicker
    const statsInterval = setInterval(() => {
      setSessions(prev => prev + Math.floor(Math.random() * 21) - 10); // ±10
      setTransactions(prev => prev + Math.floor(Math.random() * 61) - 30); // ±30
      setBlocked(prev => prev + Math.floor(Math.random() * 9) - 4); // ±4
    }, 4000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(statsInterval);
    };
  }, []);

  // Canvas Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationFrameId: number;

    const resizeCanvas = () => {
       if (containerRef.current) {
          canvas.width = containerRef.current.clientWidth;
          canvas.height = containerRef.current.clientHeight;
       } else {
         canvas.width = window.innerWidth;
         canvas.height = window.innerHeight;
       }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1.5;
        this.vy = (Math.random() - 0.5) * 1.5;
        this.radius = Math.random() * 2 + 1;
        this.color = Math.random() > 0.5 ? '#00ff88' : '#f0b429';
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < 80; i++) {
        particles.push(new Particle());
      }
    };

    const animate = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 255, 136, ${1 - distance / 100})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="h-screen bg-[#05100a] text-slate-200 font-exo relative overflow-y-auto overflow-x-hidden custom-scrollbar" style={{ '--gold': '#f0b429', '--gold2': '#ffda6a', '--green': '#00ff88', '--green2': '#00cc6a', '--blue': '#00aaff', '--red': '#ff3355' } as React.CSSProperties}>
      <style>{DashboardStyles}</style>

      {/* Background Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <canvas ref={canvasRef} className="absolute inset-0 z-0" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#00ff88]/5 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#f0b429]/5 rounded-full blur-[150px]"></div>
        <div className="absolute inset-0 crt-scanlines z-10"></div>
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

           <div className="flex items-center gap-6">
             <div className="hidden sm:flex items-center gap-2 text-slate-300 text-sm font-medium">
               <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_rgba(0,255,136,1)]"></span>
               SYSTEM ONLINE
             </div>
             <button onClick={onLogout} className="group flex items-center gap-2 px-4 py-2 rounded border border-slate-700 hover:border-[#ff3355] text-white hover:text-[#ff3355] font-exo font-semibold text-sm transition-all shadow-sm">
               <span className="hidden sm:inline">SIGN OUT</span>
               <LogOut size={16} className="group-hover:text-[#ff3355] transition-colors" />
             </button>
           </div>
        </nav>

        {/* Alert Marquee */}
        <div className="bg-[#00ff88]/5 border-b border-[#00ff88]/20 overflow-hidden flex items-center relative h-10 shadow-[inset_0_0_20px_rgba(0,255,136,0.02)] sm:hidden md:flex">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#05100a] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#05100a] to-transparent z-10 pointer-events-none"></div>
          
          <div className="whitespace-nowrap text-[#00ff88] text-sm font-exo flex items-center gap-8 pl-4" style={{ animation: 'marquee 25s linear infinite' }}>
             <span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_rgba(0,255,136,1)] animate-pulse"></span>
             <span>🏏 <span className="font-bold text-white">Somerset</span> <span className="text-[#f0b429]">145/3 (14.3 ov)</span> vs <span className="font-bold text-white">Glamorgan</span></span>
             <span className="text-[#00ff88]/50 font-bold">•</span>
             <span>🏏 <span className="font-bold text-white">India</span> <span className="text-[#f0b429]">210/4 (20.0 ov)</span> vs <span className="font-bold text-white">Australia</span> <span className="text-[#f0b429]">185/8 (20.0 ov)</span></span>
             <span className="text-[#00ff88]/50 font-bold">•</span>
             <span>🏏 <span className="font-bold text-white">CSK</span> <span className="text-[#f0b429]">165/2 (15.0 ov)</span> vs <span className="font-bold text-white">MI</span></span>
             <span className="text-[#00ff88]/50 font-bold">•</span>
             <span>⚽ <span className="font-bold text-white">Real Madrid</span> <span className="text-[#f0b429]">2 - 1</span> <span className="font-bold text-white">Barcelona</span></span>
             <span className="w-20 inline-block"></span>
          </div>

          <button onClick={() => onNavigate?.('live_matches')} className="absolute right-4 text-xs font-bold text-[#00ff88] border border-[#00ff88]/50 bg-[#05100a] px-3 py-1 rounded hover:bg-[#00ff88]/20 transition-colors z-20 whitespace-nowrap">
            LIVE VIEW
          </button>
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
                 Admin Dashboard <span className="mx-2 text-slate-600">·</span> System Control Panel
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
              <div className="bg-[var(--card-bg)] border border-[var(--gold)] rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-[3px] transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.3s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">My Username</h3>
                 <div className="text-[var(--gold)] font-orbitron text-3xl font-bold tracking-wider mb-2">ADMIN</div>
                 <div className="text-slate-300 text-sm font-exo mb-3">System Level Access</div>
                 <div className="inline-block px-2.5 py-1 rounded border border-[var(--gold)]/40 bg-[var(--gold)]/10 text-[var(--gold)] text-xs font-bold font-exo tracking-widest">MASTER</div>
              </div>

              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-[3px] transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.4s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">My Level</h3>
                 <div className="text-white font-bobbaluna text-3xl tracking-wider mb-2 leading-tight mt-1">SYSTEM ADMIN</div>
                 <div className="inline-block px-2.5 py-1 rounded border border-[var(--green)]/40 bg-[var(--green)]/10 text-[var(--green)] text-xs font-bold font-exo tracking-widest mt-1">TOP TIER</div>
              </div>

              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-[3px] transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.5s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">My Fix Limit</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2">1,000</div>
                 <div className="text-[var(--green)] text-sm font-exo mt-3">Active Limit</div>
              </div>

              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-[3px] transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.6s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">Company Contact</h3>
                 <div className="text-white font-orbitron text-2xl font-bold tracking-wider mb-3 mt-1">SC211607</div>
                 <div className="inline-block px-2.5 py-1 rounded border border-[var(--green)]/40 bg-[var(--green)]/10 text-[var(--green)] text-xs font-bold font-exo tracking-widest mt-1">VERIFIED</div>
              </div>

              {/* Row 2 */}
              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-[3px] transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.7s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3 leading-relaxed">Maximum My<br/>Share</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-4">50.0%</div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[var(--blue)] to-[var(--green)] w-1/2"></div>
                 </div>
              </div>

              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-[3px] transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.7s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3 leading-relaxed">Minimum Company<br/>Share</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-4">50%</div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--gold)] w-1/2 shadow-[0_0_10px_var(--gold)]"></div>
                 </div>
              </div>

              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-[3px] transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.7s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-4 leading-relaxed">Match<br/>Commission</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2">3</div>
                 <div className="text-[var(--green)] text-sm font-exo mt-3">Per Transaction</div>
              </div>

              <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[14px] p-6 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] hover:border-[#00ff88]/40 hover:-translate-y-[3px] transition-all backdrop-blur-md animate-fadeUp" style={{ animationDelay: '0.7s' }}>
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-4 leading-relaxed">Session<br/>Commission</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2">3</div>
                 <div className="text-[var(--green)] text-sm font-exo mt-3">Per Session</div>
              </div>
           </div>

           {/* Live Stats Row */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeUp" style={{ animationDelay: '0.8s' }}>
              
              <div className="bg-[var(--card-bg)] border-x border-t border-[var(--card-border)] live-stat-card rounded-t-[14px] rounded-b-[4px] p-6 hover:shadow-[0_0_25px_rgba(0,255,136,0.2)] hover:-translate-y-[2px] transition-all backdrop-blur-md">
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">Active Sessions</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2">{sessions.toLocaleString()}</div>
                 <div className="text-[var(--green)] text-sm font-exo font-semibold flex items-center gap-1">↑ +12 live</div>
              </div>

              <div className="bg-[var(--card-bg)] border-x border-t border-[var(--card-border)] live-stat-card rounded-t-[14px] rounded-b-[4px] p-6 hover:shadow-[0_0_25px_rgba(0,255,136,0.2)] hover:-translate-y-[2px] transition-all backdrop-blur-md">
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">Today's Transactions</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2">{transactions.toLocaleString()}</div>
                 <div className="text-[var(--green)] text-sm font-exo font-semibold flex items-center gap-1">↑ +8.4%</div>
              </div>

              <div className="bg-[var(--card-bg)] border-x border-t border-[rgba(255,51,85,0.3)] border-b-2 border-b-[var(--red)] shadow-[0_4px_15px_rgba(255,51,85,0.1)] rounded-t-[14px] rounded-b-[4px] p-6 hover:shadow-[0_0_25px_rgba(255,51,85,0.2)] hover:-translate-y-[2px] transition-all backdrop-blur-md">
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">Blocked Attempts</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2">{blocked.toLocaleString()}</div>
                 <div className="text-[var(--red)] text-sm font-exo font-semibold flex items-center gap-1">
                   <AlertTriangle size={14} className="mb-0.5" />
                   Monitored
                 </div>
              </div>

              <div className="bg-[var(--card-bg)] border-x border-t border-[var(--card-border)] live-stat-card rounded-t-[14px] rounded-b-[4px] p-6 hover:shadow-[0_0_25px_rgba(0,255,136,0.2)] hover:-translate-y-[2px] transition-all backdrop-blur-md">
                 <h3 className="text-slate-400 font-exo text-xs font-bold tracking-widest uppercase mb-3">Uptime</h3>
                 <div className="text-white font-orbitron text-3xl font-bold tracking-wider mb-2">99.9%</div>
                 <div className="text-[var(--green)] text-sm font-exo font-semibold flex items-center gap-1">↑ Stable</div>
              </div>

           </div>
        </div>

        {/* Footer */}
        <footer className="mt-auto px-6 py-4 border-t border-[var(--green)]/40 bg-[#05100a]/95 backdrop-blur flex flex-wrap max-md:flex-col items-center justify-between gap-4 z-20">
           <div className="text-slate-400 text-xs font-exo font-medium tracking-wider">
             <span className="ar-zone-logo text-lg">AR ZONE</span> <span className="mx-2 text-[#00ff88]/30">|</span> Powered By <span className="text-[var(--gold)] font-bold">AR Gaming</span> <span className="mx-2 text-[#00ff88]/30">|</span> Copyright © 2021–2026
           </div>
           
           <div className="flex items-center gap-4">
              <span className="text-slate-400 text-xs font-exo font-medium tracking-wider">Admin Panel v2.0.0</span>
              <div className="px-3 py-1 rounded bg-[var(--green)]/10 border border-[var(--green)]/30 text-[var(--green)] text-[10px] font-bold font-exo tracking-widest uppercase">
                SECURE BUILD
              </div>
           </div>
        </footer>
      </div>
    </div>
  );
}
