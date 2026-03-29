export interface GasValidationResult {
  ok: boolean;
  status?: number;
  message: string;
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

  try {
    const response = await fetch(parsedUrl, {
      method: "GET",
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
