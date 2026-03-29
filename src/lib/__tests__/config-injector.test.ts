import { describe, expect, it } from "vitest";
import { injectConfigIntoHtml, serializeConfigForScript } from "@/lib/config-injector";

describe("serializeConfigForScript", () => {
  it("escapes closing script tags and angle brackets", () => {
    const serialized = serializeConfigForScript({
      message: "</script><script>alert('xss')</script>",
    });

    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script\\u003e");
  });
});

describe("injectConfigIntoHtml", () => {
  it("injects the runtime config script into the document head", () => {
    const html = injectConfigIntoHtml(
      "<html><head><title>Demo</title></head><body></body></html>",
      { template: "elegant-classic" },
    );

    expect(html).toContain("window.__WEDGEN_CONFIG__");
    expect(html).toContain("<head><title>Demo</title><script>");
  });
});
