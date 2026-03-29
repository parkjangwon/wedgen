export interface GasValidationResult {
  ok: boolean;
  status?: number;
  message: string;
}

const ALLOWED_HOSTS = [
  "script.google.com",
  "script.googleusercontent.com",
  "docs.google.com",
  "forms.gle",
  "docs.google.com",
];

function isPrivateIp(hostname: string): boolean {
  const privatePatterns = [
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^0\./,
    /^::1$/,
    /^fc00:/i,
    /^fe80:/i,
  ];
  return privatePatterns.some((pattern) => pattern.test(hostname));
}

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOSTS.some(
    (allowed) => hostname === allowed || hostname.endsWith(`.${allowed}`),
  );
}

export async function validateGasUrl(url: string): Promise<GasValidationResult> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      ok: false,
      message: "올바른 URL 형식이 아닙니다.",
    };
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return {
      ok: false,
      message: "http 또는 https URL만 검증할 수 있습니다.",
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (isPrivateIp(hostname)) {
    return {
      ok: false,
      message: "낶부 네트워크 주소는 검증할 수 없습니다.",
    };
  }

  if (!isAllowedHost(hostname)) {
    return {
      ok: false,
      message: "Google Apps Script 또는 Google Forms URL만 검증할 수 있습니다.",
    };
  }

  try {
    const response = await fetch(parsedUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });

    return {
      ok: response.ok,
      status: response.status,
      message: response.ok
        ? "접근 가능한 GAS 엔드포인트입니다."
        : `응답 상태가 ${response.status} 입니다.`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "GAS URL에 연결할 수 없습니다.",
    };
  }
}
