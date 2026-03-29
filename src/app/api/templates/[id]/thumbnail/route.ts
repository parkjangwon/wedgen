import fs from "node:fs/promises";
import path from "node:path";
import { parseSchema } from "@/lib/schema-parser";

export const runtime = "nodejs";

function contentTypeFor(fileName: string): string {
  if (fileName.endsWith(".svg")) {
    return "image/svg+xml";
  }

  if (fileName.endsWith(".webp")) {
    return "image/webp";
  }

  if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  return "image/png";
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const templatesDir = path.resolve(process.cwd(), "templates");
  const schema = await parseSchema(path.join(templatesDir, id, "schema.json"));
  const thumbnailPath = path.join(templatesDir, id, schema.thumbnail);
  const buffer = await fs.readFile(thumbnailPath);

  return new Response(buffer, {
    headers: {
      "Content-Type": contentTypeFor(schema.thumbnail),
      "Cache-Control": "no-store",
    },
  });
}
