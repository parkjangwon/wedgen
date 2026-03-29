import path from "node:path";
import { scanTemplates } from "@/lib/template-scanner";

export const runtime = "nodejs";

export async function GET() {
  const templates = await scanTemplates(path.resolve(process.cwd(), "templates"));

  return Response.json(
    templates.map((template) => ({
      ...template,
      thumbnail: `/api/templates/${template.id}/thumbnail`,
    })),
  );
}
