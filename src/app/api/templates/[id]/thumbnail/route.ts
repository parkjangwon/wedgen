import fs from "node:fs/promises";
import path from "node:path";
import { parseSchema } from "@/lib/schema-parser";
import { isValidTemplateId } from "@/lib/template-scanner";

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

const ALLOWED_EXTENSIONS = [".svg", ".webp", ".jpg", ".jpeg", ".png"];

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;

  if (!isValidTemplateId(id)) {
    return new Response("유효하지 않은 템플릿 ID입니다.", { status: 400 });
  }

  try {
    const templatesDir = path.resolve(process.cwd(), "templates");
    const schema = await parseSchema(path.join(templatesDir, id, "schema.json"));

    const ext = path.extname(schema.thumbnail).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return new Response("유효하지 않은 썸네일 형식입니다.", { status: 400 });
    }

    const thumbnailPath = path.join(templatesDir, id, schema.thumbnail);
    const resolvedPath = path.resolve(thumbnailPath);
    const resolvedTemplatesDir = path.resolve(templatesDir);

    if (!resolvedPath.startsWith(resolvedTemplatesDir)) {
      return new Response("접근이 거부되었습니다.", { status: 403 });
    }

    const buffer = await fs.readFile(thumbnailPath);

    return new Response(buffer, {
      headers: {
        "Content-Type": contentTypeFor(schema.thumbnail),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("썸네일을 찾을 수 없습니다.", { status: 404 });
  }
}
