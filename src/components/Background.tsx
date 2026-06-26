import React, { useEffect, useRef, useState } from 'react';
import { db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export type BgType = 'particles' | 'matrix' | 'cybergrid' | 'hyperdrive' | 'nebula' | 'none';

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgType, setBgType] = useState<BgType>(() => {
    return (localStorage.getItem('arzone_bg_type') as BgType) || 'particles';
  });

  useEffect(() => {
    // 1. Listen to global background style from Firestore
    const unsubscribeFirestore = onSnapshot(doc(db, 'settings', 'background'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data && data.bgType) {
          setBgType(data.bgType as BgType);
          localStorage.setItem('arzone_bg_type', data.bgType);
        }
      }
    }, (error) => {
      console.warn("Firestore background listen error:", error);
    });

    // 2. Local storage & custom events fallback
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'arzone_bg_type') {
        setBgType((e.newValue as BgType) || 'particles');
      }
    };
    
    const handleLocalChange = (e: any) => {
      setBgType(e.detail || 'particles');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('bgTypeChanged', handleLocalChange);
    
    return () => {
      unsubscribeFirestore();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('bgTypeChanged', handleLocalChange);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      if (canvas) {
        const w = window.innerWidth || document.documentElement.clientWidth || window.screen.width || 375;
        const h = window.innerHeight || document.documentElement.clientHeight || window.screen.height || 812;
        canvas.width = w;
        canvas.height = h;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Recheck sizing on a short timeout because iframes can render initially at 0px width/height
    const timerId = setTimeout(resizeCanvas, 150);

    if (bgType === 'none') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return () => {
        window.removeEventListener('resize', resizeCanvas);
        clearTimeout(timerId);
      };
    }

    const currentW = () => canvas.width || window.innerWidth || 375;
    const currentH = () => canvas.height || window.innerHeight || 812;

    if (bgType === 'particles') {
      class Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;
        color: string;

        constructor() {
          this.x = Math.random() * currentW();
          this.y = Math.random() * currentH();
          this.vx = (Math.random() - 0.5) * 1.5;
          this.vy = (Math.random() - 0.5) * 1.5;
          this.radius = Math.random() * 2 + 1;
          this.color = Math.random() > 0.5 ? '#00ff88' : '#f0b429';
        }

        update() {
          this.x += this.vx;
          this.y += this.vy;

          const w = currentW();
          const h = currentH();

          if (this.x < 0 || this.x > w) {
            this.vx = -this.vx;
            this.x = Math.max(0, Math.min(this.x, w));
          }
          if (this.y < 0 || this.y > h) {
            this.vy = -this.vy;
            this.y = Math.max(0, Math.min(this.y, h));
          }
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

      let particles: Particle[] = [];
      const initParticles = () => {
        particles = [];
        const count = Math.min(80, Math.floor((currentW() * currentH()) / 12000) || 40);
        for (let i = 0; i < count; i++) {
          particles.push(new Particle());
        }
      };

      const animateParticles = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, currentW(), currentH());

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
        animationFrameId = requestAnimationFrame(animateParticles);
      };

      initParticles();
      animateParticles();
    } else if (bgType === 'matrix') {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()';
      const fontSize = 16;
      const columns = Math.ceil(currentW() / fontSize) || 50;
      const drops: number[] = [];
      for(let x = 0; x < columns; x++) drops[x] = Math.random() * -20; // Stagger entrance

      const animateMatrix = () => {
        ctx.fillStyle = 'rgba(5, 16, 10, 0.1)'; 
        ctx.fillRect(0, 0, currentW(), currentH());
        
        ctx.fillStyle = '#00ff88'; 
        ctx.font = fontSize + 'px monospace';
        ctx.shadowBlur = 5;
        ctx.shadowColor = '#00ff88';
        
        for(let i = 0; i < drops.length; i++) {
          const text = chars[Math.floor(Math.random() * chars.length)];
          if (Math.random() > 0.95) {
             ctx.fillStyle = '#f0b429';
             ctx.shadowColor = '#f0b429';
          } else {
             ctx.fillStyle = '#00ff88';
             ctx.shadowColor = '#00ff88';
          }
          ctx.fillText(text, i * fontSize, drops[i] * fontSize);
          
          if(drops[i] * fontSize > currentH() && Math.random() > 0.975)
            drops[i] = 0;
          
          drops[i]++;
        }
        ctx.shadowBlur = 0;
        animationFrameId = requestAnimationFrame(animateMatrix);
      };
      animateMatrix();
    } else if (bgType === 'cybergrid') {
      let offset = 0;
      const animateGrid = () => {
        if (!ctx) return;
        const w = currentW();
        const h = currentH();
        
        // Solid deep console dark green-black bg
        ctx.fillStyle = '#05100a';
        ctx.fillRect(0, 0, w, h);

        const horizon = h * 0.55;
        const gridHeight = h - horizon;

        // Draw horizon gradient light (neon glow)
        const glow = ctx.createLinearGradient(0, horizon - 80, 0, horizon + 120);
        glow.addColorStop(0, 'rgba(5, 16, 10, 1)');
        glow.addColorStop(0.4, 'rgba(0, 255, 136, 0.15)');
        glow.addColorStop(1, 'rgba(5, 16, 10, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, horizon - 80, w, gridHeight + 80);

        // Horizon line
        ctx.beginPath();
        ctx.moveTo(0, horizon);
        ctx.lineTo(w, horizon);
        ctx.strokeStyle = 'rgba(0, 255, 136, 0.6)';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff88';
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Perspective grid lines vanishing outwards
        const vanishingX = w / 2;
        const linesCount = 24;
        for (let i = -linesCount / 2; i <= linesCount / 2; i++) {
          ctx.beginPath();
          ctx.moveTo(vanishingX, horizon);
          const targetX = vanishingX + (i * (w / 8));
          ctx.lineTo(targetX, h);
          ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Horizontal perspective lines moving towards player
        offset = (offset + 1.2) % 40;
        for (let y = 0; y < gridHeight; y += 40) {
          const currentY = (y + offset) % gridHeight;
          const ratio = currentY / gridHeight;
          const screenY = horizon + Math.pow(ratio, 2) * gridHeight;

          ctx.beginPath();
          ctx.moveTo(0, screenY);
          ctx.lineTo(w, screenY);
          ctx.strokeStyle = `rgba(0, 255, 136, ${ratio * 0.4})`;
          ctx.lineWidth = 0.5 + ratio * 1.5;
          ctx.stroke();
        }

        animationFrameId = requestAnimationFrame(animateGrid);
      };
      animateGrid();
    } else if (bgType === 'hyperdrive') {
      class Star {
        x: number;
        y: number;
        z: number;
        px: number;
        py: number;
        color: string;

        constructor(w: number, h: number) {
          this.x = (Math.random() - 0.5) * w;
          this.y = (Math.random() - 0.5) * h;
          this.z = Math.random() * w;
          this.px = this.x;
          this.py = this.y;
          this.color = Math.random() > 0.6 ? '#00ff88' : (Math.random() > 0.5 ? '#f0b429' : '#00aaff');
        }

        reset(w: number, h: number) {
          this.x = (Math.random() - 0.5) * w;
          this.y = (Math.random() - 0.5) * h;
          this.z = w;
          this.px = this.x;
          this.py = this.y;
        }

        update(w: number, h: number, speed: number) {
          this.px = this.x;
          this.py = this.y;
          this.z -= speed;
          if (this.z <= 0) {
            this.reset(w, h);
          }
        }

        draw(ctx: CanvasRenderingContext2D, w: number, h: number) {
          const cx = w / 2;
          const cy = h / 2;

          const sx = (this.x / this.z) * w * 0.8 + cx;
          const sy = (this.y / this.z) * h * 0.8 + cy;

          const pz = this.z + 20;
          const spx = (this.px / pz) * w * 0.8 + cx;
          const spy = (this.py / pz) * h * 0.8 + cy;

          if (sx < 0 || sx > w || sy < 0 || sy > h) {
            this.reset(w, h);
            return;
          }

          ctx.beginPath();
          ctx.moveTo(spx, spy);
          ctx.lineTo(sx, sy);
          ctx.strokeStyle = this.color;
          ctx.lineWidth = Math.min(2.5, (1 - this.z / w) * 2.5);
          ctx.stroke();
        }
      }

      const stars: Star[] = [];
      const initStars = () => {
        const w = currentW();
        const h = currentH();
        for (let i = 0; i < 150; i++) {
          stars.push(new Star(w, h));
        }
      };
      initStars();

      const animateHyperdrive = () => {
        if (!ctx) return;
        const w = currentW();
        const h = currentH();
        
        ctx.fillStyle = 'rgba(5, 16, 10, 0.15)'; // trails accumulation
        ctx.fillRect(0, 0, w, h);

        const speed = 12;
        stars.forEach(s => {
          s.update(w, h, speed);
          s.draw(ctx, w, h);
        });

        animationFrameId = requestAnimationFrame(animateHyperdrive);
      };
      animateHyperdrive();
    } else if (bgType === 'nebula') {
      class NebulaParticle {
        angle: number;
        radius: number;
        speed: number;
        size: number;
        color: string;

        constructor(w: number, h: number) {
          this.angle = Math.random() * Math.PI * 2;
          this.radius = Math.random() * Math.min(w, h) * 0.5;
          this.speed = (Math.random() * 0.003 + 0.001) * (Math.random() > 0.5 ? 1 : -1);
          this.size = Math.random() * 1.5 + 0.5;
          this.color = Math.random() > 0.6 ? '#f0b429' : (Math.random() > 0.5 ? '#00ff88' : '#ff3355');
        }

        update(w: number, h: number) {
          this.angle += this.speed;
          this.radius += Math.sin(this.angle * 2) * 0.15;
          if (this.radius > Math.min(w, h) * 0.6) {
            this.radius = Math.random() * 20;
          }
        }

        draw(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
          const x = cx + Math.cos(this.angle) * this.radius;
          const y = cy + Math.sin(this.angle) * this.radius;
          ctx.beginPath();
          ctx.arc(x, y, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.shadowBlur = 6;
          ctx.shadowColor = this.color;
          ctx.fill();
        }
      }

      const particles: NebulaParticle[] = [];
      const initNebula = () => {
        const w = currentW();
        const h = currentH();
        for (let i = 0; i < 120; i++) {
          particles.push(new NebulaParticle(w, h));
        }
      };
      initNebula();

      let cloudAngle = 0;

      const animateNebula = () => {
        if (!ctx) return;
        const w = currentW();
        const h = currentH();
        
        ctx.fillStyle = 'rgba(5, 16, 10, 0.08)'; // long fluid decay
        ctx.fillRect(0, 0, w, h);

        const cx = w / 2;
        const cy = h / 2;

        // Draw swirling ambient clouds in background
        cloudAngle += 0.0015;
        const colors = ['rgba(0, 255, 136, 0.04)', 'rgba(240, 180, 41, 0.03)', 'rgba(255, 51, 85, 0.03)'];
        for (let i = 0; i < 3; i++) {
          const angle = cloudAngle + (i * Math.PI * 2 / 3);
          const cloudX = cx + Math.cos(angle) * 80;
          const cloudY = cy + Math.sin(angle) * 80;
          const cloudRad = Math.min(w, h) * 0.35 + Math.sin(cloudAngle * 2 + i) * 30;

          const grad = ctx.createRadialGradient(cloudX, cloudY, 10, cloudX, cloudY, cloudRad);
          grad.addColorStop(0, colors[i]);
          grad.addColorStop(1, 'rgba(5, 16, 10, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(cloudX, cloudY, cloudRad, 0, Math.PI * 2);
          ctx.fill();
        }

        // Draw spiral dust
        particles.forEach(p => {
          p.update(w, h);
          p.draw(ctx, cx, cy);
        });

        ctx.shadowBlur = 0;
        animationFrameId = requestAnimationFrame(animateNebula);
      };
      animateNebula();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      clearTimeout(timerId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [bgType]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block object-cover pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none z-0"></div>
      <div className="absolute top-1/4 left-1/4 w-150 h-150 bg-[#00ff88]/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-[#f0b429]/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute inset-0 crt-scanlines z-10 pointer-events-none"></div>
    </>
  );
}
