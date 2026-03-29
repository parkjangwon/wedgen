import type { InteractionType, TemplateSchema } from "./schema";

export interface TemplateMeta {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  interaction: InteractionType;
}

export interface TemplateBundle {
  meta: TemplateMeta;
  schema: TemplateSchema;
  html: string;
  css: string;
  script: string;
}
