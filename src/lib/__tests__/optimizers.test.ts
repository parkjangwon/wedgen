import { describe, expect, it } from "vitest";
import { optimizeAssets } from "@/lib/optimizers";

describe("optimizeAssets", () => {
  it("minifies html, css, and js in optimized mode", async () => {
    const result = await optimizeAssets(
      {
        html: "<html>\n  <body>  <h1> Demo </h1> </body>\n</html>",
        css: "body {  color: red;  padding: 16px; }",
        js: "function hello () { console.log('demo') }\nhello();",
      },
      "optimized",
    );

    expect(result.html.length).toBeLessThan(60);
    expect(result.css).toContain("body{color:red");
    expect(result.js).not.toContain("console.log");
  });

  it("returns original assets in tweak mode", async () => {
    const input = {
      html: "<html>  <body>Demo</body></html>",
      css: "body { color: red; }",
      js: "const demo = true;",
    };

    await expect(optimizeAssets(input, "tweak")).resolves.toEqual(input);
  });
});
