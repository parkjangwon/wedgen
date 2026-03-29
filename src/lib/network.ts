/**
 * 네트워크 유틸리티 - HTTP 요청, 재시도, 캐싱
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface FetchOptions extends Omit<RequestInit, "cache"> {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
  cache?: boolean;
  cacheTtl?: number;
}

export interface HttpError extends Error {
  status: number;
  statusText: string;
  response?: Response;
}

// ============================================================================
// Error Class
// ============================================================================

/**
 * HTTP 에러
 */
export class HttpRequestError extends Error implements HttpError {
  status: number;
  statusText: string;
  response?: Response;

  constructor(response: Response, message?: string) {
    super(message || `HTTP ${response.status}: ${response.statusText}`);
    this.name = "HttpRequestError";
    this.status = response.status;
    this.statusText = response.statusText;
    this.response = response;
  }
}

// ============================================================================
// Core Fetch Function
// ============================================================================

const cache = new Map<string, { data: unknown; expiresAt: number }>();

/**
 * 향상된 fetch
 * @param url URL
 * @param options 옵션
 */
export async function fetchWithConfig(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    retries = 0,
    retryDelay = 1000,
    timeout = 30000,
    cache: useCache = false,
    cacheTtl = 5 * 60 * 1000,
    ...fetchOptions
  } = options;

  // 캐시 체크
  const cacheKey = `${url}:${JSON.stringify(fetchOptions)}`;
  if (useCache && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey)!;
    if (Date.now() < cached.expiresAt) {
      return new Response(JSON.stringify(cached.data), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    cache.delete(cacheKey);
  }

  // 타임아웃 컨트롤러
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  const attempt = async (remainingRetries: number): Promise<Response> => {
    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new HttpRequestError(response);
      }

      // 캐시 저장
      if (useCache) {
        const cloned = response.clone();
        cloned.json().then((data) => {
          cache.set(cacheKey, { data, expiresAt: Date.now() + cacheTtl });
        });
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (remainingRetries > 0 && shouldRetry(error)) {
        await delay(retryDelay);
        return attempt(remainingRetries - 1);
      }

      throw error;
    }
  };

  return attempt(retries);
}

/**
 * 재시도 대상 에러인지 확인
 */
function shouldRetry(error: unknown): boolean {
  if (error instanceof HttpRequestError) {
    return error.status >= 500 || error.status === 429;
  }
  return error instanceof TypeError; // Network errors
}

/**
 * 지연 함수
 * @param ms 밀리초
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// HTTP Methods
// ============================================================================

/**
 * GET 요청
 * @param url URL
 * @param options 옵션
 */
export async function get<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetchWithConfig(url, { method: "GET", ...options });
  return response.json() as Promise<T>;
}

/**
 * POST 요청
 * @param url URL
 * @param data 데이터
 * @param options 옵션
 */
export async function post<T>(
  url: string,
  data: unknown,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithConfig(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    ...options,
  });
  return response.json() as Promise<T>;
}

/**
 * PUT 요청
 * @param url URL
 * @param data 데이터
 * @param options 옵션
 */
export async function put<T>(
  url: string,
  data: unknown,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithConfig(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    ...options,
  });
  return response.json() as Promise<T>;
}

/**
 * PATCH 요청
 * @param url URL
 * @param data 데이터
 * @param options 옵션
 */
export async function patch<T>(
  url: string,
  data: unknown,
  options?: FetchOptions
): Promise<T> {
  const response = await fetchWithConfig(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    ...options,
  });
  return response.json() as Promise<T>;
}

/**
 * DELETE 요청
 * @param url URL
 * @param options 옵션
 */
export async function del<T>(url: string, options?: FetchOptions): Promise<T> {
  const response = await fetchWithConfig(url, { method: "DELETE", ...options });
  return response.json() as Promise<T>;
}

// ============================================================================
// Query String
// ============================================================================

/**
 * 쿼리 문자열 생성
 * @param params 파라미터 객체
 */
export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

/**
 * 쿼리 문자열 파싱
 * @param queryString 쿼리 문자열
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString.replace(/^\?/, ""));
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

// ============================================================================
// Cache Management
// ============================================================================

/**
 * 캐시 클리어
 * @param pattern 패턴 (선택적)
 */
export function clearCache(pattern?: string): void {
  if (pattern) {
    const regex = new RegExp(pattern);
    for (const key of cache.keys()) {
      if (regex.test(key)) {
        cache.delete(key);
      }
    }
  } else {
    cache.clear();
  }
}

// ============================================================================
// Export
// ============================================================================

export default {
  fetch: fetchWithConfig,
  get,
  post,
  put,
  patch,
  delete: del,
  buildQueryString,
  parseQueryString,
  clearCache,
  HttpRequestError,
};
