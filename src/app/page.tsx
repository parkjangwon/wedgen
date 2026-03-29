import path from "node:path";
import { redirect } from "next/navigation";
import { scanTemplates } from "@/lib/template-scanner";

export default async function Home() {
  const templates = await scanTemplates(path.resolve(process.cwd(), "templates"));
  const defaultTemplate = templates.find((template) => template.id === "elegant-classic")
    ?? templates[0];

  if (!defaultTemplate) {
    throw new Error("사용 가능한 템플릿을 찾을 수 없습니다.");
  }

  redirect(`/editor/${defaultTemplate.id}`);
}
