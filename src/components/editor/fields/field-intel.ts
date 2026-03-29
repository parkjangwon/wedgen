export const fieldSuggestions: Record<string, string[]> = {
  greetingTitle: [
    "소중한 분들을 초대합니다",
    "저희 두 사람의 결혼식에 초대합니다",
    "기쁜 날, 함께해 주세요",
  ],
  countdownLabel: [
    "저희의 결혼식이",
    "설레는 예식까지",
    "두 사람의 첫날까지",
  ],
  accountTitle: [
    "마음 전하실 곳",
    "축하의 마음을 전하실 곳",
    "따뜻한 마음 전하기",
  ],
  guestbookTitle: [
    "축복의 한마디",
    "방명록",
    "축하 메시지",
  ],
  endingTitle: [
    "저희의 첫 장면을 함께해 주세요",
    "함께해 주시는 마음 오래도록 간직하겠습니다",
    "기억에 남을 하루를 함께해 주세요",
  ],
  heroTagline: [
    "서로의 계절이 된 두 사람이 평생의 약속을 나눕니다.",
    "가장 다정한 오늘을 함께 맞이합니다.",
  ],
  greeting: [
    "서로 다른 시간과 취향으로 살아온 두 사람이 같은 방향을 바라보게 되었습니다. 따뜻한 축복으로 함께해 주세요.",
    "작은 만남이 사랑의 결실을 이루어 평생의 첫 장면을 함께하게 되었습니다. 귀한 걸음으로 축복해 주시면 오래도록 소중히 간직하겠습니다.",
  ],
  familyNote: [
    "양가 부모님과 함께 감사한 마음으로 초대의 말씀을 전합니다.",
    "귀한 걸음으로 함께해 주시면 두 사람과 양가 가족에게 큰 기쁨이 됩니다.",
  ],
  scheduleNote: [
    "예식 종료 후 같은 층 연회장에서 식사가 이어집니다.",
    "식사는 예식 이후 연회장에서 편안하게 준비되어 있습니다.",
  ],
  navigationNote: [
    "익숙한 내비 앱으로 바로 길안내를 시작해 보세요.",
    "아래 버튼으로 길안내를 바로 시작할 수 있습니다.",
  ],
  guestbookLead: [
    "멀리서 전해주시는 축하도 오래도록 소중히 간직하겠습니다.",
    "따뜻한 메시지를 남겨주시면 오래도록 기억하겠습니다.",
  ],
  endingQuote: [
    "서로의 오늘을 가장 다정한 내일로 이어가겠습니다. 함께해 주시는 마음 오래도록 기억하겠습니다.",
    "처음의 설렘과 고마움을 오래도록 잊지 않고, 다정한 부부로 살아가겠습니다.",
  ],
};

export function validateFieldValue(
  fieldKey: string,
  value: unknown,
  required?: boolean,
): string | null {
  if (required) {
    if (Array.isArray(value) && value.length === 0) {
      return "필수 항목을 입력해 주세요.";
    }
    if (value && typeof value === "object") {
      const hasValue = Object.values(value).some(Boolean);
      if (!hasValue) {
        return "필수 항목을 입력해 주세요.";
      }
    }
    if (!Array.isArray(value) && (!value || String(value).trim() === "")) {
      return "필수 항목을 입력해 주세요.";
    }
  }

  if (
    ["guestbookUrl", "rsvpUrl", "googleFontUrl"].includes(fieldKey) &&
    value &&
    String(value).trim() !== ""
  ) {
    try {
      const url = new URL(String(value));
      if (!["http:", "https:"].includes(url.protocol)) {
        return "http 또는 https URL만 사용할 수 있습니다.";
      }
    } catch {
      return "올바른 URL 형식으로 입력해 주세요.";
    }
  }

  if (fieldKey === "venuePhone" && value && String(value).trim() !== "") {
    const normalized = String(value).replace(/[^0-9-]/g, "");
    if (normalized.length < 9) {
      return "전화번호 형식이 너무 짧습니다.";
    }
  }

  if (fieldKey === "mapCoords" && value && typeof value === "object") {
    const { lat, lng } = value as { lat?: string; lng?: string };
    if ((lat && Number.isNaN(Number(lat))) || (lng && Number.isNaN(Number(lng)))) {
      return "좌표는 숫자로 입력해 주세요.";
    }
  }

  return null;
}
