import path from "node:path";
import { notFound } from "next/navigation";
import { EditorLayout } from "@/components/editor/EditorLayout";
import { loadTemplateBundle } from "@/lib/schema-parser";

export default async function EditorPage({
  params,
}: {
  params: Promise<{ templateId: string }>;
}) {
  const { templateId } = await params;
  const bundle = await loadTemplateBundle(
    templateId,
    path.resolve(process.cwd(), "templates"),
  ).catch(() => null);

  if (!bundle) {
    notFound();
  }

  return <EditorLayout meta={bundle.meta} schema={bundle.schema} />;
}
