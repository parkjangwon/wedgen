/**
 * 날짜/시간 유틸리티 - 날짜 포맷, 계산, 유효성 검사
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type DateInput = Date | string | number;

export interface DateRange {
  start: Date;
  end: Date;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number; // milliseconds
}

// ============================================================================
// Parsing & Conversion
// ============================================================================

/**
 * 입력값을 Date 객체로 변환
 * @param input 날짜 입력
 */
export function toDate(input: DateInput): Date {
  if (input instanceof Date) return input;
  return new Date(input);
}

/**
 * 날짜가 유효한지 확인
 * @param input 날짜 입력
 */
export function isValidDate(input: DateInput): boolean {
  const date = toDate(input);
  return !isNaN(date.getTime());
}

/**
 * 날짜를 ISO 문자열로 변환 (시간 제외)
 * @param input 날짜 입력
 */
export function toISODate(input: DateInput): string {
  return toDate(input).toISOString().split("T")[0]!;
}

/**
 * 날짜를 ISO 문자열로 변환 (시간 포함)
 * @param input 날짜 입력
 */
export function toISODateTime(input: DateInput): string {
  return toDate(input).toISOString();
}

/**
 * 한국 날짜 문자열 파싱 (yyyy.MM.dd, yyyy-MM-dd 등)
 * @param input 날짜 문자열
 */
export function parseKoreanDate(input: string): Date | null {
  const clean = input.replace(/[^\d]/g, "");

  if (clean.length === 8) {
    const year = parseInt(clean.slice(0, 4), 10);
    const month = parseInt(clean.slice(4, 6), 10) - 1;
    const day = parseInt(clean.slice(6, 8), 10);
    return new Date(year, month, day);
  }

  return null;
}

/**
 * 한국 시간 문자열 파싱 (HH:mm)
 * @param input 시간 문자열
 */
export function parseTime(input: string): { hours: number; minutes: number } | null {
  const match = input.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;

  const hours = parseInt(match[1]!, 10);
  const minutes = parseInt(match[2]!, 10);

  if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
    return { hours, minutes };
  }

  return null;
}

// ============================================================================
// Formatting
// ============================================================================

const WEEKDAY_NAMES = ["일", "월", "화", "수", "목", "금", "토"];

/**
 * 한국 날짜 포맷 (yyyy년 M월 d일)
 * @param input 날짜 입력
 */
export function formatDate(input: DateInput): string {
  const date = toDate(input);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

/**
 * 한국 날짜 요일 포맷 (yyyy년 M월 d일 (요일))
 * @param input 날짜 입력
 */
export function formatDateWithDay(input: DateInput): string {
  const date = toDate(input);
  const weekday = WEEKDAY_NAMES[date.getDay()];
  return `${formatDate(input)} (${weekday})`;
}

/**
 * 시간 포맷 (HH:mm)
 * @param input 날짜 입력
 */
export function formatTime(input: DateInput): string {
  const date = toDate(input);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * 날짜 시간 포맷
 * @param input 날짜 입력
 */
export function formatDateTime(input: DateInput): string {
  return `${formatDate(input)} ${formatTime(input)}`;
}

/**
 * 상대적 시간 표시 (방금, 5분 전, 1시간 전 등)
 * @param input 날짜 입력
 */
export function formatRelativeTime(input: DateInput): string {
  const date = toDate(input);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 10) return "방금";
  if (seconds < 60) return `${seconds}초 전`;
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  if (days < 7) return `${days}일 전`;

  return formatDate(input);
}

// ============================================================================
// Calculations
// ============================================================================

/**
 * 두 날짜 간 일수 계산
 * @param from 시작 날짜
 * @param to 종료 날짜
 */
export function daysBetween(from: DateInput, to: DateInput): number {
  const start = toDate(from);
  const end = toDate(to);

  // 시간 제거
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * 남은 시간 계산
 * @param targetDate 목표 날짜
 */
export function getTimeLeft(targetDate: DateInput): TimeLeft {
  const target = toDate(targetDate);
  const now = new Date();
  const total = target.getTime() - now.getTime();

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total };
}

/**
 * 남은 시간 포맷 (D일 HH:mm:ss)
 * @param targetDate 목표 날짜
 */
export function formatTimeLeft(targetDate: DateInput): string {
  const { days, hours, minutes, seconds } = getTimeLeft(targetDate);

  if (days > 0) {
    return `${days}일 ${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/**
 * 나이 계산 (만 나이)
 * @param birthDate 생일
 * @param baseDate 기준 날짜 (기본값: 오늘)
 */
export function calculateAge(birthDate: DateInput, baseDate?: DateInput): number {
  const birth = toDate(birthDate);
  const base = baseDate ? toDate(baseDate) : new Date();

  let age = base.getFullYear() - birth.getFullYear();
  const monthDiff = base.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && base.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * 디데이 계산
 * @param targetDate 목표 날짜
 * @param fromDate 시작 날짜 (기본값: 오늘)
 */
export function calculateDday(targetDate: DateInput, fromDate?: DateInput): number {
  return daysBetween(fromDate ?? new Date(), targetDate);
}

// ============================================================================
// Manipulation
// ============================================================================

/**
 * 날짜에 일수 더하기
 * @param input 날짜
 * @param days 일수
 */
export function addDays(input: DateInput, days: number): Date {
  const date = toDate(input);
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
}

/**
 * 날짜에 개월수 더하기
 * @param input 날짜
 * @param months 개월수
 */
export function addMonths(input: DateInput, months: number): Date {
  const date = toDate(input);
  const result = new Date(date);
  result.setMonth(date.getMonth() + months);
  return result;
}

/**
 * 날짜에 연수 더하기
 * @param input 날짜
 * @param years 연수
 */
export function addYears(input: DateInput, years: number): Date {
  const date = toDate(input);
  const result = new Date(date);
  result.setFullYear(date.getFullYear() + years);
  return result;
}

/**
 * 시작/종료 날짜의 모든 날짜 배열 생성
 * @param start 시작
 * @param end 종료
 */
export function getDatesInRange(start: DateInput, end: DateInput): Date[] {
  const dates: Date[] = [];
  let current = toDate(start);
  const endDate = toDate(end);

  while (current <= endDate) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }

  return dates;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * 날짜 범위 유효성 검사
 * @param start 시작
 * @param end 종료
 */
export function isValidDateRange(start: DateInput, end: DateInput): boolean {
  return toDate(start) <= toDate(end);
}

/**
 * 날짜가 오늘인지 확인
 * @param input 날짜
 */
export function isToday(input: DateInput): boolean {
  const date = toDate(input);
  const today = new Date();
  return toISODate(date) === toISODate(today);
}

/**
 * 날짜가 미래인지 확인
 * @param input 날짜
 */
export function isFuture(input: DateInput): boolean {
  return toDate(input) > new Date();
}

/**
 * 날짜가 과거인지 확인
 * @param input 날짜
 */
export function isPast(input: DateInput): boolean {
  return toDate(input) < new Date();
}

// ============================================================================
// Export
// ============================================================================

const datetime = {
  toDate,
  isValidDate,
  toISODate,
  toISODateTime,
  parseKoreanDate,
  parseTime,
  formatDate,
  formatDateWithDay,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  daysBetween,
  getTimeLeft,
  formatTimeLeft,
  calculateAge,
  calculateDday,
  addDays,
  addMonths,
  addYears,
  getDatesInRange,
  isValidDateRange,
  isToday,
  isFuture,
  isPast,
};

export default datetime;
