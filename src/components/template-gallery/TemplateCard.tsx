"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useState } from "react";
import { Eye } from "lucide-react";
import type { TemplateMeta } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TemplatePreviewModal } from "./TemplatePreviewModal";

const interactionLabels: Record<TemplateMeta["interaction"], string> = {
  scroll: "스크롤형",
  page: "페이지형",
  parallax: "패럴랙스형",
};

const templateMood: Record<
  string,
  { city: string; english: string; keywords: [string, string]; accent: string }
> = {
  "premium-elegant-minimal": {
    city: "세비야",
    english: "Seville",
    keywords: ["우아한", "정중한"],
    accent: "#b97a56",
  },
  "premium-modern-classic": {
    city: "코펜하겐",
    english: "Copenhagen",
    keywords: ["정갈한", "미니멀"],
    accent: "#111111",
  },
  "premium-spring-romance": {
    city: "니스",
    english: "Nice",
    keywords: ["화사한", "로맨틱"],
    accent: "#c78aa5",
  },
  "premium-cinematic": {
    city: "마드리드",
    english: "Madrid",
    keywords: ["영화같은", "몰입형"],
    accent: "#d4a373",
  },
  "premium-korean-traditional": {
    city: "전주",
    english: "Jeonju",
    keywords: ["전통적", "정갈한"],
    accent: "#b06b4f",
  },
};

export function TemplateCard({ template }: { template: TemplateMeta }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const mood = templateMood[template.id] ?? {
    city: "Sample",
    english: "Sample",
    keywords: ["감각적인", "모바일형"],
    accent: "#b97a56",
  };

  return (
    <>
      <Card className="group h-full overflow-hidden rounded-[1.6rem] border-black/5 bg-white/88 shadow-[0_18px_54px_rgba(92,55,38,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_90px_rgba(92,55,38,0.16)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f3ebe0]">
          <img
            src={`/api/templates/${template.id}/thumbnail`}
            alt={`${template.name} 썸네일`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />
          <div className="absolute left-3 top-3 flex flex-wrap items-center gap-1.5">
            <Badge
              className="rounded-full border border-white/20 bg-white/16 px-2.5 py-1 text-[11px] text-white backdrop-blur"
              style={{ backgroundColor: `${mood.accent}33` }}
            >
              {interactionLabels[template.interaction]}
            </Badge>
          </div>
          <button
            onClick={() => setIsPreviewOpen(true)}
            className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-medium text-[#2d1f1a] opacity-0 backdrop-blur transition duration-200 hover:bg-white group-hover:opacity-100"
          >
            <Eye className="h-3.5 w-3.5" />
            미리보기
          </button>
          <div className="absolute inset-x-4 bottom-3 text-white">
            <p className="text-sm font-medium leading-none">{mood.city}</p>
            <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-white/68">
              {mood.english}
            </p>
          </div>
        </div>
        <Link href={`/editor/${template.id}`} className="block">
          <CardContent className="space-y-3 p-4">
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {mood.keywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full bg-[#fff7f0] px-2.5 py-1 text-[11px] text-[#6d4a3b]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
              <h3 className="text-[1.35rem] leading-tight tracking-[-0.04em]">
                {template.name}
              </h3>
            </div>
            <p className="text-[13px] leading-6 text-muted-foreground">{template.description}</p>
            <div className="flex items-center justify-between border-t border-black/5 pt-3">
              <p className="text-[11px] text-muted-foreground">클릭해서 제작 시작</p>
              <span className="text-sm font-medium text-foreground">
                선택하기 →
              </span>
            </div>
          </CardContent>
        </Link>
      </Card>

      <TemplatePreviewModal
        template={template}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
      />
    </>
  );
}
