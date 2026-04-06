import path from "node:path";
import { describe, expect, it } from "vitest";
import { scanTemplates } from "@/lib/template-scanner";

describe("scanTemplates", () => {
  it("returns metadata for templates in the directory", async () => {
    const templatesDir = path.resolve(process.cwd(), "templates");
    const templates = await scanTemplates(templatesDir);

    expect(templates.length).toBeGreaterThanOrEqual(5);
    expect(templates[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      description: expect.any(String),
      thumbnail: expect.any(String),
      interaction: expect.any(String),
    });
  });

  it("returns an empty array for a missing directory", async () => {
    await expect(scanTemplates("/missing/templates")).resolves.toEqual([]);
  });
});
