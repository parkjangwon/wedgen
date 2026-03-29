"use client";

import { useState, useEffect, type ReactNode } from "react";

interface PageTransitionProps {
  children: ReactNode;
  isVisible: boolean;
  type?: "fade" | "slide" | "scale" | "flip";
  duration?: number;
  className?: string;
}

export function PageTransition({
  children,
  isVisible,
  type = "fade",
  duration = 500,
  className = "",
}: PageTransitionProps) {
  const [isRendered, setIsRendered] = useState(isVisible);

  useEffect(() => {
    if (isVisible) {
      setIsRendered(true);
    } else {
      const timer = setTimeout(() => setIsRendered(false), duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  if (!isRendered) return null;

  const getStyles = () => {
    const base = {
      transition: `all ${duration}ms ease-out`,
      opacity: isVisible ? 1 : 0,
    };

    switch (type) {
      case "slide":
        return { ...base, transform: isVisible ? "translateX(0)" : "translateX(30px)" };
      case "scale":
        return { ...base, transform: isVisible ? "scale(1)" : "scale(0.95)" };
      case "flip":
        return { ...base, transform: isVisible ? "rotateY(0)" : "rotateY(90deg)" };
      case "fade":
      default:
        return base;
    }
  };

  return (
    <div className={`page-transition ${className}`} style={getStyles()}>
      {children}
    </div>
  );
}

interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
  className?: string;
  itemClassName?: string;
}

export function StaggeredList({
  children,
  staggerDelay = 100,
  initialDelay = 0,
  className = "",
  itemClassName = "",
}: StaggeredListProps) {
  const [visibleItems, setVisibleItems] = useState<number>(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    children.forEach((_, index) => {
      const timer = setTimeout(() => {
        setVisibleItems((prev) => Math.max(prev, index + 1));
      }, initialDelay + index * staggerDelay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [children, staggerDelay, initialDelay]);

  return (
    <div className={`staggered-list ${className}`}>
      {children.map((child, index) => (
        <div
          key={index}
          className={`staggered-item ${itemClassName}`}
          style={{
            opacity: index < visibleItems ? 1 : 0,
            transform: index < visibleItems ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 0.4s ease-out, transform 0.4s ease-out`,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}

interface TypewriterTextProps {
  text: string;
  delay?: number;
  speed?: number;
  className?: string;
}

export function TypewriterText({ text, delay = 0, speed = 50, className = "" }: TypewriterTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setIsStarted(true), delay);
    return () => clearTimeout(startTimer);
  }, [delay]);

  useEffect(() => {
    if (!isStarted) return;

    if (displayText.length < text.length) {
      const timer = setTimeout(() => {
        setDisplayText(text.slice(0, displayText.length + 1));
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [displayText, isStarted, speed, text]);

  return (
    <span className={`typewriter-text ${className}`}>
      {displayText}
      {isStarted && displayText.length < text.length && (
        <span className="typewriter-cursor">|</span>
      )}
      <style jsx>{`
        .typewriter-cursor {
          animation: blink 1s step-end infinite;
        }
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
    </span>
  );
}
