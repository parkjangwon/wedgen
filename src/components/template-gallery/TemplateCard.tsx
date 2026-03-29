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

export function TemplateCard({ template }: { template: TemplateMeta }) {
  return (
    <Link href={`/editor/${template.id}`} className="group block h-full">
      <Card className="h-full overflow-hidden rounded-[1.75rem] border-black/5 bg-white/80 shadow-[0_24px_80px_rgba(92,55,38,0.12)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_110px_rgba(92,55,38,0.16)]">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#f3ebe0]">
          <img
            src={`/api/templates/${template.id}/thumbnail`}
            alt={`${template.name} 썸네일`}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          />
        </div>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl tracking-[-0.03em]">{template.name}</h3>
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {interactionLabels[template.interaction]}
            </Badge>
          </div>
          <p className="text-sm leading-7 text-muted-foreground">{template.description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
