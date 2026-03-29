import path from "node:path";
import { notFound } from "next/navigation";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { loadTemplateBundle } from "@/lib/schema-parser";
import { scanTemplates } from "@/lib/template-scanner";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const templatesDir = path.resolve(process.cwd(), "templates");
  const bundle = await loadTemplateBundle(
    templateId,
    templatesDir,
  ).catch(() => null);
  const templates = await scanTemplates(templatesDir);

  if (!bundle) {
    notFound();
  }

  return <EditorLayout meta={bundle.meta} schema={bundle.schema} templates={templates} />;
}
