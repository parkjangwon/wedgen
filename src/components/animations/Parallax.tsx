"use client";

import { useState, useEffect, type ReactNode } from "react";

interface ParallaxProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function Parallax({ children, speed = 0.5, className = "" }: ParallaxProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setOffset(window.scrollY * speed);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed]);

  return (
    <div
      className={className}
      style={{
        transform: `translateY(${offset}px)`,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
}

export function ParallaxContainer({ children, className = "" }: ParallaxContainerProps) {
  return <div className={`parallax-container ${className}`}>{children}</div>;
}

interface FloatingElementProps {
  children: ReactNode;
  amplitude?: number;
  duration?: number;
  className?: string;
}

export function FloatingElement({
  children,
  amplitude = 10,
  duration = 3,
  className = "",
}: FloatingElementProps) {
  return (
    <div
      className={`floating-element ${className}`}
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
      }}
    >
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-${amplitude}px);
          }
        }
      `}</style>
      {children}
    </div>
  );
}

interface PulseEffectProps {
  children: ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
}

export function PulseEffect({
  children,
  scale = 1.05,
  duration = 2,
  className = "",
}: PulseEffectProps) {
  return (
    <div
      className={`pulse-effect ${className}`}
      style={{
        animation: `pulse ${duration}s ease-in-out infinite`,
      }}
    >
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(${scale});
          }
        }
      `}</style>
      {children}
    </div>
  );
}
