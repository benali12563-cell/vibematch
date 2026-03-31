"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number; vx: number; vy: number;
  color: string; size: number; life: number; rot: number; rSpeed: number;
}

const COLORS = ["#00CED1","#FF4444","#FFD700","#FF69B4","#00FF88","#FF6B35","#fff"];

export default function ConfettiEffect({ trigger }: { trigger: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (!trigger) return;
    const c = ref.current;
    if (!c) return;
    c.width = window.innerWidth;
    c.height = window.innerHeight;

    for (let i = 0; i < 120; i++) {
      particles.current.push({
        x: c.width * 0.5 + (Math.random() - 0.5) * 80,
        y: c.height * 0.45,
        vx: (Math.random() - 0.5) * 14,
        vy: Math.random() * -16 - 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: Math.random() * 8 + 4,
        life: 1,
        rot: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 12,
      });
    }

    function draw() {
      if (!c) return;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, c.width, c.height);
      particles.current = particles.current.filter((p) => p.life > 0);
      particles.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.45;
        p.vx *= 0.99;
        p.rot += p.rSpeed;
        p.life -= 0.018;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      });
      if (particles.current.length > 0) raf.current = requestAnimationFrame(draw);
      else ctx.clearRect(0, 0, c.width, c.height);
    }

    cancelAnimationFrame(raf.current);
    draw();
    return () => cancelAnimationFrame(raf.current);
  }, [trigger]);

  return (
    <canvas ref={ref} style={{ position: "fixed", inset: 0, zIndex: 9999, pointerEvents: "none" }} />
  );
}
