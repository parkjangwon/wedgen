/**
 * 테스트 유틸리티 - 테스트 헬퍼 함수와 모의 객체 생성
 */

// ============================================================================
// Mock Data Generators
// ============================================================================

/**
 * 랜덤 문자열 생성
 * @param length 길이
 */
export function generateRandomString(length = 10): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join(
    ""
  );
}

/**
 * 랜덤 이메일 생성
 */
export function generateRandomEmail(): string {
  return `${generateRandomString(8)}@example.com`;
}

/**
 * 랜덤 날짜 생성
 * @param start 시작 날짜
 * @param end 종료 날짜
 */
export function generateRandomDate(start = new Date(2020, 0, 1), end = new Date()): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

/**
 * 랜덤 전화번호 생성 (한국 형식)
 */
export function generateRandomPhone(): string {
  const middle = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0");
  const last = String(Math.floor(Math.random() * 9000) + 1000).padStart(4, "0");
  return `010-${middle}-${last}`;
}

// ============================================================================
// Mock Functions
// ============================================================================

/**
 * 지연 Promise 생성
 * @param ms 지연 시간 (ms)
 * @param value 반환값
 */
export function delay<T>(ms: number, value?: T): Promise<T | undefined> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

/**
 * reject Promise 생성
 * @param ms 지연 시간 (ms)
 * @param error 에러
 */
export function delayReject(ms: number, error: Error): Promise<never> {
  return new Promise((_, reject) => setTimeout(() => reject(error), ms));
}

/**
 * 모의 fetch 응답 생성
 * @param data 응답 데이터
 * @param status HTTP 상태 코드
 */
export function createMockResponse<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * 모의 파일 생성
 * @param name 파일명
 * @param size 파일 크기 (bytes)
 * @param type MIME 타입
 */
export function createMockFile(name: string, size = 1024, type = "image/jpeg"): File {
  const blob = new Blob([new ArrayBuffer(size)], { type });
  return new File([blob], name, { type });
}

// ============================================================================
// Test Helpers
// ============================================================================

/**
 * localStorage 모의 객체
 */
export function createMockLocalStorage(): Storage {
  const storage: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(storage).length;
    },
    getItem: (key: string) => storage[key] ?? null,
    setItem: (key: string, value: string) => {
      storage[key] = value;
    },
    removeItem: (key: string) => {
      delete storage[key];
    },
    clear: () => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    },
    key: (index: number) => Object.keys(storage)[index] ?? null,
  } as Storage;
}

/**
 * matchMedia 모의 객체
 * @param matches 매치 여부
 */
export function createMockMatchMedia(matches = false): (query: string) => MediaQueryList {
  return () =>
    ({
      matches,
      media: "",
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
    }) as MediaQueryList;
}

/**
 * IntersectionObserver 모의 클래스
 */
export class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Element[] = [];

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe(element: Element): void {
    this.elements.push(element);
  }

  unobserve(element: Element): void {
    this.elements = this.elements.filter((el) => el !== element);
  }

  disconnect(): void {
    this.elements = [];
  }

  trigger(entries: IntersectionObserverEntry[]): void {
    this.callback(entries, this as unknown as IntersectionObserver);
  }
}

/**
 * ResizeObserver 모의 클래스
 */
export class MockResizeObserver {
  callback: ResizeObserverCallback;
  elements: Element[] = [];

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe(element: Element): void {
    this.elements.push(element);
  }

  unobserve(element: Element): void {
    this.elements = this.elements.filter((el) => el !== element);
  }

  disconnect(): void {
    this.elements = [];
  }

  trigger(entries: ResizeObserverEntry[]): void {
    this.callback(entries, this as unknown as ResizeObserver);
  }
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * 에러 발생 여부 확인
 * @param fn 실행할 함수
 * @param errorClass 예상 에러 클래스
 */
export async function expectToThrow<T extends Error>(
  fn: () => unknown,
  errorClass?: new (...args: unknown[]) => T
): Promise<void> {
  try {
    await fn();
    throw new Error("Expected function to throw");
  } catch (error) {
    if (errorClass && !(error instanceof errorClass)) {
      throw new Error(`Expected ${errorClass.name} but got ${(error as Error).constructor.name}`);
    }
  }
}

/**
 * Promise 타임아웃
 * @param promise Promise
 * @param ms 타임아웃 (ms)
 */
export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout after ${ms}ms`)), ms)
    ),
  ]);
}

/**
 * 이벤트 발생 대기
 * @param element 요소
 * @param eventName 이벤트명
 * @param timeout 타임아웃 (ms)
 */
export function waitForEvent(
  element: EventTarget,
  eventName: string,
  timeout = 5000
): Promise<Event> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Timeout waiting for ${eventName}`));
    }, timeout);

    element.addEventListener(
      eventName,
      (event) => {
        clearTimeout(timer);
        resolve(event);
      },
      { once: true }
    );
  });
}

// ============================================================================
// Component Test Helpers
// ============================================================================

/**
 * 텍스트 콘텐츠로 요소 찾기
 * @param container 컨테이너
 * @param text 텍스트
 */
export function getByText(container: HTMLElement, text: string): HTMLElement | null {
  const elements = Array.from(container.querySelectorAll("*"));
  return (
    (elements.find((el) => el.textContent?.includes(text)) as HTMLElement | undefined) ?? null
  );
}

/**
 * aria-label로 요소 찾기
 * @param container 컨테이너
 * @param label 라벨
 */
export function getByLabel(container: HTMLElement, label: string): HTMLElement | null {
  return container.querySelector(`[aria-label="${label}"]`);
}

/**
 * 테스트 ID로 요소 찾기
 * @param container 컨테이너
 * @param testId 테스트 ID
 */
export function getByTestId(container: HTMLElement, testId: string): HTMLElement | null {
  return container.querySelector(`[data-testid="${testId}"]`);
}

/**
 * 클릭 이벤트 시뮬레이션
 * @param element 요소
 */
export function click(element: HTMLElement): void {
  const event = new MouseEvent("click", {
    bubbles: true,
    cancelable: true,
    view: window,
  });
  element.dispatchEvent(event);
}

/**
 * 입력 이벤트 시뮬레이션
 * @param element 입력 요소
 * @param value 값
 */
export function type(element: HTMLInputElement | HTMLTextAreaElement, value: string): void {
  element.value = value;
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

// ============================================================================
// Export
// ============================================================================

const testUtils = {
  generateRandomString,
  generateRandomEmail,
  generateRandomDate,
  generateRandomPhone,
  delay,
  delayReject,
  createMockResponse,
  createMockFile,
  createMockLocalStorage,
  createMockMatchMedia,
  MockIntersectionObserver,
  MockResizeObserver,
  expectToThrow,
  withTimeout,
  waitForEvent,
  getByText,
  getByLabel,
  getByTestId,
  click,
  type,
};

export default testUtils;
