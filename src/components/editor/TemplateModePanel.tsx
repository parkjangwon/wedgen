"use client";

import { Badge } from "@/components/ui/badge";
import type { TemplateMeta } from "@/types";

const templateModeGuides: Record<
  string,
  { title: string; points: string[] }
> = {
  "premium-modern-classic": {
    title: "모던 클래식 가이드",
    points: [
      "섹션을 한 장씩 읽게 되므로 제목과 리드 문구를 짧고 강하게 유지하세요.",
      "사진은 장면 수보다 첫인상을 우선해서 대표 이미지 한 장의 힘을 키우는 편이 좋습니다.",
      "일정과 위치 정보는 짧고 단정하게 정리할수록 완성도가 올라갑니다.",
    ],
  },
  "premium-cinematic": {
    title: "시네마틱 스크롤 가이드",
    points: [
      "대표 이미지와 갤러리 톤을 최대한 통일하면 몰입감이 훨씬 좋아집니다.",
      "문구는 짧은 문장 위주로 정리해야 장면 중심 흐름이 깨지지 않습니다.",
      "어두운 화면에서 가독성이 떨어지지 않도록 계좌·교통 정보는 간결하게 유지하세요.",
    ],
  },
  "premium-spring-romance": {
    title: "스프링 로맨스 가이드",
    points: [
      "대표 문구는 짧고 부드럽게 유지할수록 봄 웨딩 무드가 살아납니다.",
      "갤러리는 채도가 비슷한 사진으로 맞추면 전체 톤이 더 안정적입니다.",
      "계좌나 교통 정보는 장식보다 가독성을 우선해 정리하는 편이 좋습니다.",
    ],
  },
  "premium-korean-traditional": {
    title: "한국 전통 가이드",
    points: [
      "양가 부모님이 보시기 쉬운 표현과 정중한 톤을 유지하는 편이 좋습니다.",
      "음력/양력 표기를 함께 쓰면 전통 무드와 실용성을 동시에 살릴 수 있습니다.",
      "문구를 길게 쓰더라도 행갈이를 분명히 해 가독성을 확보하세요.",
    ],
  },
  "premium-elegant-minimal": {
    title: "우아한 미니멀 가이드",
    points: [
      "여백이 중요한 템플릿이라 문장을 짧게 정리할수록 완성도가 올라갑니다.",
      "사진은 4장 내외로 선별해 쓰는 편이 전체 흐름이 더 고급스럽습니다.",
      "엔딩 문구는 한 문단으로 단정하게 마무리하는 편이 잘 어울립니다.",
    ],
  },
};

export function TemplateModePanel({ meta }: { meta: TemplateMeta }) {
  const guide = templateModeGuides[meta.id];
  if (!guide) {
    return null;
  }

  return (
    <div className="rounded-[1.5rem] border border-black/5 bg-white/92 p-4 shadow-[0_16px_40px_rgba(88,47,33,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-primary/70">
            Template Mode
          </p>
          <h3 className="mt-1 text-lg tracking-[-0.03em]">{guide.title}</h3>
        </div>
        <Badge className="rounded-full bg-[#fff3e8] px-3 py-1 text-[11px] text-primary">
          {meta.interaction}
        </Badge>
      </div>
      <div className="mt-3 grid gap-2">
        {guide.points.map((point) => (
          <div
            key={point}
            className="rounded-[1rem] border border-black/5 bg-[#fffaf5] px-3 py-3 text-[13px] leading-6 text-muted-foreground"
          >
            {point}
          </div>
        ))}
      </div>
    </div>
  );
}
