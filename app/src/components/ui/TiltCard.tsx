import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '@/utils/utils';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string; // Optional border/glow gradient
}

export function TiltCard({ children, className, gradient }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 150, damping: 15 });
  const mouseY = useSpring(y, { stiffness: 150, damping: 15 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [12, -12]); // Tilt up/down
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]); // Tilt left/right

  // Highlight effect moving opposite to tilt
  const shineX = useTransform(mouseX, [-0.5, 0.5], [0, 100]);
  const shineY = useTransform(mouseY, [-0.5, 0.5], [0, 100]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseXPos = e.clientX - rect.left;
    const mouseYPos = e.clientY - rect.top;

    const xPct = mouseXPos / width - 0.5;
    const yPct = mouseYPos / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={cn(
        'relative rounded-xl transition-shadow duration-300',
        'hover:shadow-xl hover:shadow-black/5',
        className
      )}
    >
      {/* Content Container with depth */}
      <div className="relative z-10 h-full bg-white/70 backdrop-blur-md border border-white/40 rounded-xl overflow-hidden p-0.5">
        {/* Inner Shine/Gradient Border */}
        {gradient && (
          <div className={cn('absolute inset-0 opacity-20 pointer-events-none', gradient)} />
        )}

        {/* Moving Shine Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-20"
          style={{
            background: `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.6) 0%, transparent 60%)`,
            opacity: useTransform(mouseX, (v: number) => (Math.abs(v) > 0.1 ? 0.3 : 0)),
          }}
        />

        {/* Actual Content */}
        <div className="relative px-4 py-4 h-full flex flex-col justify-between">{children}</div>
      </div>
    </motion.div>
  );
}
