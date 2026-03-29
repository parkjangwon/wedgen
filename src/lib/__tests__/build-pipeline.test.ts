import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildInvitationArchive } from "@/lib/build-pipeline";

describe("buildInvitationArchive", () => {
  it("builds a zip and materializes the processed template files", async () => {
    const artifact = await buildInvitationArchive({
      templateId: "elegant-classic",
      buildMode: "tweak",
      templatesDir: path.resolve(process.cwd(), "templates"),
      config: {
        locale: "ko",
        sectionOrder: ["hero", "greeting", "gallery", "info", "rsvp", "guestbook"],
        data: {
          groomName: "김민수",
          brideName: "이수진",
          weddingDate: "2026-05-15T14:00:00+09:00",
          greeting: "서로 다른 길을 걸어온 두 사람이 하나의 계절로 만납니다.",
          venue: "그랜드볼룸",
          address: "서울 강남구 테헤란로 1",
        },
        style: {
          colorScheme: "warm-blush",
          fontPair: "gowun-batang-noto-sans",
          animation: "fade",
        },
      },
      files: {},
    });

    expect(artifact.zipBuffer.subarray(0, 2).toString()).toBe("PK");
    expect(artifact.files.get("index.html")).toContain("__WEDGEN_CONFIG__");
    expect(artifact.files.get("style.css")).toContain("--wedgen-primary");
    expect(artifact.runtimeConfig.style.fontPreset).toMatchObject({
      value: "gowun-batang-noto-sans",
      provider: "google",
    });
  });
});
