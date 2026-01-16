import { useEffect, useMemo, useRef, useState } from 'react';

type ConfettiOverlayProps = {
  triggerId?: string;
  durationMs?: number;
  onDone?: () => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  vr: number;
  color: string;
  shape: 'rect' | 'circle';
  life: number; // 0..1
};

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function ConfettiOverlay({ triggerId, durationMs = 1400, onDone }: ConfettiOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const startedAtRef = useRef<number>(0);

  const [enabled, setEnabled] = useState(false);

  const colors = useMemo(
    () => ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#14b8a6'],
    []
  );

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    particlesRef.current = [];
    setEnabled(false);
    onDone?.();
  };

  const spawn = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const rect = parent.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const count = Math.min(220, Math.max(90, Math.floor(w / 6)));
    const centerX = w * 0.5;
    const originY = h * 0.12;

    const next: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
      const speed = 260 + Math.random() * 360;
      next.push({
        x: centerX + (Math.random() - 0.5) * 30,
        y: originY + (Math.random() - 0.5) * 12,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 6,
        rotation: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        shape: Math.random() > 0.75 ? 'circle' : 'rect',
        life: 1,
      });
    }
    particlesRef.current = next;
  };

  const loop = (t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    const dt = Math.min(0.033, Math.max(0.001, (t - startedAtRef.current) / 1000));
    startedAtRef.current = t;

    const gravity = 900;
    const drag = 0.985;

    ctx.clearRect(0, 0, w, h);
    ctx.save();

    let alive = 0;
    for (const p of particlesRef.current) {
      p.vy += gravity * dt;
      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.vr * dt;
      p.life -= dt / (durationMs / 1000);

      if (p.life <= 0 || p.y > h + 40) continue;
      alive++;

      const alpha = Math.max(0, Math.min(1, p.life));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 0.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.size * 0.5, -p.size * 0.25, p.size, p.size * 0.5);
      }

      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    ctx.restore();

    if (alive === 0) {
      stop();
      return;
    }

    rafRef.current = requestAnimationFrame(loop);
  };

  useEffect(() => {
    if (!triggerId) return;
    if (prefersReducedMotion()) return;

    setEnabled(true);
    resize();
    spawn();
    startedAtRef.current = performance.now();
    rafRef.current = requestAnimationFrame(loop);

    const onResize = () => resize();
    window.addEventListener('resize', onResize);
    const timeout = window.setTimeout(() => stop(), durationMs + 500);

    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(timeout);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerId]);

  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-[60] pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
}
