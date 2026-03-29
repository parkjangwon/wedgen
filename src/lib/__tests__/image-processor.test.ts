import { describe, expect, it } from "vitest";
import { processImageAssets } from "@/lib/image-processor";

const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR42mP8/5+hHgAHggJ/PmRykQAAAABJRU5ErkJggg==",
  "base64",
);

describe("processImageAssets", () => {
  it("converts invitation images to webp and keeps audio files intact", async () => {
    const heroImage = new File([tinyPng], "hero.png", { type: "image/png" });
    const bgMusic = new File([Buffer.from("demo")], "song.mp3", {
      type: "audio/mpeg",
    });

    const result = await processImageAssets({
      heroImage,
      bgMusic,
    });

    expect(result.configAssets.heroImage).toBe("assets/hero.webp");
    expect(result.configAssets.bgMusic).toBe("assets/song.mp3");
    expect(result.outputFiles.get("assets/hero.webp")).toBeDefined();
    expect(result.outputFiles.get("assets/song.mp3")).toBeDefined();
  });
});
