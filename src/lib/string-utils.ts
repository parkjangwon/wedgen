/**
 * 문자열 유틸리티 - 문자열 처리, 포맷, 변환
 */

// ============================================================================
// Basic Operations
// ============================================================================

/**
 * 첫 글자 대문자 변환
 * @param str 문자열
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 각 단어 첫 글자 대문자 변환
 * @param str 문자열
 */
export function titleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => capitalize(txt));
}

/**
 * 카멜 케이스 변환 (foo-bar -> fooBar)
 * @param str 문자열
 */
export function camelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
    .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

/**
 * 파스칼 케이스 변환 (foo-bar -> FooBar)
 * @param str 문자열
 */
export function pascalCase(str: string): string {
  const camel = camelCase(str);
  return capitalize(camel);
}

/**
 * 케밥 케이스 변환 (fooBar -> foo-bar)
 * @param str 문자열
 */
export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * 스네이크 케이스 변환 (fooBar -> foo_bar)
 * @param str 문자열
 */
export function snakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

// ============================================================================
// Truncation & Padding
// ============================================================================

/**
 * 문자열 자르기
 * @param str 문자열
 * @param maxLength 최대 길이
 * @param suffix 접미사
 */
export function truncate(str: string, maxLength: number, suffix = "..."): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * HTML 태그 제거
 * @param html HTML 문자열
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "");
}

/**
 * 왼쪽 패딩
 * @param str 문자열
 * @param length 길이
 * @param char 채울 문자
 */
export function padStart(str: string | number, length: number, char = " "): string {
  return String(str).padStart(length, char);
}

/**
 * 오른쪽 패딩
 * @param str 문자열
 * @param length 길이
 * @param char 채울 문자
 */
export function padEnd(str: string | number, length: number, char = " "): string {
  return String(str).padEnd(length, char);
}

// ============================================================================
// Validation
// ============================================================================

/**
 * 빈 문자열인지 확인
 * @param str 문자열
 */
export function isEmpty(str: string | null | undefined): boolean {
  return str === null || str === undefined || str.trim() === "";
}

/**
 * 이메일 형식 검사
 * @param email 이메일
 */
export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * URL 형식 검사
 * @param url URL
 */
export function isUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 전화번호 형식 검사 (한국)
 * @param phone 전화번호
 */
export function isPhoneNumber(phone: string): boolean {
  return /^01[0-9]-?\d{3,4}-?\d{4}$/.test(phone);
}

/**
 * 영문자만 포함하는지 검사
 * @param str 문자열
 */
export function isAlpha(str: string): boolean {
  return /^[a-zA-Z]+$/.test(str);
}

/**
 * 숫자만 포함하는지 검사
 * @param str 문자열
 */
export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}

/**
 * 영문자+숫자만 포함하는지 검사
 * @param str 문자열
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

// ============================================================================
// Formatting
// ============================================================================

/**
 * 천 단위 콤마 추가
 * @param num 숫자
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("ko-KR");
}

/**
 * 파일 크기 포맷 (bytes -> KB, MB, GB)
 * @param bytes 바이트
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 전화번호 포맷 (01012345678 -> 010-1234-5678)
 * @param phone 전화번호
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
  }

  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

/**
 * 주민등록번호 마스킹 (******-1******)
 * @param rrn 주민등록번호
 */
export function maskRRN(rrn: string): string {
  const cleaned = rrn.replace(/\D/g, "");

  if (cleaned.length !== 13) return rrn;

  return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 7)}******`;
}

// ============================================================================
// Slug & ID Generation
// ============================================================================

/**
 * 슬러그 생성
 * @param str 문자열
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * 랜덤 ID 생성
 * @param length 길이
 */
export function generateId(length = 8): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join(
    ""
  );
}

/**
 * UUID 생성 (v4)
 */
export function generateUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// ============================================================================
// Export
// ============================================================================

export default {
  capitalize,
  titleCase,
  camelCase,
  pascalCase,
  kebabCase,
  snakeCase,
  truncate,
  stripHtml,
  padStart,
  padEnd,
  isEmpty,
  isEmail,
  isUrl,
  isPhoneNumber,
  isAlpha,
  isNumeric,
  isAlphanumeric,
  formatNumber,
  formatFileSize,
  formatPhone,
  maskRRN,
  slugify,
  generateId,
  generateUUID,
};
