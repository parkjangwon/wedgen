/**
 * 국제화 유틸리티 - 다국어 지원과 번역
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export type Locale = "ko" | "en" | "ja" | "zh";

export type TranslationKey = string;

export type Translations = Record<string, string | Record<string, string>>;

export interface I18nConfig {
  defaultLocale: Locale;
  supportedLocales: Locale[];
  fallbackLocale: Locale;
}

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_CONFIG: I18nConfig = {
  defaultLocale: "ko",
  supportedLocales: ["ko", "en", "ja", "zh"],
  fallbackLocale: "ko",
};

let config: I18nConfig = { ...DEFAULT_CONFIG };
const translationStore: Map<Locale, Translations> = new Map();
let currentLocale: Locale = DEFAULT_CONFIG.defaultLocale;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * i18n 설정
 * @param newConfig 설정 객체
 */
export function configureI18n(newConfig: Partial<I18nConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * 번역 등록
 * @param locale 로케일
 * @param translations 번역 객체
 */
export function registerTranslations(locale: Locale, translations: Translations): void {
  const existing = translationStore.get(locale) ?? {};
  translationStore.set(locale, { ...existing, ...translations });
}

/**
 * 현재 로케일 설정
 * @param locale 로케일
 */
export function setLocale(locale: Locale): void {
  if (!config.supportedLocales.includes(locale)) {
    console.warn(`Unsupported locale: ${locale}`);
    return;
  }
  currentLocale = locale;

  // HTML lang 속성 업데이트
  if (typeof document !== "undefined") {
    document.documentElement.lang = locale;
  }
}

/**
 * 현재 로케일 가져오기
 */
export function getLocale(): Locale {
  return currentLocale;
}

/**
 * 브라우저 로케일 감지
 */
export function detectLocale(): Locale {
  if (typeof navigator === "undefined") return config.defaultLocale;

  const browserLang = navigator.language.split("-")[0];
  const detected = browserLang as Locale;

  if (config.supportedLocales.includes(detected)) {
    return detected;
  }

  return config.defaultLocale;
}

/**
 * 번역 가져오기
 * @param key 번역 키 (dot notation: "common.save")
 * @param params 보간 파라미터
 * @returns 번역된 문자열
 * 
 * @example
 * t("common.save"); // "저장"
 * t("hello.name", { name: "John" }); // "Hello, John"
 */
export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const translations = translationStore.get(currentLocale);

  if (!translations) {
    return key;
  }

  // Dot notation으로 중첩 객체 탐색
  const keys = key.split(".");
  let value: unknown = translations;

  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback locale 시도
      const fallbackTranslations = translationStore.get(config.fallbackLocale);
      if (fallbackTranslations) {
        let fallbackValue: unknown = fallbackTranslations;
        for (const fk of keys) {
          if (fallbackValue && typeof fallbackValue === "object" && fk in fallbackValue) {
            fallbackValue = (fallbackValue as Record<string, unknown>)[fk];
          } else {
            return key;
          }
        }
        value = fallbackValue;
      } else {
        return key;
      }
      break;
    }
  }

  if (typeof value !== "string") {
    return key;
  }

  // 보간 처리: {param} -> value
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      const paramValue = params[paramKey];
      return paramValue !== undefined ? String(paramValue) : match;
    });
  }

  return value;
}

/**
 * 복수형 처리
 * @param key 번역 키
 * @param count 개수
 * @param params 보간 파라미터
 * 
 * @example
 * n("item.count", 1); // "1 item"
 * n("item.count", 5); // "5 items"
 */
export function n(
  key: TranslationKey,
  count: number,
  params?: Record<string, string | number>
): string {
  const pluralKey = count === 1 ? `${key}_one` : `${key}_other`;
  const translation = t(pluralKey, { count, ...params });

  // Fallback: 키가 그대로 반환되면 기본 키 사용
  if (translation === pluralKey) {
    return t(key, { count, ...params });
  }

  return translation;
}

// ============================================================================
// Locale Helpers
// ============================================================================

/**
 * 로케일 표시명
 * @param locale 로케일
 */
export function getLocaleDisplayName(locale: Locale): string {
  const names: Record<Locale, string> = {
    ko: "한국어",
    en: "English",
    ja: "日本語",
    zh: "中文",
  };
  return names[locale] ?? locale;
}

/**
 * 로케별 방향
 * @param locale 로케일
 */
export function getLocaleDirection(locale: Locale): "ltr" | "rtl" {
  void locale;
  // 모든 지원 로케일은 LTR
  return "ltr";
}

/**
 * 로케별 날짜 포맷
 * @param locale 로케일
 */
export function getLocaleDateFormat(locale: Locale): string {
  const formats: Record<Locale, string> = {
    ko: "yyyy년 M월 d일",
    en: "MMMM d, yyyy",
    ja: "yyyy年M月d日",
    zh: "yyyy年M月d日",
  };
  return formats[locale] ?? formats.ko;
}

/**
 * 로케별 숫자 포맷
 * @param locale 로케일
 */
export function getLocaleNumberFormat(locale: Locale): Intl.NumberFormat {
  return new Intl.NumberFormat(locale);
}

/**
 * 로케별 통화 포맷
 * @param locale 로케일
 * @param currency 통화 코드
 */
export function getLocaleCurrencyFormat(
  locale: Locale,
  currency: string
): Intl.NumberFormat {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  });
}

// ============================================================================
// Korean Specific
// ============================================================================

/**
 * 조사 선택 (은/는, 이/가, 을/를)
 * @param word 단어
 * @param josa 조사 종류
 */
export function addJosa(word: string, josa: "은는" | "이가" | "을를" | "와과"): string {
  const lastChar = word.charCodeAt(word.length - 1);
  const hasJongseong = (lastChar - 0xac00) % 28 !== 0;

  const pairs: Record<string, [string, string]> = {
    "은는": ["은", "는"],
    "이가": ["이", "가"],
    "을를": ["을", "를"],
    "와과": ["과", "와"],
  };

  const [withJong, withoutJong] = pairs[josa];
  return word + (hasJongseong ? withJong : withoutJong);
}

// ============================================================================
// Export
// ============================================================================

const i18n = {
  configureI18n,
  registerTranslations,
  setLocale,
  getLocale,
  detectLocale,
  t,
  n,
  getLocaleDisplayName,
  getLocaleDirection,
  getLocaleDateFormat,
  getLocaleNumberFormat,
  getLocaleCurrencyFormat,
  addJosa,
};

export default i18n;
