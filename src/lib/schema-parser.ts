import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import type { FontOption, SelectOption, TemplateBundle, TemplateSchema } from "@/types";

const selectOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

const colorSchemeSchema = selectOptionSchema.extend({
  primary: z.string(),
  bg: z.string(),
});

const fontOptionSchema = selectOptionSchema.extend({
  provider: z.literal("google"),
  importUrl: z.string().url(),
  headingFamily: z.string(),
  bodyFamily: z.string(),
});

const fieldSchema = z.object({
  type: z.enum([
    "text",
    "textarea",
    "datetime",
    "image",
    "image[]",
    "select",
    "select[]",
    "url",
    "latlng",
    "file",
  ]),
  label: z.string(),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  maxLength: z.number().optional(),
  accept: z.array(z.string()).optional(),
  maxSize: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
  options: z.array(selectOptionSchema).optional(),
  optionsFrom: z.string().optional(),
  validate: z.enum(["ping"]).optional(),
  description: z.string().optional(),
});

const templateSchemaValidator = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  version: z.string(),
  thumbnail: z.string(),
  interaction: z.enum(["scroll", "page", "parallax"]),
  sections: z.object({
    available: z.array(z.string()),
    defaultOrder: z.array(z.string()),
    required: z.array(z.string()),
  }),
  fields: z.record(z.string(), z.record(z.string(), fieldSchema)),
  style: z.object({
    colorSchemes: z.array(colorSchemeSchema),
    fonts: z.array(fontOptionSchema),
    animations: z.array(selectOptionSchema),
  }),
  i18n: z.object({
    defaultLocale: z.string(),
    supported: z.array(z.string()),
  }),
});

export async function parseSchema(schemaPath: string): Promise<TemplateSchema> {
  const raw = await fs.readFile(schemaPath, "utf-8");
  return templateSchemaValidator.parse(JSON.parse(raw));
}

function getNestedValue(target: unknown, dotPath: string): unknown {
  return dotPath.split(".").reduce<unknown>((current, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }

    return undefined;
  }, target);
}

export function resolveFieldOptions(schema: TemplateSchema): TemplateSchema {
  const resolved = structuredClone(schema);

  for (const tabName of Object.keys(resolved.fields)) {
    for (const fieldName of Object.keys(resolved.fields[tabName])) {
      const field = resolved.fields[tabName][fieldName];
      if (!field.optionsFrom) {
        continue;
      }

      const resolvedOptions = getNestedValue(resolved, field.optionsFrom);
      field.options = Array.isArray(resolvedOptions)
        ? (resolvedOptions as SelectOption[] | FontOption[])
        : [];
      delete field.optionsFrom;
    }
  }

  return resolved;
}

export async function loadTemplateBundle(
  templateId: string,
  templatesDir = path.resolve(process.cwd(), "templates"),
): Promise<TemplateBundle> {
  const baseDir = path.join(templatesDir, templateId);
  const [schema, html, css, script] = await Promise.all([
    parseSchema(path.join(baseDir, "schema.json")),
    fs.readFile(path.join(baseDir, "index.html"), "utf-8"),
    fs.readFile(path.join(baseDir, "style.css"), "utf-8"),
    fs.readFile(path.join(baseDir, "script.js"), "utf-8"),
  ]);

  return {
    meta: {
      id: schema.id,
      name: schema.name,
      description: schema.description,
      thumbnail: schema.thumbnail,
      interaction: schema.interaction,
    },
    schema: resolveFieldOptions(schema),
    html,
    css,
    script,
  };
}
