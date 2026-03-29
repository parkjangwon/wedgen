/**
 * 로깅 유틸리티 - 구조화된 로깅과 로그 레벨 관리
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  sampleRate?: number;
}

type LogHandler = (entry: LogEntry) => void | Promise<void>;

// ============================================================================
// Configuration
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: process.env.NODE_ENV === "production" ? "info" : "debug",
  enableConsole: true,
  enableRemote: false,
  sampleRate: 1.0,
};

let config: LoggerConfig = { ...DEFAULT_CONFIG };
const handlers: LogHandler[] = [];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * 로거 설정
 * @param newConfig 설정 객체
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * 로그 핸들러 등록
 * @param handler 로그 핸들러
 */
export function addLogHandler(handler: LogHandler): () => void {
  handlers.push(handler);
  return () => {
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  };
}

/**
 * 로그 레벨 확인
 * @param level 확인할 레벨
 */
function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[config.minLevel];
}

/**
 * 샘플링 확인
 */
function shouldSample(): boolean {
  return Math.random() < (config.sampleRate ?? 1.0);
}

/**
 * 로그 엔트리 생성
 * @param level 로그 레벨
 * @param message 메시지
 * @param context 컨텍스트
 * @param error 에러
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: Error
): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error,
  };
}

/**
 * 콘솔 출력
 * @param entry 로그 엔트리
 */
function logToConsole(entry: LogEntry): void {
  const { level, message, context, error } = entry;
  const timestamp = new Date(entry.timestamp).toLocaleTimeString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  const styles: Record<LogLevel, string> = {
    debug: "color: #6b7280",
    info: "color: #3b82f6",
    warn: "color: #f59e0b",
    error: "color: #ef4444",
    fatal: "color: #dc2626; font-weight: bold",
  };

  switch (level) {
    case "debug":
      console.debug(`%c${prefix}`, styles[level], message, context ?? "");
      break;
    case "info":
      console.info(`%c${prefix}`, styles[level], message, context ?? "");
      break;
    case "warn":
      console.warn(`%c${prefix}`, styles[level], message, context ?? "");
      break;
    case "error":
    case "fatal":
      console.error(`%c${prefix}`, styles[level], message, error ?? context ?? "");
      break;
  }
}

/**
 * 로그 전송
 * @param entry 로그 엔트리
 */
async function dispatchLog(entry: LogEntry): Promise<void> {
  if (config.enableConsole) {
    logToConsole(entry);
  }

  for (const handler of handlers) {
    try {
      await handler(entry);
    } catch (e) {
      console.error("Log handler failed:", e);
    }
  }
}

// ============================================================================
// Public API
// ============================================================================

/**
 * 디버그 로그
 * @param message 메시지
 * @param context 컨텍스트
 */
export function debug(message: string, context?: Record<string, unknown>): void {
  if (!shouldLog("debug") || !shouldSample()) return;
  dispatchLog(createLogEntry("debug", message, context));
}

/**
 * 정보 로그
 * @param message 메시지
 * @param context 컨텍스트
 */
export function info(message: string, context?: Record<string, unknown>): void {
  if (!shouldLog("info") || !shouldSample()) return;
  dispatchLog(createLogEntry("info", message, context));
}

/**
 * 경고 로그
 * @param message 메시지
 * @param context 컨텍스트
 */
export function warn(message: string, context?: Record<string, unknown>): void {
  if (!shouldLog("warn") || !shouldSample()) return;
  dispatchLog(createLogEntry("warn", message, context));
}

/**
 * 에러 로그
 * @param message 메시지
 * @param error 에러
 * @param context 컨텍스트
 */
export function error(
  message: string,
  error?: Error,
  context?: Record<string, unknown>
): void {
  if (!shouldLog("error")) return;
  dispatchLog(createLogEntry("error", message, context, error));
}

/**
 * 치명적 에러 로그
 * @param message 메시지
 * @param error 에러
 * @param context 컨텍스트
 */
export function fatal(
  message: string,
  error?: Error,
  context?: Record<string, unknown>
): void {
  if (!shouldLog("fatal")) return;
  dispatchLog(createLogEntry("fatal", message, context, error));
}

/**
 * 그룹 로그 시작
 * @param label 그룹 라벨
 */
export function group(label: string): void {
  console.group(label);
}

/**
 * 그룹 로그 종료
 */
export function groupEnd(): void {
  console.groupEnd();
}

/**
 * 시간 측정 시작
 * @param label 라벨
 */
export function time(label: string): void {
  console.time(label);
}

/**
 * 시간 측정 종료
 * @param label 라벨
 */
export function timeEnd(label: string): void {
  console.timeEnd(label);
}

/**
 * 객체 테이블 출력
 * @param data 데이터
 * @param columns 컬럼
 */
export function table(data: unknown[], columns?: string[]): void {
  console.table(data, columns);
}

// ============================================================================
// Remote Logging
// ============================================================================

/**
 * 원격 로그 전송
 * @param endpoint 엔드포인트
 */
export function createRemoteHandler(endpoint: string): LogHandler {
  const queue: LogEntry[] = [];
  let flushTimer: ReturnType<typeof setTimeout> | null = null;

  const flush = async (): Promise<void> => {
    if (queue.length === 0) return;

    const batch = queue.splice(0, 10);

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ logs: batch }),
        keepalive: true,
      });
    } catch (e) {
      console.error("Failed to send logs:", e);
    }

    if (queue.length > 0) {
      flushTimer = setTimeout(flush, 1000);
    }
  };

  return (entry: LogEntry) => {
    queue.push(entry);

    if (queue.length >= 10) {
      if (flushTimer) {
        clearTimeout(flushTimer);
        flushTimer = null;
      }
      flush();
    } else if (!flushTimer) {
      flushTimer = setTimeout(flush, 5000);
    }
  };
}

// ============================================================================
// Export
// ============================================================================

export default {
  configureLogger,
  addLogHandler,
  debug,
  info,
  warn,
  error,
  fatal,
  group,
  groupEnd,
  time,
  timeEnd,
  table,
  createRemoteHandler,
};
