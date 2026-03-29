import { redirect } from "next/navigation";
import path from "node:path";
import { scanTemplates } from "@/lib/template-scanner";

export default async function Home() {
  const templatesDir = path.resolve(process.cwd(), "templates");
  const templates = await scanTemplates(templatesDir);
  
  // Redirect to editor with default premium template
  const defaultTemplate = templates.find((t) => t.id === "premium-elegant-minimal") || templates[0];
  
  if (defaultTemplate) {
    redirect(`/editor/${defaultTemplate.id}`);
  }
  
  // Fallback if no templates found
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>템플릿을 불러올 수 없습니다.</p>
    </div>
  );
}
