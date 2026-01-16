import { useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/utils/utils';

type AnimatedCollapseProps = {
  open: boolean;
  durationMs?: number;
  className?: string;
  children: React.ReactNode;
};

export function AnimatedCollapse({
  open,
  durationMs = 280,
  className,
  children,
}: AnimatedCollapseProps) {
  const innerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const raf1Ref = useRef<number | null>(null);
  const raf2Ref = useRef<number | null>(null);

  const [mounted, setMounted] = useState(open);
  const [height, setHeight] = useState<number | 'auto'>(open ? 'auto' : 0);

  useLayoutEffect(() => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    if (raf1Ref.current) cancelAnimationFrame(raf1Ref.current);
    if (raf2Ref.current) cancelAnimationFrame(raf2Ref.current);

    if (open) {
      setMounted(true);

      raf1Ref.current = requestAnimationFrame(() => {
        const h = innerRef.current?.getBoundingClientRect().height ?? 0;
        setHeight(h);

        raf2Ref.current = requestAnimationFrame(() => {
          const next = innerRef.current?.getBoundingClientRect().height ?? 0;
          setHeight(next);

          timeoutRef.current = window.setTimeout(() => {
            setHeight('auto');
          }, durationMs);
        });
      });

      return;
    }

    // Closing
    const current = innerRef.current?.getBoundingClientRect().height ?? 0;
    setHeight(current);

    raf1Ref.current = requestAnimationFrame(() => {
      setHeight(0);
      timeoutRef.current = window.setTimeout(() => {
        setMounted(false);
      }, durationMs);
    });
  }, [open, durationMs]);

  if (!mounted) return null;

  return (
    <div
      className={cn(
        'overflow-hidden transition-[height] ease-in-out will-change-[height]',
        className
      )}
      style={{
        height: height === 'auto' ? 'auto' : `${height}px`,
        transitionDuration: `${durationMs}ms`,
      }}
    >
      <div ref={innerRef} className="transform-gpu">
        {children}
      </div>
    </div>
  );
}
