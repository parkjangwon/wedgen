"use client";

import { useState, type ReactNode } from "react";

interface HoverScaleProps {
  children: ReactNode;
  scale?: number;
  className?: string;
}

export function HoverScale({ children, scale = 1.05, className = "" }: HoverScaleProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`hover-scale ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? `scale(${scale})` : "scale(1)",
        transition: "transform 0.3s ease-out",
        cursor: "pointer",
      }}
    >
      {children}
    </div>
  );
}

interface HoverLiftProps {
  children: ReactNode;
  lift?: number;
  shadow?: boolean;
  className?: string;
}

export function HoverLift({ children, lift = -8, shadow = true, className = "" }: HoverLiftProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`hover-lift ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        transform: isHovered ? `translateY(${lift}px)` : "translateY(0)",
        boxShadow: isHovered && shadow
          ? "0 20px 40px rgba(0, 0, 0, 0.15)"
          : "0 4px 12px rgba(0, 0, 0, 0.08)",
        transition: "transform 0.3s ease-out, box-shadow 0.3s ease-out",
        cursor: "pointer",
      }}
    >
      {children}
    </div>
  );
}

interface HoverGlowProps {
  children: ReactNode;
  color?: string;
  className?: string;
}

export function HoverGlow({ children, color = "rgba(185, 122, 86, 0.4)", className = "" }: HoverGlowProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`hover-glow ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        boxShadow: isHovered ? `0 0 30px ${color}` : "none",
        transition: "box-shadow 0.3s ease-out",
        cursor: "pointer",
      }}
    >
      {children}
    </div>
  );
}

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function MagneticButton({ children, className = "", onClick }: MagneticButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
    const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      className={`magnetic-button ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: "transform 0.2s ease-out",
      }}
    >
      {children}
    </button>
  );
}
