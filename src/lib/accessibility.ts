/** @fileOverview 접근성 유틸리티 - 웹 접근성(ARIA, 키보드 낳igation, 포커스 관리) */

import * as React from "react";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AriaProps {
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-expanded"?: boolean;
  "aria-hidden"?: boolean;
  "aria-live"?: "off" | "assertive" | "polite";
  "aria-atomic"?: boolean;
  "aria-relevant"?: string;
  "aria-busy"?: boolean;
  "aria-current"?: boolean | "page" | "step" | "location" | "date" | "time";
  "aria-disabled"?: boolean;
  "aria-pressed"?: boolean | "mixed";
  "aria-selected"?: boolean;
  "aria-checked"?: boolean | "mixed";
  "aria-haspopup"?: boolean | "menu" | "listbox" | "tree" | "grid" | "dialog";
  "aria-controls"?: string;
  "aria-owns"?: string;
  "aria-activedescendant"?: string;
  role?: string;
}

export interface FocusTrapOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  isActive: boolean;
  onEscape?: () => void;
  returnFocusOnDeactivate?: boolean;
}

export interface AnnounceOptions {
  priority?: "polite" | "assertive";
  clearAfter?: number;
}

// ============================================================================
// ARIA Helper Functions
// ============================================================================

/**
 * 스크린 리더용 메시지 발표
 * @param message 발표할 메시지
 * @param options 옵션
 * 
 * @example
 * announce("저장되었습니다");
 * announce("오류가 발생했습니다", { priority: "assertive" });
 */
export function announce(message: string, options: AnnounceOptions = {}): void {
  const { priority = "polite", clearAfter = 3000 } = options;

  // 기존 라이브 리전 찾기 또는 생성
  let liveRegion = document.getElementById(`live-region-${priority}`);

  if (!liveRegion) {
    liveRegion = document.createElement("div");
    liveRegion.id = `live-region-${priority}`;
    liveRegion.setAttribute("aria-live", priority);
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(liveRegion);
  }

  liveRegion.textContent = message;

  // 지정된 시간 후 내용 클리어
  if (clearAfter > 0) {
    setTimeout(() => {
      if (liveRegion) {
        liveRegion.textContent = "";
      }
    }, clearAfter);
  }
}

/**
 * 키보드 탐색 허용 요소 선택자
 */
const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex=\"-1\"])",
  "[contenteditable]",
].join(", ");

/**
 * 포커스 가능한 요소들 가져오기
 * @param container 컨테이너 요소
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)
  );

  // visible 요소만 필터
  return elements.filter((el) => {
    const style = window.getComputedStyle(el);
    return style.display !== "none" && style.visibility !== "hidden";
  });
}

/**
 * 첫 번째 포커스 가능한 요소로 포커스
 * @param container 컨테이너 요소
 * @returns 포커스 성공 여부
 */
export function focusFirst(container: HTMLElement): boolean {
  const elements = getFocusableElements(container);
  if (elements.length > 0) {
    elements[0]?.focus();
    return true;
  }
  return false;
}

/**
 * 포커스 트랩 훅
 * 모달/다이얼로그 등에서 포커스를 컨테이너 날에서 유지
 */
export function useFocusTrap(options: FocusTrapOptions): void {
  const { containerRef, isActive, onEscape, returnFocusOnDeactivate = true } = options;
  const previouslyFocusedRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!isActive || !containerRef.current) return;

    // 이전 포커스 저장
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    // 첫 번째 포커스 가능한 요소로 이동
    focusFirst(containerRef.current);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== "Tab" || !containerRef.current) return;

      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Shift+Tab: 첫 번째에서 마지막으로
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
      // Tab: 마지막에서 첫 번째로
      else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // 포커스 복원
      if (returnFocusOnDeactivate && previouslyFocusedRef.current) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isActive, onEscape, returnFocusOnDeactivate, containerRef]);
}

/**
 * 스킵 링크 컴포넌트 속성
 * @param targetId 이동할 대상 ID
 */
export function getSkipLinkProps(targetId: string) {
  return {
    href: `#${targetId}`,
    className: "sr-only focus:not-sr-only focus:absolute focus:z-50",
    children: "본문으로 이동",
  };
}

/**
 * 시각적으로는 숨기지만 스크린 리더에는 노출
 */
export const VISUALLY_HIDDEN_STYLE: React.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  padding: "0",
  margin: "-1px",
  overflow: "hidden",
  clip: "rect(0, 0, 0, 0)",
  whiteSpace: "nowrap",
  border: "0",
};

/**
 * 접근성을 위한 버튼 속성 생성
 * @param onClick 클릭 핸들러
 * @param label 접근성 라벨
 */
export function createAccessibleButton(
  onClick: () => void,
  label: string
): React.ButtonHTMLAttributes<HTMLButtonElement> {
  return {
    onClick,
    "aria-label": label,
    type: "button",
  };
}

/**
 * 접근성을 위한 링크 속성 생성
 * @param href 링크 URL
 * @param label 접근성 라벨
 * @param isExternal 외부 링크 여부
 */
export function createAccessibleLink(
  href: string,
  label: string,
  isExternal = false
): React.AnchorHTMLAttributes<HTMLAnchorElement> {
  return {
    href,
    "aria-label": isExternal ? `${label} (새 창에서 열림)` : label,
    target: isExternal ? "_blank" : undefined,
    rel: isExternal ? "noopener noreferrer" : undefined,
  };
}

// ============================================================================
// Color Contrast Utilities
// ============================================================================

/**
 * HEX 색상을 RGB로 변환
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
    : null;
}

/**
 * WCAG 색상 대비 비율 계산
 * @param color1 첫 번째 색상 (HEX)
 * @param color2 두 번째 색상 (HEX)
 * @returns 대비 비율 (1:1 ~ 21:1)
 * 
 * @example
 * getContrastRatio("#FFFFFF", "#000000"); // 21
 * getContrastRatio("#777777", "#FFFFFF"); // 4.48
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 1;

  const luminance1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const luminance2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 상대 휘도 계산
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * WCAG AA 기준 충족 여부 확인
 * @param contrastRatio 대비 비율
 * @param isLargeText 큰 텍스트 여부 (18pt+ 또는 14pt+ bold)
 */
export function meetsWCAGAA(contrastRatio: number, isLargeText = false): boolean {
  return isLargeText ? contrastRatio >= 3 : contrastRatio >= 4.5;
}

/**
 * WCAG AAA 기준 충족 여부 확인
 */
export function meetsWCAGAAA(contrastRatio: number, isLargeText = false): boolean {
  return isLargeText ? contrastRatio >= 4.5 : contrastRatio >= 7;
}

// ============================================================================
// Keyboard Navigation
// ============================================================================

/**
 * 방향키 탐색 헬퍼
 * @param items 탐색할 아이템들
 * @param currentIndex 현재 인덱스
 * @param direction 방향
 */
export function getNextIndex(
  items: unknown[],
  currentIndex: number,
  direction: "next" | "prev" | "first" | "last"
): number {
  const maxIndex = items.length - 1;

  switch (direction) {
    case "next":
      return currentIndex >= maxIndex ? 0 : currentIndex + 1;
    case "prev":
      return currentIndex <= 0 ? maxIndex : currentIndex - 1;
    case "first":
      return 0;
    case "last":
      return maxIndex;
    default:
      return currentIndex;
  }
}

/**
 * 키보드 단축키 등록
 * @param key 단축키 (예: "ctrl+s", "esc", "?")
 * @param handler 핸들러
 * @returns 클린업 함수
 * 
 * @example
 * useEffect(() => {
 *   return registerShortcut("ctrl+s", () => save());
 * }, []);
 */
export function registerShortcut(key: string, handler: () => void): () => void {
  const normalizedKey = key.toLowerCase();

  const handleKeyDown = (e: KeyboardEvent) => {
    const keyCombo = [
      e.ctrlKey ? "ctrl" : "",
      e.altKey ? "alt" : "",
      e.shiftKey ? "shift" : "",
      e.metaKey ? "meta" : "",
      e.key.toLowerCase(),
    ]
      .filter(Boolean)
      .join("+");

    if (keyCombo === normalizedKey) {
      e.preventDefault();
      handler();
    }
  };

  document.addEventListener("keydown", handleKeyDown);

  return () => {
    document.removeEventListener("keydown", handleKeyDown);
  };
}

// ============================================================================
// Export
// ============================================================================

const accessibility = {
  announce,
  getFocusableElements,
  focusFirst,
  useFocusTrap,
  getSkipLinkProps,
  VISUALLY_HIDDEN_STYLE,
  createAccessibleButton,
  createAccessibleLink,
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  getNextIndex,
  registerShortcut,
};

export default accessibility;
