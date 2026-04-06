import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseSchema, resolveFieldOptions } from "@/lib/schema-parser";

describe("parseSchema", () => {
  it("parses a valid schema.json file", async () => {
    const schemaPath = path.resolve(
      process.cwd(),
      "templates/premium-elegant-minimal/schema.json",
    );

    const schema = await parseSchema(schemaPath);

    expect(schema.id).toBe("premium-elegant-minimal");
    expect(schema.fields["기본 정보"].groomName.type).toBe("text");
    expect(schema.sections.available).toContain("hero");
    expect(schema.style.headingFonts[0]).toMatchObject({
      value: "cormorant",
      provider: "google",
    });
  });

  it("throws for an invalid schema path", async () => {
    await expect(parseSchema("/missing/schema.json")).rejects.toThrow();
  });
});

describe("resolveFieldOptions", () => {
  it("hydrates optionsFrom references from the style config", async () => {
    const schemaPath = path.resolve(
      process.cwd(),
      "templates/premium-elegant-minimal/schema.json",
    );

    const schema = await parseSchema(schemaPath);
    const resolved = resolveFieldOptions(schema);

    expect(resolved.fields["스타일"].colorScheme.options?.[0]).toMatchObject({
      value: "gold-cream",
      label: "골드/크림",
    });
    expect(resolved.fields["스타일"].headingFont.options?.[0]).toMatchObject({
      value: "cormorant",
      label: "Cormorant Garamond",
    });
  });
});
