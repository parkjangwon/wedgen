import type { TemplateMeta } from "@/types";
import { TemplateCard } from "@/components/template-gallery/TemplateCard";

export function TemplateGrid({ templates }: { templates: TemplateMeta[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  );
}
