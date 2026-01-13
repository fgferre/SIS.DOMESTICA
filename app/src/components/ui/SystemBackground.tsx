import { useEffect, useRef, useState } from 'react';
import { AuroraBackground } from '@/components/ui/AuroraBackground';
import { AmbientWebGL2 } from '@/components/ui/AmbientWebGL2';
import { cn } from '@/utils/utils';

type SystemBackgroundMode = 'app' | 'hero' | 'form';

export function SystemBackground({
  mode = 'app',
  className,
}: {
  mode?: SystemBackgroundMode;
  className?: string;
}) {
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        const x = Math.min(1, Math.max(0, e.clientX / Math.max(1, window.innerWidth)));
        const y = Math.min(1, Math.max(0, e.clientY / Math.max(1, window.innerHeight)));
        setMouse({ x, y });
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const ambientOpacity = mode === 'hero' ? 0.22 : mode === 'form' ? 0.18 : 0.12;
  const auroraOpacity = mode === 'hero' ? 0.9 : mode === 'form' ? 0.55 : 0.35;

  return (
    <div className={cn('fixed inset-0 -z-50 overflow-hidden', className)}>
      <AuroraBackground className={cn('absolute inset-0', mode === 'app' && 'opacity-60')} />

      <AmbientWebGL2
        className="absolute inset-0 z-0"
        opacity={ambientOpacity}
        mouse={mouse}
        paused={false}
      />

      <div className="absolute inset-0 z-10 bg-[length:40px_40px] bg-grid-pattern opacity-20 pointer-events-none living-grid" />
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-30 pointer-events-none" />
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.15),transparent_50%)] pointer-events-none" />

      <div className="absolute inset-0 z-20 pointer-events-none scanline-overlay opacity-[0.06] dark:opacity-[0.15]" />

      {/* Subtle dark wash so content stays legible over strong glows */}
      <div
        className={cn(
          'absolute inset-0 z-30 pointer-events-none',
          'bg-white/25 dark:bg-black/40 transition-colors',
          mode !== 'hero' && 'opacity-70'
        )}
        style={{ opacity: auroraOpacity }}
      />
    </div>
  );
}
