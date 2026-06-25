import React, { useEffect, useRef, useState } from 'react';

export type BgType = 'particles' | 'matrix' | 'waves' | 'nexus' | 'quantum' | 'none';

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [bgType, setBgType] = useState<BgType>(() => {
    return (localStorage.getItem('arzone_bg_type') as BgType) || 'particles';
  });

  useEffect(() => {
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
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    if (bgType === 'none') {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return () => {
        window.removeEventListener('resize', resizeCanvas);
      };
    }

    if (bgType === 'particles') {
      class Particle {
        x: number;
        y: number;
        vx: number;
        vy: number;
        radius: number;
        color: string;

        constructor() {
          this.x = Math.random() * canvas!.width;
          this.y = Math.random() * canvas!.height;
          this.vx = (Math.random() - 0.5) * 1.5;
          this.vy = (Math.random() - 0.5) * 1.5;
          this.radius = Math.random() * 2 + 1;
          this.color = Math.random() > 0.5 ? '#00ff88' : '#f0b429';
        }

        update() {
          this.x += this.vx;
          this.y += this.vy;

          if (this.x < 0 || this.x > canvas!.width) this.vx = -this.vx;
          if (this.y < 0 || this.y > canvas!.height) this.vy = -this.vy;
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
        for (let i = 0; i < 80; i++) {
          particles.push(new Particle());
        }
      };

      const animateParticles = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas!.width, canvas!.height);

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
      const columns = canvas.width / fontSize;
      const drops: number[] = [];
      for(let x = 0; x < columns; x++) drops[x] = 1;

      const animateMatrix = () => {
        ctx.fillStyle = 'rgba(5, 16, 10, 0.1)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
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
          
          if(drops[i] * fontSize > canvas.height && Math.random() > 0.975)
            drops[i] = 0;
          
          drops[i]++;
        }
        ctx.shadowBlur = 0;
        animationFrameId = requestAnimationFrame(animateMatrix);
      };
      animateMatrix();
    } else if (bgType === 'waves') {
      let time = 0;
      const animateWaves = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(0, canvas.height / 2);
          for (let x = 0; x < canvas.width; x += 5) {
             const y = Math.sin(x * 0.01 + time + i) * 60 * Math.sin(time * 0.3 + i) + canvas.height / 2 + Math.cos(x * 0.005 + time) * 40;
             ctx.lineTo(x, y);
          }
          ctx.strokeStyle = i === 0 ? 'rgba(0, 255, 136, 0.3)' : i === 1 ? 'rgba(240, 180, 41, 0.3)' : i === 2 ? 'rgba(0, 170, 255, 0.3)' : 'rgba(255, 51, 85, 0.3)';
          ctx.lineWidth = 2 + (i % 2);
          ctx.shadowBlur = 10;
          ctx.shadowColor = ctx.strokeStyle as string;
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
        time += 0.015;
        animationFrameId = requestAnimationFrame(animateWaves);
      }
      animateWaves();
    } else if (bgType === 'nexus') {
       let time = 0;
       const animateNexus = () => {
         ctx.fillStyle = 'rgba(5, 16, 10, 0.2)';
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         
         const cx = canvas.width / 2;
         const cy = canvas.height / 2;
         
         for (let i = 0; i < 50; i++) {
           const angle = (i / 50) * Math.PI * 2 + time;
           const radius = 100 + Math.sin(time * 2 + i) * 50 + (i * 5);
           const x = cx + Math.cos(angle) * radius;
           const y = cy + Math.sin(angle) * radius;
           
           ctx.beginPath();
           ctx.arc(x, y, 3, 0, Math.PI * 2);
           ctx.fillStyle = i % 2 === 0 ? '#00ff88' : '#00aaff';
           ctx.shadowBlur = 15;
           ctx.shadowColor = ctx.fillStyle;
           ctx.fill();
           
           if (i > 0) {
             const pAngle = ((i - 1) / 50) * Math.PI * 2 + time;
             const pRadius = 100 + Math.sin(time * 2 + (i - 1)) * 50 + ((i - 1) * 5);
             const px = cx + Math.cos(pAngle) * pRadius;
             const py = cy + Math.sin(pAngle) * pRadius;
             
             ctx.beginPath();
             ctx.moveTo(x, y);
             ctx.lineTo(px, py);
             ctx.strokeStyle = `rgba(0, 255, 136, ${0.2 + Math.sin(time * 5 + i) * 0.1})`;
             ctx.lineWidth = 1;
             ctx.stroke();
           }
         }
         ctx.shadowBlur = 0;
         time += 0.005;
         animationFrameId = requestAnimationFrame(animateNexus);
       };
       animateNexus();
    } else if (bgType === 'quantum') {
       class QNode {
         x: number;
         y: number;
         z: number;
         baseX: number;
         baseY: number;
         
         constructor(x: number, y: number, z: number) {
           this.x = x;
           this.y = y;
           this.baseX = x;
           this.baseY = y;
           this.z = z;
         }
       }
       
       const nodes: QNode[] = [];
       for(let i=0; i<150; i++) {
          nodes.push(new QNode(
            Math.random() * canvas.width,
            Math.random() * canvas.height,
            Math.random() * 2 + 0.1
          ));
       }
       
       let time = 0;
       
       const animateQuantum = () => {
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         time += 0.01;
         
         nodes.forEach(n => {
           n.x = n.baseX + Math.sin(time * n.z) * 50;
           n.y = n.baseY + Math.cos(time * n.z) * 50;
         });
         
         for(let i=0; i<nodes.length; i++) {
           for(let j=i+1; j<nodes.length; j++) {
             const dx = nodes[i].x - nodes[j].x;
             const dy = nodes[i].y - nodes[j].y;
             const dist = Math.sqrt(dx*dx + dy*dy);
             
             if (dist < 120) {
               ctx.beginPath();
               ctx.moveTo(nodes[i].x, nodes[i].y);
               ctx.lineTo(nodes[j].x, nodes[j].y);
               const alpha = 1 - (dist / 120);
               ctx.strokeStyle = `rgba(240, 180, 41, ${alpha * 0.5})`;
               ctx.stroke();
             }
           }
         }
         
         nodes.forEach(n => {
           ctx.beginPath();
           ctx.arc(n.x, n.y, n.z * 1.5, 0, Math.PI*2);
           ctx.fillStyle = '#f0b429';
           ctx.fill();
         });
         
         animationFrameId = requestAnimationFrame(animateQuantum);
       };
       animateQuantum();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [bgType]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,136,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,136,0.03)_1px,transparent_1px)] bg-size-[40px_40px] pointer-events-none z-0"></div>
      <div className="absolute top-1/4 left-1/4 w-150 h-150 bg-[#00ff88]/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute bottom-1/4 right-1/4 w-125 h-125 bg-[#f0b429]/5 rounded-full blur-[150px] pointer-events-none z-0"></div>
      <div className="absolute inset-0 crt-scanlines z-10 pointer-events-none"></div>
    </>
  );
}
