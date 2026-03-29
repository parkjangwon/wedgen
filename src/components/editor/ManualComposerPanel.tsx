"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const manualFields = [
  { key: "heroEyebrow", label: "표지 상단 문구", type: "text" },
  { key: "heroTitleSize", label: "표지 제목 크기", type: "text" },
  { key: "heroMetaSize", label: "표지 메타 크기", type: "text" },
  { key: "heroTagline", label: "표지 소개 문구", type: "textarea" },
  { key: "greetingTitle", label: "초대 문구 제목", type: "text" },
  { key: "sectionTitleSize", label: "섹션 제목 크기", type: "text" },
  { key: "bodyCopySize", label: "본문 크기", type: "text" },
  { key: "familyNote", label: "혼주 소개 문구", type: "textarea" },
  { key: "groomFather", label: "신랑 아버지", type: "text" },
  { key: "groomMother", label: "신랑 어머니", type: "text" },
  { key: "brideFather", label: "신부 아버지", type: "text" },
  { key: "brideMother", label: "신부 어머니", type: "text" },
  { key: "groomContact", label: "신랑 연락처", type: "text" },
  { key: "brideContact", label: "신부 연락처", type: "text" },
  { key: "galleryTitle", label: "갤러리 제목", type: "text" },
  { key: "galleryLead", label: "갤러리 소개 문구", type: "textarea" },
  { key: "scheduleTitle", label: "일정 섹션 제목", type: "text" },
  { key: "scheduleNote", label: "일정 안내 문구", type: "textarea" },
  { key: "countdownLabel", label: "카운트다운 문구", type: "text" },
  { key: "locationTitle", label: "오시는 길 제목", type: "text" },
  { key: "navigationNote", label: "길안내 안내 문구", type: "textarea" },
  { key: "hallDetail", label: "예식장 상세", type: "text" },
  { key: "venuePhone", label: "예식장 전화번호", type: "text" },
  { key: "accountTitle", label: "계좌 섹션 제목", type: "text" },
  { key: "accountIntro", label: "계좌 안내 문구", type: "textarea" },
  { key: "groomAccount", label: "신랑 계좌", type: "text" },
  { key: "groomFamilyAccount", label: "신랑측 부모 계좌", type: "text" },
  { key: "brideAccount", label: "신부 계좌", type: "text" },
  { key: "brideFamilyAccount", label: "신부측 부모 계좌", type: "text" },
  { key: "guestbookTitle", label: "방명록 제목", type: "text" },
  { key: "guestbookLead", label: "방명록 소개 문구", type: "textarea" },
  { key: "endingTitle", label: "마무리 제목", type: "text" },
  { key: "endingQuote", label: "마무리 문구", type: "textarea" },
  { key: "rsvpLabel", label: "RSVP 버튼 문구", type: "text" },
  { key: "guestbookLabel", label: "방명록 버튼 문구", type: "text" },
] as const;

export function ManualComposerPanel({
  values,
  onChange,
}: {
  values: Record<string, unknown>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <details className="rounded-[1.5rem] border border-black/5 bg-white/92 p-4">
      <summary className="cursor-pointer list-none">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/70">
          수동 제작
        </p>
        <div className="mt-2 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg tracking-[-0.03em]">섹션 문구를 직접 다듬기</h3>
            <p className="mt-1 max-w-xl text-[13px] leading-6 text-muted-foreground">
              템플릿 기본 구조는 유지하면서, 제목과 설명을 더 정교하게 만질 수 있습니다.
            </p>
          </div>
          <span className="rounded-full bg-[#fff3e8] px-3 py-1 text-[11px] text-primary">
            고급 편집
          </span>
        </div>
      </summary>

      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {manualFields.map((field) => (
          <label
            key={field.key}
            className="grid gap-2 rounded-2xl border border-black/5 bg-[#fffaf5] p-3"
          >
            <span className="text-[13px] font-medium">{field.label}</span>
            {field.type === "textarea" ? (
              <Textarea
                value={String(values[field.key] ?? "")}
                className="min-h-24 text-sm leading-6"
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            ) : (
              <Input
                value={String(values[field.key] ?? "")}
                className="text-sm"
                onChange={(event) => onChange(field.key, event.target.value)}
              />
            )}
          </label>
        ))}
      </div>
    </details>
  );
}
