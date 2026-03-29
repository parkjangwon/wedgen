import { describe, expect, it } from "vitest";
import {
  appendFiles,
  fileToDataUrl,
  moveItem,
  removeItem,
} from "@/lib/gallery-assets";

describe("gallery asset helpers", () => {
  it("appends newly selected files after existing files", () => {
    const first = new File(["a"], "first.jpg", { type: "image/jpeg" });
    const second = new File(["b"], "second.jpg", { type: "image/jpeg" });
    const third = new File(["c"], "third.jpg", { type: "image/jpeg" });

    const merged = appendFiles([first, second], [third]);

    expect(merged.map((file) => file.name)).toEqual([
      "first.jpg",
      "second.jpg",
      "third.jpg",
    ]);
  });

  it("moves an item to a new index", () => {
    expect(moveItem(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
  });

  it("removes an item at the given index", () => {
    expect(removeItem(["a", "b", "c"], 1)).toEqual(["a", "c"]);
  });

  it("creates a data url for reliable iframe preview rendering", async () => {
    const file = new File(["hello"], "greeting.txt", { type: "text/plain" });

    await expect(fileToDataUrl(file)).resolves.toBe("data:text/plain;base64,aGVsbG8=");
  });
});
