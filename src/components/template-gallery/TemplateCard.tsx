/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { TemplateMeta } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const interactionLabels: Record<TemplateMeta["interaction"], string> = {
  scroll: "스크롤형",
  page: "페이지형",
  parallax: "패럴랙스형",
};

const templateMood: Record<
  string,
  { city: string; english: string; keywords: [string, string]; accent: string }
> = {
  "elegant-classic": {
    city: "세비야",
    english: "Seville",
    keywords: ["우아한", "정중한"],
    accent: "#b97a56",
  },
  "modern-minimal": {
    city: "코펜하겐",
    english: "Copenhagen",
    keywords: ["정갈한", "미니멀"],
    accent: "#111111",
  },
  "romantic-floral": {
    city: "니스",
    english: "Nice",
    keywords: ["화사한", "로맨틱"],
    accent: "#c78aa5",
  },
  "magazine-style": {
    city: "밀라노",
    english: "Milano",
    keywords: ["에디토리얼", "세련된"],
    accent: "#7f1d1d",
  },
  "cinematic-scroll": {
    city: "마드리드",
    english: "Madrid",
    keywords: ["영화같은", "몰입형"],
    accent: "#d4a373",
  },
  "art-deco-arch": {
    city: "파리",
    english: "Paris",
    keywords: ["대칭형", "포멀한"],
    accent: "#c9a45c",
  },
  "bento-memory": {
    city: "오사카",
    english: "Osaka",
    keywords: ["벤토형", "캐주얼"],
    accent: "#eb7d52",
  },
  "ceremony-program": {
    city: "취리히",
    english: "Zurich",
    keywords: ["프로그램북", "정리된"],
    accent: "#315b77",
  },
  "paper-collage": {
    city: "포틀랜드",
    english: "Portland",
    keywords: ["콜라주", "감성적"],
    accent: "#a66052",
  },
  "starlight-minimal": {
    city: "레이캬비크",
    english: "Reykjavik",
    keywords: ["야간형", "여백형"],
    accent: "#d9c6a5",
  },
};

export function TemplateCard({ template }: { template: TemplateMeta }) {
  const mood = templateMood[template.id] ?? {
    city: "Sample",
    english: "Sample",
    keywords: ["감각적인", "모바일형"],
    accent: "#b97a56",
  };

  return (
    <Link href={`/editor/${template.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden rounded-[2rem] border-black/5 bg-white/85 shadow-[0_24px_80px_rgba(92,55,38,0.12)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_40px_120px_rgba(92,55,38,0.18)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f3ebe0]">
          <img
            src={`/api/templates/${template.id}/thumbnail`}
            alt={`${template.name} 썸네일`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <Badge
              className="rounded-full border border-white/20 bg-white/16 px-3 py-1 text-white backdrop-blur"
              style={{ backgroundColor: `${mood.accent}33` }}
            >
              {interactionLabels[template.interaction]}
            </Badge>
            <Badge className="rounded-full border border-white/20 bg-black/20 px-3 py-1 text-white backdrop-blur">
              수동 제작 지원
            </Badge>
          </div>
          <div className="absolute inset-x-4 bottom-4 text-white">
            <p className="text-sm font-medium">{mood.city}</p>
            <p className="text-xs uppercase tracking-[0.24em] text-white/68">
              {mood.english}
            </p>
          </div>
        </div>
        <CardContent className="space-y-4 p-5">
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {mood.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="rounded-full bg-[#fff7f0] px-3 py-1 text-xs text-[#6d4a3b]"
                >
                  {keyword}
                </span>
              ))}
            </div>
            <h3 className="text-[1.7rem] leading-none tracking-[-0.04em]">
              {template.name}
            </h3>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">{template.description}</p>
          <div className="flex items-center justify-between border-t border-black/5 pt-3">
            <p className="text-xs text-muted-foreground">샘플 열어보고 바로 수정 시작</p>
            <span className="text-sm font-medium text-foreground">
              샘플 보기 →
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
