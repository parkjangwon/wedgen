import { validateGasUrl } from "@/lib/gas-validator";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json()) as { url?: string };

  if (!body.url) {
    return Response.json({ ok: false, message: "검증할 URL이 필요합니다." }, { status: 400 });
  }

  return Response.json(await validateGasUrl(body.url));
}
