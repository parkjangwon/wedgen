/**
 * 컬렉션 유틸리티 - 배열과 객체 처리
 */

// ============================================================================
// Array Operations
// ============================================================================

/**
 * 배열을 청크로 분할
 * @param arr 배열
 * @param size 청크 크기
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * 중복 제거
 * @param arr 배열
 * @param keyFn 키 추출 함수 (선택적)
 */
export function unique<T>(arr: T[], keyFn?: (item: T) => unknown): T[] {
  if (!keyFn) {
    return [...new Set(arr)];
  }

  const seen = new Set<unknown>();
  return arr.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * 그룹화
 * @param arr 배열
 * @param keyFn 키 추출 함수
 */
export function groupBy<T, K extends string | number | symbol>(
  arr: T[],
  keyFn: (item: T) => K
): Record<K, T[]> {
  return arr.reduce(
    (acc, item) => {
      const key = keyFn(item);
      acc[key] = acc[key] ?? [];
      acc[key].push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
}

/**
 * 정렬 (다중 키 지원)
 * @param arr 배열
 * @param keys 정렬 키
 */
export function sortBy<T>(
  arr: T[],
  ...keys: Array<{ key: keyof T; order?: "asc" | "desc" }>
): T[] {
  return [...arr].sort((a, b) => {
    for (const { key, order = "asc" } of keys) {
      const aVal = a[key];
      const bVal = b[key];

      if (aVal === bVal) continue;

      const comparison = aVal < bVal ? -1 : 1;
      return order === "asc" ? comparison : -comparison;
    }
    return 0;
  });
}

/**
 * 평탄화
 * @param arr 중첩 배열
 * @param depth 깊이
 */
export function flatten<T>(arr: unknown[], depth = 1): T[] {
  return arr.flat(depth) as T[];
}

/**
 * 무작위 섞기 (Fisher-Yates)
 * @param arr 배열
 */
export function shuffle<T>(arr: T[]): T[] {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 차이 찾기
 * @param arr1 배열 1
 * @param arr2 배열 2
 */
export function difference<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => !set2.has(item));
}

/**
 * 교집합
 * @param arr1 배열 1
 * @param arr2 배열 2
 */
export function intersection<T>(arr1: T[], arr2: T[]): T[] {
  const set2 = new Set(arr2);
  return arr1.filter((item) => set2.has(item));
}

/**
 * 합집합
 * @param arr1 배열 1
 * @param arr2 배열 2
 */
export function union<T>(arr1: T[], arr2: T[]): T[] {
  return [...new Set([...arr1, ...arr2])];
}

// ============================================================================
// Object Operations
// ============================================================================

/**
 * 객체 깊은 복사
 * @param obj 객체
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
  if (Array.isArray(obj)) return obj.map(deepClone) as unknown as T;

  const cloned = {} as T;
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  return cloned;
}

/**
 * 객체 병합 (깊은 병합)
 * @param target 대상 객체
 * @param sources 소스 객체들
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Array<Partial<T>>
): T {
  const result = { ...target };

  for (const source of sources) {
    for (const key in source) {
      if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = deepMerge(
          (result[key] as Record<string, unknown>) ?? {},
          source[key] as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else {
        result[key] = source[key] as T[Extract<keyof T, string>];
      }
    }
  }

  return result;
}

/**
 * 객체 픽 (선택한 키만)
 * @param obj 객체
 * @param keys 선택할 키들
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * 객체 옴잇 (제외한 키만)
 * @param obj 객체
 * @param keys 제외할 키들
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result;
}

/**
 * 키 이름 매핑
 * @param obj 객체
 * @param keyMap 키 매핑
 */
export function mapKeys<T extends Record<string, unknown>, K extends string>(
  obj: T,
  keyMap: Record<keyof T, K>
): Record<K, T[keyof T]> {
  const result = {} as Record<K, T[keyof T]>;
  for (const oldKey in obj) {
    const newKey = keyMap[oldKey] ?? (oldKey as unknown as K);
    result[newKey] = obj[oldKey];
  }
  return result;
}

/**
 * 값 매핑
 * @param obj 객체
 * @param valueFn 값 변환 함수
 */
export function mapValues<T extends Record<string, unknown>, V>(
  obj: T,
  valueFn: (value: T[keyof T]) => V
): Record<keyof T, V> {
  const result = {} as Record<keyof T, V>;
  for (const key in obj) {
    result[key] = valueFn(obj[key]);
  }
  return result;
}

/**
 * 빈 값 제거
 * @param obj 객체
 */
export function compact<T extends Record<string, unknown>>(
  obj: T
): Partial<T> {
  const result = {} as Partial<T>;
  for (const key in obj) {
    const value = obj[key];
    if (value !== null && value !== undefined && value !== "") {
      result[key] = value;
    }
  }
  return result;
}

/**
 * 객체가 비어있는지 확인
 * @param obj 객체
 */
export function isEmpty(obj: Record<string, unknown> | unknown[]): boolean {
  if (Array.isArray(obj)) return obj.length === 0;
  return Object.keys(obj).length === 0;
}

// ============================================================================
// Export
// ============================================================================

export default {
  chunk,
  unique,
  groupBy,
  sortBy,
  flatten,
  shuffle,
  difference,
  intersection,
  union,
  deepClone,
  deepMerge,
  pick,
  omit,
  mapKeys,
  mapValues,
  compact,
  isEmpty,
};
