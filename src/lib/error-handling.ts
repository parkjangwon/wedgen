/**
 * 에러 처리 유틸리티 - 커스텀 에러 클래스와 에러 핸들링
 */

// ============================================================================
// Error Classes
// ============================================================================

/**
 * 기본 애플리케이션 에러
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code = "APP_ERROR",
    statusCode = 500,
    isOperational = true
  ) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace?.(this, this.constructor);
  }
}

/**
 * 유효성 검증 에러
 */
export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string) {
    super(message, "VALIDATION_ERROR", 400, true);
    this.name = "ValidationError";
    this.field = field;
  }
}

/**
 * 인증 에러
 */
export class AuthError extends AppError {
  constructor(message = "인증이 필요합니다") {
    super(message, "AUTH_ERROR", 401, true);
    this.name = "AuthError";
  }
}

/**
 * 권한 에러
 */
export class ForbiddenError extends AppError {
  constructor(message = "접근 권한이 없습니다") {
    super(message, "FORBIDDEN", 403, true);
    this.name = "ForbiddenError";
  }
}

/**
 * 리소스 없음 에러
 */
export class NotFoundError extends AppError {
  constructor(resource = "리소스") {
    super(`${resource}를 찾을 수 없습니다`, "NOT_FOUND", 404, true);
    this.name = "NotFoundError";
  }
}

/**
 * 중복 에러
 */
export class ConflictError extends AppError {
  constructor(message = "이미 존재하는 데이터입니다") {
    super(message, "CONFLICT", 409, true);
    this.name = "ConflictError";
  }
}

/**
 * 요청 제한 에러
 */
export class RateLimitError extends AppError {
  public readonly retryAfter?: number;

  constructor(message = "요청이 너무 많습니다", retryAfter?: number) {
    super(message, "RATE_LIMIT", 429, true);
    this.name = "RateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * 네트워크 에러
 */
export class NetworkError extends AppError {
  public readonly originalError?: Error;

  constructor(message = "네트워크 오류가 발생했습니다", originalError?: Error) {
    super(message, "NETWORK_ERROR", 0, true);
    this.name = "NetworkError";
    this.originalError = originalError;
  }
}

/**
 * 타임아웃 에러
 */
export class TimeoutError extends AppError {
  constructor(message = "요청 시간이 초과되었습니다") {
    super(message, "TIMEOUT", 408, true);
    this.name = "TimeoutError";
  }
}

// ============================================================================
// Error Types
// ============================================================================

export type ErrorCode =
  | "APP_ERROR"
  | "VALIDATION_ERROR"
  | "AUTH_ERROR"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMIT"
  | "NETWORK_ERROR"
  | "TIMEOUT";

export interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode | string;
    message: string;
    field?: string;
    details?: unknown;
  };
}

export interface ErrorHandler {
  (error: Error): void | Promise<void>;
}

// ============================================================================
// Error Handling Functions
// ============================================================================

/**
 * 에러 응답 생성
 * @param error 에러 객체
 * @returns 표준화된 에러 응답
 */
export function createErrorResponse(error: Error): ErrorResponse {
  if (error instanceof AppError) {
    return {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        field: (error as ValidationError).field,
      },
    };
  }

  return {
    success: false,
    error: {
      code: "APP_ERROR",
      message: process.env.NODE_ENV === "production" 
        ? "서버 오류가 발생했습니다" 
        : error.message,
    },
  };
}

/**
 * 에러를 HTTP 상태 코드로 변환
 * @param error 에러 객체
 * @returns HTTP 상태 코드
 */
export function getErrorStatusCode(error: Error): number {
  if (error instanceof AppError) {
    return error.statusCode;
  }
  return 500;
}

/**
 * 에러가 운영 에러인지 확인
 * @param error 에러 객체
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}

/**
 * 에러 핸들러 래퍼
 * @param fn 비동기 함수
 * @param onError 에러 핸들러
 * @returns 래핑된 함수
 */
export function withErrorHandler<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  onError?: ErrorHandler
): (...args: Parameters<T>) => Promise<ReturnType<T> | undefined> {
  return async (...args: Parameters<T>): Promise<ReturnType<T> | undefined> => {
    try {
      return (await fn(...args)) as ReturnType<T>;
    } catch (error) {
      if (onError) {
        await onError(error as Error);
      } else {
        console.error("Unhandled error:", error);
      }
      return undefined;
    }
  };
}

/**
 * 재시도 로직 포함 함수 래퍼
 * @param fn 실행할 함수
 * @param maxRetries 최대 재시도 횟수
 * @param delayMs 재시도 간격 (ms)
 */
export function withRetry<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  maxRetries = 3,
  delayMs = 1000
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return (await fn(...args)) as ReturnType<T>;
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * Math.pow(2, attempt)));
        }
      }
    }

    throw lastError!;
  };
}

/**
 * 안전한 JSON 파싱
 * @param json JSON 문자열
 * @param defaultValue 파싱 실패 시 기본값
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 안전한 함수 실행
 * @param fn 실행할 함수
 * @param defaultValue 실패 시 기본값
 */
export function safeExecute<T>(fn: () => T, defaultValue: T): T {
  try {
    return fn();
  } catch {
    return defaultValue;
  }
}

// ============================================================================
// Error Reporting
// ============================================================================

/**
 * 에러 리포터 설정
 */
export interface ErrorReporter {
  report: (error: Error, context?: Record<string, unknown>) => void;
}

let errorReporter: ErrorReporter | null = null;

/**
 * 에러 리포터 설정
 * @param reporter 에러 리포터
 */
export function setErrorReporter(reporter: ErrorReporter): void {
  errorReporter = reporter;
}

/**
 * 에러 리포트
 * @param error 에러 객체
 * @param context 컨텍스트 정보
 */
export function reportError(error: Error, context?: Record<string, unknown>): void {
  if (errorReporter) {
    errorReporter.report(error, context);
  } else {
    console.error("[Error Report]", error, context);
  }
}

// ============================================================================
// Export
// ============================================================================

export default {
  AppError,
  ValidationError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  NetworkError,
  TimeoutError,
  createErrorResponse,
  getErrorStatusCode,
  isOperationalError,
  withErrorHandler,
  withRetry,
  safeJsonParse,
  safeExecute,
  setErrorReporter,
  reportError,
};
