import { buildInvitationArchive } from "@/lib/build-pipeline";
import type { BuildMode } from "@/lib/optimizers";
import type { WedgenDraftInput } from "@/types";

export const runtime = "nodejs";

function appendUpload(
  target: Record<string, File | File[] | undefined>,
  fieldName: string,
  file: File,
): void {
  const existing = target[fieldName];
  if (!existing) {
    target[fieldName] = file;
    return;
  }

  if (Array.isArray(existing)) {
    target[fieldName] = [...existing, file];
    return;
  }

  target[fieldName] = [existing, file];
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const templateId = String(formData.get("templateId") || "");
    const buildMode = String(formData.get("buildMode") || "optimized") as BuildMode;
    const rawConfig = String(formData.get("config") || "{}");
    const config = JSON.parse(rawConfig) as WedgenDraftInput;

    if (!templateId) {
      return Response.json({ error: "templateId가 필요합니다." }, { status: 400 });
    }

    const files: Record<string, File | File[] | undefined> = {};
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("asset:") || !(value instanceof File) || value.size === 0) {
        continue;
      }

      appendUpload(files, key.replace("asset:", ""), value);
    }

    const artifact = await buildInvitationArchive({
      templateId,
      buildMode,
      config,
      files,
    });

    return new Response(new Uint8Array(artifact.zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${templateId}-${buildMode}.zip"`,
      },
    });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "ZIP 생성에 실패했습니다." },
      { status: 500 },
    );
  }
}
