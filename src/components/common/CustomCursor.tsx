'use client';

import React, { useEffect, useState, useRef } from 'react';

interface ClickRipple {
  id: number;
  x: number;
  y: number;
}

export function CustomCursor() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [isHoveringInteractive, setIsHoveringInteractive] = useState(false);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [ripples, setRipples] = useState<ClickRipple[]>([]);

  // Positions for smooth lerp physics
  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const followerPos = useRef({ x: -100, y: -100 });
  const animFrameId = useRef<number | null>(null);

  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (typeof window === 'undefined') return;
    const isTouch = window.matchMedia('(hover: none) or (pointer: coarse)').matches;
    if (isTouch) return;

    setMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!visible) setVisible(true);

      // Instantly position the center dot
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      // Check if hovering interactive target
      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('button, a, input, textarea, select, [role="button"], .cursor-pointer, .hover-card-3d')
        );
        setIsHoveringInteractive(isInteractive);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsMouseDown(true);
      const newRipple: ClickRipple = {
        id: Date.now() + Math.random(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev.slice(-4), newRipple]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
      }, 700);
    };

    const handleMouseUp = () => {
      setIsMouseDown(false);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    const handleMouseEnter = () => {
      setVisible(true);
    };

    // 60FPS fluid lerp loop for the ambient spotlight and outer ring
    const render = () => {
      // Ring lerp (eases smoothly to cursor)
      const ringEase = 0.22;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * ringEase;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * ringEase;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      // Ambient radial spotlight lerp (slower, softer trail)
      const followerEase = 0.09;
      followerPos.current.x += (mousePos.current.x - followerPos.current.x) * followerEase;
      followerPos.current.y += (mousePos.current.y - followerPos.current.y) * followerEase;

      if (followerRef.current) {
        followerRef.current.style.transform = `translate3d(${followerPos.current.x}px, ${followerPos.current.y}px, 0) translate(-50%, -50%)`;
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown, { passive: true });
    window.addEventListener('mouseup', handleMouseUp, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    animFrameId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [visible]);

  if (!mounted) return null;

  return (
    <>
      {/* 1. Large Ambient Soft Spotlight */}
      <div
        ref={followerRef}
        aria-hidden="true"
        className="ambient-cursor-follower"
        style={{
          opacity: visible ? (isHoveringInteractive ? 0.9 : 0.6) : 0,
          width: isHoveringInteractive ? '480px' : '380px',
          height: isHoveringInteractive ? '480px' : '380px',
          background: isHoveringInteractive
            ? 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, rgba(16, 185, 129, 0.08) 45%, transparent 70%)'
            : 'radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, rgba(16, 185, 129, 0.04) 40%, transparent 70%)',
        }}
      />

      {/* 2. Magnetic Outer Ring */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="ambient-cursor-ring"
        style={{
          opacity: visible ? 1 : 0,
          width: isHoveringInteractive ? '46px' : isMouseDown ? '24px' : '32px',
          height: isHoveringInteractive ? '46px' : isMouseDown ? '24px' : '32px',
          borderColor: isHoveringInteractive ? '#4F46E5' : 'rgba(79, 70, 229, 0.45)',
          backgroundColor: isHoveringInteractive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
          borderWidth: isHoveringInteractive ? '2px' : '1.5px',
        }}
      />

      {/* 3. Precision Center Dot */}
      <div
        ref={dotRef}
        aria-hidden="true"
        className="ambient-cursor-dot"
        style={{
          opacity: visible ? 1 : 0,
          transform: isMouseDown ? 'translate(-50%, -50%) scale(1.6)' : 'translate(-50%, -50%) scale(1)',
          backgroundColor: isHoveringInteractive ? '#4338CA' : '#4F46E5',
        }}
      />

      {/* 4. Click Ripple Waves */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="fixed pointer-events-none rounded-full border-2 border-indigo-500/50 animate-ping z-[9997]"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '28px',
            height: '28px',
            transform: 'translate(-50%, -50%)',
            animationDuration: '600ms',
          }}
        />
      ))}
    </>
  );
}
