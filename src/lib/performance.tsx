/** @fileOverview 성능 유틸리티 - 메모이제이션, 지연 로딩, 메모리 관리 */

import * as React from "react";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LazyLoadOptions {
  rootMargin?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

export interface MemoizeOptions {
  maxSize?: number;
  ttl?: number;
}

// ============================================================================
// Lazy Loading
// ============================================================================

/**
 * 지연 로딩 훅 - Intersection Observer 기반
 * @param options 옵션
 * @returns [ref, isIntersecting, hasIntersected]
 * 
 * @example
 * const [ref, isVisible] = useLazyLoad({ threshold: 0.1 });
 * 
 * return (
 *   <div ref={ref}>
 *     {isVisible && <HeavyComponent />}
 *   </div>
 * );
 */
export function useLazyLoad(options: LazyLoadOptions = {}): [
  React.RefObject<HTMLDivElement | null>,
  boolean,
  boolean
] {
  const { rootMargin = "50px", threshold = 0, triggerOnce = true } = options;
  const ref = React.useRef<HTMLDivElement>(null);
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);

  React.useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsIntersecting(true);
          setHasIntersected(true);

          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [rootMargin, threshold, triggerOnce]);

  return [ref, isIntersecting, hasIntersected];
}

// ============================================================================
// Memory Management
// ============================================================================

/**
 * LRU (Least Recently Used) 캐시 구현
 */
export class LRUCache<K, V> {
  private cache: Map<K, CacheEntry<V>>;
  private maxSize: number;
  private ttl: number;

  constructor(options: MemoizeOptions = {}) {
    this.maxSize = options.maxSize ?? 100;
    this.ttl = options.ttl ?? 5 * 60 * 1000; // 5 minutes default
    this.cache = new Map();
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);

    if (!entry) return undefined;

    // 만료 확인
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // LRU: 최근 사용으로 이동
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.value;
  }

  set(key: K, value: V): void {
    // 용량 초과 시 가장 오래된 항목 제거
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttl,
    });
  }

  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  get size(): number {
    return this.cache.size;
  }
}

/**
 * 메모이제이션 함수 생성
 * @param fn 메모이제이션할 함수
 * @param options 옵션
 * @returns 메모이제이션된 함수
 * 
 * @example
 * const expensiveOperation = memoize((n: number) => {
 *   console.log('Computing...');
 *   return n * n;
 * });
 * 
 * expensiveOperation(5); // Computing... 25
 * expensiveOperation(5); // 25 (캐시됨)
 */
export function memoize<T extends (...args: unknown[]) => unknown>(
  fn: T,
  options: MemoizeOptions = {}
): T {
  const cache = new LRUCache<string, ReturnType<T>>(options);

  return ((...args: unknown[]): ReturnType<T> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const result = fn(...args) as ReturnType<T>;
    cache.set(key, result);
    return result;
  }) as T;
}

// ============================================================================
// Performance Measurement
// ============================================================================

/**
 * 성능 측정 데코레이터
 * @param fn 측정할 함수
 * @param label 콘솔에 표시할 레이블
 * @returns 래핑된 함수
 */
export function measurePerformance<T extends (...args: unknown[]) => unknown>(
  fn: T,
  label: string
): T {
  return ((...args: unknown[]): ReturnType<T> => {
    const start = performance.now();
    const result = fn(...args) as ReturnType<T>;
    const end = performance.now();

    console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);

    return result;
  }) as T;
}

/**
 * React 컴포넌트 렌더링 시간 측정 훅
 */
export function useRenderCount(componentName: string): number {
  React.useEffect(() => {
    console.log(`[Render] ${componentName} rendered`);
  }, [componentName]);

  return 0;
}

// ============================================================================
// Resource Loading
// ============================================================================

/**
 * 스크립트 동적 로드
 * @param src 스크립트 URL
 * @param async 비동기 로드 여부
 * @returns Promise<void>
 */
export function loadScript(src: string, async = true): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 로드됨
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = src;
    script.async = async;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));

    document.head.appendChild(script);
  });
}

/**
 * 스타일시트 동적 로드
 * @param href 스타일시트 URL
 * @returns Promise<void>
 */
export function loadStylesheet(href: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // 이미 로드됨
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));

    document.head.appendChild(link);
  });
}

// ============================================================================
// Bundle Optimization
// ============================================================================

/**
 * 로딩 스피너 컴포넌트
 */
function LoadingSpinner(): React.ReactElement {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
    </div>
  );
}

/**
 * 코드 스플리팅용 동적 임포트 래퍼
 * @param importFn 동적 임포트 함수
 * @param fallback 로딩 중 표시할 컴포넌트
 * @returns 로드된 컴포넌트 또는 fallback
 */
export function withLazyLoad<T>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ReactNode
): React.FC<T> {
  const LazyComponent = React.lazy(importFn);

  const WrappedComponent: React.FC<T> = (props) => {
    return (
      <React.Suspense fallback={fallback || <LoadingSpinner />}>
        <LazyComponent {...(props as T & React.JSX.IntrinsicAttributes)} />
      </React.Suspense>
    );
  };

  return WrappedComponent;
}

/**
 * 프리로드 힌트 추가
 * @param href 리소스 URL
 * @param as 리소스 타입
 */
export function preloadResource(href: string, as: "script" | "style" | "image" | "font"): void {
  const link = document.createElement("link");
  link.rel = "preload";
  link.href = href;
  link.as = as;

  if (as === "font") {
    link.crossOrigin = "anonymous";
  }

  document.head.appendChild(link);
}

/**
 * 프리페치 힌트 추가
 * @param href 리소스 URL
 */
export function prefetchResource(href: string): void {
  const link = document.createElement("link");
  link.rel = "prefetch";
  link.href = href;
  document.head.appendChild(link);
}

// ============================================================================
// Export
// ============================================================================

const performanceUtils = {
  useLazyLoad,
  LRUCache,
  memoize,
  measurePerformance,
  useRenderCount,
  loadScript,
  loadStylesheet,
  withLazyLoad,
  preloadResource,
  prefetchResource,
};

export default performanceUtils;
