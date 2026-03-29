import path from "node:path";
import { buildPreviewDocument } from "@/lib/build-pipeline";
import { isValidTemplateId } from "@/lib/template-scanner";
import type { WedgenDraftInput } from "@/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      templateId?: string;
      config?: WedgenDraftInput;
    };

    if (!body.templateId || !body.config) {
      return Response.json(
        { error: "templateId와 config가 필요합니다." },
        { status: 400 },
      );
    }

    if (!isValidTemplateId(body.templateId)) {
      return Response.json(
        { error: "유효하지 않은 템플릿 ID입니다." },
        { status: 400 },
      );
    }

    const html = await buildPreviewDocument(
      body.templateId,
      body.config,
      path.resolve(process.cwd(), "templates"),
    );

    return Response.json({ html });
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "미리보기를 생성하지 못했습니다.",
      },
      { status: 500 },
    );
  }
}
