import { afterEach, describe, expect, it, vi } from "vitest";
import { validateGasUrl } from "@/lib/gas-validator";

describe("validateGasUrl", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns ok for a reachable google apps script url", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("ok", { status: 200 })),
    );

    await expect(
      validateGasUrl("https://script.google.com/macros/s/demo/exec"),
    ).resolves.toMatchObject({ ok: true });
  });

  it("rejects malformed urls before requesting", async () => {
    await expect(validateGasUrl("notaurl")).resolves.toMatchObject({
      ok: false,
    });
  });
});
