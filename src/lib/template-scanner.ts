import fs from "node:fs/promises";
import path from "node:path";
import type { TemplateMeta } from "@/types";
import { parseSchema } from "@/lib/schema-parser";

const VALID_TEMPLATE_ID_PATTERN = /^[a-z0-9-]+$/;

export function isValidTemplateId(id: string): boolean {
  return VALID_TEMPLATE_ID_PATTERN.test(id) && id.length > 0 && id.length <= 64;
}

export async function scanTemplates(templatesDir: string): Promise<TemplateMeta[]> {
  try {
    const entries = await fs.readdir(templatesDir, { withFileTypes: true });
    const templates = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          try {
            const schema = await parseSchema(
              path.join(templatesDir, entry.name, "schema.json"),
            );
            return {
              id: schema.id,
              name: schema.name,
              description: schema.description,
              thumbnail: schema.thumbnail,
              interaction: schema.interaction,
            } satisfies TemplateMeta;
          } catch {
            return null;
          }
        }),
    );

    return templates
      .filter((template): template is TemplateMeta => template !== null)
      .sort((left, right) => left.name.localeCompare(right.name, "ko"));
  } catch {
    return [];
  }
}
