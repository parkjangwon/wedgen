/**
 * 분석 유틸리티 - 이벤트 추적과 사용자 행동 분석
 */

// ============================================================================
// Browser Types
// ============================================================================

interface LayoutShift extends PerformanceEntry {
  value: number;
  hadRecentInput: boolean;
}

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, unknown>;
  timestamp: number;
  sessionId: string;
  userId?: string;
}

export interface AnalyticsConfig {
  enabled: boolean;
  endpoint?: string;
  debug: boolean;
  sampleRate: number;
  sessionTimeout: number;
}

export type EventHandler = (event: AnalyticsEvent) => void | Promise<void>;

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === "production",
  debug: process.env.NODE_ENV !== "production",
  sampleRate: 1.0,
  sessionTimeout: 30 * 60 * 1000, // 30 minutes
};

let config: AnalyticsConfig = { ...DEFAULT_CONFIG };
const handlers: EventHandler[] = [];

// ============================================================================
// Session Management
// ============================================================================

function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getSessionId(): string {
  const STORAGE_KEY = "wedgen_analytics_session";

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const { sessionId, timestamp } = JSON.parse(stored) as {
        sessionId: string;
        timestamp: number;
      };

      if (Date.now() - timestamp < config.sessionTimeout) {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ sessionId, timestamp: Date.now() })
        );
        return sessionId;
      }
    }
  } catch {
    // localStorage not available
  }

  const sessionId = generateSessionId();
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sessionId, timestamp: Date.now() })
    );
  } catch {
    // localStorage not available
  }

  return sessionId;
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * 분석 설정
 * @param newConfig 설정 객체
 */
export function configureAnalytics(newConfig: Partial<AnalyticsConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * 이벤트 핸들러 등록
 * @param handler 이벤트 핸들러
 */
export function addEventHandler(handler: EventHandler): () => void {
  handlers.push(handler);
  return () => {
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  };
}

/**
 * 샘플링 확인
 */
function shouldSample(): boolean {
  return Math.random() < config.sampleRate;
}

/**
 * 이벤트 추적
 * @param name 이벤트명
 * @param properties 속성
 */
export function track(
  name: string,
  properties?: Record<string, unknown>
): void {
  if (!config.enabled || !shouldSample()) return;

  const event: AnalyticsEvent = {
    name,
    properties,
    timestamp: Date.now(),
    sessionId: getSessionId(),
  };

  if (config.debug) {
    console.log("[Analytics]", event);
  }

  handlers.forEach((handler) => {
    try {
      handler(event);
    } catch (e) {
      console.error("Analytics handler failed:", e);
    }
  });
}

/**
 * 페이지뷰 추적
 * @param page 페이지명
 * @param properties 추가 속성
 */
export function pageview(
  page: string,
  properties?: Record<string, unknown>
): void {
  track("pageview", { page, ...properties });
}

/**
 * 사용자 식별
 * @param userId 사용자 ID
 * @param traits 사용자 속성
 */
export function identify(
  userId: string,
  traits?: Record<string, unknown>
): void {
  track("identify", { userId, traits });
}

/**
 * 타이밍 측정
 * @param category 카테고리
 * @param variable 변수
 * @param value 값 (ms)
 * @param label 라벨
 */
export function timing(
  category: string,
  variable: string,
  value: number,
  label?: string
): void {
  track("timing", { category, variable, value, label });
}

/**
 * 예외 추적
 * @param description 설명
 * @param fatal 치명적 여부
 */
export function exception(description: string, fatal = false): void {
  track("exception", { description, fatal });
}

// ============================================================================
// Performance Tracking
// ============================================================================

/**
 * 웹 바이탈 측정
 */
export function trackWebVitals(): void {
  if (typeof window === "undefined") return;

  // Largest Contentful Paint
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    if (lastEntry) {
      timing("Web Vitals", "LCP", lastEntry.startTime);
    }
  });
  lcpObserver.observe({ entryTypes: ["largest-contentful-paint"] });

  // First Input Delay
  const fidObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if ("processingStart" in entry) {
        timing(
          "Web Vitals",
          "FID",
          (entry as PerformanceEventTiming).processingStart - entry.startTime
        );
      }
    }
  });
  fidObserver.observe({ entryTypes: ["first-input"] });

  // Cumulative Layout Shift
  let clsValue = 0;
  const clsObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      const layoutShift = entry as LayoutShift;
      if (!layoutShift.hadRecentInput) {
        clsValue += layoutShift.value;
      }
    }
  });
  clsObserver.observe({ entryTypes: ["layout-shift"] as const });

  // 페이지 언로드 시 CLS 전송
  window.addEventListener("beforeunload", () => {
    track("Web Vitals", { metric: "CLS", value: clsValue });
  });
}

/**
 * 타이머 생성
 * @param category 카테고리
 * @param variable 변수
 * @param label 라벨
 * @returns 타이머 객체
 */
export function createTimer(
  category: string,
  variable: string,
  label?: string
): { stop: () => void } {
  const startTime = performance.now();

  return {
    stop: () => {
      const value = performance.now() - startTime;
      timing(category, variable, value, label);
    },
  };
}

// ============================================================================
// Automatic Tracking
// ============================================================================

/**
 * 클릭 이벤트 자동 추적
 * @param selector 선택자
 * @param eventName 이벤트명
 */
export function trackClicks(selector: string, eventName?: string): () => void {
  const handleClick = (e: Event) => {
    const target = e.target as HTMLElement;
    const element = target.closest(selector);

    if (element) {
      track(eventName || "click", {
        element: element.tagName,
        id: element.id,
        class: element.className,
        text: element.textContent?.slice(0, 50),
      });
    }
  };

  document.addEventListener("click", handleClick);

  return () => {
    document.removeEventListener("click", handleClick);
  };
}

/**
 * 폼 제출 자동 추적
 * @param selector 선택자
 * @param eventName 이벤트명
 */
export function trackForms(selector: string, eventName?: string): () => void {
  const handleSubmit = (e: SubmitEvent) => {
    const form = e.target as HTMLFormElement;

    if (form.matches(selector)) {
      track(eventName || "form_submit", {
        formId: form.id,
        formAction: form.action,
      });
    }
  };

  document.addEventListener("submit", handleSubmit);

  return () => {
    document.removeEventListener("submit", handleSubmit);
  };
}

// ============================================================================
// Export
// ============================================================================

const analytics = {
  configureAnalytics,
  addEventHandler,
  track,
  pageview,
  identify,
  timing,
  exception,
  trackWebVitals,
  createTimer,
  trackClicks,
  trackForms,
};

export default analytics;
