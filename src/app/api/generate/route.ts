import { buildInvitationArchive } from "@/lib/build-pipeline";
import { isValidTemplateId } from "@/lib/template-scanner";
import type { BuildMode } from "@/lib/optimizers";
import type { WedgenDraftInput } from "@/types";

export const runtime = "nodejs";

const VALID_BUILD_MODES: BuildMode[] = ["tweak", "optimized"];

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

    if (!templateId) {
      return Response.json({ error: "templateId가 필요합니다." }, { status: 400 });
    }

    if (!isValidTemplateId(templateId)) {
      return Response.json({ error: "유효하지 않은 템플릿 ID입니다." }, { status: 400 });
    }

    if (!VALID_BUILD_MODES.includes(buildMode)) {
      return Response.json({ error: "유효하지 않은 빌드 모드입니다." }, { status: 400 });
    }

    let config: WedgenDraftInput;
    try {
      config = JSON.parse(rawConfig) as WedgenDraftInput;
    } catch {
      return Response.json({ error: "유효하지 않은 설정 데이터입니다." }, { status: 400 });
    }

    const files: Record<string, File | File[] | undefined> = {};
    for (const [key, value] of formData.entries()) {
      if (!key.startsWith("asset:") || !(value instanceof File) || value.size === 0) {
        continue;
      }

      const fieldKey = key.replace("asset:", "");
      if (!/^[a-zA-Z0-9_-]+$/.test(fieldKey)) {
        continue;
      }

      appendUpload(files, fieldKey, value);
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
