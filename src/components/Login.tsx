import React, { useState, useEffect, useRef } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, Gauge, TrendingUp, Eye, EyeOff } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

interface LoginProps {
  onLogin: () => void;
}

const LoginStyles = `
  .font-orbitron { font-family: 'Orbitron', sans-serif; }
  .font-exo { font-family: 'Exo 2', sans-serif; }
  
  .crt-scanlines {
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06));
    background-size: 100% 2px, 3px 100%;
    pointer-events: none;
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
  }
`;

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.body.style.height = '100%';
    document.body.style.touchAction = 'none';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.body.style.touchAction = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    try {
      const formattedEmail = username.includes('@') ? username : `${username}@ar-zone-app.com`;
      await signInWithEmailAndPassword(auth, formattedEmail, password);
      onLogin();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
         setError('Invalid email or password.');
      } else {
         setError(err.message || 'Login failed.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    
    setIsSendingReset(true);
    setResetMessage('');
    setError('');
    
    try {
      const formattedResetEmail = resetEmail.includes('@') ? resetEmail : `${resetEmail}@ar-zone-app.com`;
      await sendPasswordResetEmail(auth, formattedResetEmail);
      setResetMessage("Reset link has been sent to " + resetEmail);
      setResetEmail('');
    } catch (err: any) {
       console.error(err);
       setError(err.message || 'Failed to send reset link.');
    } finally {
       setIsSendingReset(false);
    }
  };

  return (
    <div ref={containerRef} className="fixed inset-0 w-full h-[100dvh] bg-[#05100a] text-slate-200 flex items-center justify-center p-4 lg:p-12 overflow-hidden font-exo touch-none overscroll-none" style={{ '--gold': '#f0b429', '--gold2': '#ffda6a', '--green': '#00ff88', '--green2': '#00cc6a', '--blue': '#00aaff', '--red': '#ff3355' } as React.CSSProperties}>
      <style>{LoginStyles}</style>

      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
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

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-12 animate-fadeUp">
        
        {/* Left Column (Brand & Info) */}
        <div className="hidden lg:block flex-1 w-full text-white space-y-4 max-w-none">
          <div>
            <h1 className="ar-zone-logo text-4xl sm:text-5xl lg:text-6xl mb-2">AR ZONE</h1>
            <p className="text-lg sm:text-xl text-slate-300 font-light border-b border-[#00ff88]/30 pb-4 inline-block font-orbitron tracking-wider">
              System Administration Portal
            </p>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-orbitron font-semibold text-[#00ff88] tracking-widest">SECURE. SMART. SEAMLESS.</h3>
            <p className="text-slate-400 text-base">Manage your system with precision and power.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(0,255,136,0.15)] flex-shrink-0">
                <ShieldCheck className="text-[#00ff88]" size={20} />
              </div>
              <h4 className="font-semibold text-white text-base font-orbitron tracking-wide">Secure</h4>
              <p className="text-xs text-slate-400 mt-1">Advanced 2FA security</p>
            </div>
            <div className="flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(0,255,136,0.15)] flex-shrink-0">
                <Gauge className="text-[#f0b429]" size={20} />
              </div>
              <h4 className="font-semibold text-white text-base font-orbitron tracking-wide">Fast</h4>
              <p className="text-xs text-slate-400 mt-1">API level performance</p>
            </div>
            <div className="flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(0,255,136,0.15)] flex-shrink-0">
                <TrendingUp className="text-[#00ff88]" size={20} />
              </div>
              <h4 className="font-semibold text-white text-base font-orbitron tracking-wide">Reliable</h4>
              <p className="text-xs text-slate-400 mt-1">Built for high scale</p>
            </div>
          </div>
        </div>

        {/* Right Column (Login Card) */}
        <div className="w-full max-w-[380px] lg:w-[400px] shrink-0">
          <div className="bg-[rgba(255,255,255,0.02)] backdrop-blur-xl border border-[#00ff88]/20 rounded-2xl shadow-[0_0_50px_rgba(0,255,136,0.05)] p-5 sm:p-6 relative overflow-hidden group hover:border-[#00ff88]/40 transition-colors">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ff88] to-transparent opacity-50"></div>
            
            <div className="flex flex-col items-center mb-5 mt-1 text-center">
              <h1 className="ar-zone-logo text-3xl sm:text-4xl mb-3">AR ZONE</h1>
              <h2 className="text-xl sm:text-2xl font-orbitron font-bold text-white tracking-widest">{showForgotPassword ? "Reset Key" : "Welcome Back"}</h2>
              <p className="text-slate-400 text-xs sm:text-sm mt-1 sm:mt-2 font-exo">{showForgotPassword ? "Enter your User ID to receive reset instructions" : "Authenticate identity to continue"}</p>
            </div>

            {!showForgotPassword ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-[#ff3355]/10 text-[#ff3355] px-4 py-2 rounded text-sm border border-[#ff3355]/30 text-center font-medium shadow-sm flex items-center justify-center gap-2">
                    <Lock size={14} />
                    {error}
                  </div>
                )}
                
                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs font-bold text-slate-300 font-orbitron uppercase tracking-widest">User ID</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-500 group-focus-within/input:text-[#00ff88] transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[rgba(5,16,10,0.5)] border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-all text-white text-sm font-exo placeholder-slate-600 shadow-inner"
                      placeholder="Enter User ID"
                      autoComplete="off"
                    />
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs font-bold text-slate-300 font-orbitron uppercase tracking-widest">Password</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock size={18} className="text-slate-500 group-focus-within/input:text-[#00ff88] transition-colors" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-2.5 sm:py-3 bg-[rgba(5,16,10,0.5)] border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-all text-white text-sm font-exo placeholder-slate-600 shadow-inner"
                      placeholder="Enter security key"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 pb-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-[rgba(5,16,10,0.5)] text-[#00ff88] focus:ring-[#00ff88]/30 focus:ring-offset-0" />
                    <span className="text-xs sm:text-sm font-exo text-slate-400 hover:text-[#00ff88] transition-colors">Session Lock</span>
                  </label>
                  <button type="button" onClick={() => { setShowForgotPassword(true); setResetMessage(''); }} className="text-xs sm:text-sm text-[#f0b429] hover:text-[#ffda6a] transition-colors font-semibold font-exo z-20 relative">
                    Forgot Key?
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-[#00ff88]/10 hover:bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88] font-orbitron font-bold tracking-widest uppercase py-3 px-4 rounded shadow-[0_0_15px_rgba(0,255,136,0.2)] hover:shadow-[0_0_25px_rgba(0,255,136,0.4)] transition-all flex items-center justify-center space-x-3 group/btn mt-2 relative z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{isLoggingIn ? "AUTHENTICATING..." : "LOGIN"}</span>
                  {!isLoggingIn && <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetSubmit} className="space-y-4">
                {error && (
                  <div className="bg-[#ff3355]/10 text-[#ff3355] px-4 py-2 rounded text-sm border border-[#ff3355]/30 text-center font-medium shadow-sm flex items-center justify-center gap-2">
                    <Lock size={14} />
                    {error}
                  </div>
                )}
                {resetMessage && (
                  <div className="bg-[#00ff88]/10 text-[#00ff88] px-4 py-2 rounded text-sm border border-[#00ff88]/30 text-center font-medium shadow-sm flex items-center justify-center gap-2">
                    <ShieldCheck size={14} />
                    {resetMessage}
                  </div>
                )}

                <div className="space-y-1 sm:space-y-2">
                  <label className="text-xs font-bold text-slate-300 font-orbitron uppercase tracking-widest">User ID</label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-500 group-focus-within/input:text-[#00ff88] transition-colors" />
                    </div>
                    <input
                      type="text"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 bg-[rgba(5,16,10,0.5)] border border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-[#00ff88]/50 focus:border-[#00ff88] transition-all text-white text-sm font-exo placeholder-slate-600 shadow-inner"
                      placeholder="Enter registered User ID"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col space-y-3 mt-4">
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="w-full bg-[#f0b429]/10 hover:bg-[#f0b429]/20 text-[#f0b429] border border-[#f0b429] font-orbitron font-bold tracking-widest uppercase py-3 px-4 rounded shadow-[0_0_15px_rgba(240,180,41,0.2)] hover:shadow-[0_0_25px_rgba(240,180,41,0.4)] transition-all flex items-center justify-center space-x-3 group/btn relative z-20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span>{isSendingReset ? "SENDING..." : "SEND RESET LINK"}</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowForgotPassword(false)} 
                    className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors font-semibold font-exo text-center z-20 relative"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
            
            <div className="mt-5 sm:mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-[10px] sm:text-xs font-exo font-semibold text-slate-500 tracking-widest uppercase">
                Powered By <span className="text-[#f0b429]">AR Gaming</span> | v2.0.0
              </p>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
