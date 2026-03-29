export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone.replace(/-/g, ""));
}

export function validateUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function validateRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

export function validateMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function validateMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

export function validateRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

export function validatePattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

export function validateDate(date: string): boolean {
  const d = new Date(date);
  return !isNaN(d.getTime());
}

export function validateFutureDate(date: string): boolean {
  const d = new Date(date);
  const now = new Date();
  return !isNaN(d.getTime()) && d > now;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  phone?: boolean;
  url?: boolean;
  date?: boolean;
  futureDate?: boolean;
  custom?: (value: unknown) => boolean;
}

export function validateField(
  value: unknown,
  rules: ValidationRule
): string | null {
  if (rules.required && !validateRequired(value)) {
    return "필수 입력 항목입니다.";
  }

  if (typeof value === "string") {
    if (rules.minLength && !validateMinLength(value, rules.minLength)) {
      return `최소 ${rules.minLength}자 이상 입력해주세요.`;
    }

    if (rules.maxLength && !validateMaxLength(value, rules.maxLength)) {
      return `최대 ${rules.maxLength}자까지 입력 가능합니다.`;
    }

    if (rules.email && !validateEmail(value)) {
      return "유효한 이메일 주소를 입력해주세요.";
    }

    if (rules.phone && !validatePhone(value)) {
      return "유효한 전화번호를 입력해주세요.";
    }

    if (rules.url && !validateUrl(value)) {
      return "유효한 URL을 입력해주세요.";
    }

    if (rules.date && !validateDate(value)) {
      return "유효한 날짜를 입력해주세요.";
    }

    if (rules.futureDate && !validateFutureDate(value)) {
      return "미래 날짜를 선택해주세요.";
    }

    if (rules.pattern && !validatePattern(value, rules.pattern)) {
      return "입력 형식이 올바르지 않습니다.";
    }
  }

  if (rules.custom && !rules.custom(value)) {
    return "입력값이 유효하지 않습니다.";
  }

  return null;
}
