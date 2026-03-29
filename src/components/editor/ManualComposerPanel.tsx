"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const groups = [
  {
    title: "타이포 조절",
    fields: [
      { key: "heroTitleSize", label: "표지 제목 크기", type: "range", min: 28, max: 72, step: 1 },
      { key: "heroMetaSize", label: "표지 메타 크기", type: "range", min: 12, max: 24, step: 1 },
      { key: "sectionTitleSize", label: "섹션 제목 크기", type: "range", min: 20, max: 44, step: 1 },
      { key: "bodyCopySize", label: "본문 크기", type: "range", min: 13, max: 22, step: 1 },
    ],
  },
  {
    title: "표지와 인사말",
    fields: [
      { key: "heroEyebrow", label: "표지 상단 문구", type: "text" },
      { key: "heroTagline", label: "표지 소개 문구", type: "textarea" },
      { key: "greetingTitle", label: "초대 문구 제목", type: "text" },
      { key: "greeting", label: "초대 문구 본문", type: "textarea" },
    ],
  },
  {
    title: "가족과 일정",
    fields: [
      { key: "familyNote", label: "혼주 소개 문구", type: "textarea" },
      { key: "groomFather", label: "신랑 아버지", type: "text" },
      { key: "groomMother", label: "신랑 어머니", type: "text" },
      { key: "brideFather", label: "신부 아버지", type: "text" },
      { key: "brideMother", label: "신부 어머니", type: "text" },
      { key: "groomContact", label: "신랑 연락처", type: "text" },
      { key: "brideContact", label: "신부 연락처", type: "text" },
      { key: "scheduleTitle", label: "일정 섹션 제목", type: "text" },
      { key: "scheduleNote", label: "일정 안내 문구", type: "textarea" },
      { key: "countdownLabel", label: "카운트다운 문구", type: "text" },
    ],
  },
  {
    title: "위치와 계좌",
    fields: [
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
    ],
  },
  {
    title: "갤러리와 마무리",
    fields: [
      { key: "galleryTitle", label: "갤러리 제목", type: "text" },
      { key: "galleryLead", label: "갤러리 소개 문구", type: "textarea" },
      { key: "guestbookTitle", label: "방명록 제목", type: "text" },
      { key: "guestbookLead", label: "방명록 소개 문구", type: "textarea" },
      { key: "endingTitle", label: "마무리 제목", type: "text" },
      { key: "endingQuote", label: "마무리 문구", type: "textarea" },
      { key: "rsvpLabel", label: "RSVP 버튼 문구", type: "text" },
      { key: "guestbookLabel", label: "방명록 버튼 문구", type: "text" },
    ],
  },
] as const;

export function ManualComposerPanel({
  values,
  onChange,
}: {
  values: Record<string, unknown>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <details className="rounded-[1.5rem] border border-white/10 bg-card/90 p-4" open>
      <summary className="cursor-pointer list-none">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/70">
          수동 제작
        </p>
        <div className="mt-2">
          <h3 className="text-lg tracking-[-0.03em]">섹션 문구와 타이포를 직접 다듬기</h3>
          <p className="mt-1 max-w-xl text-[13px] leading-6 text-muted-foreground">
            문구, 정보 배치, 타이포 비율까지 직접 맞추며 결과물을 다듬을 수 있습니다.
          </p>
        </div>
      </summary>

      <div className="mt-4 grid gap-4">
        {groups.map((group) => (
          <section
            key={group.title}
            className="rounded-[1.25rem] border border-white/10 bg-secondary/50 p-3"
          >
            <div className="mb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-primary/70">
                {group.title}
              </p>
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {group.fields.map((field) => (
                <label
                  key={field.key}
                  className="grid gap-2 rounded-[1rem] border border-white/10 bg-card p-3"
                >
                  <span className="text-[13px] font-medium">{field.label}</span>
                  {field.type === "textarea" ? (
                    <Textarea
                      value={String(values[field.key] ?? "")}
                      className="min-h-24 text-sm leading-6"
                      onChange={(event) => onChange(field.key, event.target.value)}
                    />
                  ) : field.type === "range" ? (
                    <div className="grid gap-2">
                      <input
                        type="range"
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        value={Number(values[field.key] ?? field.min)}
                        onChange={(event) => onChange(field.key, event.target.value)}
                      />
                      <div className="flex items-center justify-between text-[12px] text-muted-foreground">
                        <span>{field.min}px</span>
                        <span>{String(values[field.key] ?? field.min)}px</span>
                        <span>{field.max}px</span>
                      </div>
                    </div>
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
          </section>
        ))}
      </div>
    </details>
  );
}
